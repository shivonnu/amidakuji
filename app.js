const countInput = document.getElementById("count");
const namesInput = document.getElementById("names");
const prizesInput = document.getElementById("prizes");
const generateBtn = document.getElementById("generate");
const revealAllBtn = document.getElementById("reveal-all");
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const startLabels = document.getElementById("start-labels");
const endLabels = document.getElementById("end-labels");
const resultsEl = document.getElementById("results");
const statusEl = document.getElementById("status");

const COLORS = ["#e85d4c", "#f0c14b", "#7dcea0", "#7fb3d5", "#c39bd3", "#f5b7b1", "#76d7c4", "#f8c471", "#85c1e9", "#d7bde2"];

let state = {
  n: 5,
  names: [],
  prizes: [],
  rungs: [],
  mapping: [],
};

function parseList(value, fallbackCount) {
  const items = value.split(/[,、]/).map((s) => s.trim()).filter(Boolean);
  while (items.length < fallbackCount) items.push(String(items.length + 1));
  return items.slice(0, fallbackCount);
}

function generateRungs(n) {
  const rows = 9;
  const rungs = [];
  for (let row = 0; row < rows; row++) {
    const used = new Set();
    for (let col = 0; col < n - 1; col++) {
      if (used.has(col) || used.has(col - 1)) continue;
      if (Math.random() < 0.55) {
        rungs.push({ row, col });
        used.add(col);
      }
    }
  }
  return rungs;
}

function follow(start, rungs, n) {
  const rows = 9;
  let col = start;
  const path = [{ row: -0.15, col }];
  for (let row = 0; row < rows; row++) {
    const left = rungs.find((r) => r.row === row && r.col === col - 1);
    const right = rungs.find((r) => r.row === row && r.col === col);
    path.push({ row, col });
    if (right) {
      col += 1;
      path.push({ row, col });
    } else if (left) {
      col -= 1;
      path.push({ row, col });
    }
  }
  path.push({ row: rows - 0.15, col });
  return { end: col, path };
}

function geometry(n) {
  const padX = 48;
  const padY = 28;
  const w = canvas.width;
  const h = canvas.height;
  const xs = Array.from({ length: n }, (_, i) => padX + (i * (w - padX * 2)) / Math.max(n - 1, 1));
  const yAt = (row) => padY + ((row + 0.15) / 8.7) * (h - padY * 2);
  return { xs, yAt };
}

function drawBoard(highlight) {
  const { n, rungs } = state;
  const { xs, yAt } = geometry(n);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#d8c3a5";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  for (let i = 0; i < n; i++) {
    ctx.beginPath();
    ctx.moveTo(xs[i], yAt(-0.15));
    ctx.lineTo(xs[i], yAt(8.85));
    ctx.stroke();
  }
  for (const r of rungs) {
    ctx.beginPath();
    ctx.moveTo(xs[r.col], yAt(r.row));
    ctx.lineTo(xs[r.col + 1], yAt(r.row));
    ctx.stroke();
  }

  if (highlight?.path?.length) {
    ctx.strokeStyle = highlight.color || COLORS[0];
    ctx.lineWidth = 6;
    ctx.beginPath();
    highlight.path.forEach((p, i) => {
      const x = xs[p.col];
      const y = yAt(p.row);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }
}

function renderLabels() {
  startLabels.innerHTML = "";
  endLabels.innerHTML = "";
  state.names.forEach((name, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = name;
    btn.addEventListener("click", () => traceOne(i));
    startLabels.appendChild(btn);
  });
  state.prizes.forEach((prize) => {
    const span = document.createElement("span");
    span.textContent = prize;
    endLabels.appendChild(span);
  });
}

function rebuild() {
  const n = Math.min(10, Math.max(2, Number(countInput.value) || 5));
  countInput.value = String(n);
  const names = parseList(namesInput.value, n);
  const prizes = parseList(prizesInput.value, n);
  namesInput.value = names.join(", ");
  prizesInput.value = prizes.join(", ");
  const rungs = generateRungs(n);
  const mapping = Array.from({ length: n }, (_, i) => follow(i, rungs, n));
  state = { n, names, prizes, rungs, mapping };
  resultsEl.innerHTML = "";
  statusEl.textContent = "上の名前を押すと、その一本をたどります。";
  renderLabels();
  drawBoard();
}

function animatePath(startIndex) {
  const result = state.mapping[startIndex];
  const color = COLORS[startIndex % COLORS.length];
  const full = result.path;
  let i = 2;
  return new Promise((resolve) => {
    const tick = () => {
      drawBoard({ color, path: full.slice(0, i) });
      i += 1;
      if (i > full.length) resolve(result);
      else requestAnimationFrame(tick);
    };
    tick();
  });
}

async function traceOne(startIndex) {
  [...startLabels.children].forEach((el, i) => el.classList.toggle("active", i === startIndex));
  [...endLabels.children].forEach((el) => el.classList.remove("hit"));
  const result = await animatePath(startIndex);
  endLabels.children[result.end]?.classList.add("hit");
  const line = `${state.names[startIndex]} → ${state.prizes[result.end]}`;
  statusEl.textContent = line;
  const li = document.createElement("li");
  li.innerHTML = `<strong>${state.names[startIndex]}</strong> は <strong>${state.prizes[result.end]}</strong>`;
  resultsEl.prepend(li);
}

async function revealAll() {
  resultsEl.innerHTML = "";
  for (let i = 0; i < state.n; i++) {
    await traceOne(i);
  }
  statusEl.textContent = "全員の結果が出ました。";
}

generateBtn.addEventListener("click", rebuild);
revealAllBtn.addEventListener("click", revealAll);
rebuild();

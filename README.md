# あみだくじ

ブラウザだけで遊べる静的なあみだくじです。

- 公開 URL: https://shivonnu.github.io/amidakuji/
- 人数・名前・結果を入れて「あみだを作る」
- 上の名前を押すとその一本が光りながら結果まで進みます

## GitHub Pages の出し方

Actions の `GITHUB_TOKEN` では Pages サイトを新規作成できません。初回だけ設定画面から有効化します。

1. https://github.com/shivonnu/amidakuji/settings/pages を開く
2. **Build and deployment → Source** を **Deploy from a branch** にする（GitHub Actions ではない）
3. Branch は **main**、folder は **/ (root)** にして Save する
4. 1〜2 分後に上記 URL が開く

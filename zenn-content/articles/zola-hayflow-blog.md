---
title: "ZolaのHayFlowテーマでZenn RSS連携ブログを作る"
emoji: "🚀"
type: "tech"
topics: ["zola", "hayflow", "blog", "rss", "githubpages"]
published: true
---

## はじめに

Rust製の静的サイトジェネレーター「Zola」と、モダンな[HayFlowテーマ](https://www.getzola.org/themes/hayflow/)を使って、Zenn RSSと連携するブログサイトを作成する方法を解説します。

HayFlowは**パーティクルエフェクト付きのダークテーマ**で、アニメーションが美しく、完全にMarkdownのみで管理できる点が特徴です。

## 🎯 完成イメージ

![HayFlowテーマのスクリーンショット](https://gitlab.com/cyril-marpaud/hayflow/-/raw/main/screenshot.png)

- **モダンなデザイン**: パーティクルエフェクト + ダークテーマ
- **3つのカードタイプ**: Simple、Columns、List形式で柔軟なレイアウト
- **Font Awesomeアイコン**: ソーシャルリンクで使用
- **Zenn RSS連携**: 記事を自動取得・表示

**参考**: [ライブデモ](https://cyril-marpaud.gitlab.io) | [テーマ詳細](https://www.getzola.org/themes/hayflow/)

## 🛠 セットアップ

### 1. プロジェクト作成とテーマインストール

```bash
# プロジェクト作成
zola init myblog
cd myblog

# HayFlowテーマをクローン
git clone https://gitlab.com/cyril-marpaud/hayflow.git themes/hayflow
```

### 2. HayFlowテーマ設定

**config.toml（重要な部分のみ）:**
```toml
theme = "hayflow"

[extra]
# 名前設定
name = { first = "あなたの", last = "ブログ" }

# ソーシャルリンク（Font Awesomeアイコン使用）
links = [
   { icon = "fa-brands fa-github", url = "https://github.com/username" },
   { icon = "fa-solid fa-rss", url = "https://zenn.dev/username/feed" },
]

# セクション設定
sections = ["zenn"]
```

**content/_index.md:**
```markdown
+++
[extra]
roles = ["Tech Writer", "Developer", "Zenn Creator"]
+++
```

### 3. Zenn記事セクション作成

[HayFlowテーマ](https://www.getzola.org/themes/hayflow/)の**List card**機能を活用して、Zenn記事を表示します。

**content/zenn/_index.md:**
```markdown
+++
title = "Zenn記事"

[extra]
card_type = "list"
discover = "記事を読む"
+++

私がZennで投稿した技術記事の一覧です。
```

**content/zenn/sample-article.md:**
```markdown
+++
title = "サンプル記事"

[extra]
link = "https://zenn.dev/username/articles/sample"
+++

**投稿日**: 2025-01-01

記事の概要がここに表示されます。

[→ Zennで続きを読む](https://zenn.dev/username/articles/sample)
```

## 🔧 Zenn RSS自動連携

Zenn RSSを取得してHayFlowのList cardに自動変換するスクリプトを作成：

**scripts/fetch-zenn-rss.js（要点のみ）:**
```javascript
const ZENN_RSS_URL = 'https://zenn.dev/username/feed';

// RSS取得 → Markdown変換 → HayFlow List card形式で保存
async function main() {
  const rssData = await fetchRSS(ZENN_RSS_URL);
  const entries = parseRSSEntries(rssData);
  
  // content/zenn/ にMarkdownファイルを生成
  createZennSection(entries);
}
```

## 🚀 GitHub Pages自動デプロイ

**.github/workflows/deploy.yml（最小構成）:**
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  schedule:
    - cron: '0 9 * * 0'  # 週次更新

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: taiki-e/install-action@zola
    - uses: actions/setup-node@v4
    
    - name: Fetch Zenn RSS
      run: node scripts/fetch-zenn-rss.js
    
    - name: Build with Zola
      run: zola build
    
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v4
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./public
```

## 🎨 HayFlowテーマのカスタマイズ

[HayFlowテーマ](https://www.getzola.org/themes/hayflow/)では3つのカードタイプが利用可能：

1. **Simple card**: 基本的なテキスト表示
2. **Columns card**: 3列のカード配置
3. **List card**: リンク付きリスト（Zenn記事で使用）

Font Awesomeアイコンは**無料版のみ**使用可能。アイコンコードは`fa-solid fa-envelope`のような形式で指定します。

## まとめ

HayFlowテーマの美しいデザインとZenn RSS連携により、メンテナンスフリーなポートフォリオブログが完成しました。

- **Markdownのみ**でサイト管理
- **週次自動更新**でZenn記事を取得
- **モダンなUIエフェクト**でプロフェッショナルな印象

Zennで記事を書けば、自動的にブログサイトに反映される仕組みが構築できます。

## 参考リンク

- [HayFlowテーマ公式](https://www.getzola.org/themes/hayflow/)
- [ライブデモサイト](https://cyril-marpaud.gitlab.io)
- [Zola公式サイト](https://www.getzola.org/)
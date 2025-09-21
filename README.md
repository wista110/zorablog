# 📚 Zola Blog with Zenn RSS Integration

**本番サイト**: [https://wista110.github.io/zorablog](https://wista110.github.io/zorablog) 🚀

モダンなHayFlowテーマを使用したZolaベースのポートフォリオサイト。ZennのRSSと連携して技術記事を自動取得・表示します。

## ✨ 特徴

- 🎨 **ZennライクなモダンUI** - カード形式の美しいレイアウト
- 🤖 **自動記事取得** - ZennのRSSから最新記事を自動取得
- 📱 **完全レスポンシブ** - デスクトップ、タブレット、モバイル対応
- 🏷️ **スマート判定** - タイトルから自動でアイコンとタグを設定
- ⚡ **高速ビルド** - Rust製Zolaによる高速な静的サイト生成

## 🚀 クイックスタート

```bash
# 開発サーバー起動（記事も自動取得）
npm run serve

# 記事のみ更新
npm run fetch-zenn

# 本番ビルド（記事取得 + ビルド）
npm run build
```

## 📝 自分用備忘録

### 🔄 記事投稿から反映までの流れ

1. **Zennで記事投稿**
   - Zenn Webエディタまたは Zenn CLI で記事を公開
   - RSS（https://zenn.dev/dfuji/feed）に自動追加される

2. **ブログサイトへの反映**
   ```bash
   # 手動更新の場合
   npm run fetch-zenn
   
   # 本番デプロイの場合  
   npm run build
   git add . && git commit -m "記事更新" && git push
   ```

3. **自動更新**
   - GitHub Actions が毎週日曜日に自動実行
   - 新記事があれば自動でサイト更新・デプロイ

### ⚙️ GitHub Actions設定

**ファイル**: `.github/workflows/deploy.yml`

**トリガー**:
- 毎週日曜日 午前9時（UTC）
- 手動実行（workflow_dispatch）

**動作**:
1. Zenn RSSを取得
2. 記事ファイル自動生成
3. Zolaでビルド
4. GitHub Pagesに自動デプロイ

### 🛠️ 記事取得・更新の手動設定

#### 📡 RSS取得スクリプト (`scripts/fetch-zenn-rss.js`)

**アイコン判定ルール**:
```javascript
// "CLI", "GitHub", "入門" → 📝 TECH
// "Zola", "blog", "RSS" → 🚀 TECH  
// "test", "動作確認" → 😊 IDEA
// デフォルト → 📄 TECH
```

**カスタマイズ方法**:
1. `detectIconAndTag()` 関数を編集
2. 新しいキーワードとアイコンを追加
3. タグカラーは `style.css` の `.zenn-tag-*` で設定

#### 🎨 デザインカスタマイズ

**主要CSSファイル**: `themes/hayflow/static/style.css`

**調整ポイント（コメント付き）**:
- Contact カード: 240-327行目
- About Me テキスト: 217-241行目  
- Zenn記事グリッド: 349-419行目
- レスポンシブ: 440-502行目

### 📂 ディレクトリ構成

```
zolablog/
├── config.toml          # サイト設定
├── content/             # コンテンツ
│   ├── about/          # About Meセクション
│   ├── contact/        # Contactセクション  
│   └── zenn/           # Zenn記事（自動生成）
├── scripts/
│   └── fetch-zenn-rss.js # RSS取得スクリプト
└── themes/hayflow/      # テーマファイル
    ├── static/style.css # メインCSS
    └── templates/       # HTMLテンプレート
```

### 🔧 よく使うコマンド

```bash
# 開発開始
zola serve                 # 基本的な開発サーバー
npm run serve             # 記事取得 + 開発サーバー

# 記事更新
npm run fetch-zenn        # Zenn記事のみ更新

# デプロイ
npm run build             # 記事取得 + ビルド
git add . && git commit -m "更新" && git push

# テーマ変更後
zola serve --drafts       # ドラフト記事も表示
```

### 🎯 今後の改善予定

- [ ] タブレット・モバイルレスポンシブ改善
- [ ] パフォーマンス最適化
- [ ] SEO強化
- [ ] PWA対応検討

---

**作成日**: 2025-09-21  
**更新日**: 自動更新

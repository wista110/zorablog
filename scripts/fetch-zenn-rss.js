const https = require('https');
const fs = require('fs');
const path = require('path');

// Zenn RSS URL
const ZENN_RSS_URL = 'https://zenn.dev/dfuji/feed';

// RSSフィードを取得する関数
function fetchRSS(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// RSS 2.0形式のXMLをパースしてエントリーを抽出する関数
function parseRSSEntries(xmlString) {
  const entries = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(xmlString)) !== null) {
    const itemXml = match[1];
    
    // 基本的な情報を抽出（RSS 2.0形式）
    const title = extractTag(itemXml, 'title');
    const link = extractTag(itemXml, 'link');
    const pubDate = extractTag(itemXml, 'pubDate');
    const description = extractTag(itemXml, 'description');
    
    if (title && link && pubDate) {
      entries.push({
        title: cleanText(title),
        link: link.trim(),
        published: new Date(pubDate),
        summary: cleanText(description) || ''
      });
    }
  }
  
  return entries.sort((a, b) => b.published - a.published);
}

// XMLタグから内容を抽出
function extractTag(xml, tagName) {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1] : null;
}

// テキストをクリーンアップ
function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .trim();
}

// タイトルからアイコンとタグを自動判定する関数
function detectIconAndTag(title) {
  const titleLower = title.toLowerCase();
  
  // キーワードベースの判定
  if (titleLower.includes('cli') || titleLower.includes('github') || titleLower.includes('入門')) {
    return { icon: '\u{1F4DD}', tag: 'TECH' }; // 📝
  }
  if (titleLower.includes('zola') || titleLower.includes('blog') || titleLower.includes('rss')) {
    return { icon: '\u{1F680}', tag: 'TECH' }; // 🚀
  }
  if (titleLower.includes('test') || titleLower.includes('動作確認')) {
    return { icon: '\u{1F60A}', tag: 'IDEA' }; // 😊
  }
  
  // デフォルト値
  return { icon: '\u{1F4C4}', tag: 'TECH' }; // 📄
}

// MarkdownファイルとしてZenn記事セクションを作成
function createZennSection(entries) {
  const sectionDir = path.join('content', 'zenn');
  
  // ディレクトリが存在しない場合は作成
  if (!fs.existsSync(sectionDir)) {
    fs.mkdirSync(sectionDir, { recursive: true });
  }
  
  // 既存の記事ファイルをクリーンアップ
  const existingFiles = fs.readdirSync(sectionDir).filter(f => f.startsWith('article-') && f.endsWith('.md'));
  existingFiles.forEach(file => {
    fs.unlinkSync(path.join(sectionDir, file));
  });
  
  // セクションのindex.mdを作成
  const sectionContent = `+++
title = "Zenn記事"

[extra]
card_type = "grid"
discover = "続きを読む"
+++

私がZennで投稿した技術記事の一覧です。
${entries.length === 0 ? '\n現在記事を準備中です。近日公開予定！' : ''}
`;
  
  fs.writeFileSync(path.join(sectionDir, '_index.md'), sectionContent);
  
  if (entries.length === 0) {
    // 記事がない場合はプレースホルダーを作成
    const placeholderContent = `+++
title = "記事準備中"

[extra]
link = "https://zenn.dev/dfuji"
+++

現在、技術記事を準備中です。近日公開予定ですので、しばらくお待ちください！

[→ Zennプロフィールをチェック](https://zenn.dev/dfuji)
`;
    
    fs.writeFileSync(path.join(sectionDir, 'placeholder.md'), placeholderContent);
    console.log('📝 記事がないため、プレースホルダーを作成しました');
  } else {
    // 各記事のMarkdownファイルを作成（最新10件）
    entries.slice(0, 10).forEach((entry, index) => {
      const filename = `article-${String(index + 1).padStart(2, '0')}.md`;
      const publishedDate = entry.published.toISOString().split('T')[0];
      
      // タイトルから自動判定
      const { icon, tag } = detectIconAndTag(entry.title);
      const daysAgo = Math.floor((Date.now() - entry.published.getTime()) / (1000 * 60 * 60 * 24));
      const timeText = daysAgo === 0 ? '今日' : `${daysAgo}日前`;
      
      const articleContent = `+++
title = "${entry.title}"

[extra]
link = "${entry.link}"
tag = "${tag}"
icon = "${icon}"
time = "${timeText}"
likes = "0"
+++

**投稿日**: ${publishedDate}

${entry.summary}

[→ Zennで続きを読む](${entry.link})
`;
      
      fs.writeFileSync(path.join(sectionDir, filename), articleContent);
    });
    
    console.log(`✅ ${entries.length}件のZenn記事を処理しました（表示: 最新${Math.min(entries.length, 10)}件）`);
  }
}

// メイン処理
async function main() {
  try {
    console.log('🔄 Zenn RSSフィードを取得中...');
    const rssData = await fetchRSS(ZENN_RSS_URL);
    
    console.log('📝 RSS記事を解析中...');
    const entries = parseRSSEntries(rssData);
    
    console.log(`📚 ${entries.length}件の記事が見つかりました`);
    
    // Zennセクションを作成
    createZennSection(entries);
    
    // config.tomlのsectionsにzennを追加
    const configPath = 'config.toml';
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    if (!configContent.includes('sections = ["zenn"]')) {
      configContent = configContent.replace(
        /sections = \[\]/,
        'sections = ["zenn"]'
      );
      fs.writeFileSync(configPath, configContent);
      console.log('✅ config.tomlにZennセクションを追加しました');
    }
    
    console.log('🎉 Zenn記事の同期が完了しました！');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

main();
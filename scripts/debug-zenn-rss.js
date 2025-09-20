const https = require('https');
const fs = require('fs');

// Zenn RSS URL
const ZENN_RSS_URL = 'https://zenn.dev/dfuji/feed';

// RSSフィードを取得してファイルに保存する関数
function fetchAndSaveRSS(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        // RSSの生データを保存
        fs.writeFileSync('debug-rss-output.xml', data);
        console.log('✅ RSSフィードをdebug-rss-output.xmlに保存しました');
        console.log(`📝 RSS content preview (first 1000 chars):`);
        console.log(data.substring(0, 1000));
        console.log('...\n');
        
        // 基本的な構造を確認
        console.log('🔍 RSS構造の確認:');
        console.log('- feed要素:', data.includes('<feed') ? '✅' : '❌');
        console.log('- entry要素:', data.includes('<entry') ? '✅' : '❌');  
        console.log('- item要素:', data.includes('<item') ? '✅' : '❌');
        console.log('- title要素:', data.includes('<title') ? '✅' : '❌');
        console.log('- link要素:', data.includes('<link') ? '✅' : '❌');
        console.log('- published要素:', data.includes('<published') ? '✅' : '❌');
        console.log('- pubDate要素:', data.includes('<pubDate') ? '✅' : '❌');
        
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// メイン処理
async function main() {
  try {
    console.log('🔄 Zenn RSSフィードを取得中...');
    const rssData = await fetchAndSaveRSS(ZENN_RSS_URL);
    console.log('🎉 デバッグ完了！debug-rss-output.xmlを確認してください。');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

main();
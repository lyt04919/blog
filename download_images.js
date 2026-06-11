const fs = require('fs');
const path = require('path');
const https = require('https');

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filepath))
           .on('error', reject)
           .once('close', () => resolve(filepath));
      } else {
        res.resume();
        reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
};

const processList = async (listPath, imageDir, prefix) => {
  const dataPath = path.join(__dirname, 'src/app', listPath);
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const publicDir = path.join(__dirname, 'public', imageDir);
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const imgUrl = item.poster || item.cover;
    if (imgUrl && imgUrl.startsWith('http')) {
      const ext = path.extname(new URL(imgUrl).pathname) || '.jpg';
      const filename = `${prefix}_${i}${ext}`;
      const filepath = path.join(publicDir, filename);
      
      console.log(`Downloading ${imgUrl} to ${filepath}`);
      try {
        await downloadImage(imgUrl, filepath);
        if (item.poster) item.poster = `/${imageDir}/${filename}`;
        if (item.cover) item.cover = `/${imageDir}/${filename}`;
      } catch (err) {
        console.error(`Failed to download ${imgUrl}:`, err);
      }
    }
  }

  fs.writeFileSync(dataPath, JSON.stringify(data, null, '\t'), 'utf8');
  console.log(`Updated ${dataPath}`);
};

const run = async () => {
  await processList('movies/list.json', 'images/movies', 'movie');
  await processList('books/list.json', 'images/books', 'book');
};

run().catch(console.error);

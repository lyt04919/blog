const url = 'https://www.bilibili.com/video/BV1HrJ9zXEvF';

async function test() {
	const headers = {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
		'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
		'Referer': 'https://www.bilibili.com'
	};

	console.log('Fetching video URL:', url);
	const res = await fetch(url, { headers });
	console.log('Status:', res.status);
	const text = await res.text();
	console.log('Body length:', text.length);
	
	// Check if we can find title or metadata
	const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
	console.log('Title Match:', titleMatch ? titleMatch[1] : 'None');
}

test();

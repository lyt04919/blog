const fs = require('fs')
const path = require('path')

const replacements = [
	{ src: 'share', dest: 'diary', srcCap: 'Share', destCap: 'Diary' },
	{ src: 'share', dest: 'books', srcCap: 'Share', destCap: 'Book' },
	{ src: 'share', dest: 'movies', srcCap: 'Share', destCap: 'Movie' }
]

function copyDir(src, dest, config) {
	if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })
	
	const entries = fs.readdirSync(src, { withFileTypes: true })
	for (const entry of entries) {
		const srcPath = path.join(src, entry.name)
		let destName = entry.name
		destName = destName.replace(new RegExp(config.src, 'g'), config.dest)
		destName = destName.replace(new RegExp(config.srcCap, 'g'), config.destCap)
		const destPath = path.join(dest, destName)
		
		if (entry.isDirectory()) {
			copyDir(srcPath, destPath, config)
		} else {
			let content = fs.readFileSync(srcPath, 'utf8')
			content = content.replace(new RegExp('Share', 'g'), config.destCap)
			content = content.replace(new RegExp('share', 'g'), config.dest)
			content = content.replace(new RegExp('Shares', 'g'), config.destCap + 's')
			content = content.replace(new RegExp('shares', 'g'), config.dest + 's')
			if (config.dest === 'diary') {
				content = content.replace(new RegExp('Diarys', 'g'), 'Diaries')
				content = content.replace(new RegExp('diarys', 'g'), 'diaries')
			}
			fs.writeFileSync(destPath, content)
		}
	}
}

for (const config of replacements) {
	console.log(`Generating ${config.dest}...`)
	copyDir(path.join(__dirname, 'src/app/share'), path.join(__dirname, 'src/app', config.dest), config)
}

console.log('Done!')

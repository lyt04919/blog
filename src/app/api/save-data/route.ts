import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { target, data } = body;

    if (!target || !data || !Array.isArray(data)) {
      return NextResponse.json({ error: 'Invalid request body. Expected { target: "movies"|"books"|"book-categories", data: [...] }' }, { status: 400 });
    }

    let targetPath = '';
    if (target === 'movies') {
      targetPath = path.join(process.cwd(), 'src/app/favorite/movies.json');
    } else if (target === 'books') {
      targetPath = path.join(process.cwd(), 'src/app/favorite/books.json');
    } else if (target === 'book-categories') {
      targetPath = path.join(process.cwd(), 'src/app/favorite/categories.json');
    } else if (target === 'share') {
      targetPath = path.join(process.cwd(), 'src/app/favorite/share/list.json');
    } else if (target === 'bloggers') {
      targetPath = path.join(process.cwd(), 'src/app/favorite/bloggers/list.json');
    } else if (target === 'gears') {
      targetPath = path.join(process.cwd(), 'src/app/favorite/gears.json');
    } else if (target === 'software') {
      targetPath = path.join(process.cwd(), 'src/app/favorite/software.json');
    } else if (target === 'music') {
      targetPath = path.join(process.cwd(), 'src/app/favorite/music.json');
    } else if (target === 'games') {
      targetPath = path.join(process.cwd(), 'src/app/favorite/games.json');
    } else if (target === 'videos') {
      targetPath = path.join(process.cwd(), 'src/app/favorite/videos.json');
    } else if (target === 'blog-index') {
      targetPath = path.join(process.cwd(), 'public/blogs/index.json');
    } else if (target === 'blog-categories') {
      targetPath = path.join(process.cwd(), 'public/blogs/categories.json');
    } else {
      return NextResponse.json({ error: 'Invalid target. Only "movies", "books", "book-categories", "share", "bloggers", "gears", "software", "music", "games", "videos", "blog-index", or "blog-categories" are allowed.' }, { status: 400 });
    }

    // Write the formatted JSON back to the local file
    fs.writeFileSync(targetPath, JSON.stringify(data, null, '\t'), 'utf8');

    return NextResponse.json({ success: true, message: `Successfully saved ${data.length} items to ${target}.` });
  } catch (error: any) {
    console.error('Error saving data:', error);
    return NextResponse.json({ error: error.message || 'Failed to save data' }, { status: 500 });
  }
}

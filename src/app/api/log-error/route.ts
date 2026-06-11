import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const text = await req.text()
  console.log("================= CLIENT ERROR =================")
  console.log(text)
  console.log("================================================")
  return NextResponse.json({ ok: true })
}

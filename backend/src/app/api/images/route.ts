import { NextResponse } from 'next/server'
import { OpenAI } from '@/lib/openai.client'

export async function GET() {
  const openai = new OpenAI(process.env.OPENAI_API_KEY!)
  const imageUrl = (await openai.createImage('A happy little tree')).data[0].url
  console.log(`Image URL: ${imageUrl}`)
  
  return NextResponse.json({ url: imageUrl})
}
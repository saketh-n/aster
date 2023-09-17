import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from '@/lib/openai.client'
import Replicate from 'replicate'

const prompt = (text: string) => `Guidelines: \nGiven the text below, determine the overall theme of the writing in a single word.

Example:
Input: "The magician waved his wand and a the chair started levitating"
Output: "fantasy"
 
Limitations: Only return 1 or 2 words describing the theme.

Text:
${text}
`

export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get('text')!
  console.time('theme')
  console.log(`Received request for classification: ${text}`)
  const openai = new OpenAI(process.env.OPENAI_API_KEY!)
  const theme = await openai.chatCompletion('You are fiction writing classifier that is able to derive the theme of a block of text.', prompt(text), 'gpt-3.5-turbo')

  console.log('Theme from GPT', theme)
  console.timeEnd('theme')
  return NextResponse.json({ theme })
}
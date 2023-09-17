import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from '@/lib/openai.client'
import Replicate from 'replicate'

const promptPrompt = (text: string, theme: string) => `Guidelines:\nGenerate a concise and visually rich prompt for the following passage to be used in MidJourney, a generative AI image generator following a ${theme} theme. Emphasize the visual elements and ignore the importance of names and proper nouns. Ensure that the prompt is concise.
Limitations: 
The prompt should follow this theme: ${theme}

Text:
${text}
`

export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get('text')!
  const theme = req.nextUrl.searchParams.get('theme')!

  console.time(text)
  console.log(`Received request: ${text} | Theme: ${theme}`)
  const openai = new OpenAI(process.env.OPENAI_API_KEY!)
  const prompt = await openai.chatCompletion('You are an expert prompt engineer with vast experience creating prompts for generate AI models', promptPrompt(text, theme), 'gpt-3.5-turbo')

  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! })

  console.log('Prompt from GPT', prompt)

  const output = await replicate.run(
    'stability-ai/sdxl:8beff3369e81422112d93b89ca01426147de542cd4684c244b673b105188fe5f',
    { input: { prompt } }
  )
  console.log(`Image URL from Replicate: ${output}`)

  console.timeEnd(text)
  return NextResponse.json({ url: output })
}
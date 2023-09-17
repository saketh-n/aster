import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from '@/lib/openai.client'

const promptPrompt = 'Generate a concise and visually rich prompt for the following passage to be used in MidJourney, a generative AI image generator. Emphasize the visual elements and ignore the importance of names and proper nouns.'

export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get('text')!
  console.log(`Received request: ${text}`)
  const openai = new OpenAI(process.env.OPENAI_API_KEY!)
  const prompt = await openai.chatCompletion('You are an expert prompt engineer with vast experience creating prompts for generate AI models', `${promptPrompt}\n${text}`, 'gpt-3.5-turbo')

  console.log('Prompt from GPT', prompt)

  const imageUrl = (await openai.createImage(prompt)).data[0].url

  console.log(`Image URL: ${imageUrl}`)

  return NextResponse.json({ url: imageUrl })
}
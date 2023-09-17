import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from '@/lib/openai.client'
import Replicate from 'replicate'

const promptPrompt = 'Generate a concise and visually rich prompt for the following passage to be used in MidJourney, a generative AI image generator. Emphasize the visual elements and ignore the importance of names and proper nouns. Ensure that the prompt is concise.'

export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get('text')!
  console.log(`Received request: ${text}`)
  const openai = new OpenAI(process.env.OPENAI_API_KEY!)
  const prompt = await openai.chatCompletion('You are an expert prompt engineer with vast experience creating prompts for generate AI models', `${promptPrompt}\n${text}`, 'gpt-3.5-turbo')

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN!
  })


  console.log('Prompt from GPT', prompt)

  const output = await replicate.run(
    'stability-ai/sdxl:8beff3369e81422112d93b89ca01426147de542cd4684c244b673b105188fe5f',
    { input: { prompt } }
  )
  console.log(`Image URL from Replicate: ${output}`)

  return NextResponse.json({ url: output })
}
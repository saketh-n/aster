import { OpenAI as OpenAIAPI, APIError } from 'openai'
import { encode } from '@aliuq/gpt-3-encoder'
import PQueue from 'p-queue'
import { wait } from './wait'

export const percentage = (numerator: number, denominator: number): number => {
  return Math.ceil((numerator / denominator) * 100)
}

const EMBEDDING_MODEL = 'text-embedding-ada-002'
export const GPTModels = {
  GPT3: 'text-davinci-003',
  GPT3_5: 'gpt-3.5-turbo',
  GPT4: 'gpt-4'
} as const

export type GPTModel = (typeof GPTModels)[keyof typeof GPTModels]

export class OpenAI {
  private readonly openai: OpenAIAPI
  // The queue ensures we're not hitting OpenAI rate limits
  private readonly queue = new PQueue({ concurrency: 10, intervalCap: 7, interval: 200 })
  private log = console

  constructor(apiKey: string) {
    if (!apiKey) throw new Error('No OpenAI API key provided')

    this.openai = new OpenAIAPI({
      apiKey
    })
  }

  /**
   *
   * @throws {Error}
   */
  private handleError = (e: typeof APIError | Error, msg: string) => {
    if (e instanceof APIError) {
      let message = `${msg} ${e.message} | ${e.status}. `

      if (e.status === 400) {
        message += 'Bad request parameters, check payload.'
      } else if (e.status === 401) {
        message += 'Authentication error. Check API key.'
      } else if (e.status === 403) {
        message += 'Authorization error. Check subscription?'
      } else if (e.status === 404) {
        message += 'Not found error?'
      } else if (e.status === 422) {
        message += 'Unprocessable entity error. Check payload.'
      } else if (e.status === 429) {
        message += 'Rate limit exceeded.'
      } else if ((e.status || 500) >= 500) {
        message += 'Internal server error. Retry.'
      } else {
        message += 'Unknown OpenAI API connection error.'
      }

      const error = new Error(message)
      error.name = e.name
      error.stack = e.stack

      this.log.error('OpenAI APIError', { e: error })
      return error
    }

    this.log.error('Generic Error', { e: e as Error })
    return e
  }

  private handleRateLimits = async ({ headers }: Response) => {
    const totalRequestsPerMin = parseInt(headers.get('x-ratelimit-limit-requests') as string)
    const requestsRemaining = parseInt(headers.get('x-ratelimit-remaining-requests') as string)
    const totalTokensPerMin = parseInt(headers.get('x-ratelimit-limit-tokens') as string)
    const tokensRemaining = parseInt(headers.get('x-ratelimit-remaining-tokens') as string)
    // const requestResetTime = get('x-ratelimit-reset-requests')
    // const tokenResetTime = get('x-ratelimit-reset-tokens')

    if (percentage(tokensRemaining, totalTokensPerMin) < 10) {
      this.log.warn(`OpenAI: Token rate limit reached. Waiting 60 seconds`)
      await wait(60000)
    } else if (percentage(requestsRemaining, totalRequestsPerMin) < 10) {
      this.log.warn(`OpenAI: Request rate limit reached. Waiting 60 seconds`)
      await wait(60000)
    }
  }

  chatCompletion = async (systemMessage: string, prompt: string, model: GPTModel): Promise<string> => {
    const tokens: number[] = encode(prompt)
    this.log.info(`Creating completion for ${tokens.length} tokens`)

    if (model === 'gpt-4' && tokens.length > 8190) throw new Error('Prompt is too long')

    const func = async (): Promise<string> => {
      const { data: completion, response: raw } = await this.openai.chat.completions
        .create({
          temperature: 0,
          messages: [
            {
              role: 'system',
              content: systemMessage
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          model
        })
        .withResponse()

      await this.handleRateLimits(raw)
      return completion.choices[0].message.content!
    }

    return this.queue.add<string>(async () => {
      try {
        return func()
      } catch (e) {
        // Model is overloaded?
        // @ts-ignore
        if ('status' in e && e.status >= 500) {
          this.log.info('Model is overloaded, waiting 500ms and retrying')
          return wait(500).then(() => func())
        }

        throw this.handleError(e, `Error creating completion for ${systemMessage.substring(0, 20)}...\``)
      }
    }) as Promise<string>
  }

  createCompletion = async (prompt: string, temperature: number): Promise<string> => {
    const tokens: number[] = encode(prompt)
    this.log.info(`Creating completion for ${tokens.length} tokens`, { prompt: `${prompt.substring(0, 20)}...` })

    if (tokens.length > 4000) throw new Error('Prompt is too long')

    try {
      const completion = await this.openai.completions.create({
        model: GPTModels.GPT3,
        prompt,
        temperature,
        max_tokens: 2000
      })

      return completion.choices[0].text
    } catch (e) {
      throw this.handleError(e, 'Error creating completion')
    }
  }

  createEmbedding = async (input: string | string[]): Promise<Array<OpenAIAPI.Embeddings.Embedding>> => {
    const isString = typeof input === 'string'

    if (isString) {
      const tokens = this.computeTokens(input)
      this.log.info(`Creating embedding for string with ${tokens} tokens`)

      if (tokens >= 8185) throw new Error(`Input is too long for $${input.slice(0, 40)}...}`)
    } else {
      this.log.info(`Creating embedding for ${input.length} inputs`)
    }

    const { data } = await this.openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input
    })

    this.log.info('Created embedding.')

    return data
  }

  createImage = (prompt: string) => {
    return this.openai.images.generate({ prompt, n: 1, size: '512x512', response_format: 'url' })
  }

  computeTokens = (input: string): number => encode(input).length as number
}

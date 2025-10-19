import { consumeStream, convertToModelMessages, streamText, type UIMessage } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const prompt = convertToModelMessages(messages)

  const result = streamText({
    model: "openai/gpt-5-mini",
    prompt,
    abortSignal: req.signal,
    system: `Eres un asistente virtual amigable y útil. 
    Respondes en español de manera clara y concisa.
    Ayudas a los usuarios con sus preguntas y conversaciones de forma natural.`,
  })

  return result.toUIMessageStreamResponse({
    onFinish: async ({ isAborted }) => {
      if (isAborted) {
        console.log("[v0] Chat abortado por el usuario")
      }
    },
    consumeSseStream: consumeStream,
  })
}

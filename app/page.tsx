"use client"
import { VoiceChatbot } from "@/components/voice-chatbot"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/30">
      <div className="w-full max-w-4xl">
        <div className="mb-10 text-center space-y-3">
          <h1 className="text-5xl font-bold tracking-tight text-balance bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Chatbot con Voz
          </h1>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto leading-relaxed">
            Habla o escribe para interactuar con el asistente inteligente
          </p>
        </div>
        <VoiceChatbot />
      </div>
    </main>
  )
}

"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mic, MicOff, Send, Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export function VoiceChatbot() {
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const recognitionRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  // Inicializar Web Speech API
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

      if (!SpeechRecognition) {
        setIsSupported(false)
        return
      }

      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "es-ES" // Español

      recognition.onresult = (event: any) => {
        let interimTranscript = ""
        let finalTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " "
          } else {
            interimTranscript += transcript
          }
        }

        if (finalTranscript) {
          setInput((prev) => prev + finalTranscript)
        }
      }

      recognition.onerror = (event: any) => {
        console.error("Error de reconocimiento de voz:", event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const toggleListening = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || status === "in_progress") return

    sendMessage({ text: input.trim() })
    setInput("")

    // Detener grabación si está activa
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  return (
    <Card className="flex flex-col h-[650px] glass-effect shadow-2xl shadow-primary/5 border-border/50">
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <p className="text-center text-pretty text-lg">
              Comienza una conversación escribiendo o usando el micrófono
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[75%] rounded-2xl px-5 py-3 shadow-sm transition-all hover:shadow-md",
                message.role === "user"
                  ? "message-user text-primary-foreground"
                  : "bg-card text-card-foreground border border-border/50",
              )}
            >
              {message.parts.map((part, index) => {
                if (part.type === "text") {
                  return (
                    <p key={index} className="whitespace-pre-wrap text-pretty leading-relaxed">
                      {part.text}
                    </p>
                  )
                }
                return null
              })}
            </div>
          </div>
        ))}

        {status === "in_progress" && (
          <div className="flex justify-start gap-3">
            <div className="bg-card border border-border/50 rounded-2xl px-5 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Pensando...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border/50 p-6 bg-card/50 backdrop-blur-sm">
        {!isSupported && (
          <div className="mb-3 text-sm text-destructive text-center bg-destructive/10 py-2 px-4 rounded-lg">
            Tu navegador no soporta reconocimiento de voz
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Escuchando..." : "Escribe un mensaje..."}
              className={cn(
                "w-full px-5 py-3 pr-14 rounded-xl border-2 bg-background/50 backdrop-blur-sm",
                "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
                "transition-all duration-200 placeholder:text-muted-foreground/60",
                "text-base leading-relaxed",
                isListening && "border-destructive ring-2 ring-destructive/20",
              )}
              disabled={status === "in_progress"}
            />
            {isListening && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                </span>
              </div>
            )}
          </div>

          <Button
            type="button"
            variant={isListening ? "destructive" : "secondary"}
            size="icon"
            onClick={toggleListening}
            disabled={!isSupported || status === "in_progress"}
            className={cn(
              "shrink-0 h-12 w-12 rounded-xl transition-all duration-200",
              "hover:scale-105 active:scale-95",
              isListening && "animate-pulse",
            )}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || status === "in_progress"}
            className="shrink-0 h-12 w-12 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
          >
            {status === "in_progress" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </div>
    </Card>
  )
}

"use client"

import { useState } from "react"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { API_BASE_URL } from "@/lib/api-service"

export default function FraudChatbot({ transaction }: { transaction?: any }) {
  const [message, setMessage] = useState("")
  const [chat, setChat] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!message.trim() || loading) return

    const currentMessage = message
    setLoading(true)
    setMessage("")
    try {
      const res = await axios.post(`${API_BASE_URL}/api/chat`, {
        message: currentMessage,
        transaction,
      })
      setChat((prev) => [...prev, { user: currentMessage, bot: res.data.reply }])
    } catch {
      setChat((prev) => [
        ...prev,
        {
          user: currentMessage,
          bot: "Unable to connect to AI engine right now. Please verify backend chat route.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="h-full border-border bg-card">
      <CardHeader>
        <CardTitle>GraphSentinel AI Assistant</CardTitle>
        <CardDescription>Ask about patterns, anomalies, and actions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-56 overflow-y-auto rounded-md border border-border p-3 text-sm">
          {chat.length === 0 ? (
            <p className="text-muted-foreground">
              Ask GraphSentinel AI — e.g. &quot;Explain how risk score is generated for flagged transactions.&quot;
            </p>
          ) : (
            chat.map((c, i) => (
              <div key={i} className="mb-3 space-y-1">
                <p><span className="font-medium">You:</span> {c.user}</p>
                <p><span className="font-medium">GraphSentinel AI:</span> {c.bot}</p>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask GraphSentinel AI about this fraud pattern..."
          />
          <Button onClick={sendMessage} disabled={loading}>
            {loading ? "..." : "Send"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
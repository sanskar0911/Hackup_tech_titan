"use client"

import { useState } from "react"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function FraudChatbot({ transaction }: { transaction: any }) {
  const [message, setMessage] = useState("")
  const [chat, setChat] = useState<any[]>([])

  const sendMessage = async () => {
    const res = await axios.post("http://localhost:5000/api/chat", {
      message,
      transaction,
    })

    setChat([...chat, { user: message, bot: res.data.reply }])
    setMessage("")
  }

  return (
    <div className="p-3 bg-gray-900 rounded">
      <div className="h-40 overflow-y-auto mb-2">
        {chat.map((c, i) => (
          <div key={i}>
            <p>🧑 {c.user}</p>
            <p>🤖 {c.bot}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  )
}
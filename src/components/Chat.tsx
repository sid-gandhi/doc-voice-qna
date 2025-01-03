"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

import { useChat } from "ai/react";

export function TextConversation() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="flex flex-col h-[300px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className="whitespace-pre-wrap">
            {m.role === "user" ? "User: " : "AI: "}
            {m.content}
          </div>
        ))}
      </div>
      <div className="p-4 flex">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="flex-1 mr-2"
          // ={handleSubmit}
        />
        <Button onClick={handleSubmit}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

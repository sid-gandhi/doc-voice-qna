"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useChat } from "ai/react";

type Annotations = {
  sources: string[];
};

type TextConversationProps = {
  namespace: string;
};

export function TextConversation({ namespace }: TextConversationProps) {
  const { messages, input, handleInputChange, handleSubmit, data, setData } =
    useChat({
      body: { namespace },
    });

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                m.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <div className="text-sm font-semibold mb-1">
                {m.role === "user" ? "You" : "AI"}
              </div>
              <div className="whitespace-pre-wrap">{m.content} </div>
              <div>
                {m.annotations && (
                  <div className="text-xs text-gray-500 mt-1">
                    {(m.annotations[0] as Annotations)?.sources?.map(
                      (source: string, index: number) => (
                        <a
                          href={"https://www.google.com/"}
                          target="_blank"
                          rel="noopener noreferrer"
                          key={index}
                          className="inline-block bg-gray-200 rounded px-2 py-1 mr-1 mb-1 hover:bg-gray-300 transition-colors"
                        >
                          {source}
                        </a>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 flex">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="flex-1 mr-2"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit(e);
            }
          }}
        />
        <Button onClick={handleSubmit}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type ConversationMessage = {
  content: string;
  role: "user" | "assistant";
  timestamp: string;
  isSent?: boolean;
  avatarUrl: string;
};

const ChatBubble = ({
  content,
  role,
  timestamp,
  isSent = false,
  avatarUrl,
}: ConversationMessage) => {
  return (
    <div
      className={cn(
        "flex gap-2 max-w-[80%] mb-4",
        isSent ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback>
          {role[0].toUpperCase() === "U" ? "H" : "AI"}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-1">
        <div
          className={cn(
            "rounded-2xl px-4 py-2 text-sm",
            role === "user"
              ? "bg-blue-500 text-white rounded-br-none"
              : "bg-gray-100 text-gray-900 rounded-bl-none"
          )}
        >
          {content}
        </div>

        <span className="text-xs text-gray-500">{timestamp}</span>
      </div>
    </div>
  );
};

type ChatHistoryProps = { messages: ConversationMessage[] };

// Example usage component
const ChatHistory = ({ messages }: ChatHistoryProps) => {
  return (
    <div>
      <ScrollArea>
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <ChatBubble key={idx} {...msg} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatHistory;

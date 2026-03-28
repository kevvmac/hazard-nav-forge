import { useState } from "react";
import { Send, Bot, User } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Mission briefing loaded. Ask me anything about the operational environment, hazards, or recommended procedures.",
  },
];

const ChatTab = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim() };
    setMessages((prev) => [
      ...prev,
      userMsg,
      {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Acknowledged. Processing your query against mission data. This feature will be connected to an AI backend in a future update.",
      },
    ]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-2">
            <div className={`shrink-0 h-5 w-5 flex items-center justify-center mt-0.5 ${
              msg.role === "assistant" ? "text-primary" : "text-muted-foreground"
            }`}>
              {msg.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </div>
            <div className={`text-xs leading-relaxed ${
              msg.role === "assistant" ? "text-foreground" : "text-muted-foreground"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-border p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about the mission..."
          className="flex-1 bg-input border border-border px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="px-3 py-2 bg-primary text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default ChatTab;

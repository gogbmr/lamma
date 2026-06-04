"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User, Loader2, Sparkles, MessageSquare, Trash2 } from "lucide-react";

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

interface AiChatbotProps {
  lessonId: string;
  lessonTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function AiChatbot({ lessonId, lessonTitle, isOpen, onClose }: AiChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = { role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          message: trimmed,
          history: messages, // Send full conversation history
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [...prev, { role: "model", text: data.response }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "model", text: data.error || "Sorry, I encountered an error. Please try again." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "Network error. Please check your connection and try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Slide-over Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border z-50 flex flex-col transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">AI Lesson Assistant</h3>
              <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[200px]">
                {lessonTitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                title="Clear chat"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-10">
              <div className="w-16 h-16 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-center">
                <MessageSquare className="h-7 w-7 text-primary/40" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Ask anything about this lesson</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
                  I have full context of the video content. Ask me to explain concepts, 
                  clarify timestamps, or dive deeper into topics.
                </p>
              </div>
              <div className="space-y-2 w-full max-w-[280px]">
                {[
                  "Summarize this lesson for me",
                  "Explain the key concepts covered",
                  "What happens at the beginning?",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => { setInput(suggestion); inputRef.current?.focus(); }}
                    className="w-full text-left text-xs p-2.5 bg-muted/50 hover:bg-muted border border-border rounded-xl text-muted-foreground hover:text-foreground transition-colors font-medium"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "model" && (
                <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] text-xs leading-relaxed rounded-2xl px-3.5 py-2.5 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted/60 border border-border text-foreground rounded-bl-md"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 bg-muted rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="bg-muted/60 border border-border rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-muted/10 shrink-0">
          <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-1 focus-within:ring-1 focus-within:ring-primary">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about this lesson..."
              disabled={isLoading}
              className="flex-1 text-xs py-2.5 bg-transparent outline-none font-medium text-foreground placeholder:text-muted-foreground"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2 font-medium">
            AI responses are based on the lesson video content only.
          </p>
        </div>
      </div>
    </>
  );
}

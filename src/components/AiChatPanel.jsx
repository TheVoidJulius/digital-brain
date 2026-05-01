import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBrain } from "../context/BrainContext";
import { useToast } from "./Toast";
import { Send, Copy, Bot, Sparkles, Trash2, ArrowDown } from "lucide-react";

export default function AIChatPanel() {
  const { notes } = useBrain();
  const { addToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async (text = input) => {
    if (!text.trim() || loading) return;

    const userMsg = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    const notesContext = notes.map(n => 
      `Title: ${n.title}\nContent: ${n.content}\nTags: ${n.tags.join(", ")}`
    ).join("\n\n---\n\n");

    const systemPrompt = `You are a helpful second brain assistant. The user has the following notes:\n\n${notesContext}\n\nHelp the user find connections, summarize ideas, and answer questions based on their notes. Keep responses concise and use markdown formatting where appropriate.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: updated.map(m => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }]
            })),
            systemInstruction: { parts: [{ text: systemPrompt }] }
          }),
        }
      );

      const data = await response.json();
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: data.candidates[0].content.parts[0].text,
        }]);
      } else {
        throw new Error("Invalid response");
      }
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Error: Could not reach AI. Please check your API key or connection." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    addToast("Message copied to clipboard", "success");
  };

  const suggestions = [
    "Summarize all my notes",
    "What are the common themes?",
    "Find connections between my ideas",
    "Write a blog post based on my latest note"
  ];

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-primary)", position: "relative" }}>

      {/* Header */}
      <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-glass)", backdropFilter: "var(--blur-md)", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, var(--accent-primary), #ec4899)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(236, 72, 153, 0.3)" }}>
            <Sparkles size={16} color="white" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "var(--text-primary)" }}>Ask Your Brain</h2>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>Powered by Gemini AI</p>
          </div>
        </div>
        
        {messages.length > 0 && (
          <button 
            className="button-base"
            onClick={() => setMessages([])}
            style={{ padding: "6px 12px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)", background: "var(--bg-secondary)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--danger-color)"; e.currentTarget.style.background = "rgba(255, 69, 58, 0.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "var(--bg-secondary)"; }}
          >
            <Trash2 size={14} /> Clear Chat
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {messages.length === 0 ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", maxWidth: "600px", margin: "0 auto", width: "100%" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "var(--bg-glass)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px", boxShadow: "var(--shadow-md)" }}>
              <Bot size={32} color="var(--accent-primary)" />
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>How can I help you today?</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", textAlign: "center", marginBottom: "32px", lineHeight: "1.6" }}>
              I have access to your {notes.length} notes. I can help you summarize them, find hidden connections, or brainstorm new ideas based on what you've written.
            </p>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", width: "100%" }}>
              {suggestions.map((sug, i) => (
                <button 
                  key={i}
                  className="button-base glass-panel"
                  onClick={() => sendMessage(sug)}
                  style={{ padding: "16px", borderRadius: "12px", textAlign: "left", fontSize: "13px", color: "var(--text-secondary)", transition: "all var(--transition-fast)", border: "1px solid var(--border-color)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-primary)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <span style={{ color: "var(--accent-primary)", display: "block", marginBottom: "8px" }}><Sparkles size={14}/></span>
                  {sug}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "24px" }}>
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  style={{
                    display: "flex",
                    flexDirection: msg.role === "user" ? "row-reverse" : "row",
                    gap: "16px",
                    alignItems: "flex-start"
                  }}
                >
                <div style={{ 
                  width: "32px", height: "32px", borderRadius: "10px", flexShrink: 0,
                  background: msg.role === "user" ? "var(--bg-secondary)" : "linear-gradient(135deg, var(--accent-primary), #ec4899)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: msg.role === "user" ? "none" : "0 4px 12px rgba(236, 72, 153, 0.2)"
                }}>
                  {msg.role === "user" ? <div style={{width:"8px", height:"8px", borderRadius:"50%", background:"var(--text-muted)"}}/> : <Sparkles size={16} color="white" />}
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "80%" }}>
                  <div className={msg.role === "user" ? "" : "glass-panel"} style={{
                    padding: "16px",
                    borderRadius: "16px",
                    borderTopRightRadius: msg.role === "user" ? "4px" : "16px",
                    borderTopLeftRadius: msg.role === "assistant" ? "4px" : "16px",
                    background: msg.role === "user" ? "var(--text-primary)" : "var(--bg-glass)",
                    color: msg.role === "user" ? "var(--bg-primary)" : "var(--text-primary)",
                    fontSize: "15px",
                    lineHeight: "1.6",
                    boxShadow: msg.role === "user" ? "var(--shadow-sm)" : "none"
                  }}>
                    {/* Basic parsing for markdown-like display */}
                    <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  </div>
                  
                  {msg.role === "assistant" && (
                    <button 
                      className="button-base"
                      onClick={() => copyToClipboard(msg.content)}
                      style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "var(--text-muted)", padding: "4px 8px", borderRadius: "4px" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-secondary)"; e.currentTarget.style.color = "var(--text-primary)" }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)" }}
                    >
                      <Copy size={12} /> Copy
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
            
            {loading && (
              <div className="animate-fade-in" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "linear-gradient(135deg, var(--accent-primary), #ec4899)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.5 }}>
                  <Sparkles size={16} color="white" />
                </div>
                <div className="glass-panel" style={{ padding: "16px 24px", borderRadius: "16px", borderTopLeftRadius: "4px", display: "flex", gap: "6px", alignItems: "center" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent-primary)", animation: "typing 1.4s infinite 0s" }}></div>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent-primary)", animation: "typing 1.4s infinite 0.2s" }}></div>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent-primary)", animation: "typing 1.4s infinite 0.4s" }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div style={{ padding: "20px 24px", borderTop: "1px solid var(--border-color)", background: "var(--bg-glass)", backdropFilter: "var(--blur-md)", zIndex: 10 }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative" }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask a question about your notes... (Shift+Enter for new line)"
            className="input-base glass-panel"
            style={{ 
              width: "100%", padding: "16px 56px 16px 16px", borderRadius: "16px", fontSize: "15px", 
              resize: "none", minHeight: "56px", maxHeight: "150px", overflowY: "auto",
              lineHeight: "1.5", transition: "all var(--transition-fast)",
              boxShadow: "var(--shadow-sm)"
            }}
            onFocus={(e) => e.target.style.boxShadow = "0 0 0 2px var(--accent-glow), var(--shadow-sm)"}
            onBlur={(e) => e.target.style.boxShadow = "var(--shadow-sm)"}
            rows={1}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="button-base"
            style={{ 
              position: "absolute", right: "8px", bottom: "8px", width: "40px", height: "40px", 
              borderRadius: "12px", background: input.trim() && !loading ? "var(--text-primary)" : "var(--bg-secondary)", 
              color: input.trim() && !loading ? "var(--bg-primary)" : "var(--text-muted)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: input.trim() && !loading ? "pointer" : "not-allowed"
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
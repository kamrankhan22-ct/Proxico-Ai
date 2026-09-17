import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are a helpful, sharp, and concise AI assistant. Answer clearly and directly.`;

export default function ProxicoAI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(SYSTEM_PROMPT);
  const [showSettings, setShowSettings] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    const userMsg = { role: "user", content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: newMessages,
        }),
      });
      const data = await response.json();
      const reply = data.content?.map((b) => b.text || "").join("") || "No response.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages([...newMessages, { role: "assistant", content: "⚠️ Error reaching the API." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      color: "#e8e6f0",
      fontFamily: "'Georgia', serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "0",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 720,
        padding: "28px 24px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        borderBottom: "1px solid #1e1e2e",
      }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.25em", color: "#6c6a7c", textTransform: "uppercase", marginBottom: 4 }}>
            Welcome to
          </div>
          <div style={{ fontSize: 28, fontWeight: "bold", letterSpacing: "-0.5px", color: "#f0eeff" }}>
            Proxico AI ✦
          </div>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            background: showSettings ? "#2a2040" : "transparent",
            border: "1px solid #2e2c42",
            color: "#9990bb",
            borderRadius: 8,
            padding: "6px 14px",
            cursor: "pointer",
            fontSize: 13,
            fontFamily: "inherit",
          }}
        >
          {showSettings ? "Close" : "⚙ Settings"}
        </button>
      </div>

      {showSettings && (
        <div style={{
          width: "100%",
          maxWidth: 720,
          padding: "16px 24px",
          background: "#0f0e1a",
          borderBottom: "1px solid #1e1e2e",
        }}>
          <label style={{ fontSize: 12, color: "#6c6a7c", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            System Prompt
          </label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={3}
            style={{
              display: "block",
              width: "100%",
              marginTop: 8,
              background: "#16131f",
              border: "1px solid #2e2c42",
              borderRadius: 8,
              color: "#c8c4e0",
              fontFamily: "monospace",
              fontSize: 13,
              padding: "10px 12px",
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={() => { setMessages([]); setShowSettings(false); }}
            style={{
              marginTop: 10,
              background: "#1e1a2e",
              border: "1px solid #3a3560",
              color: "#b0a8d8",
              borderRadius: 6,
              padding: "6px 14px",
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "inherit",
            }}
          >
            Clear chat & apply
          </button>
        </div>
      )}

      <div style={{
        flex: 1,
        width: "100%",
        maxWidth: 720,
        padding: "24px 24px 0",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        minHeight: "calc(100vh - 240px)",
      }}>
        {messages.length === 0 && (
          <div style={{
            margin: "auto",
            textAlign: "center",
            color: "#3e3c54",
            fontSize: 15,
            lineHeight: 1.8,
            paddingTop: 60,
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>◈</div>
            Ask me anything.<br />
            <span style={{ fontSize: 12, color: "#2e2c42" }}>Shift+Enter for new line · Enter to send</span>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              fontSize: 10,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: msg.role === "user" ? "#5a5078" : "#3a5870",
              marginBottom: 4,
              paddingLeft: 4,
            }}>
              {msg.role === "user" ? "You" : "Proxico AI"}
            </div>
            <div style={{
              maxWidth: "85%",
              padding: "12px 16px",
              borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: msg.role === "user" ? "#1e1830" : "#111424",
              border: `1px solid ${msg.role === "user" ? "#2e2848" : "#1a2035"}`,
              fontSize: 15,
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              color: msg.role === "user" ? "#d4cff0" : "#c0cce0",
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#3a5870", marginBottom: 4, paddingLeft: 4 }}>
              Proxico AI
            </div>
            <div style={{
              padding: "12px 18px",
              borderRadius: "16px 16px 16px 4px",
              background: "#111424",
              border: "1px solid #1a2035",
              display: "flex",
              gap: 6,
              alignItems: "center",
            }}>
              {[0, 1, 2].map(j => (
                <div key={j} style={{
                  width: 6, height: 6,
                  borderRadius: "50%",
                  background: "#4a4878",
                  animation: "pulse 1.2s infinite",
                  animationDelay: `${j * 0.2}s`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{
        width: "100%",
        maxWidth: 720,
        padding: "16px 24px 28px",
        position: "sticky",
        bottom: 0,
        background: "linear-gradient(transparent, #0a0a0f 30%)",
      }}>
        <div style={{
          display: "flex",
          gap: 10,
          background: "#111018",
          border: "1px solid #2a2840",
          borderRadius: 14,
          padding: "4px 4px 4px 16px",
          boxShadow: "0 0 0 1px #1a1830 inset",
        }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type your message…"
            rows={1}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: "#ddd8f8",
              fontFamily: "'Georgia', serif",
              fontSize: 15,
              resize: "none",
              outline: "none",
              padding: "10px 0",
              lineHeight: 1.5,
              maxHeight: 120,
              overflowY: "auto",
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            style={{
              background: input.trim() && !loading ? "#3d2f6e" : "#1a1830",
              border: "none",
              borderRadius: 10,
              width: 42,
              height: 42,
              alignSelf: "flex-end",
              cursor: input.trim() && !loading ? "pointer" : "default",
              color: input.trim() && !loading ? "#c8b8ff" : "#3a3858",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            ↑
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
        textarea::placeholder { color: #3a3858; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
                }

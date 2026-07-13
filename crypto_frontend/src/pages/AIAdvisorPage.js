import { useState } from "react";
import {Btn,SectionLabel} from "../components/toolkit/UIComponents";

const EXAMPLES = [
  { label: "🏦 Banking app",      text: "I want to secure login tokens for a mobile banking app" },
  { label: "🏥 Medical records",  text: "I need to encrypt patient health records in a hospital database" },
  { label: "💬 Chat app",         text: "I am building a chat app like WhatsApp with end-to-end encryption" },
  { label: "📦 Software signing", text: "I want to digitally sign software releases so users can verify authenticity" },
];

export default function AIAdvisorTab() {
  const [usecase, setUsecase] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function askAI() {
    if (!usecase.trim()) { setResponse("Please describe your use case above."); return; }
    setLoading(true); setResponse("");
    try {
      const res = await fetch("https://crypto-z0td.onrender.com/api/ai-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: usecase }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(c => c.text || "").join("") || "Could not get a response.";
      setResponse(text);
    } catch (e) { setResponse("Error connecting to AI. Please check your connection."); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-4">
      <SectionLabel>Describe your use case</SectionLabel>
      <textarea
        rows={4}
        value={usecase}
        onChange={e => setUsecase(e.target.value)}
        placeholder="E.g. I want to encrypt medical records in a hospital system…"
        className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2.5
          text-sm text-slate-200 placeholder-slate-500 resize-none
          focus:outline-none focus:border-cyan-500/60 transition"
      />

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map(ex => (
          <button
            key={ex.label}
            onClick={() => setUsecase(ex.text)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg
              bg-slate-800/60 border border-slate-600 text-slate-300
              hover:border-cyan-400/50 hover:text-cyan-400 transition"
          >
            {ex.label}
          </button>
        ))}
      </div>

      <Btn primary onClick={askAI} disabled={loading}>
        {loading ? "⏳ Thinking…" : "✨ Ask AI Advisor"}
      </Btn>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className={`w-2 h-2 rounded-full ${loading ? "bg-cyan-400 animate-pulse" : "bg-slate-600"}`} />
          <span className="text-xs text-slate-400">{loading ? "AI is thinking…" : "AI Advisor"}</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4
          text-sm text-slate-300 leading-relaxed whitespace-pre-wrap min-h-[100px]">
          {response || "Describe your project above and the AI will recommend RSA or ECC, explain why, and outline implementation steps."}
        </div>
      </div>
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";

// ----------------------------------
// Types
// ----------------------------------

type HistoryItem = {
  id: string;
  idea: string;
  profession: string;
  result: string;
  promptType: string;
  promptTypeLabel: string;
  lengthStyle: string;
  lengthStyleLabel: string;
  timestamp: string;
};

// ----------------------------------
// Constants
// ----------------------------------

const PROMPT_TYPES = {
  "role-goal":        { label: "ROLE · GOAL · INSTRUCTIONS · OUTPUT" },
  "task-context":     { label: "TASK · CONTEXT · CONSTRAINTS · DELIVERABLE" },
  "persona-scenario": { label: "PERSONA · SCENARIO · BEHAVIOR · STYLE" },
  "system-user":      { label: "SYSTEM PROMPT · USER MESSAGE · BEHAVIOR" },
  "chain-of-thought": { label: "OBJECTIVE · STEP BY STEP · ANSWER FORMAT" },
  "custom":           { label: "✦  BUILD YOUR OWN" },
};

const CUSTOM_SECTIONS = [
  "ROLE", "GOAL", "TASK", "CONTEXT", "INSTRUCTIONS",
  "CONSTRAINTS", "OUTPUT", "DELIVERABLE", "PERSONA",
  "SCENARIO", "BEHAVIOR", "STYLE", "OBJECTIVE",
  "EXAMPLES", "TONE", "AUDIENCE", "FORMAT", "RULES",
];

const LENGTH_STYLES = [
  { key: "short",       label: "Short",       sublabel: "~80 words",    desc: "One line per section. Fast, minimal, no fluff.",         icon: "▪"   },
  { key: "medium",      label: "Medium",      sublabel: "150–250 words", desc: "Balanced mix of bullets and brief paragraphs.",          icon: "▪▪"  },
  { key: "long",        label: "Long",        sublabel: "300+ words",    desc: "Detailed and thorough. Best for complex tasks.",         icon: "▪▪▪" },
  { key: "bullet-only", label: "Bullet-only", sublabel: "All points",    desc: "Everything as bullet points — no paragraphs at all.",   icon: "≡"   },
  { key: "paragraph",   label: "Paragraph",   sublabel: "Flowing prose", desc: "Natural sentences only — no bullets anywhere.",         icon: "¶"   },
];

const PROFESSION_SUGGESTIONS = [
  "Web Developer", "Student", "Content Writer", "UI/UX Designer",
  "Data Scientist", "Filmmaker", "Marketing Manager", "Startup Founder",
];

const MAX_HISTORY = 10;

// ----------------------------------
// Component
// ----------------------------------

export default function Home() {
  const [profession, setProfession] = useState("");
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState("");
  const [promptTypeLabel, setPromptTypeLabel] = useState("");
  const [lengthStyleLabel, setLengthStyleLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("role-goal");
  const [selectedLength, setSelectedLength] = useState("medium");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<"generate" | "history">("generate");
  const [copied, setCopied] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<HistoryItem | null>(null);
  const [customSections, setCustomSections] = useState<string[]>([]);

  const toggleCustomSection = (section: string) => {
    setCustomSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : prev.length < 6
        ? [...prev, section]
        : prev
    );
  };

  useEffect(() => {
    const saved = localStorage.getItem("promptcraft-history");
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch {}
    }
  }, []);

  const saveHistory = (items: HistoryItem[]) => {
    setHistory(items);
    localStorage.setItem("promptcraft-history", JSON.stringify(items));
  };

  const generatePrompt = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("http://127.0.0.1:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea,
          profession: profession.trim(),
          prompt_type: selectedType,
          length_style: selectedLength,
          custom_sections: selectedType === "custom" ? customSections : [],
        }),
      });

      const data = await response.json();
      setResult(data.result);
      setPromptTypeLabel(data.prompt_type_label);
      setLengthStyleLabel(data.length_style_label);

      const newItem: HistoryItem = {
        id: Date.now().toString(),
        idea: idea.trim(),
        profession: profession.trim(),
        result: data.result,
        promptType: selectedType,
        promptTypeLabel: data.prompt_type_label,
        lengthStyle: selectedLength,
        lengthStyleLabel: data.length_style_label,
        timestamp: new Date().toLocaleString("en-IN", {
          day: "2-digit", month: "short",
          hour: "2-digit", minute: "2-digit",
        }),
      };

      saveHistory([newItem, ...history].slice(0, MAX_HISTORY));
    } catch {
      setResult("Error: Backend not running. Start with: uvicorn main:app --reload");
    } finally {
      setLoading(false);
    }
  };

  const copyPrompt = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportPrompt = (text: string, typeLabel: string, styleLabel: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prompt-${typeLabel}-${styleLabel}-${Date.now()}.txt`
      .toLowerCase().replace(/\s+/g, "-");
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadFromHistory = (item: HistoryItem) => {
    setProfession(item.profession || "");
    setIdea(item.idea);
    setResult(item.result);
    setSelectedType(item.promptType);
    setSelectedLength(item.lengthStyle);
    setPromptTypeLabel(item.promptTypeLabel);
    setLengthStyleLabel(item.lengthStyleLabel);
    setActiveTab("generate");
  };

  // ----------------------------------
  // Render
  // ----------------------------------

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-black">
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <span className="inline-block bg-black text-white text-xs font-mono px-3 py-1 rounded-full tracking-widest uppercase mb-4">
            AI Tool
          </span>
          <h1 className="text-5xl font-black tracking-tight">
            Prompt<span className="text-gray-400">Craft</span>
          </h1>
          <p className="mt-2 text-gray-500">Human ideas → structured AI prompts</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-xl w-fit">
          {(["generate", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                activeTab === tab ? "bg-black text-white" : "text-gray-500 hover:text-black"
              }`}
            >
              {tab}
              {tab === "history" && history.length > 0 && (
                <span className="ml-2 bg-gray-300 text-gray-700 text-xs px-1.5 py-0.5 rounded-full">
                  {history.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ===== GENERATE TAB ===== */}
        {activeTab === "generate" && (
          <div className="space-y-8">

            {/* STEP 0 — Profession */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                Who are you? <span className="text-gray-300 normal-case font-normal tracking-normal">(optional)</span>
              </label>
              <p className="text-xs text-gray-400 mb-3">
                Helps shape the prompt around your experience and objectives.
              </p>

              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="e.g. Filmmaker, Web Developer, 3rd year IT student..."
                className="w-full px-4 py-3 border-2 border-gray-200 bg-white rounded-xl text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors"
              />

              {/* Quick-pick chips */}
              {!profession && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {PROFESSION_SUGGESTIONS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setProfession(p)}
                      className="px-3 py-1 text-xs bg-white border border-gray-200 rounded-full text-gray-500 hover:border-black hover:text-black transition-all"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              {/* Show clear chip if profession is set */}
              {profession && (
                <div className="flex items-center gap-2 mt-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-xs rounded-full font-medium">
                    {profession}
                    <button
                      onClick={() => setProfession("")}
                      className="text-gray-400 hover:text-white ml-0.5"
                    >
                      ✕
                    </button>
                  </span>
                  <span className="text-xs text-gray-400">Prompt will be tailored to this</span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* STEP 1 — Prompt Structure */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                1 · Prompt Structure
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(PROMPT_TYPES).map(([key, type]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedType(key)}
                    className={`text-left p-3.5 rounded-xl border-2 transition-all ${
                      selectedType === key
                        ? "border-black bg-black text-white"
                        : "border-gray-200 bg-white hover:border-gray-400"
                    }`}
                  >
                    <div className={`text-xs font-mono tracking-tight font-semibold ${
                      selectedType === key ? "text-gray-300" : "text-gray-400"
                    }`}>
                      {type.label}
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom section picker — appears when custom is selected */}
              {selectedType === "custom" && (
                <div className="mt-3 p-4 border-2 border-black rounded-xl bg-white">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                      Pick 4–6 sections
                    </p>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                      customSections.length >= 4
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}>
                      {customSections.length} / 6
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {CUSTOM_SECTIONS.map((section) => {
                      const selected = customSections.includes(section);
                      const order = customSections.indexOf(section);
                      return (
                        <button
                          key={section}
                          onClick={() => toggleCustomSection(section)}
                          disabled={!selected && customSections.length >= 6}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-xs font-mono font-bold transition-all disabled:opacity-30 ${
                            selected
                              ? "border-black bg-black text-white"
                              : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-400 hover:text-black"
                          }`}
                        >
                          {selected && (
                            <span className="w-4 h-4 rounded-full bg-white text-black text-xs flex items-center justify-center font-black leading-none">
                              {order + 1}
                            </span>
                          )}
                          {section}
                        </button>
                      );
                    })}
                  </div>

                  {customSections.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-400">Your structure:</span>
                      <span className="text-xs font-mono text-gray-600">
                        {customSections.join(" · ")}
                      </span>
                      {customSections.length >= 4 && (
                        <span className="ml-auto text-xs text-green-600 font-semibold">✓ Ready</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* STEP 2 — Length & Style */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                2 · Length & Style
              </label>
              <div className="grid grid-cols-5 gap-2">
                {LENGTH_STYLES.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setSelectedLength(s.key)}
                    title={s.desc}
                    className={`flex flex-col items-center text-center p-3 rounded-xl border-2 transition-all ${
                      selectedLength === s.key
                        ? "border-black bg-black text-white"
                        : "border-gray-200 bg-white hover:border-gray-400"
                    }`}
                  >
                    <span className="text-lg font-mono leading-none mb-1">{s.icon}</span>
                    <span className="text-xs font-bold">{s.label}</span>
                    <span className={`text-xs mt-0.5 ${selectedLength === s.key ? "text-gray-400" : "text-gray-400"}`}>
                      {s.sublabel}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2 pl-1">
                {LENGTH_STYLES.find((s) => s.key === selectedLength)?.desc}
              </p>
            </div>

            {/* STEP 3 — Idea */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                3 · Your Idea
              </label>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe your project, task, or what you want to build..."
                className="w-full h-40 p-4 border-2 border-gray-200 bg-white rounded-xl text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors resize-none"
              />
            </div>

            {/* Generate */}
            <button
              onClick={generatePrompt}
              disabled={loading || !idea.trim() || (selectedType === "custom" && customSections.length < 4)}
              className="w-full py-3.5 bg-black text-white rounded-xl font-bold text-sm disabled:opacity-40 hover:bg-gray-900 transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </span>
              ) : (
                "Generate Prompt →"
              )}
            </button>

            {/* Result */}
            {result && (
              <div className="border-2 border-black rounded-2xl overflow-hidden bg-white">
                <div className="flex justify-between items-center px-6 py-4 bg-black text-white">
                  <div>
                    <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                      Generated Prompt
                    </span>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-sm font-bold">{promptTypeLabel}</span>
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full text-gray-300">
                        {lengthStyleLabel}
                      </span>
                      {profession && (
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full text-gray-300">
                          {profession}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => copyPrompt(result)}
                      className="px-4 py-2 bg-white text-black rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
                    >
                      {copied ? "Copied ✓" : "Copy"}
                    </button>
                    <button
                      onClick={() => exportPrompt(result, promptTypeLabel, lengthStyleLabel)}
                      className="px-4 py-2 border border-gray-600 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
                    >
                      Export .txt
                    </button>
                  </div>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-black leading-7 p-6 font-mono">
                  {result}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* ===== HISTORY TAB ===== */}
        {activeTab === "history" && (
          <div>
            {history.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <div className="text-5xl mb-4">📭</div>
                <p className="font-semibold">No history yet</p>
                <p className="text-sm mt-1">Generated prompts will appear here</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-500">{history.length} of {MAX_HISTORY} saved</p>
                  <button
                    onClick={() => { saveHistory([]); setSelectedHistory(null); }}
                    className="text-sm text-red-500 hover:text-red-700 font-semibold"
                  >
                    Clear all
                  </button>
                </div>

                <div className="space-y-3">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedHistory(selectedHistory?.id === item.id ? null : item)}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                        selectedHistory?.id === item.id
                          ? "border-black bg-white"
                          : "border-gray-200 bg-white hover:border-gray-400"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{item.idea}</p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {item.profession && (
                              <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full font-medium">
                                {item.profession}
                              </span>
                            )}
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-mono">
                              {item.promptTypeLabel}
                            </span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-mono">
                              {item.lengthStyleLabel}
                            </span>
                            <span className="text-xs text-gray-400">{item.timestamp}</span>
                          </div>
                        </div>
                        <span className="text-gray-400 text-sm shrink-0">
                          {selectedHistory?.id === item.id ? "▲" : "▼"}
                        </span>
                      </div>

                      {selectedHistory?.id === item.id && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <pre className="whitespace-pre-wrap text-xs font-mono text-gray-700 leading-6 mb-4">
                            {item.result}
                          </pre>
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={(e) => { e.stopPropagation(); loadFromHistory(item); }}
                              className="px-3 py-1.5 bg-black text-white rounded-lg text-xs font-semibold"
                            >
                              Load & Edit
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); copyPrompt(item.result); }}
                              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold"
                            >
                              Copy
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); exportPrompt(item.result, item.promptTypeLabel, item.lengthStyleLabel); }}
                              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold"
                            >
                              Export .txt
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
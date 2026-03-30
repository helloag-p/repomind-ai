"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import s from "./page.module.css";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const EMPTY_VALUES = new Set(["none","none detected","undetermined","unknown","n/a","null","undefined","-","—"]);

function fmt(v: any): string {
  if (v === null || v === undefined || v === "") return "";
  if (Array.isArray(v)) return v.filter(Boolean).join(", ");
  if (typeof v === "object") return Object.entries(v).filter(([,val])=>val).map(([k,val])=>`${k}: ${val}`).join(" · ");
  const str = String(v).trim();
  return EMPTY_VALUES.has(str.toLowerCase()) ? "" : str;
}

function timeStr() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ── Typing animation hook ──────────────────────────────────── */
function useTypingEffect(words: string[], speed = 80, pause = 1800) {
  const [display, setDisplay] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx % words.length];
    const delay = deleting ? speed / 2 : charIdx === current.length ? pause : speed;
    const t = setTimeout(() => {
      if (!deleting && charIdx === current.length) { setDeleting(true); return; }
      if (deleting && charIdx === 0) { setDeleting(false); setWordIdx(i => i + 1); return; }
      setCharIdx(i => i + (deleting ? -1 : 1));
      setDisplay(current.slice(0, charIdx + (deleting ? -1 : 1)));
    }, delay);
    return () => clearTimeout(t);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);

  return display;
}

/* ── Skeleton card ──────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className={s.card}>
      <div className={s.skeletonIcon} />
      <div className={s.skeletonLabel} />
      <div className={s.skeletonValue} />
    </div>
  );
}

function SkeletonSection() {
  return (
    <div className={`${s.section} ${s.skeletonSection}`}>
      <div className={s.skeletonSectionHead}>
        <div className={s.skeletonSIcon} />
        <div className={s.skeletonSTitle} />
      </div>
      <div className={s.skeletonSBody}>
        <div className={s.skeletonLine} />
        <div className={s.skeletonLine} style={{ width: "80%" }} />
        <div className={s.skeletonLine} style={{ width: "65%" }} />
      </div>
    </div>
  );
}

/* ── Feature pill ───────────────────────────────────────────── */
function FeaturePill({ icon, text }: { icon: string; text: string }) {
  return (
    <div className={s.featurePill}>
      <span className={s.featurePillIcon}>{icon}</span>
      <span>{text}</span>
    </div>
  );
}

/* ── Stat card ──────────────────────────────────────────────── */
function StatCard({ icon, label, value, delay = 0 }: { icon: string; label: string; value: any; delay?: number }) {
  const display = fmt(value);
  return (
    <div className={s.card} style={{ animationDelay: `${delay}ms` }}>
      <div className={s.cardInner}>
        <span className={s.cardIcon}>{icon}</span>
        <p className={s.cardLabel}>{label}</p>
        {display ? <p className={s.cardValue}>{display}</p> : <p className={s.cardEmpty}>Not detected</p>}
      </div>
    </div>
  );
}

/* ── Score card ─────────────────────────────────────────────── */
function ScoreCard({ score, max = 10 }: { score: number; max?: number }) {
  const na    = score === 0;
  const pct   = Math.round((score / max) * 100);
  const color = na ? "#3a3f52" : pct >= 80 ? "#00e5a0" : pct >= 55 ? "#f59e0b" : "#ff4d6d";
  return (
    <div className={`${s.card} ${s.scoreCard}`} style={{ animationDelay: "150ms" }}>
      <p className={s.cardLabel}>Repo Score</p>
      {na ? <p className={s.scoreNa}>N/A</p> : <p className={s.scoreNum} style={{ color }}>{score}</p>}
      <p className={s.scoreDenom}>/ {max}</p>
      <div className={s.scoreBar}>
        <div className={s.scoreBarFill} style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

/* ── Typing dots ────────────────────────────────────────────── */
function TypingDots() {
  return (
    <div className={s.typing}>
      <div className={`${s.ava} ${s.avaBot}`}>AI</div>
      <div className={s.typingBubble}>
        <span className={s.dot} /><span className={s.dot} /><span className={s.dot} />
      </div>
    </div>
  );
}

/* ── Copy button ────────────────────────────────────────────── */
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button className={s.copyBtn} onClick={copy} title="Copy">
      {copied
        ? <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="#00e5a0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        : <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2"/></svg>
      }
    </button>
  );
}

/* ── Section toggle ─────────────────────────────────────────── */
function SectionToggle({ title, icon, count, children, delay = 0 }: {
  title: string; icon: string; count?: number; children: React.ReactNode; delay?: number;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className={s.section} style={{ animationDelay: `${delay}ms` }}>
      <button className={s.sectionHead} onClick={() => setOpen(o => !o)}>
        <span className={s.sectionIcon}>{icon}</span>
        <span className={s.sectionTitle}>{title}</span>
        {count !== undefined && <span className={s.sectionCount}>{count}</span>}
        <svg className={s.sectionChevron}
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
          width="12" height="12" fill="none" viewBox="0 0 24 24">
          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && <div className={s.sectionBody}>{children}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════════ */
export default function Home() {
  const [repoUrl, setRepoUrl]         = useState("");
  const [rawData, setRawData]         = useState<any>(null);
  const [question, setQuestion]       = useState("");
  const [messages, setMessages]       = useState<{ role: string; content: string; time: string }[]>([]);
  const [loading, setLoading]         = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const typedWord = useTypingEffect(["any GitHub repo.", "your codebase.", "open-source projects.", "your team's repos."]);

  // Auto-scroll chat
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, chatLoading]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }, [question]);

  const analyze = async () => {
    if (!repoUrl.trim()) return;
    setLoading(true); setRawData(null); setMessages([]);
    try {
      const r = await axios.get(`${API}/analyze`, { params: { repo_url: repoUrl } });
      setRawData(r.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const chat = useCallback(async () => {
    const q = question.trim();
    if (!q || chatLoading) return;
    setMessages(p => [...p, { role: "user", content: q, time: timeStr() }]);
    setQuestion(""); setChatLoading(true);
    try {
      const r = await axios.get(`${API}/chat`, { params: { repo_url: repoUrl, question: q } });
      setMessages(p => [...p, { role: "bot", content: r.data.answer, time: timeStr() }]);
    } catch {
      setMessages(p => [...p, { role: "bot", content: "Something went wrong. Please try again.", time: timeStr() }]);
    } finally { setChatLoading(false); }
  }, [question, chatLoading, repoUrl]);

  const a  = rawData?.analysis ?? {};
  const sc = rawData?.score    ?? {};

  const CHIPS = ["What's the main architecture?", "List key dependencies", "Explain the entry point", "Any security concerns?"];
  const FEATURES = [
    { icon: "🔍", text: "Deep code analysis" },
    { icon: "📊", text: "Quality scoring" },
    { icon: "🧩", text: "Module breakdown" },
    { icon: "💬", text: "RAG-powered chat" },
    { icon: "⚡", text: "Improvement suggestions" },
  ];

  return (
    <div className={s.root}>

      {/* Background scene */}
      <div className={s.scene}>
        <div className={s.beam} />
        <div className={s.orb} />
        <div className={s.scanline} />
        <div className={s.noise} />
      </div>

      {/* Navbar */}
      <nav className={s.nav}>
        <div className={s.logo}>
          <div className={s.logoMark}>⚡</div>
          <span className={s.logoText}>Repo<span>Mind AI</span></span>
        </div>
        <div className={s.navRight}>
          <span className={`${s.tag} ${s.tagLive}`}><span className={s.livePulse} />Live</span>
          <span className={s.tag}>v2.0</span>
        </div>
      </nav>

      <main className={s.main}>

        {/* ── HERO ── */}
        {!rawData && !loading && (
          <div className={s.hero}>
            <div className={s.heroBadge}><span className={s.heroBadgeDot} />AI-Powered Repo Analysis</div>
            <h1 className={s.heroH1}>
              Understand<br />
              <span className={s.teal}>{typedWord}</span>
              <span className={s.cursor}>|</span>
            </h1>
            <p className={s.heroSub}>
              Paste a URL. Get deep analysis, tech-stack insights, quality scores,
              and an AI assistant that knows every line of code.
            </p>
            <div className={s.featurePills}>
              {FEATURES.map(f => <FeaturePill key={f.text} icon={f.icon} text={f.text} />)}
            </div>
          </div>
        )}

        {/* ── INPUT CARD ── */}
        <div className={s.glass}>
          <div className={s.glassInner}>
            <div className={s.inputLabel}>Repository URL</div>
            <div className={s.inputRow}>
              <div className={s.inputWrap}>
                <span className={s.inputIcon}>~/</span>
                <input
                  className={s.input}
                  placeholder="github.com/owner/repository"
                  value={repoUrl}
                  onChange={e => setRepoUrl(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && analyze()}
                />
              </div>
              <button className={s.btn} onClick={analyze} disabled={loading || !repoUrl.trim()}>
                {loading
                  ? <span className={s.btnInner}><span className={s.spinner} />Analyzing…</span>
                  : "Analyze →"}
              </button>
            </div>
            {loading && (
              <div className={s.progressRow}>
                <div className={s.progressTrack}><div className={s.progressFill} /></div>
                <span className={s.progressText}>Cloning &amp; indexing repo…</span>
              </div>
            )}
          </div>
        </div>

        {/* ── SKELETON ── */}
        {loading && (
          <div className={s.skeletonResults}>
            <div className={s.skeletonStrip} />
            <div className={s.grid}>
              <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
            <SkeletonSection />
            <SkeletonSection />
          </div>
        )}

        {/* ── RESULTS ── */}
        {rawData && (
          <div className={s.results}>

            {/* Repo header */}
            <div className={s.repoStrip}>
              <div className={s.repoStripIcon}>📦</div>
              <div className={s.repoStripInfo}>
                <p className={s.repoName}>{repoUrl.replace("https://github.com/", "")}</p>
                <p className={s.repoMeta}>Indexed · {new Date().toLocaleTimeString()}</p>
              </div>
              <span className={s.readyBadge}>✓ Ready</span>
            </div>

            {/* Stat grid */}
            <div className={s.grid}>
              <StatCard icon="🏗️" label="Project Type" value={a.project_type} delay={0}   />
              <StatCard icon="⚙️" label="Framework"    value={a.framework}    delay={60}  />
              <StatCard icon="💻" label="Languages"    value={a.languages}    delay={120} />
              <ScoreCard score={sc.repo_score ?? 0} max={sc.max_score ?? 10} />
            </div>

            {/* Architecture */}
            {a.architecture && (
              <SectionToggle title="Architecture" icon="🗺️" delay={0}>
                <p className={s.archText}>{a.architecture}</p>
              </SectionToggle>
            )}

            {/* Key Modules */}
            {a.key_modules?.length > 0 && (
              <SectionToggle title="Key Modules" icon="🧩" count={a.key_modules.length} delay={50}>
                <div className={s.moduleGrid}>
                  {a.key_modules.map((m: any, i: number) => {
                    const isStr = typeof m === "string";
                    const name  = isStr ? m : (m.name ?? m.title ?? m.module ?? "");
                    const desc  = isStr ? "" : (m.description ?? m.desc ?? m.detail ?? "");
                    return (
                      <div key={i} className={`${s.moduleCard} ${!desc ? s.moduleCardCompact : ""}`}>
                        <p className={s.moduleName}>
                          <span className={s.moduleIndex}>{String(i + 1).padStart(2, "0")}</span>
                          {name}
                        </p>
                        {desc && <p className={s.moduleDesc}>{desc}</p>}
                      </div>
                    );
                  })}
                </div>
              </SectionToggle>
            )}

            {/* Improvements */}
            {a.improvements?.length > 0 && (
              <SectionToggle title="Suggested Improvements" icon="⚡" count={a.improvements.length} delay={100}>
                <div className={s.improvements}>
                  {a.improvements.map((imp: any, i: number) => {
                    const isStr = typeof imp === "string";
                    const area  = isStr ? null : (imp.area ?? imp.title ?? imp.name ?? imp.category ?? null);
                    const text  = isStr ? imp  : (imp.suggestion ?? imp.description ?? imp.detail ?? imp.text ?? imp.content ?? JSON.stringify(imp));
                    return (
                      <div key={i} className={s.impRow}>
                        <div className={s.impBadge}><span className={s.impNum}>{i + 1}</span></div>
                        <div className={s.impBody}>
                          {area && <p className={s.impArea}>{area}</p>}
                          <p className={s.impSuggestion}>{text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionToggle>
            )}

            {/* ── CHAT ── */}
            <div className={s.chatPanel}>
              <div className={s.chatHead}>
                <div className={s.chatHeadLeft}>
                  <div className={s.chatHeadIcon}>💬</div>
                  <div>
                    <p className={s.chatHeadTitle}>Repo Chat</p>
                    <p className={s.chatHeadSub}>RAG-powered · context-aware</p>
                  </div>
                </div>
                <div className={s.chatHeadRight}>
                  <span className={s.chatOnline} />{messages.length} messages
                </div>
              </div>

              <div className={s.msgs}>
                {messages.length === 0 && !chatLoading && (
                  <div className={s.empty}>
                    <div className={s.emptyIcon}>🤖</div>
                    <p className={s.emptyText}>Ask anything about this repo — architecture, dependencies, functions, patterns…</p>
                    <div className={s.chips}>
                      {CHIPS.map(c => (
                        <button key={c} className={s.chip} onClick={() => setQuestion(c)}>{c}</button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((m, i) => (
                  <div key={i} className={`${s.row} ${m.role === "user" ? s.rowUser : ""}`}>
                    {m.role === "bot" && <div className={`${s.ava} ${s.avaBot}`}>AI</div>}

                    <div className={s.bubbleWrap}>
                      <div className={`${s.bubble} ${m.role === "user" ? s.bubbleUser : s.bubbleBot}`}>
                        {m.role === "bot"
                          ? <div className="md"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                          : m.content}
                      </div>
                      <div className={`${s.bubbleMeta} ${m.role === "user" ? s.bubbleMetaUser : ""}`}>
                        <span className={s.timestamp}>{m.time}</span>
                        {m.role === "bot" && <CopyBtn text={m.content} />}
                      </div>
                    </div>

                    {m.role === "user" && <div className={`${s.ava} ${s.avaUser}`}>U</div>}
                  </div>
                ))}

                {chatLoading && <TypingDots />}
                <div ref={bottomRef} />
              </div>

              <div className={s.inputZone}>
                <div className={s.inputBox}>
                  <textarea
                    ref={textareaRef}
                    className={s.textarea}
                    rows={1}
                    placeholder="Ask about this repo… (Enter to send)"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); chat(); } }}
                  />
                  <button className={s.sendBtn} onClick={chat} disabled={chatLoading || !question.trim()} aria-label="Send">
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="#020c08" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                <p className={s.hint}>Responses grounded in repo source code via RAG · Shift+Enter for newline</p>
              </div>
            </div>

          </div>
        )}
      </main>

      <footer className={s.footer}>
        RepoMind AI · Next.js + FastAPI · <span>RAG-powered</span> analysis
      </footer>
    </div>
  );
}
import { useState, useEffect, useCallback, useRef, createContext, useContext, useMemo } from "react";

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 20, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);
const ArrowLeft     = p => <Icon {...p} d="M19 12H5M12 5l-7 7 7 7" />;
const AlertTriangle = p => <Icon {...p} d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />;
const Search        = p => <Icon {...p} d={["M11 17.25a6.25 6.25 0 1 1 0-12.5 6.25 6.25 0 0 1 0 12.5z","M16 16l4.5 4.5"]} />;
const Save          = p => <Icon {...p} d={["M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z","M17 21v-8H7v8","M7 3v5h8"]} />;
const Archive       = p => <Icon {...p} d={["M21 8v13H3V8","M1 3h22v5H1z","M10 12h4"]} />;
const Eye           = p => <Icon {...p} d={["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z","M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"]} />;
const CheckCircle   = p => <Icon {...p} d={["M22 11.08V12a10 10 0 1 1-5.93-9.14","M22 4L12 14.01l-3-3"]} />;
const XCircle       = p => <Icon {...p} d={["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z","M15 9l-6 6","M9 9l6 6"]} />;
const X             = p => <Icon {...p} d="M18 6L6 18M6 6l12 12" />;
const Loader2       = p => <Icon {...p} d="M21 12a9 9 0 1 1-6.219-8.56" />;
const ImageIcon     = p => <Icon {...p} d={["M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z","M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z","M21 15l-5-5L5 21"]} />;
const BookOpen      = p => <Icon {...p} d={["M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z","M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"]} />;
const Calculator    = p => <Icon {...p} d={["M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z","M8 6h8","M8 10h2","M12 10h2","M16 10h.01","M8 14h.01","M12 14h.01","M16 14h.01","M8 18h.01","M12 18h.01","M16 18h.01"]} />;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const VERBAL_CATS = ["Words in Context","Central Ideas & Details","Text Structure & Purpose","Transitions","Rhetorical Synthesis","Boundaries","Form, Structure & Sense","Command of Evidence","Inferences","Cross-Text Connections"];
const MATH_CATS   = ["Algebra","Advanced Math","Problem Solving & Data Analysis","Geometry & Trigonometry","Statistics & Probability","Number Theory","Ratios & Proportions","Systems of Equations","Functions","Word Problems"];

const SECTION_META = {
  verbal: { label: "VERBAL", color: "#7C3AED", bg: "rgba(124,58,237,.1)", border: "rgba(124,58,237,.4)", cats: VERBAL_CATS },
  math:   { label: "MATH",   color: "#0891B2", bg: "rgba(8,145,178,.1)",  border: "rgba(8,145,178,.4)",  cats: MATH_CATS   },
};

// ─── STORE ────────────────────────────────────────────────────────────────────
const AppCtx = createContext(null);
const loadLS = (k, d) => { try { return JSON.parse(localStorage.getItem(k) ?? "null") ?? d; } catch { return d; } };
const saveLS = (k, v) => localStorage.setItem(k, JSON.stringify(v));

function AppProvider({ children }) {
  const [screen,    setScreen]    = useState("intro");
  const [errorLogs, setErrorLogs] = useState(() => loadLS("error_logs", []));
  const [toasts,    setToasts]    = useState([]);

  useEffect(() => saveLS("error_logs", errorLogs), [errorLogs]);

  const todayErrors = useMemo(() => errorLogs.filter(e =>
    new Date(e.created_at).toDateString() === new Date().toDateString() && e.status === "needs_review"
  ), [errorLogs]);

  const addToast = useCallback((text, type) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(p => [...p, { id, text, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 2800);
  }, []);

  const addErrorLog = useCallback(async log => {
    const entry = { ...log, id: Date.now().toString(), status: "needs_review", review_count: 0, last_reviewed_at: null, created_at: new Date().toISOString() };
    setErrorLogs(p => [entry, ...p]);
    addToast("Error logged!", "success");
  }, [addToast]);

  const updateErrorLog = useCallback(async (id, updates) => {
    setErrorLogs(p => p.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const markErrorMastered = useCallback(async id => {
    setErrorLogs(p => p.map(e => e.id === id ? { ...e, status: "mastered", review_count: (e.review_count||0)+1, last_reviewed_at: new Date().toISOString() } : e));
    addToast("MASTERED!", "xp");
  }, [addToast]);

  return (
    <AppCtx.Provider value={{ screen, setScreen, errorLogs, todayErrors, addErrorLog, updateErrorLog, markErrorMastered, toasts, addToast }}>
      {children}
    </AppCtx.Provider>
  );
}
const useApp = () => useContext(AppCtx);

// ─── CSS ──────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Press+Start+2P&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
  *{box-sizing:border-box}
  body{margin:0;background:#0A0A1A;font-family:'Space Mono',monospace;color:#E0E0E0;overflow-x:hidden}
  .fp{font-family:'Press Start 2P',cursive}
  .fm{font-family:'Space Mono',monospace;letter-spacing:.02em}

  /* SAT panels — Be Vietnam Pro handles Vietnamese perfectly */
  .sat-panel{background:#fff;color:#1a1a2e;font-family:'Be Vietnam Pro',sans-serif;font-size:16px;line-height:1.75}
  .sat-passage{font-size:15.5px;line-height:1.9;color:#1a1a2e;text-align:left;font-family:'Be Vietnam Pro',sans-serif;white-space:pre-wrap}
  .sat-question{font-size:15px;color:#1a1a2e;font-weight:600;margin-bottom:16px;text-align:left;font-family:'Be Vietnam Pro',sans-serif}
  .sat-option{display:flex;align-items:flex-start;gap:10px;padding:10px 14px;border:1.5px solid #d0d0d0;border-radius:6px;cursor:pointer;background:#fff;width:100%;text-align:left;font-family:'Be Vietnam Pro',sans-serif;font-size:15px;color:#1a1a2e;margin-bottom:8px;transition:all .15s}
  .sat-option:hover{border-color:#4a90e2;background:#f0f6ff}
  .sat-option.selected{border-color:#4a90e2;background:#e8f0fe}
  .sat-option.correct{border-color:#2e7d32;background:#e8f5e9;color:#2e7d32}
  .sat-option.wrong{border-color:#c62828;background:#ffebee;color:#c62828}
  .sat-option-letter{width:28px;height:28px;border-radius:50%;border:1.5px solid #888;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;font-family:'Space Mono',monospace}
  .sat-option.selected .sat-option-letter{border-color:#4a90e2;background:#4a90e2;color:#fff}
  .sat-option.correct .sat-option-letter{border-color:#2e7d32;background:#2e7d32;color:#fff}
  .sat-option.wrong .sat-option-letter{border-color:#c62828;background:#c62828;color:#fff}

  /* retro UI */
  .pixel-border-pink{border:2px solid #FF007F;box-shadow:0 0 8px #FF007F30}
  .pixel-border-verbal{border:2px solid #7C3AED;box-shadow:0 0 8px #7C3AED30}
  .pixel-border-math{border:2px solid #0891B2;box-shadow:0 0 8px #0891B230}
  .retro-btn{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.05em;padding:9px 18px;border:2px solid;cursor:pointer;background:linear-gradient(180deg,#1E1E3E,#12122A);transition:all .15s;user-select:none;display:inline-flex;align-items:center;gap:6px;color:#E0E0E0}
  .retro-btn:hover{transform:translateY(-2px);filter:brightness(1.3)}
  .retro-btn:active{transform:translateY(1px);filter:brightness(.8)}
  .retro-btn:disabled{opacity:.4;cursor:not-allowed;transform:none!important;filter:none!important}
  .pixel-input{background:#12122A;border:2px solid #2A2A4A;font-family:'Be Vietnam Pro',sans-serif;font-size:15px;padding:8px 12px;outline:none;color:#E0E0E0;width:100%;transition:border-color .2s}
  .pixel-input:focus{border-color:#00FF66}
  .pixel-input::placeholder{color:#4A4A6A}
  .pixel-textarea{background:#12122A;border:2px solid #2A2A4A;font-family:'Be Vietnam Pro',sans-serif;font-size:15px;padding:8px 12px;outline:none;color:#E0E0E0;width:100%;resize:vertical;transition:border-color .2s;line-height:1.6}
  .pixel-textarea:focus{border-color:#00FF66}
  .pixel-textarea::placeholder{color:#4A4A6A}

  @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
  @keyframes fadeup{0%{opacity:0;transform:translateY(14px)}100%{opacity:1;transform:translateY(0)}}
  @keyframes title-g{0%,100%{text-shadow:0 0 10px #00FF66,0 0 30px #00FF66}50%{text-shadow:0 0 4px #00FF66}}
  @keyframes title-p{0%,100%{text-shadow:0 0 10px #FF007F,0 0 30px #FF007F}50%{text-shadow:0 0 4px #FF007F}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .anim-blink{animation:blink 1s step-end infinite}
  .anim-float{animation:fadeup .4s ease-out}
  .anim-tg{animation:title-g 1.5s ease-in-out infinite}
  .anim-tp{animation:title-p 1.5s ease-in-out infinite}
  .anim-spin{animation:spin 1s linear infinite}
  .scanlines::after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.07) 2px,rgba(0,0,0,.07) 4px);pointer-events:none;z-index:50}

  ::-webkit-scrollbar{width:6px}
  ::-webkit-scrollbar-track{background:#0A0A1A}
  ::-webkit-scrollbar-thumb{background:#2A2A4A}
  select option{background:#12122A;color:#E0E0E0}

  /* SAT split review */
  .review-divider{width:1px;background:#d5d5d5;flex-shrink:0}
  .review-left{overflow-y:auto;padding:32px 36px;background:#fff;flex:1;min-width:0}
  .review-right{overflow-y:auto;padding:28px 32px;background:#fafafa;flex:1;min-width:0;display:flex;flex-direction:column}
  .mark-bar{background:#f5f5f5;border-bottom:1px solid #ddd;padding:8px 16px;display:flex;align-items:center;gap:10px;font-family:'Space Mono',monospace;font-size:11px;color:#555;flex-shrink:0;letter-spacing:.03em}
  .mark-btn{background:none;border:1.5px solid #aaa;padding:4px 12px;border-radius:4px;cursor:pointer;font-family:'Space Mono',monospace;font-size:10px;color:#555}
  .mark-btn.active{background:#ede9fe;border-color:#7C3AED;color:#7C3AED}

  /* feedback boxes */
  .fb-root{padding:12px 16px;background:#fff8e1;border:1px solid #f9a825;border-radius:6px;margin-bottom:8px}
  .fb-reasoning{padding:12px 16px;background:#f3e8ff;border:1px solid #a855f7;border-radius:6px;margin-bottom:8px}
  .fb-action{padding:12px 16px;background:#e3f2fd;border:1px solid #1976d2;border-radius:6px;margin-bottom:8px}
  .fb-label{font-family:'Space Mono',monospace;font-size:10px;font-weight:700;letter-spacing:.06em;margin-bottom:6px}
  .fb-text{font-family:'Be Vietnam Pro',sans-serif;font-size:15px;line-height:1.7;color:#333;margin:0}
`;

// ─── STARFIELD ────────────────────────────────────────────────────────────────
function StarField() {
  const ref = useRef();
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); let id;
    const stars = [];
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    for (let i = 0; i < 100; i++) stars.push({ x: Math.random()*1400, y: Math.random()*900, sz: Math.random()*2+.3, sp: Math.random()*.22+.04, op: Math.random()*.6+.3 });
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      for (const s of stars) {
        s.y -= s.sp; if (s.y < 0) { s.y = c.height; s.x = Math.random()*c.width; }
        const t = .5 + .5*Math.sin(Date.now()*.002 + s.x);
        ctx.fillStyle = `rgba(200,220,255,${s.op*t})`;
        ctx.fillRect(~~s.x, ~~s.y, Math.ceil(s.sz), Math.ceil(s.sz));
      }
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }}/>;
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ message }) {
  const c = { success:"#00FF66", xp:"#FFD700", error:"#FF3333" }[message.type] || "#00FF66";
  return (
    <div className="anim-float fm" style={{ fontSize:10, padding:"10px 16px", background:"#12122A", border:`2px solid ${c}`, color:c, boxShadow:`0 0 10px ${c}40` }}>
      {message.text}
    </div>
  );
}

// ─── INTRO ────────────────────────────────────────────────────────────────────
function IntroScreen() {
  const { setScreen } = useApp();
  const [fade, setFade] = useState(false);
  const go = () => { setFade(true); setTimeout(() => setScreen("hub"), 500); };
  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", opacity:fade?0:1, transition:"opacity .4s", position:"relative" }}>
      <div className="scanlines" style={{ position:"absolute", inset:0, pointerEvents:"none" }}/>
      <h1 className="fp anim-tg" style={{ fontSize:"clamp(22px,4.5vw,46px)", color:"#00FF66", margin:0, lineHeight:1.6 }}>SAT ERROR</h1>
      <h1 className="fp anim-tp" style={{ fontSize:"clamp(22px,4.5vw,46px)", color:"#FF007F", margin:"8px 0 32px", lineHeight:1.6 }}>LOG TRACKER</h1>
      <p className="fm anim-blink" style={{ fontSize:13, color:"#00D4FF", marginBottom:40, letterSpacing:".15em" }}>TRACK / REVIEW / MASTER</p>
      <button onClick={go} className="retro-btn" style={{ color:"#00FF66", borderColor:"#00FF66", fontSize:12, padding:"14px 36px" }}>[ START ]</button>
    </div>
  );
}

// ─── MAIN HUB ─────────────────────────────────────────────────────────────────
function MainHub() {
  const { setScreen, errorLogs, todayErrors } = useApp();
  const verbal  = errorLogs.filter(e => e.section === "verbal");
  const math    = errorLogs.filter(e => e.section === "math");
  const total   = errorLogs.length;
  const mastered= errorLogs.filter(e => e.status === "mastered").length;

  const SectionCard = ({ section }) => {
    const m    = SECTION_META[section];
    const list = section === "verbal" ? verbal : math;
    const Icon = section === "verbal" ? BookOpen : Calculator;
    const active = list.filter(e => e.status === "needs_review").length;
    return (
      <button
        onClick={() => setScreen(`error-input-${section}`)}
        style={{ background:"#12122A", border:`2px solid ${m.border}`, boxShadow:`0 0 10px ${m.bg}`, padding:"24px 20px", cursor:"pointer", textAlign:"left", transition:"transform .2s", display:"flex", gap:16, alignItems:"flex-start" }}
        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
        onMouseLeave={e => e.currentTarget.style.transform = ""}
      >
        <div style={{ padding:10, background:m.bg, border:`1px solid ${m.border}`, flexShrink:0 }}>
          <Icon size={28} style={{ color:m.color }}/>
        </div>
        <div>
          <p className="fp" style={{ fontSize:8, color:m.color, marginBottom:6 }}>{m.label}</p>
          <h2 className="fp" style={{ fontSize:12, color:"#fff", marginBottom:8, lineHeight:1.8 }}>LOG {m.label} ERROR</h2>
          <p className="fm" style={{ fontSize:11, color:"#9090A0", marginBottom:8 }}>{list.length} logged · {active} active</p>
        </div>
      </button>
    );
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", background:"#0A0A1A" }}>
      {/* Header */}
      <div style={{ background:"#12122A", borderBottom:"2px solid #2A2A4A", padding:"14px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span className="fp" style={{ fontSize:10, color:"#FF007F" }}>SAT ERROR LOG</span>
        <div style={{ display:"flex", gap:20 }}>
          <span className="fm" style={{ fontSize:11, color:"#9090A0" }}>TOTAL: <span style={{ color:"#fff" }}>{total}</span></span>
          <span className="fm" style={{ fontSize:11, color:"#00FF66" }}>MASTERED: {mastered}</span>
        </div>
      </div>

      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
        <div style={{ maxWidth:680, width:"100%", display:"flex", flexDirection:"column", gap:16 }}>
          {/* Two section entry cards */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <SectionCard section="verbal"/>
            <SectionCard section="math"/>
          </div>

          {/* Review + Archive row */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {todayErrors.length > 0 && (
              <button onClick={() => setScreen("error-review")} className="retro-btn" style={{ color:"#FF007F", borderColor:"rgba(255,0,127,.5)", justifyContent:"center", width:"100%" }}>
                <AlertTriangle size={13}/>REVIEW TODAY ({todayErrors.length})
              </button>
            )}
            <button
              onClick={() => setScreen("error-archive")}
              style={{ background:"#12122A", border:"2px solid #2A2A4A", padding:"12px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:10, color:"#E0E0E0", transition:"all .2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor="#FF007F"}
              onMouseLeave={e => e.currentTarget.style.borderColor="#2A2A4A"}
            >
              <Archive size={20} style={{ color:"#FF007F" }}/>
              <div>
                <p className="fp" style={{ fontSize:7, color:"#9090A0", margin:0 }}>ARCHIVE</p>
                <p className="fm" style={{ fontSize:11, color:"#6B6B8A", margin:0 }}>{total} errors</p>
              </div>
            </button>
          </div>

          {/* Stats bar */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {["verbal","math"].map(sec => {
              const m    = SECTION_META[sec];
              const list = sec === "verbal" ? verbal : math;
              const mast = list.filter(e => e.status === "mastered").length;
              return (
                <div key={sec} style={{ background:"#12122A", border:`1px solid ${m.border}`, padding:"10px 14px" }}>
                  <p className="fp" style={{ fontSize:7, color:m.color, marginBottom:6 }}>{m.label}</p>
                  <div style={{ display:"flex", gap:16 }}>
                    <span className="fm" style={{ fontSize:10, color:"#9090A0" }}>Total: {list.length}</span>
                    <span className="fm" style={{ fontSize:10, color:"#00FF66" }}>✓ {mast}</span>
                    <span className="fm" style={{ fontSize:10, color:"#FF8800" }}>⚡ {list.length - mast}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ERROR INPUT ──────────────────────────────────────────────────────────────
// Verbal is always MCQ. Math supports MCQ + Fill-in.
function ErrorInput({ section }) {
  const { setScreen, addErrorLog } = useApp();
  const m    = SECTION_META[section];
  const cats = m.cats;
  const isMath = section === "math";

  const [qFormat,    setQFormat]    = useState("mcq");
  const [qType,      setQType]      = useState("");
  const [passage,    setPassage]    = useState("");
  const [prompt,     setPrompt]     = useState("");
  const [opts,       setOpts]       = useState(["","","",""]);
  const [correct,    setCorrect]    = useState(null);
  const [selected,   setSelected]   = useState(null);
  const [correctAns, setCorrectAns] = useState("");
  const [myAns,      setMyAns]      = useState("");
  const [rootCause,  setRootCause]  = useState("");
  const [reasoning,  setReasoning]  = useState("");
  const [actionPlan, setActionPlan] = useState("");
  const [saving,     setSaving]     = useState(false);
  const [scanning,   setScanning]   = useState(false);
  const [scannedImg, setScannedImg] = useState(null);

  const switchFormat = (fmt) => {
    setQFormat(fmt);
    setCorrect(null); setSelected(null); setOpts(["","","",""]);
    setCorrectAns(""); setMyAns("");
  };

  const handlePaste = useCallback(async e => {
    const items = e.clipboardData?.items || [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        e.preventDefault();
        const file = items[i].getAsFile(); if (!file) return;
        const b64WithHeader = await new Promise(res => { const r = new FileReader(); r.onload = ev => res(ev.target.result); r.readAsDataURL(file); });
        setScannedImg(b64WithHeader);
        setScanning(true);
        
        // Thêm dòng này để cắt bỏ phần đầu "data:image/png;base64," đi
        const pureBase64 = b64WithHeader.split(',')[1];
        try {
          const res = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST", 
  headers: {
    "Content-Type": "application/json",
    "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY,
    "anthropic-version": "2023-06-01",
    "anthropic-dangerous-direct-browser-access": "true"
  },
            body: JSON.stringify({
              model:"claude-3-5-sonnet-20241022", max_tokens:1500,
              messages:[{ role:"user", content:[
                { type:"image", source:{ type:"base64", media_type:file.type, data: pureBase64 } },
                { type:"text", text:`This is a SAT ${isMath ? "Math" : "Reading & Writing"} question screenshot.
${isMath
  ? `Determine format: "mcq" (has A B C D options) or "fill" (empty answer box, no options).`
  : `Format is always "mcq" (Reading & Writing is always multiple choice).`}
Return ONLY pure JSON (no markdown):
{
  "format": "${isMath ? 'mcq or fill' : 'mcq'}",
  "question_type": "the skill/category tested",
  "passage": "full passage, stimulus, or given context (all text before the question)",
  "question_prompt": "the direct question being asked",
  "options": { "A": "...", "B": "...", "C": "...", "D": "..." }
}
${isMath ? "For fill-in, set options to null." : "Always include all four options."}` }
              ]}]
            })
          });
          const data = await res.json();
          const raw  = (data.content||[]).map(c=>c.text||"").join("").replace(/```json|```/g,"").trim();
          const parsed = JSON.parse(raw);
          if (isMath && parsed.format === "fill") setQFormat("fill");
          else setQFormat("mcq");
          if (parsed.question_type) {
            const matched = cats.find(c => c.toLowerCase().includes(parsed.question_type.toLowerCase().split(" ")[0]));
            if (matched) setQType(matched);
          }
          if (parsed.passage)          setPassage(parsed.passage);
          if (parsed.question_prompt)  setPrompt(parsed.question_prompt);
          if (parsed.options && parsed.format !== "fill")
            setOpts([parsed.options.A||"", parsed.options.B||"", parsed.options.C||"", parsed.options.D||""]);
        } catch { /* silent */ }
        setScanning(false);
        return;
      }
    }
    const text = e.clipboardData.getData("text");
    if (!text) return;
    const lines    = text.trim().split("\n").map(l=>l.trim()).filter(Boolean);
    const optLines = lines.filter(l => /^[A-D][.)]\s/.test(l));
    if (optLines.length === 4 && !["pixel-textarea","pixel-input"].some(cls => e.target.classList.contains(cls))) {
      e.preventDefault();
      setOpts(optLines.map(l => l.replace(/^[A-D][.):\s]+/,"").trim()));
    }
  }, [cats, isMath]);

  const canSave = qFormat === "mcq"
    ? !saving && qType && prompt.trim() && correct !== null && opts.every(o=>o.trim())
    : !saving && qType && prompt.trim() && correctAns.trim();

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    if (qFormat === "mcq") {
      await addErrorLog({ section, q_format:"mcq", question_type:qType, passage:passage.trim()||null, question_prompt:prompt.trim(), answer_options:opts.filter(o=>o.trim()), correct_option_index:correct, selected_option_index:selected, image_url:null, root_cause:rootCause.trim()||null, reasoning:reasoning.trim()||null, action_plan:actionPlan.trim()||null });
    } else {
      await addErrorLog({ section, q_format:"fill", question_type:qType, passage:passage.trim()||null, question_prompt:prompt.trim(), answer_options:[], correct_option_index:null, selected_option_index:null, correct_answer:correctAns.trim(), my_answer:myAns.trim()||null, image_url:null, root_cause:rootCause.trim()||null, reasoning:reasoning.trim()||null, action_plan:actionPlan.trim()||null });
    }
    setQType(""); setPassage(""); setPrompt(""); setOpts(["","","",""]); setCorrect(null); setSelected(null);
    setCorrectAns(""); setMyAns(""); setRootCause(""); setReasoning(""); setActionPlan(""); setScannedImg(null);
    setSaving(false);
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", background:"#0A0A1A" }} onPaste={handlePaste}>
      {/* Header */}
      <div style={{ background:"#12122A", borderBottom:`2px solid ${m.border}`, padding:"11px 16px", display:"flex", alignItems:"center", gap:14 }}>
        <button onClick={() => setScreen("hub")} style={{ background:"none", border:"none", color:"#9090A0", cursor:"pointer" }}><ArrowLeft size={24}/></button>
        <span className="fp" style={{ fontSize:9, color:m.color, background:m.bg, padding:"3px 8px", border:`1px solid ${m.border}` }}>{m.label}</span>
        <h1 className="fp" style={{ fontSize:11, color:"#fff", margin:0 }}>LOG ERROR</h1>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:16, paddingBottom:80 }}>
        <div style={{ maxWidth:760, margin:"0 auto", display:"flex", flexDirection:"column", gap:14 }}>

          {/* Format toggle — Math only */}
          {isMath && (
            <div style={{ display:"flex", gap:0 }}>
              {[
                { key:"mcq",  label:"MCQ  (A–D)",           icon:"◉" },
                { key:"fill", label:"Fill-in (numeric answer)", icon:"▭" },
              ].map(f => (
                <button key={f.key} onClick={() => switchFormat(f.key)}
                  style={{ flex:1, padding:"10px 0", cursor:"pointer", fontFamily:"'Space Mono',monospace", fontSize:10, letterSpacing:".04em",
                    background: qFormat===f.key ? m.color : "#12122A",
                    color:      qFormat===f.key ? "#fff"   : "#6B6B8A",
                    border:`2px solid ${qFormat===f.key ? m.color : "#2A2A4A"}`,
                    borderRight: f.key==="mcq" ? "none" : undefined,
                    fontWeight:  qFormat===f.key ? 700 : 400 }}>
                  {f.icon} &nbsp;{f.label}
                </button>
              ))}
            </div>
          )}

          {/* OCR paste zone */}
          <div style={{ background:m.bg, border:`2px dashed ${m.border}`, padding:14, textAlign:"center" }}>
            {scanning ? (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                <Loader2 size={18} style={{ color:m.color, animation:"spin 1s linear infinite" }}/>
                <span className="fm" style={{ fontSize:10, color:m.color }}>AI SCANNING...</span>
              </div>
            ) : scannedImg ? (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                <span className="fm" style={{ fontSize:10, color:"#00FF66" }}>✓ SCANNED — form auto-filled</span>
                <button onClick={() => setScannedImg(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"#6B6B8A" }}><X size={13}/></button>
              </div>
            ) : (
              <div>
                <ImageIcon size={22} style={{ color:m.color, display:"block", margin:"0 auto 6px", opacity:.55 }}/>
                <p className="fp" style={{ fontSize:8, color:m.color, margin:"0 0 4px" }}>Ctrl+V TO PASTE SAT SCREENSHOT</p>
                <p style={{ fontFamily:"'Be Vietnam Pro',sans-serif", fontSize:13, color:"#6B6B8A", margin:0 }}>
                  AI will auto-detect the format and extract passage, question & options
                </p>
              </div>
            )}
          </div>

          {/* Form */}
          <div style={{ background:"#12122A", border:`2px solid ${m.border}`, padding:20, display:"flex", flexDirection:"column", gap:14 }}>

            <div>
              <label className="fp" style={{ fontSize:8, color:m.color, display:"block", marginBottom:5 }}>QUESTION TYPE</label>
              <select className="pixel-input" value={qType} onChange={e=>setQType(e.target.value)} style={{ cursor:"pointer" }}>
                <option value="">-- Select category --</option>
                {cats.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="fp" style={{ fontSize:8, color:"#9090A0", display:"block", marginBottom:4 }}>
                {isMath ? "PROBLEM CONTEXT / GIVEN INFO" : "PASSAGE / STIMULUS"}
              </label>
              <textarea className="pixel-textarea" value={passage} onChange={e=>setPassage(e.target.value)}
                placeholder={isMath ? "Problem text, equations, given values, table data..." : "The passage or reading stimulus text..."}
                rows={5}/>
            </div>

            <div>
              <label className="fp" style={{ fontSize:8, color:m.color, display:"block", marginBottom:4 }}>QUESTION</label>
              <textarea className="pixel-textarea" value={prompt} onChange={e=>setPrompt(e.target.value)}
                placeholder={qFormat==="fill" ? "What is the value of p?" : "Which choice most logically completes the text?"}
                rows={2}/>
            </div>

            {/* MCQ options */}
            {qFormat === "mcq" && (
              <div>
                <label className="fp" style={{ fontSize:8, color:"#9090A0", display:"block", marginBottom:4 }}>OPTIONS (A–D)</label>
                <p style={{ fontFamily:"'Be Vietnam Pro',sans-serif", fontSize:13, color:"#6B6B8A", marginBottom:8 }}>
                  Click <span style={{ color:"#00FF66" }}>letter</span> = correct answer &nbsp;·&nbsp;
                  Click <span style={{ color:"#FF3333" }}>✗</span> = your wrong pick
                </p>
                <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                  {opts.map((opt,i) => {
                    const letter = String.fromCharCode(65+i);
                    return (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:7 }}>
                        <button onClick={()=>setCorrect(correct===i?null:i)} className="fp"
                          style={{ width:28, height:28, flexShrink:0, fontSize:9, border:"2px solid", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                            borderColor:correct===i?"#00FF66":"#2A2A4A", color:correct===i?"#00FF66":"#6B6B8A", background:correct===i?"rgba(0,255,102,.1)":"none" }}>{letter}</button>
                        <button onClick={()=>setSelected(selected===i?null:i)} className="fp"
                          style={{ width:28, height:28, flexShrink:0, fontSize:11, border:"2px solid", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                            borderColor:selected===i?"#FF3333":"#2A2A4A", color:selected===i?"#FF3333":"#6B6B8A", background:selected===i?"rgba(255,51,51,.1)":"none" }}>✗</button>
                        <input className="pixel-input" value={opt} onChange={e=>{const n=[...opts];n[i]=e.target.value;setOpts(n);}}
                          placeholder={`Option ${letter}...`}
                          style={{ flex:1, borderColor:correct===i?"rgba(0,255,102,.5)":selected===i?"rgba(255,51,51,.5)":"#2A2A4A" }}/>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fill-in answers (Math only) */}
            {qFormat === "fill" && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label className="fp" style={{ fontSize:8, color:"#00FF66", display:"block", marginBottom:5 }}>CORRECT ANSWER</label>
                  <input className="pixel-input" value={correctAns} onChange={e=>setCorrectAns(e.target.value)}
                    placeholder="e.g. -11 or 2/3 or 14" style={{ borderColor:"rgba(0,255,102,.5)", fontSize:18, textAlign:"center" }}/>
                  <p style={{ fontFamily:"'Be Vietnam Pro',sans-serif", fontSize:12, color:"#6B6B8A", marginTop:5 }}>
                    Can be integer, fraction, or decimal
                  </p>
                </div>
                <div>
                  <label className="fp" style={{ fontSize:8, color:"#FF3333", display:"block", marginBottom:5 }}>MY ANSWER</label>
                  <input className="pixel-input" value={myAns} onChange={e=>setMyAns(e.target.value)}
                    placeholder="What I wrote..." style={{ borderColor:"rgba(255,51,51,.4)", fontSize:18, textAlign:"center" }}/>
                  <p style={{ fontFamily:"'Be Vietnam Pro',sans-serif", fontSize:12, color:"#6B6B8A", marginTop:5 }}>
                    Leave blank if you skipped
                  </p>
                </div>
              </div>
            )}

            {/* Root cause / Reasoning / Action plan */}
            <div style={{ borderTop:"1px solid #2A2A4A", paddingTop:14, display:"flex", flexDirection:"column", gap:10 }}>
              <div>
                <label className="fp" style={{ fontSize:8, color:"#FF8800", display:"block", marginBottom:4 }}>ROOT CAUSE</label>
                <textarea className="pixel-textarea" value={rootCause} onChange={e=>setRootCause(e.target.value)}
                  placeholder="Why did you get it wrong? (misread, careless error, wrong concept...)" rows={2}/>
              </div>
              <div>
                <label className="fp" style={{ fontSize:8, color:"#A855F7", display:"block", marginBottom:4 }}>REASONING</label>
                <textarea className="pixel-textarea" value={reasoning} onChange={e=>setReasoning(e.target.value)}
                  placeholder="Explain why the correct answer is right. Walk through the solution..." rows={3}/>
              </div>
              <div>
                <label className="fp" style={{ fontSize:8, color:"#00D4FF", display:"block", marginBottom:4 }}>ACTION PLAN</label>
                <textarea className="pixel-textarea" value={actionPlan} onChange={e=>setActionPlan(e.target.value)}
                  placeholder="What will you do differently next time?" rows={2}/>
              </div>
            </div>

            <button onClick={handleSave} disabled={!canSave} className="retro-btn"
              style={{ color:m.color, borderColor:m.color, justifyContent:"center", width:"100%" }}>
              <Save size={15}/>{saving ? "LOGGING..." : "LOG ERROR"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SAT REVIEW CARD (split-screen like real SAT) ────────────────────────────
function SATReviewCard({ err, idx, total, onNext, onPrev, onMastered, onNeedsReview }) {
  const [selOpt,    setSelOpt]    = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [marked,    setMarked]    = useState(false);
  const section = err.section || "verbal";
  const m = SECTION_META[section] || SECTION_META.verbal;

  useEffect(() => { setSelOpt(null); setSubmitted(false); setMarked(false); }, [err.id]);

  const isFill   = err.q_format === "fill";
  const hasOpts  = !isFill && err.answer_options?.length > 0;
  const correct  = err.correct_option_index;

  // fill-in: typed answer state
  const [typedAns, setTypedAns] = useState("");

  const optClass = i => {
    if (!submitted) return selOpt===i ? "sat-option selected" : "sat-option";
    if (i === correct) return "sat-option correct";
    if (i === selOpt && i !== correct) return "sat-option wrong";
    return "sat-option";
  };

  const fillCorrect = isFill && submitted
    ? typedAns.trim().toLowerCase() === (err.correct_answer||"").toLowerCase()
    : null;

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      {/* Mark bar */}
      <div className="mark-bar">
        <span style={{ fontWeight:700, fontSize:13 }}>{idx+1}</span>
        <button className={`mark-btn${marked?" active":""}`} onClick={()=>setMarked(v=>!v)}>🚩 Mark for Review</button>
        <span style={{ background:m.bg, color:m.color, border:`1px solid ${m.border}`, padding:"2px 8px", borderRadius:3, fontSize:9, fontFamily:"'Space Mono',monospace" }}>{m.label}</span>
        {isFill && <span style={{ background:"#1e293b", color:"#94a3b8", padding:"2px 8px", borderRadius:3, fontSize:9, fontFamily:"'Space Mono',monospace" }}>FILL-IN</span>}
        <span style={{ marginLeft:"auto" }}>{idx+1} / {total}</span>
        <button onClick={onPrev} disabled={idx===0}
          style={{ background:"none", border:"1.5px solid #ccc", padding:"4px 14px", cursor:"pointer", borderRadius:4, fontSize:12, fontFamily:"'Space Mono',monospace", opacity:idx===0?.4:1 }}>← Back</button>
        <button onClick={onNext}
          style={{ background:"#1a237e", border:"none", padding:"5px 18px", cursor:"pointer", borderRadius:4, fontSize:12, color:"#fff", fontFamily:"'Space Mono',monospace", fontWeight:700 }}>Next →</button>
      </div>

      {/* Split body */}
      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        {/* LEFT — passage */}
        <div className="review-left sat-panel">
          {err.passage
            ? <p className="sat-passage">{err.passage}</p>
            : <p style={{ color:"#aaa", fontStyle:"italic", fontSize:15, fontFamily:"'Be Vietnam Pro',sans-serif" }}>No passage / context recorded.</p>
          }
        </div>

        <div className="review-divider"/>

        {/* RIGHT — question + answer area + feedback */}
        <div className="review-right sat-panel">
          <span style={{ fontSize:11, color:m.color, fontWeight:700, fontFamily:"'Space Mono',monospace", marginBottom:10, display:"block", letterSpacing:".04em" }}>
            {err.question_type}
          </span>
          <p className="sat-question">{err.question_prompt}</p>

          {/* MCQ options */}
          {hasOpts && (
            <div style={{ marginBottom:16 }}>
              {err.answer_options.map((opt,i) => (
                <button key={i} className={optClass(i)} onClick={() => !submitted && setSelOpt(i)}>
                  <span className="sat-option-letter">{String.fromCharCode(65+i)}</span>
                  <span style={{ flex:1 }}>{opt}</span>
                  {submitted && i===correct && <CheckCircle size={17} style={{ color:"#2e7d32", flexShrink:0 }}/>}
                  {submitted && i===selOpt && i!==correct && <XCircle size={17} style={{ color:"#c62828", flexShrink:0 }}/>}
                </button>
              ))}
            </div>
          )}

          {/* Fill-in box */}
          {isFill && !submitted && (
            <div style={{ marginBottom:16 }}>
              <p style={{ fontFamily:"'Be Vietnam Pro',sans-serif", fontSize:13, color:"#666", marginBottom:8 }}>Type your answer:</p>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                {/* Mimic SAT answer box */}
                <input
                  value={typedAns} onChange={e=>setTypedAns(e.target.value)}
                  placeholder="Your answer"
                  style={{ width:120, height:44, border:"2px solid #555", borderRadius:4, textAlign:"center", fontSize:18, fontFamily:"'Space Mono',monospace", outline:"none", padding:"0 8px" }}
                />
                {err.my_answer && (
                  <span style={{ fontFamily:"'Be Vietnam Pro',sans-serif", fontSize:13, color:"#888" }}>
                    (you wrote: <span style={{ color:"#c62828", fontWeight:600 }}>{err.my_answer}</span>)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Fill-in result after submit */}
          {isFill && submitted && (
            <div style={{ marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" }}>
                <div style={{ textAlign:"center" }}>
                  <p style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"#666", marginBottom:4 }}>YOUR ANSWER</p>
                  <div style={{ width:100, height:44, border:`2px solid ${fillCorrect?"#2e7d32":"#c62828"}`, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center",
                    background:fillCorrect?"#e8f5e9":"#ffebee", fontSize:20, fontFamily:"'Space Mono',monospace", color:fillCorrect?"#2e7d32":"#c62828", fontWeight:700 }}>
                    {typedAns || err.my_answer || "—"}
                  </div>
                </div>
                {!fillCorrect && (
                  <div style={{ textAlign:"center" }}>
                    <p style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"#666", marginBottom:4 }}>CORRECT ANSWER</p>
                    <div style={{ width:100, height:44, border:"2px solid #2e7d32", borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center",
                      background:"#e8f5e9", fontSize:20, fontFamily:"'Space Mono',monospace", color:"#2e7d32", fontWeight:700 }}>
                      {err.correct_answer}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!submitted ? (
            <button onClick={() => setSubmitted(true)} disabled={hasOpts && selOpt===null}
              style={{ background:"#1a237e", color:"#fff", border:"none", padding:"10px 24px", cursor:"pointer", fontFamily:"'Space Mono',monospace", fontSize:12, fontWeight:700, borderRadius:4, alignSelf:"flex-start", letterSpacing:".04em" }}>
              Submit Answer
            </button>
          ) : (
            <div className="anim-float" style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {/* MCQ result */}
              {hasOpts && selOpt !== null && (
                <div style={{ padding:"10px 14px", background:selOpt===correct?"#e8f5e9":"#ffebee", border:`1.5px solid ${selOpt===correct?"#2e7d32":"#c62828"}`, borderRadius:5 }}>
                  <span style={{ fontWeight:700, color:selOpt===correct?"#2e7d32":"#c62828", fontFamily:"'Space Mono',monospace", fontSize:12 }}>
                    {selOpt===correct ? "✓ Correct!" : `✗ Incorrect — Answer: ${String.fromCharCode(65+correct)}`}
                  </span>
                </div>
              )}
              {/* Fill-in result banner */}
              {isFill && fillCorrect !== null && (
                <div style={{ padding:"10px 14px", background:fillCorrect?"#e8f5e9":"#ffebee", border:`1.5px solid ${fillCorrect?"#2e7d32":"#c62828"}`, borderRadius:5 }}>
                  <span style={{ fontWeight:700, color:fillCorrect?"#2e7d32":"#c62828", fontFamily:"'Space Mono',monospace", fontSize:12 }}>
                    {fillCorrect ? "✓ Correct!" : `✗ Incorrect — Correct answer: ${err.correct_answer}`}
                  </span>
                </div>
              )}

              {/* Root cause */}
              {err.root_cause && (
                <div className="fb-root">
                  <p className="fb-label" style={{ color:"#f57f17" }}>ROOT CAUSE</p>
                  <p className="fb-text">{err.root_cause}</p>
                </div>
              )}

              {/* Reasoning */}
              {err.reasoning && (
                <div className="fb-reasoning">
                  <p className="fb-label" style={{ color:"#7e22ce" }}>REASONING</p>
                  <p className="fb-text">{err.reasoning}</p>
                </div>
              )}

              {/* Action plan */}
              {err.action_plan && (
                <div className="fb-action">
                  <p className="fb-label" style={{ color:"#1565c0" }}>ACTION PLAN</p>
                  <p className="fb-text">{err.action_plan}</p>
                </div>
              )}

              {/* Mastery buttons */}
              <div style={{ display:"flex", gap:8, marginTop:4 }}>
                <button onClick={onMastered}
                  style={{ background:"#2e7d32", color:"#fff", border:"none", padding:"8px 16px", cursor:"pointer", borderRadius:4, fontFamily:"'Space Mono',monospace", fontSize:11, fontWeight:700 }}>
                  ✓ Mastered
                </button>
                <button onClick={onNeedsReview}
                  style={{ background:"#e65100", color:"#fff", border:"none", padding:"8px 16px", cursor:"pointer", borderRadius:4, fontFamily:"'Space Mono',monospace", fontSize:11, fontWeight:700 }}>
                  ↻ Review Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ERROR REVIEW (today) ────────────────────────────────────────────────────
function ErrorReview() {
  const { setScreen, todayErrors, markErrorMastered, updateErrorLog } = useApp();
  const [idx, setIdx] = useState(0);

  if (todayErrors.length === 0) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#0A0A1A" }}>
      <div className="pixel-border-pink" style={{ background:"#12122A", padding:40, textAlign:"center" }}>
        <p className="fp" style={{ fontSize:13, color:"#FF007F", marginBottom:16 }}>NO ERRORS TODAY</p>
        <button onClick={() => setScreen("hub")} className="retro-btn" style={{ color:"#00D4FF", borderColor:"rgba(0,212,255,.5)" }}>← HUB</button>
      </div>
    </div>
  );

  const cur = todayErrors[Math.min(idx, todayErrors.length-1)];
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh" }}>
      <div style={{ background:"#12122A", borderBottom:"2px solid rgba(255,0,127,.3)", padding:"8px 16px", display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
        <button onClick={() => setScreen("hub")} style={{ background:"none", border:"none", color:"#9090A0", cursor:"pointer" }}><ArrowLeft size={20}/></button>
        <span className="fp" style={{ fontSize:8, color:"#FF007F" }}>TODAY'S REVIEW</span>
      </div>
      <div style={{ flex:1, overflow:"hidden" }}>
        <SATReviewCard key={cur.id} err={cur} idx={idx} total={todayErrors.length}
          onNext={() => setIdx(i => Math.min(i+1, todayErrors.length-1))}
          onPrev={() => setIdx(i => Math.max(i-1, 0))}
          onMastered={async () => { await markErrorMastered(cur.id); setIdx(i => Math.min(i, todayErrors.length-2)); }}
          onNeedsReview={async () => { await updateErrorLog(cur.id, { review_count:(cur.review_count||0)+1, last_reviewed_at:new Date().toISOString() }); setIdx(i => Math.min(i+1, todayErrors.length-1)); }}
        />
      </div>
    </div>
  );
}

// ─── ERROR ARCHIVE ────────────────────────────────────────────────────────────
function ErrorArchive() {
  const { setScreen, errorLogs, markErrorMastered, updateErrorLog } = useApp();
  const [search,    setSearch]    = useState("");
  const [filter,    setFilter]    = useState("all");
  const [secFilter, setSecFilter] = useState("all"); // all | verbal | math
  const [reviewIdx, setReviewIdx] = useState(null);

  const filtered = useMemo(() => errorLogs.filter(e => {
    if (secFilter !== "all" && e.section !== secFilter) return false;
    if (search && !e.question_prompt.toLowerCase().includes(search.toLowerCase()) && !(e.question_type||"").toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "active")   return e.status === "needs_review";
    if (filter === "mastered") return e.status === "mastered";
    return true;
  }), [errorLogs, search, filter, secFilter]);

  // Review mode
  if (reviewIdx !== null) {
    const cur = filtered[Math.min(reviewIdx, filtered.length-1)];
    if (!cur) { setReviewIdx(null); return null; }
    return (
      <div style={{ display:"flex", flexDirection:"column", height:"100vh" }}>
        <div style={{ background:"#12122A", borderBottom:"2px solid rgba(255,0,127,.3)", padding:"8px 16px", display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
          <button onClick={() => setReviewIdx(null)} style={{ background:"none", border:"none", color:"#9090A0", cursor:"pointer" }}><ArrowLeft size={20}/></button>
          <span className="fp" style={{ fontSize:8, color:"#FF007F" }}>ARCHIVE REVIEW</span>
          <span className="fm" style={{ fontSize:10, color:"#6B6B8A", marginLeft:"auto" }}>{filtered.length} errors</span>
        </div>
        <div style={{ flex:1, overflow:"hidden" }}>
          <SATReviewCard key={cur.id} err={cur} idx={reviewIdx} total={filtered.length}
            onNext={() => setReviewIdx(i => Math.min(i+1, filtered.length-1))}
            onPrev={() => setReviewIdx(i => Math.max(i-1, 0))}
            onMastered={async () => { await markErrorMastered(cur.id); setReviewIdx(i => Math.min(i, filtered.length-2)); }}
            onNeedsReview={async () => { await updateErrorLog(cur.id, { review_count:(cur.review_count||0)+1, last_reviewed_at:new Date().toISOString() }); setReviewIdx(i => Math.min(i+1, filtered.length-1)); }}
          />
        </div>
      </div>
    );
  }

  // List mode
  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", background:"#0A0A1A" }}>
      <div style={{ background:"#12122A", borderBottom:"2px solid rgba(255,0,127,.3)", padding:"11px 16px", display:"flex", alignItems:"center", gap:14 }}>
        <button onClick={() => setScreen("hub")} style={{ background:"none", border:"none", color:"#9090A0", cursor:"pointer" }}><ArrowLeft size={24}/></button>
        <div style={{ flex:1 }}>
          <p className="fp" style={{ fontSize:8, color:"#FF007F", margin:0 }}>ERROR ARCHIVE</p>
        </div>
        <span className="fm" style={{ fontSize:10, color:"#9090A0" }}>{filtered.length}/{errorLogs.length}</span>
      </div>

      {/* Filter bar */}
      <div style={{ background:"rgba(18,18,42,.85)", borderBottom:"1px solid #2A2A4A", padding:"8px 16px", display:"flex", flexWrap:"wrap", alignItems:"center", gap:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, flex:1, minWidth:160 }}>
          <Search size={14} style={{ color:"#6B6B8A" }}/>
          <input className="pixel-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{ padding:"4px 10px" }}/>
        </div>

        {/* Section filter */}
        <div style={{ display:"flex", gap:4 }}>
          {["all","verbal","math"].map(s => {
            const active = secFilter === s;
            const col = s === "verbal" ? "#7C3AED" : s === "math" ? "#0891B2" : "#9090A0";
            return (
              <button key={s} onClick={() => setSecFilter(s)} className="fp"
                style={{ fontSize:7, padding:"4px 12px", border:"1px solid", cursor:"pointer", borderColor:active?col:"#2A2A4A", color:active?col:"#6B6B8A", background:active?`${col}18`:"none" }}>
                {s.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Status filter */}
        <div style={{ display:"flex", gap:4 }}>
          {["all","active","mastered"].map(f => (
            <button key={f} onClick={() => setFilter(f)} className="fp"
              style={{ fontSize:7, padding:"4px 12px", border:"1px solid", cursor:"pointer", borderColor:filter===f?"#FF007F":"#2A2A4A", color:filter===f?"#FF007F":"#6B6B8A", background:filter===f?"rgba(255,0,127,.1)":"none" }}>
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {filtered.length > 0 && (
          <button onClick={() => setReviewIdx(0)} className="retro-btn" style={{ color:"#FF007F", borderColor:"rgba(255,0,127,.5)" }}>
            <Eye size={13}/>REVIEW ALL
          </button>
        )}
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:14 }}>
        <div style={{ maxWidth:960, margin:"0 auto" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:48 }}>
              <p className="fp" style={{ fontSize:11, color:"#6B6B8A" }}>NO ERRORS FOUND</p>
            </div>
          ) : (
            <div style={{ border:"2px solid #2A2A4A", background:"#12122A" }}>
              <div style={{ display:"grid", gridTemplateColumns:"28px 70px 90px 50px 1fr 68px 68px 80px", gap:6, padding:"8px 12px", background:"#0A0A1A", borderBottom:"2px solid #2A2A4A" }}>
                {["#","SEC","TYPE","FMT","QUESTION","DATE","STATUS",""].map((h,i) => (
                  <span key={i} className="fp" style={{ fontSize:6, color:i===1?"#9090A0":i===2?"#FF007F":"#6B6B8A" }}>{h}</span>
                ))}
              </div>
              {filtered.map((err, i) => {
                const sm  = SECTION_META[err.section || "verbal"] || SECTION_META.verbal;
                const fmt = err.q_format === "fill";
                return (
                  <div key={err.id}
                    style={{ display:"grid", gridTemplateColumns:"28px 70px 90px 50px 1fr 68px 68px 80px", gap:6, padding:"8px 12px", borderBottom:"1px solid rgba(42,42,74,.4)", alignItems:"center" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(42,42,74,.2)"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    <span className="fm" style={{ fontSize:10, color:"#6B6B8A" }}>{i+1}</span>
                    <span className="fp" style={{ fontSize:6, color:sm.color, background:sm.bg, padding:"2px 5px", whiteSpace:"nowrap" }}>{sm.label}</span>
                    <span className="fm" style={{ fontSize:9, color:"#9090A0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{(err.question_type||"").split(" ").slice(0,3).join(" ")}</span>
                    <span className="fp" style={{ fontSize:6, padding:"2px 4px", color:fmt?"#F59E0B":"#60A5FA", background:fmt?"rgba(245,158,11,.12)":"rgba(96,165,250,.12)", whiteSpace:"nowrap" }}>
                      {fmt ? "FILL" : "MCQ"}
                    </span>
                    <span style={{ fontFamily:"'Be Vietnam Pro',sans-serif", fontSize:14, color:"#9090A0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{err.question_prompt.slice(0,55)}</span>
                    <span className="fm" style={{ fontSize:10, color:"#6B6B8A" }}>{new Date(err.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span>
                    <span className="fp" style={{ fontSize:6, padding:"2px 4px", color:err.status==="mastered"?"#00FF66":"#FF8800", background:err.status==="mastered"?"rgba(0,255,102,.1)":"rgba(255,136,0,.1)" }}>
                      {err.status==="mastered"?"MASTERED":"ACTIVE"}
                    </span>
                    <button onClick={() => setReviewIdx(i)} className="retro-btn"
                      style={{ color:"#00D4FF", borderColor:"rgba(0,212,255,.35)", padding:"4px 10px", fontSize:7 }}>
                      REVIEW
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────
function AppShell() {
  const { screen, toasts } = useApp();
  const screens = {
    intro:                 <IntroScreen/>,
    hub:                   <MainHub/>,
    "error-input-verbal":  <ErrorInput section="verbal"/>,
    "error-input-math":    <ErrorInput section="math"/>,
    "error-review":        <ErrorReview/>,
    "error-archive":       <ErrorArchive/>,
  };
  return (
    <div style={{ minHeight:"100vh", background:"#0A0A1A", position:"relative", overflow:"hidden" }}>
      <style>{css}</style>
      <StarField/>
      <div style={{ position:"relative", zIndex:10 }}>{screens[screen] || <IntroScreen/>}</div>
      <div style={{ position:"fixed", bottom:16, right:16, zIndex:50, display:"flex", flexDirection:"column", gap:8 }}>
        {toasts.map(t => <Toast key={t.id} message={t}/>)}
      </div>
    </div>
  );
}

export default function App() {
  return <AppProvider><AppShell/></AppProvider>;
}

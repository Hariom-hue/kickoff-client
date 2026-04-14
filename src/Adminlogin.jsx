import { useState, useRef, useEffect } from "react";

const API = "https://kickoff-11.up.railway.app";

export default function AdminLogin({ onSuccess }) {
  const [step,      setStep]      = useState(1);
  const [username,  setUsername]  = useState("");
  const [password,  setPassword]  = useState("");
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [attempts,  setAttempts]  = useState(0);
  const [locked,    setLocked]    = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [sessionToken, setSessionToken] = useState("");
  const [codeDigits,   setCodeDigits]   = useState(["","","","","",""]);
  const codeRefs = [useRef(),useRef(),useRef(),useRef(),useRef(),useRef()];

  useEffect(() => {
    if (!locked || lockTimer <= 0) return;
    const t = setInterval(() => {
      setLockTimer(p => {
        if (p <= 1) { setLocked(false); setAttempts(0); clearInterval(t); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [locked, lockTimer]);

  const handleCredentials = async () => {
    if (locked) return;
    if (!username || !password) { setError("Enter username and password"); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/admin-login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim().toLowerCase(), password })
      });
      const data = await res.json();
      if (data.success) {
        setSessionToken(data.token);
        setStep(2);
        setTimeout(() => codeRefs[0].current?.focus(), 150);
      } else {
        const next = attempts + 1;
        setAttempts(next);
        if (next >= 5) { setLocked(true); setLockTimer(60); setError("Too many attempts. Locked for 60s."); }
        else setError(`Wrong credentials — ${5 - next} attempt${5 - next !== 1 ? "s" : ""} left`);
      }
    } catch { setError("Cannot reach server."); }
    setLoading(false);
  };

  const handleDigit = (idx, val) => {
    const v = val.replace(/\D/g, "").slice(-1);
    const next = [...codeDigits]; next[idx] = v; setCodeDigits(next);
    if (v && idx < 5) codeRefs[idx + 1].current?.focus();
    if (idx === 5 && v) { const full = next.join(""); if (full.length === 6) setTimeout(() => verifyCode(full), 80); }
  };

  const handleDigitKey = (idx, e) => {
    if (e.key === "Backspace" && !codeDigits[idx] && idx > 0) codeRefs[idx - 1].current?.focus();
    if (e.key === "Enter") verifyCode(codeDigits.join(""));
  };

  const verifyCode = async (fullCode) => {
    const code = fullCode || codeDigits.join("");
    if (code.length !== 6) { setError("Enter all 6 digits"); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/admin-verify`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: sessionToken, code })
      });
      const data = await res.json();
      if (data.success) { sessionStorage.setItem("adminAuth", data.adminToken); onSuccess(); }
      else { setError(data.error || "Invalid code — try again"); setCodeDigits(["","","","","",""]); codeRefs[0].current?.focus(); }
    } catch { setError("Server error — try again"); }
    setLoading(false);
  };

  const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: 10, background: "#0c0c0c", border: "1px solid #252525", color: "#fff", fontSize: 14, outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box", opacity: locked ? 0.5 : 1 };

  return (
    <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: 20 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;600;700&display=swap');
        .adm-inp:focus{border-color:#c8ff00!important;outline:none;}
        .adm-inp::placeholder{color:#333;}
        .otp-inp:focus{border-color:#c8ff00!important;outline:none;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp 0.35s ease;}
      `}</style>

      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.6rem", letterSpacing: "0.12em", margin: 0 }}>
            <span style={{ color: "#fff" }}>KICK</span><span style={{ color: "#c8ff00" }}>OFF</span>
          </h1>
          <p style={{ color: "#333", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 4 }}>Admin Portal</p>
        </div>

        <div className="fade-up" style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 20, overflow: "hidden" }}>
          <div style={{ padding: "20px 28px", borderBottom: "1px solid #1a1a1a" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: step === 2 ? "rgba(200,255,0,0.1)" : "#1a1a1a", border: `1px solid ${step === 2 ? "#c8ff00" : "#252525"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, transition: "all 0.3s" }}>
                {step === 1 ? "🔑" : "🛡️"}
              </div>
              <div>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: 0 }}>{step === 1 ? "Sign In" : "Verify OTP"}</p>
                <p style={{ color: "#444", fontSize: 11, margin: 0 }}>{step === 1 ? "Enter your admin credentials" : "Check your email for 6-digit code"}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ height: 3, flex: 1, borderRadius: 2, background: "#c8ff00" }} />
              <div style={{ height: 3, flex: 1, borderRadius: 2, background: step === 2 ? "#c8ff00" : "#222", transition: "background 0.3s" }} />
            </div>
          </div>

          <div style={{ padding: 28 }}>
            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#555", marginBottom: 8 }}>Username</label>
                  <input className="adm-inp" type="text" placeholder="kickoff" value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCredentials()} disabled={locked} style={{ ...inputStyle, border: "1px solid #252525", transition: "border-color 0.2s" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#555", marginBottom: 8 }}>Password</label>
                  <input className="adm-inp" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCredentials()} disabled={locked} style={{ ...inputStyle, border: "1px solid #252525", transition: "border-color 0.2s" }} />
                </div>
                {error && (
                  <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8 }}>
                    <p style={{ color: "#ef4444", fontSize: 12, margin: 0 }}>{locked ? `🔒 ${error} (${lockTimer}s)` : `⚠️ ${error}`}</p>
                  </div>
                )}
                {attempts > 0 && !locked && (
                  <div style={{ display: "flex", gap: 5 }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i < attempts ? "#ef4444" : "#1e1e1e", transition: "background 0.2s" }} />
                    ))}
                  </div>
                )}
                <button onClick={handleCredentials} disabled={loading || locked}
                  style={{ padding: 14, background: locked ? "#1a1a1a" : "#c8ff00", border: "none", borderRadius: 10, color: locked ? "#444" : "#0a0a0a", fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", cursor: locked ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>
                  {loading ? "Verifying..." : locked ? `Locked (${lockTimer}s)` : "Continue →"}
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <p style={{ color: "#555", fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                  Check your <span style={{ color: "#c8ff00", fontWeight: 700 }}>email inbox</span> for the 6-digit OTP. It expires in 5 minutes.
                </p>
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  {codeDigits.map((d, i) => (
                    <input key={i} ref={codeRefs[i]} className="otp-inp" type="text" inputMode="numeric" maxLength={1} value={d}
                      onChange={e => handleDigit(i, e.target.value)} onKeyDown={e => handleDigitKey(i, e)}
                      style={{ width: 46, height: 56, textAlign: "center", background: "#0c0c0c", border: `2px solid ${d ? "#c8ff00" : "#252525"}`, borderRadius: 10, color: "#fff", fontSize: 22, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", outline: "none", transition: "border-color 0.2s", cursor: "text" }} />
                  ))}
                </div>
                {error && (
                  <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8 }}>
                    <p style={{ color: "#ef4444", fontSize: 12, margin: 0 }}>⚠️ {error}</p>
                  </div>
                )}
                <button onClick={() => verifyCode(codeDigits.join(""))} disabled={loading || codeDigits.join("").length < 6}
                  style={{ padding: 14, background: codeDigits.join("").length === 6 ? "#c8ff00" : "#1a1a1a", border: "none", borderRadius: 10, color: codeDigits.join("").length === 6 ? "#0a0a0a" : "#444", fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", cursor: codeDigits.join("").length < 6 ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  {loading ? "Verifying..." : "Verify & Enter →"}
                </button>
                <button onClick={() => { setStep(1); setCodeDigits(["","","","","",""]); setError(""); }}
                  style={{ background: "none", border: "none", color: "#333", fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>
                  ← Back
                </button>
              </div>
            )}
          </div>
        </div>
        <p style={{ color: "#1a1a1a", fontSize: 11, textAlign: "center", marginTop: 20 }}>🔒 All login attempts are logged.</p>
      </div>
    </div>
  );
}
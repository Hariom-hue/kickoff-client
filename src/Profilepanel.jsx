import { useState, useEffect, useCallback, useRef } from "react";

const API = "https://kickoff-11.up.railway.app";   // ← Railway backend

function OTPInput({ value, onChange, onComplete, digits = 6 }) {
  const refs = Array.from({ length: digits }, () => useRef(null));
  const vals = value.split("").concat(Array(digits).fill("")).slice(0, digits);
  const handle = (i, v) => {
    const ch = v.replace(/\D/g, "").slice(-1);
    const next = [...vals]; next[i] = ch;
    const str = next.join("");
    onChange(str);
    if (ch && i < digits - 1) refs[i + 1].current?.focus();
    if (str.replace(/\s/g, "").length === digits) onComplete?.(str);
  };
  const onKey = (i, e) => {
    if (e.key === "Backspace" && !vals[i] && i > 0) refs[i - 1].current?.focus();
  };
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
      {vals.map((d, i) => (
        <input key={i} ref={refs[i]} type="text" inputMode="numeric" maxLength={1} value={d}
          onChange={e => handle(i, e.target.value)} onKeyDown={e => onKey(i, e)}
          style={{ width: 44, height: 54, textAlign: "center", background: "#0c0c0c", border: `2px solid ${d ? "#c8ff00" : "#252525"}`, borderRadius: 10, color: "#fff", fontSize: 20, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", outline: "none", transition: "border-color 0.2s" }} />
      ))}
    </div>
  );
}

function OrderTracker({ order }) {
  const stages = ["Placed", "Confirmed", "Shipped", "Out for Delivery", "Delivered"];
  const daysSince = Math.floor((Date.now() - new Date(order.date).getTime()) / 86400000);
  const currentStage = Math.min(daysSince, 4);
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", alignItems: "flex-start", position: "relative" }}>
        <div style={{ position: "absolute", top: 9, left: 10, right: 10, height: 2, background: "#1e1e1e", zIndex: 0 }} />
        <div style={{ position: "absolute", top: 9, left: 10, height: 2, width: `${(currentStage / (stages.length - 1)) * 100}%`, background: "#c8ff00", zIndex: 1, transition: "width 0.6s ease" }} />
        {stages.map((s, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, zIndex: 2, flex: 1 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: i <= currentStage ? "#c8ff00" : "#1a1a1a", border: `2px solid ${i <= currentStage ? "#c8ff00" : "#333"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}>
              {i < currentStage && <span style={{ fontSize: 9, color: "#0a0a0a", fontWeight: 900 }}>✓</span>}
              {i === currentStage && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0a0a0a", display: "block" }} />}
            </div>
            <p style={{ color: i <= currentStage ? "#c8ff00" : "#333", fontSize: 7.5, fontWeight: 700, textAlign: "center", whiteSpace: "nowrap", margin: 0 }}>{s}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProfilePanel({ user, setUser, setShowProfile, setAuthMode, authMode }) {
  const [flow, setFlow]         = useState("idle");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp]           = useState("");
  const [otpErr, setOtpErr]     = useState("");
  const [sending, setSending]   = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [tab, setTab]           = useState("profile");
  const [profile, setProfile]   = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editingInfo, setEditingInfo] = useState(false);
  const [orders, setOrders]     = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [addingAddr, setAddingAddr] = useState(false);
  const [newAddr, setNewAddr]   = useState({ label: "Home", line1: "", line2: "", city: "", state: "", pin: "" });
  const [savingAddr, setSavingAddr] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [savingNotif, setSavingNotif] = useState(false);

  const inp = { width: "100%", padding: "11px 14px", borderRadius: 9, background: "#161616", border: "1px solid #2a2a2a", color: "#fff", fontSize: 13, outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box", transition: "border-color 0.2s" };
  const lbl = { display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#555", marginBottom: 6 };
  const primaryBtn = (disabled) => ({ width: "100%", padding: "13px", borderRadius: 10, background: disabled ? "#1a1a1a" : "#c8ff00", color: disabled ? "#444" : "#0a0a0a", fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", border: "none", cursor: disabled ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif" });

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn(p => { if (p <= 1) { clearInterval(t); return 0; } return p - 1; }), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API}/user/profile?email=${encodeURIComponent(user)}`);
      const data = await res.json();
      if (res.ok) { setProfile(data); setEditName(data.name || ""); setEditPhone(data.phone || ""); setNotifEnabled(data.notifications !== false); }
    } catch {}
  }, [user]);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const res = await fetch(`${API}/orders/user/${encodeURIComponent(user)}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch { setOrders([]); }
    setLoadingOrders(false);
  }, [user]);

  useEffect(() => { if (user) fetchProfile(); }, [user, fetchProfile]);
  useEffect(() => { if (user && tab === "orders") fetchOrders(); }, [user, tab, fetchOrders]);

  const sendSignupOTP = async () => {
    if (!email || !password) { setOtpErr("Enter email and password"); return; }
    if (password.length < 6) { setOtpErr("Password must be at least 6 characters"); return; }
    setSending(true); setOtpErr("");
    try {
      const res = await fetch(`${API}/auth/send-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, purpose: "signup" }) });
      const data = await res.json();
      if (!res.ok) setOtpErr(data.error || "Failed to send OTP");
      else { setFlow("signup_otp"); setResendIn(60); }
    } catch { setOtpErr("Cannot reach server"); }
    setSending(false);
  };

  const verifySignupOTP = async (code) => {
    if (verifying) return;
    setVerifying(true); setOtpErr("");
    try {
      const res = await fetch(`${API}/auth/verify-signup`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, otp: code || otp }) });
      const data = await res.json();
      if (!res.ok) { setOtpErr(data.error || "Invalid OTP"); }
      else { setUser(email); localStorage.setItem("user", email); if (data.token) localStorage.setItem("userToken", data.token); setShowProfile(false); setFlow("idle"); }
    } catch { setOtpErr("Server error"); }
    setVerifying(false);
  };

  const sendLoginOTP = async () => {
    if (!email) { setOtpErr("Enter your email"); return; }
    setSending(true); setOtpErr("");
    try {
      const res = await fetch(`${API}/auth/send-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, purpose: "login" }) });
      const data = await res.json();
      if (!res.ok) setOtpErr(data.error || "Failed to send OTP");
      else { setFlow("login_otp"); setResendIn(60); }
    } catch { setOtpErr("Cannot reach server"); }
    setSending(false);
  };

  const verifyLoginOTP = async (code) => {
    if (verifying) return;
    setVerifying(true); setOtpErr("");
    try {
      const res = await fetch(`${API}/auth/verify-login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, otp: code || otp }) });
      const data = await res.json();
      if (!res.ok) { setOtpErr(data.error || "Invalid OTP"); }
      else { setUser(email); localStorage.setItem("user", email); if (data.token) localStorage.setItem("userToken", data.token); setShowProfile(false); setFlow("idle"); }
    } catch { setOtpErr("Server error"); }
    setVerifying(false);
  };

  const saveInfo = async () => {
    setSavingProfile(true);
    try {
      await fetch(`${API}/user/profile`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: user, name: editName, phone: editPhone }) });
      setProfile(p => ({ ...p, name: editName, phone: editPhone })); setEditingInfo(false);
    } catch {}
    setSavingProfile(false);
  };

  const saveAddress = async () => {
    if (!newAddr.line1 || !newAddr.city || !newAddr.pin) return;
    setSavingAddr(true);
    const updated = [...(profile?.savedAddresses || []), newAddr];
    try {
      await fetch(`${API}/user/profile`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: user, savedAddresses: updated }) });
      setProfile(p => ({ ...p, savedAddresses: updated })); setAddingAddr(false);
      setNewAddr({ label: "Home", line1: "", line2: "", city: "", state: "", pin: "" });
    } catch {}
    setSavingAddr(false);
  };

  const deleteAddress = async (idx) => {
    const updated = (profile?.savedAddresses || []).filter((_, i) => i !== idx);
    try {
      await fetch(`${API}/user/profile`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: user, savedAddresses: updated }) });
      setProfile(p => ({ ...p, savedAddresses: updated }));
    } catch {}
  };

  const toggleNotifications = async () => {
    setSavingNotif(true);
    const next = !notifEnabled;
    try {
      await fetch(`${API}/user/profile`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: user, notifications: next }) });
      setNotifEnabled(next);
    } catch {}
    setSavingNotif(false);
  };

  const timeAgo = d => { const days = Math.floor((Date.now() - new Date(d)) / 86400000); return days === 0 ? "Today" : days === 1 ? "Yesterday" : `${days}d ago`; };

  return (
    <div className="fixed inset-0 z-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .pp-fade{animation:fadeIn 0.22s ease;}
        .pp-inp:focus{border-color:#c8ff00!important;}
        .pp-inp::placeholder{color:#333;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .pp-spin{animation:spin 0.7s linear infinite;display:inline-block;}
      `}</style>
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(8px)" }} onClick={() => setShowProfile(false)} />
      <div className="absolute left-0 top-0 bottom-0 flex flex-col" style={{ width: "100%", maxWidth: 420, background: "#0c0c0c", borderRight: "1px solid #1e1e1e", zIndex: 10, overflow: "hidden" }}>
        <div style={{ padding: "24px 28px 0", borderBottom: "1px solid #1a1a1a", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#c8ff00", marginBottom: 3 }}>Account</p>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", color: "#fff", letterSpacing: "0.06em", margin: 0 }}>My Profile</h2>
            </div>
            <button onClick={() => setShowProfile(false)} style={{ width: 36, height: 36, borderRadius: "50%", background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#888", cursor: "pointer", fontSize: 14 }}>✕</button>
          </div>
          {user && (
            <div style={{ display: "flex", gap: 0, overflowX: "auto", scrollbarWidth: "none" }}>
              {[
                { key: "profile", icon: "👤", label: "Profile" },
                { key: "orders", icon: "📦", label: "Orders" },
                { key: "addresses", icon: "🏠", label: "Addresses" },
                { key: "payment", icon: "💳", label: "Payment" },
                { key: "notifications", icon: "🔔", label: "Alerts" },
              ].map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  style={{ flexShrink: 0, padding: "10px 12px", background: "none", border: "none", borderBottom: `2px solid ${tab === t.key ? "#c8ff00" : "transparent"}`, color: tab === t.key ? "#c8ff00" : "#444", fontWeight: 700, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "color 0.2s" }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "22px 28px" }}>

          {/* ── Not logged in ── */}
          {!user && flow === "idle" && (
            <div className="pp-fade" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ color: "#444", fontSize: 13, marginBottom: 8 }}>Sign in with your Gmail to access your orders, addresses and more.</p>
              <button onClick={() => { setFlow("signup_email"); setOtpErr(""); }} style={primaryBtn(false)}>Create Account</button>
              <button onClick={() => { setFlow("login_email"); setOtpErr(""); }} style={{ ...primaryBtn(false), background: "transparent", color: "#fff", border: "1px solid #2a2a2a" }}>Sign In</button>
            </div>
          )}

          {!user && flow === "signup_email" && (
            <div className="pp-fade" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <button onClick={() => { setFlow("idle"); setOtpErr(""); }} style={{ background: "none", border: "none", color: "#c8ff00", fontSize: 11, fontWeight: 700, cursor: "pointer", textAlign: "left", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>← Back</button>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", color: "#fff", letterSpacing: "0.06em", margin: 0 }}>Create Account</h3>
              <p style={{ color: "#555", fontSize: 12, margin: 0 }}>We'll send a 6-digit OTP to your Gmail to verify your email.</p>
              <div><label style={lbl}>Gmail address</label><input type="email" className="pp-inp" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@gmail.com" style={inp} onFocus={e=>e.target.style.borderColor="#c8ff00"} onBlur={e=>e.target.style.borderColor="#2a2a2a"} /></div>
              <div><label style={lbl}>Password</label><input type="password" className="pp-inp" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" style={inp} onFocus={e=>e.target.style.borderColor="#c8ff00"} onBlur={e=>e.target.style.borderColor="#2a2a2a"} onKeyDown={e => e.key === "Enter" && sendSignupOTP()} /></div>
              {otpErr && <p style={{ color: "#ef4444", fontSize: 12, margin: 0 }}>⚠️ {otpErr}</p>}
              <button onClick={sendSignupOTP} disabled={sending} style={primaryBtn(sending)}>{sending ? "Sending OTP..." : "Send OTP to Gmail →"}</button>
              <p style={{ textAlign: "center", color: "#444", fontSize: 12 }}>Have an account? <button onClick={() => { setFlow("login_email"); setOtpErr(""); }} style={{ background: "none", border: "none", color: "#c8ff00", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>Sign in</button></p>
            </div>
          )}

          {!user && flow === "signup_otp" && (
            <div className="pp-fade" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <button onClick={() => { setFlow("signup_email"); setOtp(""); setOtpErr(""); }} style={{ background: "none", border: "none", color: "#c8ff00", fontSize: 11, fontWeight: 700, cursor: "pointer", textAlign: "left", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>← Back</button>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", color: "#fff", letterSpacing: "0.06em", margin: 0 }}>Verify Email</h3>
              <div style={{ padding: "12px 16px", background: "rgba(200,255,0,0.06)", border: "1px solid rgba(200,255,0,0.15)", borderRadius: 10 }}>
                <p style={{ color: "#c8ff00", fontSize: 12, fontWeight: 700, margin: "0 0 2px" }}>OTP sent to your Gmail</p>
                <p style={{ color: "#555", fontSize: 11, margin: 0 }}>{email}</p>
              </div>
              <OTPInput value={otp} onChange={v => { setOtp(v); setOtpErr(""); }} onComplete={verifySignupOTP} />
              {otpErr && <p style={{ color: "#ef4444", fontSize: 12, margin: 0, textAlign: "center" }}>⚠️ {otpErr}</p>}
              <button onClick={() => verifySignupOTP()} disabled={verifying || otp.length < 6} style={primaryBtn(verifying || otp.length < 6)}>{verifying ? "Verifying..." : "Verify & Create Account →"}</button>
              <p style={{ textAlign: "center", color: "#444", fontSize: 12, margin: 0 }}>
                {resendIn > 0 ? <span style={{ color: "#333" }}>Resend in {resendIn}s</span> : <button onClick={sendSignupOTP} style={{ background: "none", border: "none", color: "#c8ff00", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>Resend OTP</button>}
              </p>
              <p style={{ color: "#333", fontSize: 11, textAlign: "center", margin: 0 }}>Check your inbox & spam folder</p>
            </div>
          )}

          {!user && flow === "login_email" && (
            <div className="pp-fade" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <button onClick={() => { setFlow("idle"); setOtpErr(""); }} style={{ background: "none", border: "none", color: "#c8ff00", fontSize: 11, fontWeight: 700, cursor: "pointer", textAlign: "left", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>← Back</button>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", color: "#fff", letterSpacing: "0.06em", margin: 0 }}>Sign In</h3>
              <p style={{ color: "#555", fontSize: 12, margin: 0 }}>Enter your Gmail and we'll send you an OTP to sign in securely.</p>
              <div><label style={lbl}>Gmail address</label><input type="email" className="pp-inp" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@gmail.com" style={inp} onFocus={e=>e.target.style.borderColor="#c8ff00"} onBlur={e=>e.target.style.borderColor="#2a2a2a"} onKeyDown={e => e.key === "Enter" && sendLoginOTP()} /></div>
              {otpErr && <p style={{ color: "#ef4444", fontSize: 12, margin: 0 }}>⚠️ {otpErr}</p>}
              <button onClick={sendLoginOTP} disabled={sending} style={primaryBtn(sending)}>{sending ? "Sending OTP..." : "Send OTP to Gmail →"}</button>
              <p style={{ textAlign: "center", color: "#444", fontSize: 12 }}>No account? <button onClick={() => { setFlow("signup_email"); setOtpErr(""); }} style={{ background: "none", border: "none", color: "#c8ff00", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>Create one</button></p>
            </div>
          )}

          {!user && flow === "login_otp" && (
            <div className="pp-fade" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <button onClick={() => { setFlow("login_email"); setOtp(""); setOtpErr(""); }} style={{ background: "none", border: "none", color: "#c8ff00", fontSize: 11, fontWeight: 700, cursor: "pointer", textAlign: "left", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>← Back</button>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", color: "#fff", letterSpacing: "0.06em", margin: 0 }}>Enter OTP</h3>
              <div style={{ padding: "12px 16px", background: "rgba(200,255,0,0.06)", border: "1px solid rgba(200,255,0,0.15)", borderRadius: 10 }}>
                <p style={{ color: "#c8ff00", fontSize: 12, fontWeight: 700, margin: "0 0 2px" }}>Login code sent to</p>
                <p style={{ color: "#555", fontSize: 11, margin: 0 }}>{email}</p>
              </div>
              <OTPInput value={otp} onChange={v => { setOtp(v); setOtpErr(""); }} onComplete={verifyLoginOTP} />
              {otpErr && <p style={{ color: "#ef4444", fontSize: 12, margin: 0, textAlign: "center" }}>⚠️ {otpErr}</p>}
              <button onClick={() => verifyLoginOTP()} disabled={verifying || otp.length < 6} style={primaryBtn(verifying || otp.length < 6)}>{verifying ? "Verifying..." : "Sign In →"}</button>
              <p style={{ textAlign: "center", color: "#444", fontSize: 12, margin: 0 }}>
                {resendIn > 0 ? <span style={{ color: "#333" }}>Resend in {resendIn}s</span> : <button onClick={sendLoginOTP} style={{ background: "none", border: "none", color: "#c8ff00", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>Resend OTP</button>}
              </p>
            </div>
          )}

          {/* ── Profile tab ── */}
          {user && tab === "profile" && (
            <div className="pp-fade" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, background: "#111", border: "1px solid #1e1e1e", borderRadius: 14 }}>
                <div style={{ width: 54, height: 54, borderRadius: "50%", background: "#c8ff00", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", color: "#0c0c0c", flexShrink: 0 }}>
                  {(profile?.name || user).charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: 0 }}>{profile?.name || user.split("@")[0]}</p>
                  <p style={{ color: "#444", fontSize: 12, margin: "2px 0 0" }}>{user}</p>
                  {profile?.phone && <p style={{ color: "#555", fontSize: 11, margin: "1px 0 0" }}>📞 {profile.phone}</p>}
                </div>
                <button onClick={() => setEditingInfo(true)} style={{ background: "none", border: "1px solid #2a2a2a", borderRadius: 7, padding: "5px 10px", color: "#c8ff00", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Edit</button>
              </div>
              {editingInfo && (
                <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div><label style={lbl}>Display Name</label><input className="pp-inp" value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Your name" style={inp} onFocus={e=>e.target.style.borderColor="#c8ff00"} onBlur={e=>e.target.style.borderColor="#2a2a2a"} /></div>
                  <div><label style={lbl}>Phone</label><input className="pp-inp" value={editPhone} onChange={e=>setEditPhone(e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="10-digit number" style={inp} onFocus={e=>e.target.style.borderColor="#c8ff00"} onBlur={e=>e.target.style.borderColor="#2a2a2a"} /></div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={saveInfo} disabled={savingProfile} style={{ ...primaryBtn(savingProfile), flex: 1, padding: "10px" }}>{savingProfile ? "Saving..." : "Save"}</button>
                    <button onClick={() => setEditingInfo(false)} style={{ flex: 1, padding: "10px", background: "#1a1a1a", border: "none", borderRadius: 9, color: "#888", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
                  </div>
                </div>
              )}
              {[
                { icon: "📦", label: "My Orders", sub: "Track & view order history", onClick: () => setTab("orders") },
                { icon: "🏠", label: "Saved Addresses", sub: "Manage delivery addresses", onClick: () => setTab("addresses") },
                { icon: "💳", label: "Payment Methods", sub: "Saved UPI IDs & cards", onClick: () => setTab("payment") },
                { icon: "🔔", label: "Notifications", sub: `Order alerts are ${notifEnabled ? "ON" : "OFF"}`, onClick: () => setTab("notifications") },
              ].map((item, i) => (
                <button key={i} onClick={item.onClick} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", width: "100%", textAlign: "left" }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: "#fff", fontWeight: 600, fontSize: 13, margin: 0 }}>{item.label}</p>
                    <p style={{ color: "#444", fontSize: 11, margin: "2px 0 0" }}>{item.sub}</p>
                  </div>
                  <span style={{ color: "#333", fontSize: 18 }}>›</span>
                </button>
              ))}
              <button onClick={() => { setUser(null); localStorage.removeItem("user"); localStorage.removeItem("userToken"); setShowProfile(false); }}
                style={{ width: "100%", padding: 13, borderRadius: 12, background: "#1a0808", color: "#ff5555", border: "1px solid #2a1515", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>
                Logout
              </button>
            </div>
          )}

          {/* ── Orders tab ── */}
          {user && tab === "orders" && (
            <div className="pp-fade">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: 0 }}>Order History</h3>
                <button onClick={fetchOrders} style={{ background: "none", border: "none", color: "#c8ff00", fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>↻ Refresh</button>
              </div>
              {loadingOrders ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <div style={{ width: 28, height: 28, border: "2px solid #1e1e1e", borderTop: "2px solid #c8ff00", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
                  <p style={{ color: "#444", fontSize: 12 }}>Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ fontSize: 44, marginBottom: 12 }}>📭</div>
                  <p style={{ color: "#444", fontSize: 14, fontWeight: 600, margin: 0 }}>No orders yet</p>
                  <p style={{ color: "#333", fontSize: 12, marginTop: 4 }}>Your orders will appear here</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {orders.map((o, i) => (
                    <div key={i} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 14, overflow: "hidden" }}>
                      <div style={{ padding: "11px 16px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <p style={{ color: "#c8ff00", fontWeight: 700, fontSize: 11, fontFamily: "monospace", margin: 0 }}>OD{String(o._id || i).slice(-8).toUpperCase()}</p>
                          <p style={{ color: "#444", fontSize: 10, margin: "2px 0 0" }}>{timeAgo(o.date)}</p>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: "rgba(200,255,0,0.1)", color: "#c8ff00", border: "1px solid rgba(200,255,0,0.2)" }}>
                          {o.paymentMethod === "cod" ? "COD" : "PAID"}
                        </span>
                      </div>
                      <div style={{ padding: "10px 16px" }}>
                        {(Array.isArray(o.items) ? o.items : []).slice(0, 2).map((it, j) => (
                          <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                            {it.image && <img src={it.image} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ color: "#ccc", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>{it.name || String(it)}</p>
                              {it.size && <p style={{ color: "#444", fontSize: 10, margin: "1px 0 0" }}>Size: {it.size}</p>}
                            </div>
                            <span style={{ color: "#c8ff00", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>₹{it.price}</span>
                          </div>
                        ))}
                        {o.items?.length > 2 && <p style={{ color: "#444", fontSize: 11, margin: "0 0 4px" }}>+{o.items.length - 2} more item{o.items.length - 2 !== 1 ? "s" : ""}</p>}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid #1a1a1a", marginTop: 4 }}>
                          <span style={{ color: "#555", fontSize: 11 }}>Total</span>
                          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem", color: "#c8ff00" }}>₹{o.total}</span>
                        </div>
                      </div>
                      <div style={{ padding: "8px 16px 14px", borderTop: "1px solid #1a1a1a" }}>
                        <p style={{ color: "#444", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 6px" }}>Live Tracking</p>
                        <OrderTracker order={o} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Addresses tab ── */}
          {user && tab === "addresses" && (
            <div className="pp-fade" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: "0 0 4px" }}>Saved Addresses</h3>
              {(profile?.savedAddresses || []).length === 0 && !addingAddr && (
                <div style={{ textAlign: "center", padding: "30px 0", color: "#444" }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>📍</div>
                  <p style={{ fontSize: 13, margin: 0 }}>No addresses saved yet</p>
                </div>
              )}
              {(profile?.savedAddresses || []).map((addr, i) => (
                <div key={i} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: "12px 14px", display: "flex", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{addr.label === "Work" ? "💼" : addr.label === "Other" ? "📍" : "🏠"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: "#fff", fontWeight: 700, fontSize: 13, margin: "0 0 2px" }}>{addr.label}</p>
                    <p style={{ color: "#555", fontSize: 12, margin: 0, lineHeight: 1.5 }}>{addr.line1}{addr.line2 ? ", " + addr.line2 : ""}<br/>{addr.city}, {addr.state} — {addr.pin}</p>
                  </div>
                  <button onClick={() => deleteAddress(i)} style={{ background: "none", border: "none", color: "#ff5555", fontSize: 12, cursor: "pointer", alignSelf: "flex-start" }}>✕</button>
                </div>
              ))}
              {addingAddr ? (
                <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["Home", "Work", "Other"].map(t => (
                      <button key={t} onClick={() => setNewAddr(a => ({ ...a, label: t }))}
                        style={{ flex: 1, padding: "6px", borderRadius: 8, border: `2px solid ${newAddr.label === t ? "#c8ff00" : "#2a2a2a"}`, background: "transparent", color: newAddr.label === t ? "#c8ff00" : "#555", fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                        {t}
                      </button>
                    ))}
                  </div>
                  {[
                    { key: "line1", label: "Flat / House No. *", placeholder: "e.g. Flat 4B, Green Towers" },
                    { key: "line2", label: "Area / Street", placeholder: "e.g. MG Road, Bandra" },
                    { key: "city",  label: "City *", placeholder: "e.g. Pune" },
                    { key: "state", label: "State", placeholder: "e.g. Maharashtra" },
                    { key: "pin",   label: "PIN Code *", placeholder: "6 digits" },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={lbl}>{f.label}</label>
                      <input className="pp-inp" value={newAddr[f.key]} onChange={e => setNewAddr(a => ({ ...a, [f.key]: e.target.value }))} placeholder={f.placeholder} style={inp} onFocus={e=>e.target.style.borderColor="#c8ff00"} onBlur={e=>e.target.style.borderColor="#2a2a2a"} />
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={saveAddress} disabled={savingAddr} style={{ ...primaryBtn(savingAddr), flex: 1, padding: "10px" }}>{savingAddr ? "Saving..." : "Save Address"}</button>
                    <button onClick={() => setAddingAddr(false)} style={{ flex: 1, padding: "10px", background: "#1a1a1a", border: "none", borderRadius: 9, color: "#888", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAddingAddr(true)} style={primaryBtn(false)}>+ Add New Address</button>
              )}
            </div>
          )}

          {/* ── Payment tab ── */}
          {user && tab === "payment" && (
            <div className="pp-fade" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: "0 0 4px" }}>Payment Methods</h3>
              <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: "14px 16px" }}>
                <p style={{ color: "#555", fontSize: 12, margin: "0 0 12px" }}>Payment methods are securely selected at checkout. We never store your card or UPI details.</p>
                {[
                  { icon: "📱", label: "UPI", sub: "Google Pay, PhonePe, Paytm, BHIM" },
                  { icon: "💳", label: "Credit / Debit Card", sub: "Visa, Mastercard, RuPay" },
                  { icon: "🏦", label: "Net Banking", sub: "All major banks" },
                  { icon: "💵", label: "Cash on Delivery", sub: "Pay when order arrives" },
                ].map((m, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 3 ? "1px solid #1a1a1a" : "none" }}>
                    <span style={{ fontSize: 20 }}>{m.icon}</span>
                    <div>
                      <p style={{ color: "#ccc", fontWeight: 600, fontSize: 13, margin: 0 }}>{m.label}</p>
                      <p style={{ color: "#333", fontSize: 11, margin: "1px 0 0" }}>{m.sub}</p>
                    </div>
                    <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 700, color: "#22c55e", background: "rgba(34,197,94,0.1)", padding: "2px 7px", borderRadius: 4, border: "1px solid rgba(34,197,94,0.2)" }}>AVAILABLE</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: "12px 14px", background: "rgba(200,255,0,0.04)", border: "1px solid rgba(200,255,0,0.1)", borderRadius: 10 }}>
                <p style={{ color: "#c8ff00", fontWeight: 700, fontSize: 12, margin: "0 0 4px" }}>🔒 100% Secure</p>
                <p style={{ color: "#444", fontSize: 11, margin: 0 }}>All transactions are SSL encrypted. Your payment info is never stored on our servers.</p>
              </div>
            </div>
          )}

          {/* ── Notifications tab ── */}
          {user && tab === "notifications" && (
            <div className="pp-fade" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: "0 0 4px" }}>Notification Preferences</h3>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "#111", border: "1px solid #1e1e1e", borderRadius: 12 }}>
                <div>
                  <p style={{ color: "#fff", fontWeight: 600, fontSize: 13, margin: 0 }}>All Notifications</p>
                  <p style={{ color: "#444", fontSize: 11, margin: "2px 0 0" }}>Email updates for orders and offers</p>
                </div>
                <button onClick={toggleNotifications} disabled={savingNotif}
                  style={{ width: 44, height: 24, borderRadius: 12, background: notifEnabled ? "#c8ff00" : "#2a2a2a", border: "none", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background 0.2s" }}>
                  <span style={{ position: "absolute", top: 3, left: notifEnabled ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: notifEnabled ? "#0a0a0a" : "#555", transition: "left 0.2s" }} />
                </button>
              </div>
              {[
                { icon: "📦", label: "Order Updates", sub: "Shipping, delivery & tracking" },
                { icon: "🏷️", label: "Offers & Deals", sub: "Discounts and promotional codes" },
                { icon: "🔔", label: "New Arrivals", sub: "Latest jersey drops from your leagues" },
                { icon: "⭐", label: "Review Reminders", sub: "Rate your recent purchases" },
              ].map((n, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, opacity: notifEnabled ? 1 : 0.45 }}>
                  <span style={{ fontSize: 20 }}>{n.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: "#ccc", fontWeight: 600, fontSize: 13, margin: 0 }}>{n.label}</p>
                    <p style={{ color: "#333", fontSize: 11, margin: "1px 0 0" }}>{n.sub}</p>
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: notifEnabled ? "#22c55e" : "#333", flexShrink: 0 }} />
                </div>
              ))}
              <p style={{ color: "#333", fontSize: 11, textAlign: "center", margin: 0 }}>Notifications sent to <span style={{ color: "#444" }}>{user}</span></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
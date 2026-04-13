import { useState } from "react";

const API = "http://127.0.0.1:5000";

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh",
];

const inp = {
  width: "100%", padding: "11px 14px", background: "#161616",
  border: "1px solid #2a2a2a", borderRadius: 9, color: "#fff",
  fontSize: 13, outline: "none", fontFamily: "'DM Sans', sans-serif",
  boxSizing: "border-box", transition: "border-color 0.2s",
};

const labelSm = {
  display: "block", fontSize: 10, fontWeight: 700,
  letterSpacing: "0.1em", textTransform: "uppercase",
  color: "#555", marginBottom: 6,
};

const sectionBox = {
  background: "#111", border: "1px solid #1e1e1e",
  borderRadius: 16, marginBottom: 14, overflow: "hidden",
};

const sectionHead = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "16px 20px", borderBottom: "1px solid #1a1a1a",
};

export default function Checkout({ cart, total, finalTotal: propFinalTotal, user, setCheckout, onOrderSuccess, Navbar, appliedOffer, setAppliedOffer, offers }) {
  const [step, setStep] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const [orderId, setOrderId] = useState("");

  const [fullName,  setFullName]  = useState("");
  const [phone,     setPhone]     = useState("");
  const [pincode,   setPincode]   = useState("");
  const [address1,  setAddress1]  = useState("");
  const [address2,  setAddress2]  = useState("");
  const [city,      setCity]      = useState("");
  const [state,     setState]     = useState("Maharashtra");
  const [addrType,  setAddrType]  = useState("Home");
  const [pinInfo,   setPinInfo]   = useState(null);
  const [pinErr,    setPinErr]    = useState("");
  const [pinLoading,setPinLoading]= useState(false);

  const [payMethod, setPayMethod] = useState("upi");
  const [upiId,     setUpiId]     = useState("");

  const DELIVERY_CHARGE = 0;
  const discount        = appliedOffer ? appliedOffer.discount : 0;
  const finalTotal      = propFinalTotal ?? (total - discount);

  /* ── PIN lookup ── */
  const checkPin = async (pin) => {
    if (pin.length !== 6) { setPinInfo(null); setPinErr(""); return; }
    setPinLoading(true); setPinErr(""); setPinInfo(null);
    try {
      const res  = await fetch(`${API}/delivery/${pin}`);
      const data = await res.json();
      if (res.ok) { setPinInfo(data); setCity(data.city); setState(data.state); }
      else setPinErr(data.error || "PIN not serviceable");
    } catch { setPinErr("Server error"); }
    setPinLoading(false);
  };

  /* ── Place order ── */
  const placeOrder = async () => {
    setPlacing(true);
    const fullAddress = `${fullName}, ${phone}\n${address1}${address2 ? ", " + address2 : ""}\n${city}, ${state} - ${pincode}`;
    try {
      const res = await fetch(`${API}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart, total: finalTotal, user,
          address: fullAddress,
          appliedOffer: appliedOffer ? appliedOffer.label : null,
          paymentId: payMethod === "cod" ? "COD" : `${payMethod.toUpperCase()}-${Date.now()}`,
          paymentMethod: payMethod,
        }),
      });
      if (res.ok) {
        const fakeId = "OD" + Date.now().toString().slice(-10);
        setOrderId(fakeId);
        setOrderDone(true);
        if (onOrderSuccess) onOrderSuccess();
      } else {
        alert("Order failed. Please try again.");
      }
    } catch { alert("Server error"); }
    setPlacing(false);
  };

  /* ── ORDER SUCCESS SCREEN ── */
  if (orderDone) {
    return (
      <div style={{ background: "#0a0a0a", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
        {Navbar}
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(34,197,94,0.12)", border: "2px solid #22c55e", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 36 }}>✓</div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#22c55e", marginBottom: 8 }}>Order Confirmed</p>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.8rem", color: "#fff", letterSpacing: "0.05em", marginBottom: 8 }}>Thank You!</h1>
          <p style={{ color: "#555", fontSize: 14, marginBottom: 32 }}>Your order has been placed successfully.</p>

          <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, padding: 24, textAlign: "left", marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ color: "#444", fontSize: 12 }}>Order ID</span>
              <span style={{ color: "#c8ff00", fontWeight: 700, fontSize: 13, fontFamily: "monospace" }}>{orderId}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ color: "#444", fontSize: 12 }}>Items</span>
              <span style={{ color: "#fff", fontSize: 13 }}>{cart.length} item{cart.length !== 1 ? "s" : ""}</span>
            </div>
            {appliedOffer && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ color: "#444", fontSize: 12 }}>Offer Applied</span>
                <span style={{ color: "#22c55e", fontWeight: 700, fontSize: 12 }}>🎉 {appliedOffer.label} off</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ color: "#444", fontSize: 12 }}>Amount Paid</span>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", color: "#c8ff00" }}>₹{finalTotal}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#444", fontSize: 12 }}>Estimated Delivery</span>
              <span style={{ color: "#22c55e", fontWeight: 700, fontSize: 13 }}>{pinInfo?.deliveryDate || "3–5 business days"}</span>
            </div>
          </div>

          <button onClick={() => { setCheckout(false); }} style={{ width: "100%", padding: 14, background: "#c8ff00", border: "none", borderRadius: 10, color: "#0a0a0a", fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const steps = ["Delivery Address", "Order Summary", "Payment"];

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", paddingBottom: 100 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        .co-inp:focus { border-color: #c8ff00 !important; }
        .co-inp::placeholder { color: #333; }
        .co-inp:hover { border-color: #444 !important; }
        .pay-opt { cursor: pointer; transition: border-color 0.2s, background 0.2s; }
        .pay-opt:hover { border-color: #444 !important; }
        .addr-type-btn { transition: all 0.15s; }
        .addr-type-btn:hover { border-color: #c8ff00 !important; color: #c8ff00 !important; }
        .offer-chip { transition: border-color 0.15s, background 0.15s; cursor: pointer; }
        .offer-chip:hover { border-color: #c8ff00 !important; }
      `}</style>

      {Navbar}

      <div style={{ background: "#0d0d0d", borderBottom: "1px solid #181818", padding: "10px 24px" }}>
        <button onClick={() => setCheckout(false)} style={{ background: "none", border: "none", color: "#c8ff00", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>← Back to Cart</button>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px", display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, alignItems: "start" }} className="co-grid">
        <style>{`.co-grid{grid-template-columns:1fr 360px} @media(max-width:800px){.co-grid{grid-template-columns:1fr!important;}}`}</style>

        {/* ── LEFT COLUMN ── */}
        <div>
          {/* Step indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 24 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: i < step - 1 ? "pointer" : "default" }} onClick={() => i < step - 1 && setStep(i + 1)}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: i + 1 < step ? "#22c55e" : i + 1 === step ? "#c8ff00" : "#1a1a1a", border: `2px solid ${i + 1 < step ? "#22c55e" : i + 1 === step ? "#c8ff00" : "#2a2a2a"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                    {i + 1 < step ? <span style={{ fontSize: 12, color: "#fff" }}>✓</span> : <span style={{ fontSize: 11, fontWeight: 700, color: i + 1 === step ? "#0a0a0a" : "#444" }}>{i + 1}</span>}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: i + 1 === step ? "#fff" : i + 1 < step ? "#22c55e" : "#333", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{s}</span>
                </div>
                {i < steps.length - 1 && <div style={{ flex: 1, height: 1, background: i + 1 < step ? "#22c55e" : "#1e1e1e", margin: "0 12px", transition: "background 0.3s" }} />}
              </div>
            ))}
          </div>

          {/* ══ STEP 1 — ADDRESS ══ */}
          {step === 1 && (
            <div style={sectionBox}>
              <div style={sectionHead}>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#c8ff00", marginBottom: 4 }}>Step 1</p>
                  <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", color: "#fff", letterSpacing: "0.05em" }}>Delivery Address</h2>
                </div>
              </div>

              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelSm}>Full Name <span style={{ color: "#c8ff00" }}>*</span></label>
                    <input type="text" className="co-inp" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Rahul Sharma" style={inp} />
                  </div>
                  <div>
                    <label style={labelSm}>Mobile Number <span style={{ color: "#c8ff00" }}>*</span></label>
                    <input type="tel" className="co-inp" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit number" style={inp} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelSm}>PIN Code <span style={{ color: "#c8ff00" }}>*</span></label>
                    <div style={{ position: "relative" }}>
                      <input type="text" className="co-inp" value={pincode} maxLength={6}
                        onChange={e => { const v = e.target.value.replace(/\D/g, ""); setPincode(v); checkPin(v); }}
                        placeholder="6-digit PIN" style={inp} />
                      {pinLoading && <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#555", fontSize: 11 }}>...</span>}
                    </div>
                    {pinErr && <p style={{ color: "#ef4444", fontSize: 10, marginTop: 4 }}>{pinErr}</p>}
                    {pinInfo && <p style={{ color: "#22c55e", fontSize: 10, marginTop: 4 }}>✓ {pinInfo.city}, {pinInfo.state}</p>}
                  </div>
                  <div>
                    <label style={labelSm}>City <span style={{ color: "#c8ff00" }}>*</span></label>
                    <input type="text" className="co-inp" value={city} onChange={e => setCity(e.target.value)} placeholder="City" style={inp} />
                  </div>
                  <div>
                    <label style={labelSm}>State <span style={{ color: "#c8ff00" }}>*</span></label>
                    <select className="co-inp" value={state} onChange={e => setState(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={labelSm}>Flat, House No., Building <span style={{ color: "#c8ff00" }}>*</span></label>
                  <input type="text" className="co-inp" value={address1} onChange={e => setAddress1(e.target.value)} placeholder="e.g. Flat 4B, Sunshine Apartments" style={inp} />
                </div>
                <div>
                  <label style={labelSm}>Area, Colony, Street</label>
                  <input type="text" className="co-inp" value={address2} onChange={e => setAddress2(e.target.value)} placeholder="e.g. MG Road, Bandra West" style={inp} />
                </div>

                <div>
                  <label style={labelSm}>Address Type</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["Home", "Work", "Other"].map(t => (
                      <button key={t} className="addr-type-btn" onClick={() => setAddrType(t)}
                        style={{ padding: "7px 18px", borderRadius: 20, border: `2px solid ${addrType === t ? "#c8ff00" : "#2a2a2a"}`, background: addrType === t ? "rgba(200,255,0,0.08)" : "transparent", color: addrType === t ? "#c8ff00" : "#555", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                        {t === "Home" ? "🏠 " : t === "Work" ? "💼 " : "📍 "}{t}
                      </button>
                    ))}
                  </div>
                </div>

                {pinInfo && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 10, padding: "12px 16px" }}>
                    <span style={{ fontSize: 20 }}>🚚</span>
                    <div>
                      <p style={{ color: "#22c55e", fontWeight: 700, fontSize: 13 }}>FREE Delivery by {pinInfo.deliveryDate}</p>
                      <p style={{ color: "#555", fontSize: 11 }}>Cash on delivery available · Seller: {pinInfo.seller}</p>
                    </div>
                  </div>
                )}

                <button onClick={() => { if (!fullName.trim()) { alert("Enter your full name"); return; } if (phone.length !== 10) { alert("Enter a valid 10-digit mobile number"); return; } if (pincode.length !== 6) { alert("Enter a valid PIN code"); return; } if (!address1.trim()) { alert("Enter your flat/house details"); return; } if (!city.trim()) { alert("Enter your city"); return; } setStep(2); }}
                  style={{ padding: "13px", background: "#c8ff00", border: "none", borderRadius: 10, color: "#0a0a0a", fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>
                  Deliver to this Address →
                </button>
              </div>
            </div>
          )}

          {/* ══ STEP 2 — ORDER SUMMARY ══ */}
          {step === 2 && (
            <div style={sectionBox}>
              <div style={sectionHead}>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#c8ff00", marginBottom: 4 }}>Step 2</p>
                  <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", color: "#fff", letterSpacing: "0.05em" }}>Order Summary</h2>
                </div>
                <button onClick={() => setStep(1)} style={{ background: "none", border: "1px solid #2a2a2a", borderRadius: 8, color: "#c8ff00", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", padding: "6px 14px", fontFamily: "'DM Sans', sans-serif" }}>Edit Address</button>
              </div>

              <div style={{ margin: "0 20px", marginTop: 16, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ fontSize: 16, marginTop: 1 }}>📍</span>
                  <div>
                    <p style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{fullName} <span style={{ color: "#555", fontWeight: 400, fontSize: 12 }}>({addrType})</span></p>
                    <p style={{ color: "#555", fontSize: 12, marginTop: 2 }}>{address1}{address2 ? `, ${address2}` : ""}</p>
                    <p style={{ color: "#555", fontSize: 12 }}>{city}, {state} - {pincode}</p>
                    <p style={{ color: "#555", fontSize: 12 }}>📞 {phone}</p>
                    {pinInfo && <p style={{ color: "#22c55e", fontSize: 11, marginTop: 4 }}>🚚 FREE Delivery by {pinInfo.deliveryDate}</p>}
                  </div>
                </div>
              </div>

              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                {cart.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 12 }}>
                    {item.image && <img src={item.image} alt={item.name} style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: "#fff", fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{item.name}</p>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {item.size && <span style={{ color: "#555", fontSize: 11 }}>Size: <b style={{ color: "#888" }}>{item.size}</b></span>}
                        {item.league && <span style={{ color: "#555", fontSize: 11 }}>{item.league}</span>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                        <span style={{ color: "#22c55e", fontSize: 10, fontWeight: 700 }}>↓61%</span>
                        <span style={{ color: "#c8ff00", fontWeight: 700, fontSize: 15 }}>₹{item.price}</span>
                        <span style={{ color: "#333", textDecoration: "line-through", fontSize: 11 }}>₹{Math.round(item.price / 0.39)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ padding: "0 20px 20px" }}>
                <button onClick={() => setStep(3)}
                  style={{ width: "100%", padding: 13, background: "#c8ff00", border: "none", borderRadius: 10, color: "#0a0a0a", fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  Continue to Payment →
                </button>
              </div>
            </div>
          )}

          {/* ══ STEP 3 — PAYMENT ══ */}
          {step === 3 && (
            <div style={sectionBox}>
              <div style={sectionHead}>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#c8ff00", marginBottom: 4 }}>Step 3</p>
                  <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", color: "#fff", letterSpacing: "0.05em" }}>Payment</h2>
                </div>
                <button onClick={() => setStep(2)} style={{ background: "none", border: "1px solid #2a2a2a", borderRadius: 8, color: "#c8ff00", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", padding: "6px 14px", fontFamily: "'DM Sans', sans-serif" }}>Edit Order</button>
              </div>

              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>

                {/* Applied offer banner */}
                {appliedOffer && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{appliedOffer.icon}</span>
                      <p style={{ color: "#22c55e", fontWeight: 700, fontSize: 13 }}>🎉 {appliedOffer.label} discount applied!</p>
                    </div>
                    <button onClick={() => setAppliedOffer(null)} style={{ background: "none", border: "none", color: "#555", fontSize: 12, cursor: "pointer" }}>Remove</button>
                  </div>
                )}

                {/* Change offer option */}
                {offers.length > 0 && !appliedOffer && (
                  <div style={{ border: "1px dashed #222", borderRadius: 10, padding: "12px 14px" }}>
                    <p style={{ color: "#444", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Apply an offer</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {offers.map((o, i) => (
                        <div key={i} className="offer-chip" onClick={() => setAppliedOffer(o)}
                          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 14 }}>{o.icon}</span>
                            <p style={{ color: "#ccc", fontSize: 12, fontWeight: 600 }}>{o.label} off · {o.sub}</p>
                          </div>
                          <span style={{ color: "#c8ff00", fontSize: 10, fontWeight: 700 }}>APPLY</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment options */}
                {[
                  { id: "upi",        icon: "📱", label: "UPI",               sub: "Google Pay, PhonePe, Paytm, BHIM" },
                  { id: "card",       icon: "💳", label: "Credit / Debit Card", sub: "Visa, Mastercard, RuPay" },
                  { id: "netbanking", icon: "🏦", label: "Net Banking",        sub: "All major banks supported" },
                  { id: "cod",        icon: "💵", label: "Cash on Delivery",   sub: "Pay when your order arrives" },
                ].map(opt => (
                  <div key={opt.id} className="pay-opt" onClick={() => setPayMethod(opt.id)}
                    style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 16px", background: payMethod === opt.id ? "rgba(200,255,0,0.05)" : "#0d0d0d", border: `2px solid ${payMethod === opt.id ? "#c8ff00" : "#1e1e1e"}`, borderRadius: 12, transition: "all 0.15s" }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${payMethod === opt.id ? "#c8ff00" : "#333"}`, background: payMethod === opt.id ? "#c8ff00" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                      {payMethod === opt.id && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#0a0a0a" }} />}
                    </div>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{opt.icon}</span>
                    <div>
                      <p style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{opt.label}</p>
                      <p style={{ color: "#444", fontSize: 11, marginTop: 2 }}>{opt.sub}</p>
                    </div>
                  </div>
                ))}

                {payMethod === "upi" && (
                  <div style={{ marginTop: 4 }}>
                    <label style={labelSm}>UPI ID</label>
                    <input type="text" className="co-inp" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi" style={inp} />
                  </div>
                )}

                {payMethod === "card" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                    <div>
                      <label style={labelSm}>Card Number</label>
                      <input type="text" className="co-inp" placeholder="1234 5678 9012 3456" maxLength={19} style={inp} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div><label style={labelSm}>Expiry (MM/YY)</label><input type="text" className="co-inp" placeholder="MM/YY" maxLength={5} style={inp} /></div>
                      <div><label style={labelSm}>CVV</label><input type="password" className="co-inp" placeholder="•••" maxLength={3} style={inp} /></div>
                    </div>
                    <div><label style={labelSm}>Cardholder Name</label><input type="text" className="co-inp" placeholder="As on card" style={inp} /></div>
                  </div>
                )}

                {payMethod === "cod" && (
                  <div style={{ background: "rgba(250,204,21,0.06)", border: "1px solid rgba(250,204,21,0.15)", borderRadius: 10, padding: "12px 16px", marginTop: 4 }}>
                    <p style={{ color: "#facc15", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>⚠️ Cash on Delivery</p>
                    <p style={{ color: "#555", fontSize: 12 }}>Please keep exact change of ₹{finalTotal} ready.</p>
                  </div>
                )}

                <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                  {["🔒 100% Secure", "✅ SSL Encrypted", "🏆 10L+ customers"].map(b => (
                    <span key={b} style={{ fontSize: 10, color: "#444", fontWeight: 600, padding: "4px 10px", background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 20 }}>{b}</span>
                  ))}
                </div>

                <button onClick={placeOrder} disabled={placing}
                  style={{ padding: 14, background: placing ? "#1a1a1a" : "#c8ff00", border: "none", borderRadius: 10, color: placing ? "#444" : "#0a0a0a", fontWeight: 700, fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase", cursor: placing ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>
                  {placing ? "Placing Order..." : `Place Order · ₹${finalTotal}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN — PRICE SUMMARY ── */}
        <div style={{ position: "sticky", top: 80 }}>
          <div style={sectionBox}>
            <div style={{ ...sectionHead, borderBottom: "1px solid #1a1a1a" }}>
              <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Price Details</h3>
              <span style={{ color: "#444", fontSize: 12 }}>{cart.length} item{cart.length !== 1 ? "s" : ""}</span>
            </div>

            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#555", fontSize: 13 }}>Price ({cart.length} item{cart.length !== 1 ? "s" : ""})</span>
                <span style={{ color: "#ccc", fontSize: 13 }}>₹{total}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#555", fontSize: 13 }}>Delivery Charges</span>
                <span style={{ color: "#22c55e", fontWeight: 700, fontSize: 13 }}>FREE</span>
              </div>
              {discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ color: "#555", fontSize: 13 }}>Offer Discount</span>
                    <p style={{ color: "#22c55e", fontSize: 10, marginTop: 2 }}>🎉 {appliedOffer?.label} off · {appliedOffer?.sub}</p>
                  </div>
                  <span style={{ color: "#22c55e", fontWeight: 700, fontSize: 13 }}>− ₹{discount}</span>
                </div>
              )}
              <div style={{ borderTop: "1px solid #1e1e1e", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Total Amount</span>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", color: "#c8ff00", letterSpacing: "0.04em" }}>₹{finalTotal}</span>
              </div>
              <p style={{ color: "#22c55e", fontSize: 11, fontWeight: 600 }}>You will save ₹{Math.round(total * 0.61) + discount} on this order</p>
            </div>

            <div style={{ borderTop: "1px solid #1a1a1a", padding: "14px 20px" }}>
              <p style={{ color: "#444", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Items in Cart</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {cart.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {item.image && <img src={item.image} alt={item.name} style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: "#888", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</p>
                      {item.size && <p style={{ color: "#444", fontSize: 10 }}>Size: {item.size}</p>}
                    </div>
                    <span style={{ color: "#c8ff00", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>₹{item.price}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: "1px solid #1a1a1a", padding: "12px 20px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>🔒</span>
              <p style={{ color: "#333", fontSize: 11 }}>Safe and Secure Payments. Easy returns. 100% Authentic products.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#0c0c0c", borderTop: "1px solid #1e1e1e", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 40 }} className="co-mob">
        <style>{`.co-mob{display:flex} @media(min-width:800px){.co-mob{display:none!important;}}`}</style>
        <div>
          <p style={{ color: "#555", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Total</p>
          <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", color: "#c8ff00" }}>₹{finalTotal}</p>
        </div>
        {step === 1 && <button onClick={() => { if (!fullName||phone.length!==10||pincode.length!==6||!address1||!city){alert("Please fill all required address fields");return;} setStep(2); }} style={{ padding: "12px 24px", background: "#c8ff00", border: "none", borderRadius: 10, color: "#0a0a0a", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Continue →</button>}
        {step === 2 && <button onClick={() => setStep(3)} style={{ padding: "12px 24px", background: "#c8ff00", border: "none", borderRadius: 10, color: "#0a0a0a", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>To Payment →</button>}
        {step === 3 && <button onClick={placeOrder} disabled={placing} style={{ padding: "12px 24px", background: placing?"#1a1a1a":"#c8ff00", border: "none", borderRadius: 10, color: placing?"#444":"#0a0a0a", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", cursor: placing?"not-allowed":"pointer", fontFamily: "'DM Sans', sans-serif" }}>{placing?"Placing...":"Place Order"}</button>}
      </div>
    </div>
  );
}
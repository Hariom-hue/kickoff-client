import { useState, useEffect, useRef, useCallback } from "react";
import Admin from "./Admin";
import AdminLogin from "./Adminlogin";
import ProductDetail from "./ProductDetail";
import Checkout from "./Checkout";
import ProfilePanel from "./ProfilePanel";   // ← NEW

const API = "http://127.0.0.1:5000";
const sportEmoji = { Football: "⚽", Cricket: "🏏", Basketball: "🏀", Kabaddi: "🤼", Hockey: "🏑", Tennis: "🎾", default: "🏆" };

/* ─── persistent cart helpers ─── */
function getCartKey(user) { return user ? `cart_${user}` : null; }
function loadCart(user) {
  const key = getCartKey(user);
  if (!key) return [];
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
function saveCart(user, cart) {
  const key = getCartKey(user);
  if (key) localStorage.setItem(key, JSON.stringify(cart));
}

/* ─────────────────────────────────────────────
   CART FLY ANIMATION
───────────────────────────────────────────── */
function CartFlyAnimation({ item, origin, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !origin) return;
    const cartEl = document.getElementById("nav-cart-btn");
    const target = cartEl
      ? cartEl.getBoundingClientRect()
      : { left: window.innerWidth - 60, top: 20, width: 42, height: 42 };
    const dx = target.left + target.width / 2 - origin.x;
    const dy = target.top  + target.height / 2 - origin.y;
    ref.current.animate(
      [
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: `translate(${dx * 0.4}px,${dy * 0.15}px) scale(0.85)`, opacity: 1, offset: 0.35 },
        { transform: `translate(${dx}px,${dy}px) scale(0.1)`, opacity: 0 },
      ],
      { duration: 680, easing: "cubic-bezier(0.25,0.46,0.45,0.94)", fill: "forwards" }
    ).onfinish = onDone;
  }, []);
  if (!origin) return null;
  return (
    <div ref={ref} style={{
      position: "fixed", left: origin.x - 28, top: origin.y - 28,
      width: 56, height: 56, borderRadius: 10, overflow: "hidden",
      zIndex: 9999, pointerEvents: "none",
      border: "2px solid #c8ff00", boxShadow: "0 0 20px rgba(200,255,0,0.6)",
    }}>
      <img src={item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   CART PANEL
───────────────────────────────────────────── */
function CartPanel({ cart, removeFromCart, total, setShowCart, setShowProfile, setCheckout, user, appliedOffer, setAppliedOffer, offers }) {
  const discount   = appliedOffer ? appliedOffer.discount : 0;
  const finalTotal = total - discount;
  return (
    <div className="fixed inset-0 z-50 overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }} onClick={() => setShowCart(false)} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md flex flex-col" style={{ background: "#0c0c0c", borderLeft: "1px solid #1e1e1e" }}>
        <div className="flex items-center justify-between px-8 py-6" style={{ borderBottom: "1px solid #1e1e1e" }}>
          <div>
            <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#c8ff00", marginBottom: 4 }}>Your</p>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", color: "#fff", letterSpacing: "0.06em" }}>Shopping Cart</h2>
          </div>
          <button onClick={() => setShowCart(false)} style={{ width: 40, height: 40, borderRadius: "50%", background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#888", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", paddingTop: 80, color: "#333" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
              <p style={{ fontSize: 14 }}>Your cart is empty</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {cart.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "#161616", border: "1px solid #222", borderRadius: 12 }}>
                  {item.image && <img src={item.image} alt={item.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: "#fff", fontWeight: 600, fontSize: 13, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</p>
                    {item.size && <p style={{ color: "#555", fontSize: 11 }}>Size: {item.size}</p>}
                    <p style={{ color: "#c8ff00", fontWeight: 700, fontSize: 14, marginTop: 2 }}>₹{item.price}</p>
                  </div>
                  <button onClick={() => removeFromCart(i)} style={{ width: 28, height: 28, borderRadius: 6, background: "#1a0808", border: "1px solid #3a1515", color: "#ff5555", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>✕</button>
                </div>
              ))}

              {/* Offer chips */}
              {offers && offers.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <p style={{ color: "#444", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Apply Offer</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {offers.map((o, i) => {
                      const isApplied = appliedOffer?._id === o._id;
                      return (
                        <div key={i} onClick={() => setAppliedOffer(isApplied ? null : o)}
                          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: isApplied ? "rgba(200,255,0,0.06)" : "#111", border: `1px solid ${isApplied ? "#c8ff00" : "#222"}`, borderRadius: 10, cursor: "pointer", transition: "all 0.15s" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 16 }}>{o.icon}</span>
                            <div>
                              <p style={{ color: "#fff", fontWeight: 600, fontSize: 12, margin: 0 }}>{o.label} off</p>
                              <p style={{ color: "#555", fontSize: 10, margin: 0 }}>{o.sub} · {o.type}</p>
                            </div>
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 700, color: isApplied ? "#c8ff00" : "#555" }}>{isApplied ? "✓ APPLIED" : "APPLY"}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ padding: "20px 32px", borderTop: "1px solid #1e1e1e" }}>
          {appliedOffer && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: "#22c55e", fontSize: 12 }}>🎉 {appliedOffer.label} discount</span>
              <span style={{ color: "#22c55e", fontWeight: 700, fontSize: 12 }}>− ₹{discount}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ color: "#555", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Total</span>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: "#c8ff00", letterSpacing: "0.04em" }}>₹{finalTotal}</span>
          </div>
          <button onClick={() => { setShowCart(false); if (!user) setShowProfile(true); else setCheckout(true); }} disabled={cart.length === 0}
            style={{ width: "100%", padding: "14px", borderRadius: 12, background: cart.length === 0 ? "#1a1a1a" : "#c8ff00", color: cart.length === 0 ? "#333" : "#0c0c0c", fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", border: "none", cursor: cart.length === 0 ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────── */
function Navbar({ search, setSearch, cart, setShowCart, setShowProfile, setShowSidebar, onLogoClick, user, cartBounce }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        .nav-inp::placeholder{color:#444;}
        .nav-inp:focus{border-color:#c8ff00!important;outline:none;}
        .nav-cart-btn:hover{border-color:#c8ff00!important;}
        @keyframes cartBounce{0%,100%{transform:scale(1)}30%{transform:scale(1.45)}60%{transform:scale(0.88)}80%{transform:scale(1.12)}}
        .cart-bounce{animation:cartBounce 0.55s ease;}
        @keyframes badgePop{0%{transform:scale(0)}60%{transform:scale(1.4)}100%{transform:scale(1)}}
        .badge-pop{animation:badgePop 0.3s ease;}
      `}</style>
      <header style={{ background: "#0a0a0a", borderBottom: "1px solid #181818", position: "sticky", top: 0, zIndex: 40, fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "0 28px", height: 64 }}>
          <button onClick={() => setShowSidebar(true)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", gap: 5, padding: 4, flexShrink: 0 }}>
            <span style={{ display: "block", width: 22, height: 2, background: "#fff" }} />
            <span style={{ display: "block", width: 15, height: 2, background: "#c8ff00" }} />
            <span style={{ display: "block", width: 22, height: 2, background: "#fff" }} />
          </button>
          <h1 onClick={onLogoClick} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.7rem", letterSpacing: "0.12em", cursor: "pointer", flexShrink: 0, lineHeight: 1, marginRight: 8 }}>
            <span style={{ color: "#fff" }}>KICK</span><span style={{ color: "#c8ff00" }}>OFF</span>
          </h1>
          <div style={{ flex: 1, position: "relative", maxWidth: 440 }}>
            <svg style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#444", pointerEvents: "none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" placeholder="Search jerseys..." value={search} onChange={e => setSearch(e.target.value)} className="nav-inp"
              style={{ width: "100%", paddingLeft: 40, paddingRight: 14, paddingTop: 9, paddingBottom: 9, background: "#161616", border: "1px solid #252525", borderRadius: 9, color: "#fff", fontSize: 13, transition: "border-color 0.2s", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto", flexShrink: 0 }}>
            <button onClick={() => setShowProfile(true)}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "#161616", border: "1px solid #252525", borderRadius: 9, padding: "7px 12px", cursor: "pointer", transition: "border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor="#c8ff00"} onMouseLeave={e => e.currentTarget.style.borderColor="#252525"}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: user ? "#c8ff00" : "#252525", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#0a0a0a" }}>
                {user ? user.split("@")[0].charAt(0).toUpperCase() : "?"}
              </div>
              <span style={{ color: user ? "#fff" : "#666", fontSize: 12, fontWeight: 600 }}>{user ? user.split("@")[0] : "Sign in"}</span>
            </button>
            <button id="nav-cart-btn" onClick={() => setShowCart(true)}
              className={`nav-cart-btn${cartBounce ? " cart-bounce" : ""}`}
              style={{ position: "relative", width: 42, height: 42, background: "#161616", border: "1px solid #252525", borderRadius: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color 0.2s" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.75"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              {cart.length > 0 && (
                <span key={cart.length} className="badge-pop" style={{ position: "absolute", top: -6, right: -6, background: "#c8ff00", color: "#0a0a0a", width: 17, height: 17, borderRadius: "50%", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{cart.length}</span>
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
function Footer({ leagues, goLeague }) {
  return (
    <footer style={{ background: "#060606", borderTop: "1px solid #161616", fontFamily: "'DM Sans', sans-serif", marginTop: 80 }}>
      <div style={{ borderBottom: "1px solid #111", padding: "24px 40px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 28, alignItems: "center", justifyContent: "center" }}>
          {[
            { icon: "🔒", title: "Secure Payments",  sub: "SSL encrypted checkout" },
            { icon: "🚚", title: "Free Delivery",    sub: "On all orders" },
            { icon: "🔄", title: "7-Day Returns",    sub: "Hassle-free returns" },
            { icon: "✅", title: "100% Authentic",   sub: "Official licensed products" },
            { icon: "💬", title: "24×7 Support",     sub: "Always here for you" },
          ].map((b, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 22 }}>{b.icon}</span>
              <div>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 13, margin: 0 }}>{b.title}</p>
                <p style={{ color: "#444", fontSize: 11, margin: 0 }}>{b.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "44px 40px 32px", display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", gap: 40 }} className="footer-grid">
        <style>{`@media(max-width:768px){.footer-grid{grid-template-columns:1fr!important;}}`}</style>
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.4rem", letterSpacing: "0.12em", marginBottom: 12 }}>
            <span style={{ color: "#fff" }}>KICK</span><span style={{ color: "#c8ff00" }}>OFF</span>
          </h2>
          <p style={{ color: "#444", fontSize: 13, lineHeight: 1.75, maxWidth: 260, marginBottom: 22 }}>India's premier destination for authentic sports jerseys. Official kits from the world's biggest leagues, delivered to your door.</p>
          <div style={{ display: "flex", gap: 10 }}>
            {[{l:"📸",h:"https://instagram.com"},{l:"🐦",h:"https://twitter.com"},{l:"▶️",h:"https://youtube.com"}].map((s,i)=>(
              <a key={i} href={s.h} target="_blank" rel="noreferrer" style={{ width:36,height:36,borderRadius:8,background:"#111",border:"1px solid #222",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",fontSize:14,transition:"border-color 0.2s" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor="#c8ff00"} onMouseLeave={e=>e.currentTarget.style.borderColor="#222"}>{s.l}</a>
            ))}
          </div>
        </div>
        <div>
          <p style={{ fontSize:10,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:"#c8ff00",marginBottom:18 }}>Leagues</p>
          <div style={{ display:"flex",flexDirection:"column",gap:11 }}>
            {leagues.slice(0,6).map((l,i)=>(
              <button key={i} onClick={()=>goLeague(l)} style={{ background:"none",border:"none",color:"#555",fontSize:13,cursor:"pointer",textAlign:"left",padding:0,fontFamily:"'DM Sans',sans-serif",transition:"color 0.2s" }}
                onMouseEnter={e=>e.currentTarget.style.color="#fff"} onMouseLeave={e=>e.currentTarget.style.color="#555"}>
                {sportEmoji[l.sport]||sportEmoji.default} {l.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p style={{ fontSize:10,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:"#c8ff00",marginBottom:18 }}>Quick Links</p>
          <div style={{ display:"flex",flexDirection:"column",gap:11 }}>
            {["Home","Catalog","New Arrivals","Sale","Track Order"].map(link=>(
              <a key={link} href="#" style={{ color:"#555",fontSize:13,textDecoration:"none",transition:"color 0.2s" }}
                onMouseEnter={e=>e.currentTarget.style.color="#fff"} onMouseLeave={e=>e.currentTarget.style.color="#555"}>{link}</a>
            ))}
          </div>
        </div>
        <div>
          <p style={{ fontSize:10,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:"#c8ff00",marginBottom:18 }}>Legal</p>
          <div style={{ display:"flex",flexDirection:"column",gap:11 }}>
            {["Privacy Policy","Refund Policy","Terms of Use","Shipping Policy","Contact Information","About Us"].map(link=>(
              <a key={link} href="#" style={{ color:"#555",fontSize:13,textDecoration:"none",transition:"color 0.2s" }}
                onMouseEnter={e=>e.currentTarget.style.color="#fff"} onMouseLeave={e=>e.currentTarget.style.color="#555"}>{link}</a>
            ))}
          </div>
        </div>
      </div>
      <div style={{ borderTop:"1px solid #111",padding:"22px 40px" }}>
        <div style={{ maxWidth:1400,margin:"0 auto",display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:20 }}>
          <div style={{ display:"flex",alignItems:"center",gap:20 }}>
            <div>
              <div style={{ display:"flex",gap:3,marginBottom:4 }}>
                {[1,2,3,4].map(s=><span key={s} style={{ color:"#22c55e",fontSize:18 }}>★</span>)}
                <span style={{ color:"#2a2a2a",fontSize:18 }}>★</span>
              </div>
              <p style={{ color:"#22c55e",fontSize:13,fontWeight:700,margin:0 }}>616 reviews</p>
            </div>
            <div style={{ width:1,height:36,background:"#1e1e1e" }} />
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <span style={{ color:"#444",fontSize:12 }}>Verified by</span>
              <div style={{ display:"flex",alignItems:"center",gap:5 }}>
                <div style={{ width:18,height:18,borderRadius:3,background:"#22c55e",display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <span style={{ color:"#fff",fontSize:10,fontWeight:900 }}>✓</span>
                </div>
                <span style={{ color:"#22c55e",fontWeight:800,fontSize:14 }}>Judge.me</span>
              </div>
            </div>
          </div>
          <div style={{ display:"flex",gap:14,flexWrap:"wrap" }}>
            {[
              {num:"616",label:"VERIFIED\nREVIEWS",color:"#22c55e"},
              {num:"152",label:"MONTHLY\nRECORD",color:"#22c55e"},
              {num:"★",  label:"SILVER\nTRANSPARENCY",color:"#888"},
              {num:"1%", label:"TOP\nTRENDING",color:"#f59e0b"},
              {num:"5%", label:"TOP\nSTORES",color:"#888"},
            ].map((b,i)=>(
              <div key={i} style={{ width:56,height:56,borderRadius:"50%",border:`2px solid ${b.color}44`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1 }}>
                <span style={{ color:b.color,fontWeight:900,fontSize:b.num==="★"?16:12,lineHeight:1 }}>{b.num}</span>
                <span style={{ color:"#333",fontSize:7,fontWeight:700,textAlign:"center",whiteSpace:"pre-line",lineHeight:1.2 }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ borderTop:"1px solid #0d0d0d",padding:"16px 40px",display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:12 }}>
        <p style={{ color:"#2a2a2a",fontSize:11,margin:0 }}>© 2025 KICKOFF Store. All rights reserved.</p>
        <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
          {["Visa","Mastercard","UPI","PhonePe","GPay","COD"].map(p=>(
            <span key={p} style={{ color:"#2a2a2a",fontSize:10,fontWeight:700,padding:"3px 8px",border:"1px solid #1a1a1a",borderRadius:4 }}>{p}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────── */
function App() {
  const [user, setUser]         = useState(localStorage.getItem("user"));
  const [checkout, setCheckout] = useState(false);
  const [isAdmin, setIsAdmin]   = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [search, setSearch]     = useState("");

  // ── ProfilePanel is now a separate component — we just control show/hide ──
  const [showProfile, setShowProfile] = useState(false);
  const [authMode, setAuthMode]       = useState(null);  // kept for API compat but ProfilePanel manages its own flow

  const [showSidebar, setShowSidebar] = useState(false);

  // Cart — persisted per user
  const [cart, setCart] = useState(() => loadCart(localStorage.getItem("user")));

  // Offers
  const [offers, setOffers]             = useState([]);
  const [appliedOffer, setAppliedOffer] = useState(null);

  // Cart animation
  const [flyItem,    setFlyItem]    = useState(null);
  const [flyOrigin,  setFlyOrigin]  = useState(null);
  const [cartBounce, setCartBounce] = useState(false);

  // Navigation
  const [view, setView]                       = useState("home");
  const [selectedLeague, setSelectedLeague]   = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Data
  const [leagues, setLeagues]                 = useState([]);
  const [products, setProducts]               = useState([]);
  const [leagueProducts, setLeagueProducts]   = useState([]);
  const [loadingLeagues, setLoadingLeagues]   = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Detect /admin URL
  useEffect(() => {
    if (window.location.pathname === "/admin" || window.location.pathname === "/admin/") {
      window.history.replaceState({}, "", "/");
      setShowAdminLogin(true);
    }
  }, []);

  // When user changes, reload their cart
  useEffect(() => { setCart(loadCart(user)); }, [user]);

  // Persist cart on every change
  useEffect(() => { saveCart(user, cart); }, [cart, user]);

  const addToCart = (item, event) => {
    setCart(prev => { const next = [...prev, item]; saveCart(user, next); return next; });
    if (event) {
      const rect = event.currentTarget.getBoundingClientRect();
      setFlyOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      setFlyItem(item);
    }
    setTimeout(() => { setCartBounce(true); setTimeout(() => setCartBounce(false), 600); }, 660);
  };

  const removeFromCart = i => {
    setCart(prev => { const next = prev.filter((_, idx) => idx !== i); saveCart(user, next); return next; });
  };

  const total      = cart.reduce((s, i) => s + i.price, 0);
  const discount   = appliedOffer ? appliedOffer.discount : 0;
  const finalTotal = total - discount;

  useEffect(() => {
    setLoadingLeagues(true);
    fetch(`${API}/leagues`).then(r=>r.json()).then(d=>{setLeagues(d);setLoadingLeagues(false);}).catch(()=>setLoadingLeagues(false));
    fetch(`${API}/offers`).then(r=>r.json()).then(setOffers).catch(()=>{});
  }, []);

  useEffect(() => {
    fetch(`${API}/products`).then(r=>r.json()).then(setProducts).catch(()=>{});
  }, []);

  useEffect(() => {
    if (!selectedLeague) return;
    setLoadingProducts(true);
    fetch(`${API}/products?league=${encodeURIComponent(selectedLeague.name)}`).then(r=>r.json()).then(d=>{setLeagueProducts(d);setLoadingProducts(false);}).catch(()=>setLoadingProducts(false));
  }, [selectedLeague]);

  useEffect(() => {
    if (checkout && !user) { setCheckout(false); setShowProfile(true); }
  }, [checkout, user]);

  const goHome    = () => { setView("home"); setSelectedLeague(null); setSelectedProduct(null); setSearch(""); };
  const goLeague  = l  => { setSelectedLeague(l); setView("league"); setSelectedProduct(null); };
  const goProduct = p  => { setSelectedProduct(p); setView("product"); };

  const navProps = { search, setSearch, cart, setShowCart, setShowProfile, setShowSidebar, onLogoClick: goHome, user, cartBounce };

  const searchResults = search.trim().length > 1
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.league || "").toLowerCase().includes(search.toLowerCase()))
    : [];

  // ── Admin guards ──
  if (showAdminLogin && !isAdmin) return <AdminLogin onSuccess={() => { setIsAdmin(true); setShowAdminLogin(false); }} />;
  if (isAdmin) return <Admin goBack={() => setIsAdmin(false)} refresh={() => fetch(`${API}/products`).then(r=>r.json()).then(setProducts)} />;

  // ── Checkout ──
  if (checkout && user) {
    return (
      <Checkout
        cart={cart} total={total} finalTotal={finalTotal}
        user={user} setCheckout={setCheckout}
        onOrderSuccess={() => { setCart([]); saveCart(user, []); setAppliedOffer(null); }}
        Navbar={<Navbar {...navProps} />}
        appliedOffer={appliedOffer} setAppliedOffer={setAppliedOffer} offers={offers}
      />
    );
  }

  // ── Product detail ──
  if (view === "product" && selectedProduct) {
    return (
      <>
        <ProductDetail
          product={selectedProduct} user={user} setUser={setUser}
          cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} total={total}
          setCheckout={setCheckout}
          onBack={() => setView(selectedLeague ? "league" : "home")}
          setSelectedProduct={p => { if (p) goProduct(p); else setView(selectedLeague ? "league" : "home"); }}
          showCart={showCart} setShowCart={setShowCart}
          showProfile={showProfile} setShowProfile={setShowProfile}
          authMode={authMode} setAuthMode={setAuthMode}
          allProducts={leagueProducts.length > 0 ? leagueProducts : products}
          Navbar={<Navbar {...navProps} />}
        />
        {/* ProfilePanel rendered at App level so it persists across views */}
        {showProfile && (
          <ProfilePanel
            user={user} setUser={setUser}
            setShowProfile={setShowProfile}
            authMode={authMode} setAuthMode={setAuthMode}
          />
        )}
      </>
    );
  }

  // ── League page ──
  if (view === "league" && selectedLeague) {
    const filtered = leagueProducts.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));
    return (
      <div style={{ background: "#0a0a0a", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
          .pc:hover{border-color:#c8ff00!important;transform:translateY(-3px);}
          .pc{transition:border-color 0.25s,transform 0.25s;}
          .pc-img{transition:transform 0.4s;}
          .pc:hover .pc-img{transform:scale(1.07);}
          .addbtn{transition:background 0.2s,color 0.2s,border-color 0.2s;}
          .addbtn:hover{background:#c8ff00!important;color:#0a0a0a!important;border-color:#c8ff00!important;}
          @keyframes spin{to{transform:rotate(360deg)}}`}
        </style>
        <Navbar {...navProps} />
        {showSidebar && <Sidebar setShowSidebar={setShowSidebar} setShowAdminLogin={setShowAdminLogin} goHome={goHome} leagues={leagues} goLeague={goLeague} selectedLeague={selectedLeague} />}

        <div style={{ background: "#111", borderBottom: "1px solid #1e1e1e", padding: "28px 28px 24px" }}>
          <button onClick={goHome} style={{ background: "none", border: "none", color: "#c8ff00", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>← All Leagues</button>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: 14, background: "#1a1a1a", border: "1px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
              {selectedLeague.logo ? <img src={selectedLeague.logo} alt={selectedLeague.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <span style={{ fontSize: 28 }}>{sportEmoji[selectedLeague.sport] || sportEmoji.default}</span>}
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#c8ff00", marginBottom: 4 }}>{selectedLeague.sport} · {selectedLeague.country}</p>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.2rem", color: "#fff", letterSpacing: "0.06em", lineHeight: 1, margin: 0 }}>{selectedLeague.name}</h1>
            </div>
            <span style={{ marginLeft: "auto", fontSize: 12, color: "#444" }}>{filtered.length} jersey{filtered.length !== 1 ? "s" : ""}</span>
          </div>
        </div>

        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 28px" }}>
          {loadingProducts ? (
            <div style={{ textAlign: "center", padding: 80 }}>
              <div style={{ width: 40, height: 40, border: "2px solid #1e1e1e", borderTop: "2px solid #c8ff00", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
              <p style={{ color: "#444", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>Loading jerseys</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 80 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>👕</div>
              <p style={{ color: "#444", fontSize: 14 }}>No jerseys found for this league yet.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
              {filtered.map((item, i) => <ProductCard key={i} item={item} onClick={() => goProduct(item)} onAddToCart={e => { e.stopPropagation(); addToCart(item, e); }} />)}
            </div>
          )}
        </div>

        <Footer leagues={leagues} goLeague={goLeague} />

        {flyItem && <CartFlyAnimation item={flyItem} origin={flyOrigin} onDone={() => { setFlyItem(null); setFlyOrigin(null); }} />}
        {showCart && <CartPanel cart={cart} removeFromCart={removeFromCart} total={total} setShowCart={setShowCart} setShowProfile={setShowProfile} setCheckout={setCheckout} user={user} appliedOffer={appliedOffer} setAppliedOffer={setAppliedOffer} offers={offers} />}

        {/* ── ProfilePanel rendered here too ── */}
        {showProfile && (
          <ProfilePanel
            user={user} setUser={setUser}
            setShowProfile={setShowProfile}
            authMode={authMode} setAuthMode={setAuthMode}
          />
        )}
      </div>
    );
  }

  // ── Home ──
  const displayProducts = search.trim().length > 1 ? searchResults : [];
  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        .lc{transition:border-color 0.25s,transform 0.25s,background 0.25s;}
        .lc:hover{border-color:#c8ff00!important;transform:translateY(-4px);background:#141414!important;}
        .pc{transition:border-color 0.25s,transform 0.25s;}
        .pc:hover{border-color:#c8ff00!important;transform:translateY(-3px);}
        .pc-img{transition:transform 0.4s;}
        .pc:hover .pc-img{transform:scale(1.07);}
        .addbtn{transition:background 0.2s,color 0.2s,border-color 0.2s;}
        .addbtn:hover{background:#c8ff00!important;color:#0a0a0a!important;border-color:#c8ff00!important;}
      `}</style>

      {showSidebar && <Sidebar setShowSidebar={setShowSidebar} setShowAdminLogin={setShowAdminLogin} goHome={goHome} leagues={leagues} goLeague={goLeague} selectedLeague={null} />}
      <Navbar {...navProps} />

      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "44px 28px" }}>
        {search.trim().length > 1 ? (
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#c8ff00", marginBottom: 6 }}>Search Results</p>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: "#fff", letterSpacing: "0.05em", marginBottom: 28 }}>"{search}"</h2>
            {displayProducts.length === 0 ? <p style={{ color: "#444", fontSize: 14 }}>No products found.</p> : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
                {displayProducts.map((item, i) => <ProductCard key={i} item={item} onClick={() => goProduct(item)} onAddToCart={e => { e.stopPropagation(); addToCart(item, e); }} />)}
              </div>
            )}
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 52 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c8ff00", marginBottom: 10 }}>Official Jerseys</p>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2.8rem, 6vw, 5rem)", color: "#fff", letterSpacing: "0.05em", lineHeight: 0.95, marginBottom: 14 }}>
                WEAR YOUR<br /><span style={{ color: "#c8ff00" }}>TEAM'S</span> PRIDE
              </h1>
              <p style={{ color: "#555", fontSize: 14, maxWidth: 480 }}>Authentic jerseys from the world's biggest leagues. Select a league to explore the collection.</p>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#444", marginBottom: 4 }}>Browse by</p>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", color: "#fff", letterSpacing: "0.05em" }}>Leagues</h2>
              </div>
              <span style={{ fontSize: 12, color: "#333" }}>{leagues.length} leagues</span>
            </div>

            {loadingLeagues ? (
              <div style={{ textAlign: "center", padding: 60 }}>
                <div style={{ width: 36, height: 36, border: "2px solid #1e1e1e", borderTop: "2px solid #c8ff00", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
                <p style={{ color: "#333", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>Loading leagues</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 56 }}>
                {leagues.map((league, i) => (
                  <button key={i} className="lc" onClick={() => goLeague(league)}
                    style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, padding: "24px 16px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
                    <div style={{ width: 64, height: 64, borderRadius: 14, background: "#1a1a1a", border: "1px solid #252525", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      {league.logo ? <img src={league.logo} alt={league.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <span style={{ fontSize: 28 }}>{sportEmoji[league.sport] || sportEmoji.default}</span>}
                    </div>
                    <div>
                      <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 4, lineHeight: 1.3 }}>{league.name}</p>
                      <p style={{ color: "#444", fontSize: 11, fontWeight: 600 }}>{league.sport}</p>
                    </div>
                    <div style={{ marginTop: "auto", padding: "5px 14px", background: "rgba(200,255,0,0.06)", border: "1px solid rgba(200,255,0,0.15)", borderRadius: 20 }}>
                      <span style={{ color: "#c8ff00", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>View Jerseys →</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer leagues={leagues} goLeague={goLeague} />

      {flyItem && <CartFlyAnimation item={flyItem} origin={flyOrigin} onDone={() => { setFlyItem(null); setFlyOrigin(null); }} />}
      {showCart && <CartPanel cart={cart} removeFromCart={removeFromCart} total={total} setShowCart={setShowCart} setShowProfile={setShowProfile} setCheckout={setCheckout} user={user} appliedOffer={appliedOffer} setAppliedOffer={setAppliedOffer} offers={offers} />}

      {/* ── ProfilePanel — replaces the old inline ProfilePanel function ── */}
      {showProfile && (
        <ProfilePanel
          user={user} setUser={setUser}
          setShowProfile={setShowProfile}
          authMode={authMode} setAuthMode={setAuthMode}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────────── */
function Sidebar({ setShowSidebar, setShowAdminLogin, goHome, leagues, goLeague, selectedLeague }) {
  return (
    <div className="fixed inset-0 z-50 flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)" }} onClick={() => setShowSidebar(false)} />
      <div className="relative flex flex-col h-full z-50" style={{ width: 280, background: "#0c0c0c", borderRight: "1px solid #1e1e1e", padding: "28px 20px", overflow: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "0.1em" }}>
            <span style={{ color: "#fff" }}>KICK</span><span style={{ color: "#c8ff00" }}>OFF</span>
          </h2>
          <button onClick={() => setShowSidebar(false)} style={{ width: 32, height: 32, borderRadius: 8, background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#888", cursor: "pointer" }}>✕</button>
        </div>
        <button onClick={() => { goHome(); setShowSidebar(false); }}
          style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 12px", background: "none", border: "none", color: "#888", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", borderRadius: 8, marginBottom: 16 }}
          onMouseEnter={e => { e.currentTarget.style.background="#161616"; e.currentTarget.style.color="#c8ff00"; }}
          onMouseLeave={e => { e.currentTarget.style.background="none"; e.currentTarget.style.color="#888"; }}>
          ← All Leagues
        </button>
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#333", marginBottom: 10, paddingLeft: 12 }}>Leagues</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {leagues.map((league, i) => (
            <button key={i} onClick={() => { goLeague(league); setShowSidebar(false); }}
              style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", padding: "10px 12px", background: selectedLeague?._id === league._id ? "#1a2200" : "none", border: "none", borderRadius: 9, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "background 0.2s" }}
              onMouseEnter={e => { if (selectedLeague?._id !== league._id) e.currentTarget.style.background="#161616"; }}
              onMouseLeave={e => { if (selectedLeague?._id !== league._id) e.currentTarget.style.background="none"; }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#1a1a1a", border: "1px solid #252525", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                {league.logo ? <img src={league.logo} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <span style={{ fontSize: 14 }}>{sportEmoji[league.sport] || sportEmoji.default}</span>}
              </div>
              <div>
                <p style={{ color: selectedLeague?._id === league._id ? "#c8ff00" : "#ccc", fontWeight: 600, fontSize: 13, margin: 0 }}>{league.name}</p>
                <p style={{ color: "#444", fontSize: 10, margin: 0 }}>{league.sport}</p>
              </div>
            </button>
          ))}
        </div>
        <div style={{ marginTop: "auto", paddingTop: 20, borderTop: "1px solid #1e1e1e" }}>
          <button onClick={() => { setShowAdminLogin(true); setShowSidebar(false); }}
            style={{ width: "100%", padding: "10px 12px", background: "none", border: "1px solid #2a2a2a", borderRadius: 9, color: "#555", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            Admin Panel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PRODUCT CARD
───────────────────────────────────────────── */
function ProductCard({ item, onClick, onAddToCart }) {
  return (
    <div className="pc" onClick={onClick} style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 18, overflow: "hidden", cursor: "pointer" }}>
      <div style={{ position: "relative", height: 240, overflow: "hidden", background: "#161616" }}>
        <img src={item.image} alt={item.name} className="pc-img" style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => { e.target.src = "https://via.placeholder.com/300x300?text=Jersey"; }} />
        {item.league && (
          <span style={{ position: "absolute", top: 12, left: 12, background: "rgba(10,10,10,0.85)", backdropFilter: "blur(4px)", color: "#c8ff00", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(200,255,0,0.2)" }}>
            {item.league}
          </span>
        )}
      </div>
      <div style={{ padding: "16px 18px" }}>
        <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 6, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.name}</h3>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", color: "#c8ff00", letterSpacing: "0.04em" }}>₹{item.price}</span>
          {item.category && <span style={{ fontSize: 9, fontWeight: 700, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase" }}>{item.category}</span>}
        </div>
        <button className="addbtn" onClick={onAddToCart}
          style={{ width: "100%", padding: "10px", background: "#161616", border: "1px solid #2a2a2a", borderRadius: 9, color: "#fff", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
          + Add to Cart
        </button>
      </div>
    </div>
  );
}

export default App;
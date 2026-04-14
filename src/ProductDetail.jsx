import { useState, useEffect } from "react";
const API = "https://kickoff-11.up.railway.app";

export default function ProductDetail({
  product, user, setUser,
  cart, addToCart, removeFromCart, total,
  setCheckout, setSelectedProduct, onBack,
  showCart, setShowCart,
  showProfile, setShowProfile,
  authMode, setAuthMode,
  allProducts = [],
  Navbar,
}) {
  if (!product) return null;

  const [selectedSize,   setSelectedSize]   = useState("M");
  const [offersOpen,     setOffersOpen]     = useState(true);
  const [highlightsOpen, setHighlightsOpen] = useState(true);
  const [reviewsOpen,    setReviewsOpen]    = useState(true);
  const [offers,         setOffers]         = useState([]);
  const [pinInput,       setPinInput]       = useState("");
  const [pinLoading,     setPinLoading]     = useState(false);
  const [pinError,       setPinError]       = useState("");
  const [delivery,       setDelivery]       = useState(null);
  const [reviews,        setReviews]        = useState([]);
  const [avg,            setAvg]            = useState(0);
  const [starCounts,     setStarCounts]     = useState([]);
  const [reviewTotal,    setReviewTotal]    = useState(0);
  const [reviewLoading,  setReviewLoading]  = useState(true);
  const [newRating,      setNewRating]      = useState(0);
  const [hoverStar,      setHoverStar]      = useState(0);
  const [newTitle,       setNewTitle]       = useState("");
  const [newComment,     setNewComment]     = useState("");
  const [submitting,     setSubmitting]     = useState(false);
  const [submitMsg,      setSubmitMsg]      = useState("");

  const productId   = product._id || product.id;
  const discountPct = 61;
  const mrp         = Math.round(product.price / (1 - discountPct / 100));

  const highlights = [
    { label: "Color",    value: product.highlights?.color    || "" },
    { label: "Pattern",  value: product.highlights?.pattern  || "" },
    { label: "Fabric",   value: product.highlights?.fabric   || "" },
    { label: "Fit",      value: product.highlights?.fit      || "" },
    { label: "Sport",    value: product.category             || "" },
    { label: "Occasion", value: product.highlights?.occasion || "" },
    { label: "Material", value: product.highlights?.material || "" },
  ].filter(h => h.value);

  // Suggestions: same league or same category, exclude current
  const suggestions = allProducts
    .filter(p => (p._id || p.id) !== productId)
    .filter(p => p.league === product.league || p.category === product.category)
    .slice(0, 6);

  useEffect(() => {
    fetch(`${API}/offers`).then(r => r.json()).then(setOffers).catch(() => setOffers([]));
  }, []);

  const fetchReviews = () => {
    setReviewLoading(true);
    fetch(`${API}/reviews/${productId}`)
      .then(r => r.json())
      .then(data => { setReviews(data.reviews || []); setAvg(data.avg || 0); setStarCounts(data.starCounts || []); setReviewTotal(data.total || 0); setReviewLoading(false); })
      .catch(() => setReviewLoading(false));
  };
  useEffect(() => { fetchReviews(); setSelectedSize("M"); setPinInput(""); setDelivery(null); setPinError(""); }, [productId]);

  const checkPin = async () => {
    if (pinInput.length !== 6) { setPinError("Enter a valid 6-digit PIN code"); return; }
    setPinLoading(true); setPinError(""); setDelivery(null);
    try {
      const res = await fetch(`${API}/delivery/${pinInput}`);
      const data = await res.json();
      if (res.ok) setDelivery(data); else setPinError(data.error || "PIN not serviceable");
    } catch { setPinError("Server error"); }
    setPinLoading(false);
  };

  const submitReview = async () => {
    if (!user) { setShowProfile(true); return; }
    if (!newRating) { setSubmitMsg("⚠️ Please select a star rating"); return; }
    if (!newComment.trim()) { setSubmitMsg("⚠️ Please write a comment"); return; }
    setSubmitting(true); setSubmitMsg("");
    try {
      const res = await fetch(`${API}/reviews/${productId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user, rating: newRating, title: newTitle, comment: newComment }) });
      const data = await res.json();
      if (res.ok) { setNewRating(0); setNewTitle(""); setNewComment(""); setSubmitMsg("✅ Review submitted! Thank you."); fetchReviews(); }
      else setSubmitMsg("❌ " + (data.error || "Could not submit"));
    } catch { setSubmitMsg("❌ Server error"); }
    setSubmitting(false);
  };

  const voteReview = async (reviewId, type) => {
    try { await fetch(`${API}/reviews/${productId}/${reviewId}/vote`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type }) }); fetchReviews(); } catch {}
  };

  const ratingBg = avg >= 4 ? "#16a34a" : avg >= 3 ? "#22c55e" : avg >= 2 ? "#f97316" : "#ef4444";
  const starColor = n => n >= 4 ? "#22c55e" : n === 3 ? "#facc15" : "#ef4444";
  const timeAgo = dateStr => {
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    if (days < 1) return "Today";
    if (days < 30) return `${days}d ago`;
    const m = Math.floor(days / 30);
    return m < 12 ? `${m}mo ago` : `${Math.floor(m / 12)}yr ago`;
  };

  const sectionStyle = { background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, padding: "20px 22px", marginBottom: 14 };
  const labelSm = { fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#444", marginBottom: 6, display: "block" };
  const inp = { width: "100%", padding: "10px 14px", background: "#0c0c0c", border: "1px solid #252525", borderRadius: 9, color: "#fff", fontSize: 13, outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box", transition: "border-color 0.2s" };

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", paddingBottom: 100 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        .pd-inp:focus{border-color:#c8ff00!important;}
        .pd-inp::placeholder{color:#333;}
        .sz-btn:hover{border-color:#c8ff00!important;color:#c8ff00!important;}
        .offer-card:hover{border-color:#c8ff00!important;}
        .rev-vote:hover{color:#c8ff00!important;}
        .sug-card{transition:border-color 0.2s,transform 0.2s;}
        .sug-card:hover{border-color:#c8ff00!important;transform:translateY(-2px);}
        .sug-img{transition:transform 0.3s;}
        .sug-card:hover .sug-img{transform:scale(1.05);}
      `}</style>

      {Navbar}

      {/* Breadcrumb */}
      <div style={{ background: "#0d0d0d", borderBottom: "1px solid #181818", padding: "10px 24px", display: "flex", alignItems: "center", gap: 8, fontSize: 12, flexWrap: "wrap" }}>
        <button onClick={onBack || (() => setSelectedProduct(null))} style={{ background: "none", border: "none", color: "#c8ff00", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>← Back</button>
        <span style={{ color: "#333" }}>/</span>
        {product.league && <span style={{ color: "#444" }}>{product.league}</span>}
        {product.league && <span style={{ color: "#333" }}>/</span>}
        <span style={{ color: "#666", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.name}</span>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }} className="pd-grid">
        <style>{`.pd-grid{grid-template-columns:1fr 1fr} @media(max-width:768px){.pd-grid{grid-template-columns:1fr!important;}}`}</style>

        {/* ── LEFT: IMAGES ── */}
        <div style={{ position: "sticky", top: 20 }}>
          <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 20, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, padding: 10, background: "#0d0d0d" }}>
              {/* Front */}
              <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #1e1e1e", aspectRatio: "1/1", position: "relative" }}>
                <img src={product.image} alt={product.name + " front"} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={e => { e.target.src = "https://via.placeholder.com/400x400?text=Front"; }} />
                <span style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(0,0,0,0.7)", color: "#c8ff00", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 5 }}>Front</span>
              </div>
              {/* Back */}
              <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #1e1e1e", aspectRatio: "1/1", position: "relative" }}>
                <img
                  src={product.backImage || product.image}
                  alt={product.name + " back"}
                  style={{ width: "100%", height: "100%", objectFit: "cover", transform: product.backImage ? "none" : "scaleX(-1)" }}
                  onError={e => { e.target.src = "https://via.placeholder.com/400x400?text=Back"; }}
                />
                <span style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(0,0,0,0.7)", color: "#c8ff00", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 5 }}>
                  {product.backImage ? "Back" : "Back (mirror)"}
                </span>
                <div style={{ position: "absolute", top: 8, right: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                  <button style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(20,20,20,0.9)", border: "1px solid #2a2a2a", color: "#888", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>♡</button>
                  <button style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(20,20,20,0.9)", border: "1px solid #2a2a2a", color: "#888", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>↗</button>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, padding: "12px 14px", borderTop: "1px solid #1e1e1e" }}>
              <button onClick={() => addToCart({ ...product, size: selectedSize })}
                style={{ flex: 1, padding: "12px", background: "transparent", border: "2px solid #fff", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor="#c8ff00"} onMouseLeave={e => e.currentTarget.style.borderColor="#fff"}>
                Add to Cart
              </button>
              <button onClick={() => { addToCart({ ...product, size: selectedSize }); setCheckout(true); }}
                style={{ flex: 1, padding: "12px", background: "#c8ff00", border: "none", borderRadius: 10, color: "#0a0a0a", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                Buy at ₹{product.price}
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT: DETAILS ── */}
        <div>

          {/* Title + Price + Size */}
          <div style={sectionStyle}>
            {product.league && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#c8ff00", display: "block", marginBottom: 8 }}>{product.league}</span>}
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", color: "#fff", letterSpacing: "0.05em", lineHeight: 1.1, marginBottom: 12 }}>{product.name}</h1>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              {reviewTotal > 0 ? (
                <>
                  <span style={{ background: ratingBg, color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 5 }}>{avg} ★</span>
                  <span style={{ color: "#444", fontSize: 12 }}>{reviewTotal} rating{reviewTotal !== 1 ? "s" : ""}</span>
                </>
              ) : (
                <span style={{ color: "#333", fontSize: 12, fontStyle: "italic" }}>No ratings yet — be the first!</span>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
              <span style={{ color: "#22c55e", fontWeight: 700, fontSize: 14 }}>↓{discountPct}%</span>
              <span style={{ color: "#333", textDecoration: "line-through", fontSize: 14 }}>₹{mrp}</span>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.2rem", color: "#c8ff00", letterSpacing: "0.04em" }}>₹{product.price}</span>
            </div>
            <p style={{ color: "#333", fontSize: 11, marginBottom: 18 }}>Inclusive of all taxes</p>

            {/* Size */}
            <div>
              <label style={labelSm}>Select Size</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["XXS","XS","S","M","L","XL","XXL"].map(s => (
                  <button key={s} className="sz-btn" onClick={() => setSelectedSize(s)}
                    style={{ width: 44, height: 40, borderRadius: 20, border: `2px solid ${selectedSize === s ? "#c8ff00" : "#252525"}`, background: selectedSize === s ? "rgba(200,255,0,0.08)" : "transparent", color: selectedSize === s ? "#c8ff00" : "#666", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s" }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bank Offers */}
          <div style={{ ...sectionStyle, padding: 0, overflow: "hidden" }}>
            <button onClick={() => setOffersOpen(o => !o)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: "#1565c0", border: "none", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ background: "#facc15", color: "#1565c0", fontSize: 9, fontWeight: 900, padding: "3px 6px", borderRadius: 4, lineHeight: 1.2 }}><div>WOW!</div><div>DEAL</div></div>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Apply offers for maximum savings</span>
              </div>
              <span style={{ color: "#fff", fontSize: 16 }}>{offersOpen ? "∧" : "∨"}</span>
            </button>
            {offersOpen && (
              <>
                {offers.length > 0 && <div style={{ padding: "12px 20px", background: "#0d1a30", borderBottom: "1px solid #1e1e1e" }}><p style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Buy at ₹{product.price - Math.max(...offers.map(o => o.discount))}</p></div>}
                <div style={{ padding: 16 }}>
                  <p style={{ color: "#444", fontSize: 11, marginBottom: 12 }}>Bank offers</p>
                  {offers.length === 0 ? <p style={{ color: "#333", fontSize: 12 }}>No offers available.</p> : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {offers.map((offer, i) => (
                        <div key={i} className="offer-card" style={{ border: "1px solid #1e1e1e", borderRadius: 10, padding: 12, cursor: "pointer", transition: "border-color 0.2s" }}>
                          {offer.tag && <span style={{ fontSize: 9, background: "rgba(250,204,21,0.12)", color: "#facc15", fontWeight: 700, padding: "3px 8px", borderRadius: 4, display: "inline-block", marginBottom: 8, letterSpacing: "0.06em" }}>{offer.tag}</span>}
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: 18 }}>{offer.icon}</span>
                              <div>
                                <p style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{offer.label}</p>
                                <p style={{ color: "#444", fontSize: 10 }}>{offer.sub}</p>
                              </div>
                            </div>
                            <button style={{ background: "none", border: "none", color: "#60a5fa", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Apply</button>
                          </div>
                          <p style={{ color: "#333", fontSize: 10, marginTop: 6 }}>{offer.type} ›</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Delivery */}
          <div style={sectionStyle}>
            <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Delivery details</h3>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input type="text" maxLength={6} placeholder="Enter 6-digit PIN code" value={pinInput} className="pd-inp"
                onChange={e => { setPinInput(e.target.value.replace(/\D/g, "")); setPinError(""); setDelivery(null); }}
                onKeyDown={e => e.key === "Enter" && checkPin()}
                style={{ ...inp, flex: 1 }} />
              <button onClick={checkPin} disabled={pinLoading}
                style={{ padding: "10px 18px", background: "#1565c0", border: "none", borderRadius: 9, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", opacity: pinLoading ? 0.6 : 1 }}>
                {pinLoading ? "..." : "Check"}
              </button>
            </div>
            {pinError && <p style={{ color: "#ef4444", fontSize: 11, marginBottom: 10 }}>{pinError}</p>}
            {delivery && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, padding: "10px 14px" }}>
                  <span>📍</span>
                  <span style={{ color: "#22c55e", fontWeight: 700, fontSize: 13 }}>{delivery.city}, {delivery.state} — {delivery.pincode}</span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ fontSize: 18, marginTop: 2 }}>🚚</span>
                  <div>
                    <p style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>{delivery.freeDelivery ? "FREE Delivery" : "Paid Delivery"} by <span style={{ color: "#22c55e" }}>{delivery.deliveryDate}</span></p>
                    {delivery.cod && <p style={{ color: "#555", fontSize: 11, marginTop: 2 }}>Cash on Delivery available</p>}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ fontSize: 18, marginTop: 2 }}>🏪</span>
                  <div>
                    <p style={{ color: "#ccc", fontSize: 13 }}>Fulfilled by <strong style={{ color: "#fff" }}>{delivery.seller}</strong></p>
                    <p style={{ color: "#444", fontSize: 11 }}>{delivery.sellerRating} ★ · 1 year with KickOff</p>
                  </div>
                </div>
              </div>
            )}
            {!delivery && !pinError && <p style={{ color: "#333", fontSize: 11, marginTop: 6 }}>Enter PIN code to check delivery date & availability</p>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, borderTop: "1px solid #1e1e1e", marginTop: 16, paddingTop: 16, textAlign: "center" }}>
              {[{ icon: "🔄", label: "7-Day\nReturn" }, { icon: "💵", label: "Cash on\nDelivery" }, { icon: "🕐", label: "24×7\nSupport" }].map((item, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <p style={{ color: "#555", fontSize: 10, fontWeight: 600, whiteSpace: "pre-line", textAlign: "center" }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Product Highlights */}
          <div style={sectionStyle}>
            <button onClick={() => setHighlightsOpen(h => !h)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: "'DM Sans', sans-serif" }}>Product highlights</h3>
              <span style={{ color: "#444", fontSize: 16 }}>{highlightsOpen ? "∧" : "∨"}</span>
            </button>
            {highlightsOpen && (
              highlights.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 32px", marginTop: 16 }}>
                  {highlights.map((item, i) => (
                    <div key={i}>
                      <p style={{ color: "#444", fontSize: 11, marginBottom: 3 }}>{item.label}</p>
                      <p style={{ color: "#ccc", fontWeight: 600, fontSize: 13 }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#333", fontSize: 12, marginTop: 12, fontStyle: "italic" }}>No highlights added by admin yet.</p>
              )
            )}
          </div>

          {/* Reviews */}
          <div style={sectionStyle}>
            <button onClick={() => setReviewsOpen(r => !r)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 16 }}>
              <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: "'DM Sans', sans-serif" }}>Ratings & Reviews</h3>
              <span style={{ color: "#444", fontSize: 16 }}>{reviewsOpen ? "∧" : "∨"}</span>
            </button>

            {reviewsOpen && (
              <>
                {reviewTotal > 0 && (
                  <div style={{ display: "flex", gap: 24, marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #1e1e1e" }}>
                    <div style={{ textAlign: "center", flexShrink: 0 }}>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "3rem", color: "#fff", letterSpacing: "0.04em", lineHeight: 1 }}>{avg}</div>
                      <div style={{ color: "#facc15", fontSize: 16, margin: "4px 0" }}>{"★".repeat(Math.round(avg))}{"☆".repeat(5 - Math.round(avg))}</div>
                      <div style={{ color: "#333", fontSize: 10 }}>{reviewTotal} ratings</div>
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                      {starCounts.map(sc => (
                        <div key={sc.star} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
                          <span style={{ color: "#444", width: 28, textAlign: "right" }}>{sc.star} ★</span>
                          <div style={{ flex: 1, height: 5, background: "#1a1a1a", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ height: "100%", background: starColor(sc.star), width: `${sc.pct}%`, borderRadius: 3 }} />
                          </div>
                          <span style={{ color: "#333", width: 16 }}>{sc.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {reviewLoading ? (
                  <p style={{ color: "#333", fontSize: 12, textAlign: "center", padding: "20px 0" }}>Loading reviews...</p>
                ) : reviews.length === 0 ? (
                  <p style={{ color: "#333", fontSize: 12, textAlign: "center", padding: "16px 0", fontStyle: "italic" }}>No reviews yet. Be the first!</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                    {reviews.map(r => (
                      <div key={r._id} style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 12, padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <span style={{ background: starColor(r.rating), color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 7px", borderRadius: 4 }}>{r.rating} ★</span>
                          {r.title && <span style={{ color: "#ccc", fontWeight: 600, fontSize: 13 }}>{r.title}</span>}
                          <span style={{ color: "#333", fontSize: 10, marginLeft: "auto" }}>{timeAgo(r.date)}</span>
                        </div>
                        <p style={{ color: "#888", fontSize: 13, lineHeight: 1.5, marginBottom: 10 }}>{r.comment}</p>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div>
                            <p style={{ color: "#555", fontSize: 11, fontWeight: 600 }}>{r.user}</p>
                            <p style={{ color: "#333", fontSize: 10 }}>✅ Verified Buyer</p>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <button className="rev-vote" onClick={() => voteReview(r._id, "helpful")} style={{ background: "none", border: "none", color: "#444", fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "color 0.2s" }}>👍 {r.helpful}</button>
                            <button className="rev-vote" onClick={() => voteReview(r._id, "notHelpful")} style={{ background: "none", border: "none", color: "#444", fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "color 0.2s" }}>👎 {r.notHelpful}</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Write review */}
                <div style={{ borderTop: "1px solid #1e1e1e", paddingTop: 18 }}>
                  <h4 style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Write a Review</h4>
                  {!user && (
                    <div style={{ background: "rgba(21,101,192,0.1)", border: "1px solid rgba(21,101,192,0.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 14, fontSize: 13, color: "#60a5fa" }}>
                      <button onClick={() => setShowProfile(true)} style={{ background: "none", border: "none", color: "#c8ff00", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Sign in</button> to write a review
                    </div>
                  )}
                  <div style={{ marginBottom: 12 }}>
                    <label style={labelSm}>Your rating</label>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[1,2,3,4,5].map(n => (
                        <button key={n} onClick={() => setNewRating(n)} onMouseEnter={() => setHoverStar(n)} onMouseLeave={() => setHoverStar(0)}
                          style={{ fontSize: 28, background: "none", border: "none", color: n <= (hoverStar || newRating) ? "#facc15" : "#252525", cursor: "pointer", transition: "color 0.15s" }}>★</button>
                      ))}
                    </div>
                  </div>
                  <input type="text" placeholder="Review title (optional)" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="pd-inp" style={{ ...inp, marginBottom: 10 }} />
                  <textarea placeholder="Share your experience..." value={newComment} onChange={e => setNewComment(e.target.value)} rows={3} className="pd-inp"
                    style={{ ...inp, resize: "none", marginBottom: 10 }} />
                  {submitMsg && <p style={{ fontSize: 12, marginBottom: 10, color: submitMsg.startsWith("✅") ? "#22c55e" : "#ef4444" }}>{submitMsg}</p>}
                  <button onClick={submitReview} disabled={submitting}
                    style={{ padding: "11px 24px", background: submitting ? "#1a1a1a" : "#1565c0", border: "none", borderRadius: 9, color: "#fff", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", opacity: submitting ? 0.6 : 1 }}>
                    {submitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* ── SUGGESTIONS ── */}
      {suggestions.length > 0 && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px 32px" }}>
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#c8ff00", marginBottom: 6 }}>You might also like</p>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", color: "#fff", letterSpacing: "0.05em" }}>Similar Jerseys</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
            {suggestions.map((item, i) => (
              <div key={i} className="sug-card" onClick={() => setSelectedProduct(item)} style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 14, overflow: "hidden", cursor: "pointer" }}>
                <div style={{ height: 160, overflow: "hidden", background: "#161616" }}>
                  <img src={item.image} alt={item.name} className="sug-img" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={e => { e.target.src = "https://via.placeholder.com/300x300?text=Jersey"; }} />
                </div>
                <div style={{ padding: "12px 14px" }}>
                  <p style={{ color: "#ccc", fontWeight: 600, fontSize: 12, marginBottom: 4, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.name}</p>
                  <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", color: "#c8ff00", letterSpacing: "0.04em" }}>₹{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile bottom bar */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#0c0c0c", borderTop: "1px solid #1e1e1e", display: "flex", gap: 10, padding: "12px 16px", zIndex: 40 }} className="lg-hidden">
        <style>{`.lg-hidden{display:flex} @media(min-width:1024px){.lg-hidden{display:none!important;}}`}</style>
        <button onClick={() => addToCart({ ...product, size: selectedSize })}
          style={{ flex: 1, padding: 12, background: "transparent", border: "2px solid #fff", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
          Add to Cart
        </button>
        <button onClick={() => { addToCart({ ...product, size: selectedSize }); setCheckout(true); }}
          style={{ flex: 1, padding: 12, background: "#c8ff00", border: "none", borderRadius: 10, color: "#0a0a0a", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
          Buy at ₹{product.price}
        </button>
      </div>

      {showCart && (
        <CartPanel cart={cart} removeFromCart={removeFromCart} total={total} setShowCart={setShowCart} setShowProfile={setShowProfile} setCheckout={setCheckout} user={user} />
      )}
      {showProfile && (
        <ProfilePanel user={user} setUser={setUser} setShowProfile={setShowProfile} authMode={authMode} setAuthMode={setAuthMode} />
      )}
    </div>
  );
}

// These need to be imported in ProductDetail from App — re-export pattern
// Since they're defined in App.jsx, pass them as props or define here locally
function CartPanel({ cart, removeFromCart, total, setShowCart, setShowProfile, setCheckout, user }) {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.8)" }} onClick={() => setShowCart(false)} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md flex flex-col" style={{ background: "#0c0c0c", borderLeft: "1px solid #1e1e1e" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", borderBottom: "1px solid #1e1e1e" }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", color: "#fff", letterSpacing: "0.05em" }}>Shopping Cart</h2>
          <button onClick={() => setShowCart(false)} style={{ width: 36, height: 36, borderRadius: "50%", background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#888", cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
          {cart.length === 0 ? <p style={{ color: "#333", textAlign: "center", paddingTop: 60, fontSize: 14 }}>Your cart is empty</p> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {cart.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#161616", border: "1px solid #222", borderRadius: 10 }}>
                  {item.image && <img src={item.image} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: "#fff", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</p>
                    {item.size && <p style={{ color: "#555", fontSize: 11 }}>Size: {item.size}</p>}
                    <p style={{ color: "#c8ff00", fontWeight: 700, fontSize: 13 }}>₹{item.price}</p>
                  </div>
                  <button onClick={() => removeFromCart(i)} style={{ width: 26, height: 26, borderRadius: 6, background: "#1a0808", border: "1px solid #3a1515", color: "#ff5555", cursor: "pointer", fontSize: 11, flexShrink: 0 }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ padding: "16px 28px", borderTop: "1px solid #1e1e1e" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ color: "#555", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Total</span>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", color: "#c8ff00" }}>₹{total}</span>
          </div>
          <button onClick={() => { setShowCart(false); if (!user) setShowProfile(true); else setCheckout(true); }} disabled={cart.length === 0}
            style={{ width: "100%", padding: 13, background: cart.length === 0 ? "#1a1a1a" : "#c8ff00", color: cart.length === 0 ? "#333" : "#0a0a0a", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", cursor: cart.length === 0 ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfilePanel({ user, setUser, setShowProfile, setAuthMode, authMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const inp = { width: "100%", padding: "11px 14px", borderRadius: 9, background: "#161616", border: "1px solid #2a2a2a", color: "#fff", fontSize: 13, outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" };
  const btn = (c) => ({ width: "100%", padding: 13, borderRadius: 10, background: c === "p" ? "#c8ff00" : "transparent", color: c === "p" ? "#0a0a0a" : "#fff", border: c === "p" ? "none" : "1px solid #2a2a2a", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" });
  const handleLogin = async () => {
    if (!email || !password) { alert("Enter email and password"); return; }
    try { const res = await fetch(`${API}/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) }); const data = await res.json(); if (res.ok) { setUser(email); localStorage.setItem("user", email); setShowProfile(false); setAuthMode(null); } else alert(data.error); } catch { alert("Server error"); }
  };
  const handleSignup = async () => {
    if (!email || !password) { alert("Enter email and password"); return; }
    try { const res = await fetch(`${API}/signup`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) }); const data = await res.json(); if (res.ok) { setUser(email); localStorage.setItem("user", email); setShowProfile(false); setAuthMode(null); } else alert(data.error); } catch { alert("Server error"); }
  };
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.8)" }} onClick={() => { setShowProfile(false); setAuthMode(null); }} />
      <div className="absolute left-0 top-0 bottom-0 flex flex-col z-10" style={{ width: "100%", maxWidth: 340, background: "#0c0c0c", borderRight: "1px solid #1e1e1e", padding: "28px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", color: "#fff", letterSpacing: "0.05em" }}>My Profile</h2>
          <button onClick={() => { setShowProfile(false); setAuthMode(null); }} style={{ width: 32, height: 32, borderRadius: "50%", background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#888", cursor: "pointer" }}>✕</button>
        </div>
        {!user && !authMode && (<div style={{ display: "flex", flexDirection: "column", gap: 10 }}><button onClick={() => setAuthMode("login")} style={btn("p")}>Sign In</button><button onClick={() => setAuthMode("signup")} style={btn("g")}>Create Account</button></div>)}
        {!user && authMode === "login" && (<div style={{ display: "flex", flexDirection: "column", gap: 14 }}><button onClick={() => setAuthMode(null)} style={{ background: "none", border: "none", color: "#c8ff00", fontSize: 11, fontWeight: 700, cursor: "pointer", textAlign: "left", letterSpacing: "0.08em", textTransform: "uppercase" }}>← Back</button><div><p style={{ fontSize: 10, color: "#555", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Email</p><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={inp} onFocus={e => e.target.style.borderColor="#c8ff00"} onBlur={e => e.target.style.borderColor="#2a2a2a"} /></div><div><p style={{ fontSize: 10, color: "#555", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Password</p><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inp} onFocus={e => e.target.style.borderColor="#c8ff00"} onBlur={e => e.target.style.borderColor="#2a2a2a"} onKeyDown={e => e.key==="Enter"&&handleLogin()} /></div><button onClick={handleLogin} style={btn("p")}>Login</button></div>)}
        {!user && authMode === "signup" && (<div style={{ display: "flex", flexDirection: "column", gap: 14 }}><button onClick={() => setAuthMode(null)} style={{ background: "none", border: "none", color: "#c8ff00", fontSize: 11, fontWeight: 700, cursor: "pointer", textAlign: "left", letterSpacing: "0.08em", textTransform: "uppercase" }}>← Back</button><div><p style={{ fontSize: 10, color: "#555", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Email</p><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={inp} onFocus={e => e.target.style.borderColor="#c8ff00"} onBlur={e => e.target.style.borderColor="#2a2a2a"} /></div><div><p style={{ fontSize: 10, color: "#555", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Password</p><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inp} onFocus={e => e.target.style.borderColor="#c8ff00"} onBlur={e => e.target.style.borderColor="#2a2a2a"} onKeyDown={e => e.key==="Enter"&&handleSignup()} /></div><button onClick={handleSignup} style={btn("p")}>Create Account</button></div>)}
        {user && (<div style={{ display: "flex", flexDirection: "column", gap: 12 }}><div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, background: "#161616", border: "1px solid #222", borderRadius: 12 }}><div style={{ width: 40, height: 40, borderRadius: "50%", background: "#c8ff00", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", color: "#0a0a0a", flexShrink: 0 }}>{user.split("@")[0].charAt(0).toUpperCase()}</div><div><p style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>{user.split("@")[0]}</p><p style={{ color: "#444", fontSize: 11 }}>{user}</p></div></div><button onClick={() => { setUser(null); localStorage.removeItem("user"); setShowProfile(false); }} style={{ width: "100%", padding: 12, background: "#1a0808", color: "#ff5555", border: "1px solid #2a1515", borderRadius: 10, fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Logout</button></div>)}
      </div>
    </div>
  );
}
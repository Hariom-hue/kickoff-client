import { useEffect, useState } from "react";

const API = "http://127.0.0.1:5000";
const sportEmoji = { Football: "⚽", Cricket: "🏏", Basketball: "🏀", Kabaddi: "🤼", Hockey: "🏑", Tennis: "🎾", default: "🏆" };

/* ══════════════════════════════════════════
   🔑 AUTH HELPERS — add these 3 functions
   ══════════════════════════════════════════ */
const getToken = () => sessionStorage.getItem("adminAuth");

const authFetch = (url, opts = {}) => fetch(url, {
  ...opts,
  headers: {
    "Content-Type": "application/json",
    ...(getToken() ? { "Authorization": `Bearer ${getToken()}` } : {}),
    ...(opts.headers || {}),
  },
});

const authFetchFile = (url, opts = {}) => fetch(url, {
  ...opts,
  headers: {
    ...(getToken() ? { "Authorization": `Bearer ${getToken()}` } : {}),
  },
});

// ═══════════════════════════════════════════════════════
// ProductForm — unchanged
// ═══════════════════════════════════════════════════════
function ProductForm({ name, setName, category, setCategory, price, setPrice, league, setLeague, leagues,
  imagePreview, onFrontImageChange, backImagePreview, onBackImageChange,
  hlColor, setHlColor, hlPattern, setHlPattern, hlFabric, setHlFabric,
  hlFit, setHlFit, hlOccasion, setHlOccasion, hlMaterial, setHlMaterial,
  onSubmit, submitLabel, uploading }) {

  const inp = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
          <input type="text" placeholder="e.g. India Cricket Jersey 2025" value={name} onChange={e => setName(e.target.value)} className={inp} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className={inp + " cursor-pointer"}>
              <option>Football</option><option>Cricket</option><option>Basketball</option>
              <option>Kabaddi</option><option>Retro Jersey</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">League</label>
            <select value={league} onChange={e => setLeague(e.target.value)} className={inp + " cursor-pointer"}>
              <option value="">-- No League --</option>
              {leagues.map(l => <option key={l._id} value={l.name}>{l.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹)</label>
          <input type="number" placeholder="e.g. 999" value={price} onChange={e => setPrice(e.target.value)} className={inp} />
        </div>
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
          <h3 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2">
            ✨ Product Highlights <span className="text-xs font-normal text-gray-400">(shown on product page)</span>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Color",    value: hlColor,    setter: setHlColor,    placeholder: "e.g. Black" },
              { label: "Pattern",  value: hlPattern,  setter: setHlPattern,  placeholder: "e.g. Printed" },
              { label: "Fabric",   value: hlFabric,   setter: setHlFabric,   placeholder: "e.g. Polyester" },
              { label: "Fit",      value: hlFit,      setter: setHlFit,      placeholder: "e.g. Regular Fit" },
              { label: "Occasion", value: hlOccasion, setter: setHlOccasion, placeholder: "e.g. Sports" },
              { label: "Material", value: hlMaterial, setter: setHlMaterial, placeholder: "e.g. Dri-FIT" },
            ].map(field => (
              <div key={field.label}>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{field.label}</label>
                <input type="text" placeholder={field.placeholder} value={field.value}
                  onChange={e => field.setter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
              </div>
            ))}
          </div>
        </div>
        <button onClick={onSubmit} disabled={uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition">
          {uploading ? "Uploading..." : submitLabel}
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Front Image <span className="text-red-500">*</span></label>
          <label className="flex items-center justify-center w-full px-4 py-5 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
            <div className="text-center"><div className="text-3xl mb-1">👕</div><p className="text-gray-600 font-medium text-sm">Click to upload front image</p><p className="text-gray-400 text-xs">PNG, JPG up to 10MB</p></div>
            <input type="file" onChange={onFrontImageChange} className="hidden" accept="image/*" disabled={uploading} />
          </label>
          {imagePreview && (
            <div className="mt-3 relative">
              <img src={imagePreview} alt="front" className="w-full h-40 object-cover rounded-xl border border-gray-200" />
              <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded">FRONT</span>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Back Image <span className="text-gray-400 font-normal text-xs">(optional)</span></label>
          <label className="flex items-center justify-center w-full px-4 py-5 border-2 border-dashed border-green-300 rounded-xl cursor-pointer hover:border-green-500 hover:bg-green-50 transition">
            <div className="text-center"><div className="text-3xl mb-1">🔄</div><p className="text-gray-600 font-medium text-sm">Click to upload back image</p><p className="text-gray-400 text-xs">PNG, JPG up to 10MB</p></div>
            <input type="file" onChange={onBackImageChange} className="hidden" accept="image/*" disabled={uploading} />
          </label>
          {backImagePreview ? (
            <div className="mt-3 relative">
              <img src={backImagePreview} alt="back" className="w-full h-40 object-cover rounded-xl border border-gray-200" />
              <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">BACK</span>
            </div>
          ) : (
            <div className="mt-3 w-full h-40 bg-gray-100 rounded-xl flex items-center justify-center border border-dashed border-gray-300">
              <p className="text-gray-400 text-xs text-center">No back image<br />Front will be mirrored</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ProductCard — unchanged
// ═══════════════════════════════════════════════════════
function ProductCard({ p, onEdit, onDelete }) {
  const catColors = { Football: "bg-blue-100 text-blue-700", Cricket: "bg-green-100 text-green-700", "Retro Jersey": "bg-purple-100 text-purple-700", Basketball: "bg-orange-100 text-orange-700", Kabaddi: "bg-red-100 text-red-700" };
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition duration-300 group">
      <div className="grid grid-cols-2 gap-1 bg-gray-100 h-40">
        <div className="relative overflow-hidden">
          <img src={p.image} alt={p.name + " front"} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" onError={e => { e.target.src = "https://via.placeholder.com/300?text=Front"; }} />
          <span className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1.5 py-0.5 rounded">Front</span>
        </div>
        <div className="relative overflow-hidden">
          <img src={p.backImage || p.image} style={!p.backImage ? { transform: "scaleX(-1)" } : {}} alt={p.name + " back"} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" onError={e => { e.target.src = "https://via.placeholder.com/300?text=Back"; }} />
          <span className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1.5 py-0.5 rounded">{p.backImage ? "Back" : "Mirror"}</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-1">{p.name}</h3>
        {p.league && <p className="text-xs text-blue-600 font-semibold mb-1">🏆 {p.league}</p>}
        {p.highlights && (p.highlights.color || p.highlights.fabric) && (
          <p className="text-gray-400 text-xs mb-2">{[p.highlights.color, p.highlights.fabric, p.highlights.fit].filter(Boolean).join(" · ")}</p>
        )}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-green-600">₹{p.price}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${catColors[p.category] || "bg-gray-100 text-gray-700"}`}>{p.category}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => onEdit(p)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg transition text-sm">Edit</button>
          <button onClick={() => onDelete(p._id)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg transition text-sm">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// LeagueForm — unchanged
// ═══════════════════════════════════════════════════════
function LeagueForm({ lName, setLName, lSport, setLSport, lCountry, setLCountry, lLogoPreview, onLogoChange, onSubmit, submitLabel, uploading, onCancel }) {
  const inp = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition text-sm";
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-purple-100">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">League Name <span className="text-red-500">*</span></label>
            <input type="text" placeholder="e.g. IPL, La Liga" value={lName} onChange={e => setLName(e.target.value)} className={inp} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Sport</label>
              <select value={lSport} onChange={e => setLSport(e.target.value)} className={inp + " cursor-pointer"}>
                {["Football","Cricket","Basketball","Kabaddi","Hockey","Tennis","Other"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Country</label>
              <input type="text" placeholder="e.g. India" value={lCountry} onChange={e => setLCountry(e.target.value)} className={inp} />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onSubmit} disabled={uploading} className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition text-sm">
              {uploading ? "Uploading..." : submitLabel}
            </button>
            {onCancel && <button onClick={onCancel} className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-lg transition text-sm">Cancel</button>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">League Logo <span className="text-gray-400 font-normal text-xs">(optional)</span></label>
          <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-purple-300 rounded-xl cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition">
            <div className="text-center"><div className="text-3xl mb-1">🏆</div><p className="text-gray-600 font-medium text-sm">Click to upload logo</p><p className="text-gray-400 text-xs">PNG, JPG — transparent PNG works best</p></div>
            <input type="file" onChange={onLogoChange} className="hidden" accept="image/*" disabled={uploading} />
          </label>
          {lLogoPreview ? (
            <div className="mt-3 flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <img src={lLogoPreview} alt="logo" style={{ width: 56, height: 56, objectFit: "contain", borderRadius: 10, background: "#f0f0f0", padding: 4 }} />
              <p className="text-green-600 font-semibold text-sm">Logo selected</p>
            </div>
          ) : (
            <div className="mt-3 flex items-center justify-center h-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-400 text-xs">No logo — emoji will be used instead</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN ADMIN — only the fetch calls are changed
// ═══════════════════════════════════════════════════════
function Admin({ goBack, refresh }) {
  const [products, setProducts]   = useState([]);
  const [orders,   setOrders]     = useState([]);
  const [leagues,  setLeagues]    = useState([]);
  const [activeTab, setActiveTab] = useState("manage");
  const [uploading, setUploading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name,     setName]     = useState("");
  const [category, setCategory] = useState("Football");
  const [league,   setLeague]   = useState("");
  const [price,    setPrice]    = useState("");
  const [image,            setImage]            = useState(null);
  const [imagePreview,     setImagePreview]     = useState(null);
  const [backImage,        setBackImage]        = useState(null);
  const [backImagePreview, setBackImagePreview] = useState(null);
  const [hlColor,    setHlColor]    = useState("");
  const [hlPattern,  setHlPattern]  = useState("");
  const [hlFabric,   setHlFabric]   = useState("");
  const [hlFit,      setHlFit]      = useState("");
  const [hlOccasion, setHlOccasion] = useState("");
  const [hlMaterial, setHlMaterial] = useState("");

  const [editingLeagueId, setEditingLeagueId] = useState(null);
  const [isEditingLeague, setIsEditingLeague] = useState(false);
  const [lName,        setLName]        = useState("");
  const [lSport,       setLSport]       = useState("Football");
  const [lCountry,     setLCountry]     = useState("");
  const [lLogo,        setLLogo]        = useState(null);
  const [lLogoPreview, setLLogoPreview] = useState(null);

  /* ── Loaders — ✅ CHANGED: orders uses authFetch ── */
  const loadProducts = () => fetch(`${API}/products`).then(r => r.json()).then(setProducts).catch(() => {});
  const loadOrders   = () => authFetch(`${API}/orders`).then(r => r.json()).then(setOrders).catch(() => {});
  const loadLeagues  = () => fetch(`${API}/leagues`).then(r => r.json()).then(setLeagues).catch(() => {});

  useEffect(() => { loadProducts(); loadOrders(); loadLeagues(); }, []);

  const resetProductForm = () => {
    setEditingId(null); setName(""); setCategory("Football"); setLeague(""); setPrice("");
    setImage(null); setImagePreview(null); setBackImage(null); setBackImagePreview(null);
    setHlColor(""); setHlPattern(""); setHlFabric(""); setHlFit(""); setHlOccasion(""); setHlMaterial("");
  };
  const cancelProductEdit = () => { resetProductForm(); setIsEditing(false); setActiveTab("manage"); };

  /* ── ✅ CHANGED: upload uses authFetchFile ── */
  const uploadImage = async (file) => {
    if (!file) return null;
    const fd = new FormData();
    fd.append("image", file);
    try {
      setUploading(true);
      const res  = await authFetchFile(`${API}/upload`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      return data.url;
    } catch (err) { alert("Upload failed: " + err.message); return null; }
    finally { setUploading(false); }
  };

  const buildProductPayload = (frontUrl, backUrl) => ({
    name, category, league, price: Number(price),
    image: frontUrl, backImage: backUrl || "",
    highlights: { color: hlColor, pattern: hlPattern, fabric: hlFabric, fit: hlFit, occasion: hlOccasion, material: hlMaterial },
  });

  /* ── ✅ CHANGED: all write operations use authFetch ── */
  const handleAddProduct = async () => {
    if (!name || !price || !imagePreview) { alert("Fill Name, Price and Front Image"); return; }
    let frontUrl = imagePreview;
    let backUrl  = backImagePreview || "";
    if (image)     frontUrl = await uploadImage(image);
    if (backImage) backUrl  = await uploadImage(backImage);
    if (!frontUrl) return;
    try {
      const res = await authFetch(`${API}/add-product`, {
        method: "POST",
        body: JSON.stringify(buildProductPayload(frontUrl, backUrl))
      });
      if (!res.ok) throw new Error((await res.json()).error);
      alert("Product added! ✅"); resetProductForm(); loadProducts(); refresh();
    } catch (err) { alert("Failed: " + err.message); }
  };

  const handleUpdateProduct = async () => {
    if (!name || !price) { alert("Fill Name and Price"); return; }
    let frontUrl = imagePreview;
    let backUrl  = backImagePreview || "";
    if (image)     frontUrl = await uploadImage(image);
    if (backImage) backUrl  = await uploadImage(backImage);
    if (!frontUrl) return;
    try {
      const res = await authFetch(`${API}/update-product/${editingId}`, {
        method: "PUT",
        body: JSON.stringify(buildProductPayload(frontUrl, backUrl))
      });
      if (!res.ok) throw new Error((await res.json()).error);
      alert("Updated! ✅"); cancelProductEdit(); loadProducts(); refresh();
    } catch (err) { alert("Failed: " + err.message); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await authFetch(`${API}/delete-product/${id}`, { method: "DELETE" });
    loadProducts(); refresh();
  };

  const startEditProduct = (p) => {
    setEditingId(p._id); setName(p.name); setCategory(p.category); setLeague(p.league || ""); setPrice(p.price);
    setImagePreview(p.image || ""); setBackImagePreview(p.backImage || ""); setImage(null); setBackImage(null);
    const h = p.highlights || {};
    setHlColor(h.color||""); setHlPattern(h.pattern||""); setHlFabric(h.fabric||"");
    setHlFit(h.fit||""); setHlOccasion(h.occasion||""); setHlMaterial(h.material||"");
    setIsEditing(true); setActiveTab("edit");
  };

  const handleFrontImageChange = (e) => { const f = e.target.files[0]; if (!f) return; setImage(f); const r = new FileReader(); r.onloadend = () => setImagePreview(r.result); r.readAsDataURL(f); };
  const handleBackImageChange  = (e) => { const f = e.target.files[0]; if (!f) return; setBackImage(f); const r = new FileReader(); r.onloadend = () => setBackImagePreview(r.result); r.readAsDataURL(f); };

  const resetLeagueForm = () => { setEditingLeagueId(null); setLName(""); setLSport("Football"); setLCountry(""); setLLogo(null); setLLogoPreview(null); setIsEditingLeague(false); };

  const handleAddLeague = async () => {
    if (!lName) { alert("Enter league name"); return; }
    let logoUrl = lLogoPreview || "";
    if (lLogo) logoUrl = await uploadImage(lLogo) || "";
    try {
      const res = await authFetch(`${API}/leagues`, {
        method: "POST",
        body: JSON.stringify({ name: lName, sport: lSport, country: lCountry, logo: logoUrl })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      alert("League added! ✅"); resetLeagueForm(); loadLeagues();
    } catch (err) { alert("Failed: " + err.message); }
  };

  const handleUpdateLeague = async () => {
    if (!lName) { alert("Enter league name"); return; }
    let logoUrl = lLogoPreview || "";
    if (lLogo) logoUrl = await uploadImage(lLogo) || "";
    try {
      const res = await authFetch(`${API}/leagues/${editingLeagueId}`, {
        method: "PUT",
        body: JSON.stringify({ name: lName, sport: lSport, country: lCountry, logo: logoUrl })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      alert("League updated! ✅"); resetLeagueForm(); loadLeagues();
    } catch (err) { alert("Failed: " + err.message); }
  };

  const handleDeleteLeague = async (id) => {
    if (!window.confirm("Delete this league?")) return;
    await authFetch(`${API}/leagues/${id}`, { method: "DELETE" });
    loadLeagues();
  };

  const startEditLeague  = (l) => { setEditingLeagueId(l._id); setLName(l.name); setLSport(l.sport); setLCountry(l.country || ""); setLLogoPreview(l.logo || ""); setLLogo(null); setIsEditingLeague(true); };
  const handleLogoChange = (e) => { const f = e.target.files[0]; if (!f) return; setLLogo(f); const r = new FileReader(); r.onloadend = () => setLLogoPreview(r.result); r.readAsDataURL(f); };

  const formProps = { name, setName, category, setCategory, price, setPrice, league, setLeague, leagues,
    imagePreview, onFrontImageChange: handleFrontImageChange, backImagePreview, onBackImageChange: handleBackImageChange,
    hlColor, setHlColor, hlPattern, setHlPattern, hlFabric, setHlFabric,
    hlFit, setHlFit, hlOccasion, setHlOccasion, hlMaterial, setHlMaterial, uploading };
  const leagueFormProps = { lName, setLName, lSport, setLSport, lCountry, setLCountry, lLogoPreview, onLogoChange: handleLogoChange, uploading };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage your KICKOFF Store</p>
          </div>
          {/* ✅ CHANGED: clears token on logout */}
          <button onClick={() => { sessionStorage.removeItem("adminAuth"); goBack(); }}
            className="flex items-center gap-2 bg-black hover:bg-gray-900 text-white font-semibold px-6 py-2.5 rounded-lg transition">
            ← Back to Store
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-1 mb-8 border-b border-gray-200 overflow-x-auto">
          {[
            { key: "add",     label: "Add Product" },
            { key: "manage",  label: `Products (${products.length})` },
            { key: "leagues", label: `Leagues (${leagues.length})` },
            { key: "orders",  label: `Orders (${orders.length})` },
          ].map(tab => (
            <button key={tab.key}
              onClick={() => { setActiveTab(tab.key); if (isEditing) cancelProductEdit(); }}
              className={`pb-3 px-5 font-semibold transition-all whitespace-nowrap text-sm ${activeTab === tab.key ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-800"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "add" && (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h2>
            <ProductForm {...formProps} onSubmit={handleAddProduct} submitLabel="Add Product" />
          </div>
        )}

        {activeTab === "edit" && isEditing && (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
              <button onClick={cancelProductEdit} className="text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
            </div>
            <ProductForm {...formProps} onSubmit={handleUpdateProduct} submitLabel="Save Changes" />
          </div>
        )}

        {activeTab === "manage" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Products</h2>
            {products.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center"><p className="text-gray-400">No products added yet</p></div>
            ) : (
              (() => {
                const grouped = {};
                products.forEach(p => { const key = p.league || "No League"; if (!grouped[key]) grouped[key] = []; grouped[key].push(p); });
                return Object.entries(grouped).map(([leagueName, prods]) => (
                  <div key={leagueName} className="mb-10">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="text-2xl">🏆</span> {leagueName} <span className="text-sm font-normal text-gray-400">({prods.length})</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                      {prods.map(p => <ProductCard key={p._id} p={p} onEdit={startEditProduct} onDelete={handleDeleteProduct} />)}
                    </div>
                  </div>
                ));
              })()
            )}
          </div>
        )}

        {activeTab === "leagues" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Manage Leagues</h2>
            </div>
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-3">{isEditingLeague ? "Edit League" : "Add New League"}</h3>
              <LeagueForm {...leagueFormProps}
                onSubmit={isEditingLeague ? handleUpdateLeague : handleAddLeague}
                submitLabel={isEditingLeague ? "Save Changes" : "Add League"}
                onCancel={isEditingLeague ? resetLeagueForm : null}
              />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">All Leagues</h3>
            {leagues.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center"><p className="text-gray-400">No leagues added yet</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {leagues.map(l => (
                  <div key={l._id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition">
                    <div className="flex items-center gap-4 p-5 border-b border-gray-100">
                      <div style={{ width: 56, height: 56, borderRadius: 12, background: "#f5f5f5", border: "1px solid #e5e5e5", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                        {l.logo ? <img src={l.logo} alt={l.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <span style={{ fontSize: 24 }}>{sportEmoji[l.sport] || sportEmoji.default}</span>}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-base">{l.name}</h4>
                        <p className="text-gray-500 text-xs mt-0.5">{l.sport}{l.country ? ` · ${l.country}` : ""}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-4">
                      <button onClick={() => startEditLeague(l)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-lg transition text-sm">Edit</button>
                      <button onClick={() => handleDeleteLeague(l._id)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg transition text-sm">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Orders</h2>
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center"><p className="text-gray-400">No orders yet</p></div>
            ) : (
              <div className="space-y-4">
                {orders.map((o, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div><p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Items</p><p className="text-gray-900 font-medium text-sm">{Array.isArray(o.items) ? o.items.map(it => it.name || it).join(", ") : o.items}</p></div>
                      <div><p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Total</p><p className="text-2xl font-bold text-green-600">₹{o.total}</p></div>
                      <div><p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Date</p><p className="text-gray-900 text-sm">{new Date(o.date).toLocaleString()}</p></div>
                    </div>
                    {o.address && <div className="mt-4 pt-4 border-t"><p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Address</p><p className="text-gray-700 text-sm">{o.address}</p></div>}
                    {o.user && <div className="mt-2"><p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Customer</p><p className="text-gray-700 text-sm">{o.user}</p></div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
import { useCallback, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";
const STATUSES = ["Pending", "Preparing", "Ready", "Delivered", "Cancelled"];
const STATUS_STYLE = {
  Pending: { color: "#b87900", bg: "#fff0cb" },
  Preparing: { color: "#1478c8", bg: "#dff0ff" },
  Ready: { color: "#16855b", bg: "#d9f8e8" },
  Delivered: { color: "#178347", bg: "#dcfce7" },
  Cancelled: { color: "#d12f45", bg: "#ffe3e7" },
};
const money = (value) => new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(Number(value) || 0);
const shortDate = (value) => { if (!value) return "—"; const d = new Date(value); return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en", { month: "short", day: "numeric" }); };
const shortTime = (value) => { if (!value) return "—"; const d = new Date(value); return Number.isNaN(d.getTime()) ? "—" : d.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", hour12: true }); };
function mergeOrder(orders, incoming) {
  if (!incoming?.orderNumber) return orders;
  const exists = orders.some((o) => o.orderNumber === incoming.orderNumber);
  const next = exists ? orders.map((o) => o.orderNumber === incoming.orderNumber ? { ...o, ...incoming } : o) : [incoming, ...orders];
  return next.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem("adminToken"));
  const [admin, setAdmin] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeNav, setActiveNav] = useState("Dashboard");

  const logout = useCallback(() => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setToken(null);
    setAdmin(null);
    setOrders([]);
    navigate("/admin/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (!token) {
      setAuthChecking(false);
      navigate("/admin/login", { replace: true });
      return undefined;
    }

    let cancelled = false;

    (async () => {
      try {
        const response = await fetch(`${API}/admin/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json().catch(() => ({}));

        if (response.status === 401 || response.status === 403) {
          throw new Error("Your admin session has expired. Please log in again.");
        }
        if (!response.ok) {
          throw new Error(data.message || "Unable to verify your admin session.");
        }

        if (!cancelled) setAdmin(data.admin || null);
        if (!data.admin && !cancelled) {
          throw new Error("Could not verify your admin account.");
        }
      } catch {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        if (!cancelled) {
          setToken(null);
          setAdmin(null);
          navigate("/admin/login", { replace: true });
        }
      } finally {
        if (!cancelled) setAuthChecking(false);
      }
    })();

    return () => { cancelled = true; };
  }, [token, navigate]);

  const loadOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        logout();
        return;
      }
      if (!response.ok) throw new Error(data.message || "Unable to load orders.");

      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend. Check that the server is running."
          : err.message || "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    if (!token || authChecking || !admin) return undefined;

    const socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: Infinity,
    });

    socket.on("connect", () => setSocketConnected(true));
    socket.on("disconnect", () => setSocketConnected(false));
    socket.on("connect_error", () => setSocketConnected(false));
    socket.on("order:new", (order) => {
      setOrders((current) => mergeOrder(current, order));
      setNotice(`New order received: ${order.orderNumber}`);
    });
    socket.on("order:updated", (order) => {
      setOrders((current) => mergeOrder(current, order));
    });

    loadOrders();

    return () => {
      socket.disconnect();
      setSocketConnected(false);
    };
  }, [token, authChecking, admin, loadOrders]);

  async function updateStatus(orderNumber, status) {
    if (!token) {
      logout();
      return;
    }

    setUpdating(orderNumber);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API}/orders/${encodeURIComponent(orderNumber)}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        logout();
        return;
      }
      if (!response.ok) throw new Error(data.message || "Unable to update order.");

      setOrders((current) => mergeOrder(current, data.order));
      setNotice(`${orderNumber} updated to ${status}.`);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend. Check that the server is running."
          : err.message || "Unable to update order."
      );
    } finally {
      setUpdating("");
    }
  }

  const filteredOrders = useMemo(
    () => filter === "All" ? orders : orders.filter((o) => o.status === filter),
    [orders, filter]
  );

  const stats = [
    { label: "Total Orders", value: orders.length, icon: "▤", tone: "green", note: "All recorded orders" },
    { label: "Pending", value: orders.filter((o) => o.status === "Pending").length, icon: "◷", tone: "gold", note: "Awaiting preparation" },
    { label: "Preparing", value: orders.filter((o) => o.status === "Preparing").length, icon: "♨", tone: "blue", note: "Being prepared" },
    { label: "Ready", value: orders.filter((o) => o.status === "Ready").length, icon: "✓", tone: "purple", note: "Ready to serve" },
  ];

  const popularDishes = useMemo(() => {
    const totals = {};
    orders.forEach((order) => (order.items || []).forEach((item) => {
      const name = item.name || "Unknown item";
      totals[name] = (totals[name] || 0) + (Number(item.quantity) || 0);
    }));
    return Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [orders]);

  const weeklyOrders = useMemo(() => {
    const today = new Date();
    const days = [];
    for (let offset = 6; offset >= 0; offset--) {
      const day = new Date(today);
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - offset);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      const count = orders.filter((order) => {
        const created = new Date(order.createdAt);
        return !Number.isNaN(created.getTime()) && created >= day && created < nextDay;
      }).length;
      days.push({ label: day.toLocaleDateString("en", { weekday: "short" }), count });
    }
    return days;
  }, [orders]);

  const chartPoints = useMemo(() => {
    const max = Math.max(...weeklyOrders.map((d) => d.count), 1);
    return weeklyOrders.map((day, index) => ({
      ...day,
      x: 20 + index * 43,
      y: 120 - (day.count / max) * 85,
    }));
  }, [weeklyOrders]);

  const chartPath = chartPoints.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const revenue = orders.filter((o) => o.status !== "Cancelled").reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  if (authChecking || (!admin && token)) {
    return <div className="ik-auth-loading">Checking admin session…</div>;
  }
  if (!token || !admin) return null;

  return (
    <div className="ik-dashboard">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap');
        .ik-dashboard{min-height:100vh;display:flex;background:#f4f6fa;color:#192230;font:13px 'DM Sans',sans-serif}.ik-dashboard *{box-sizing:border-box}.ik-sidebar{width:220px;min-height:100vh;flex-shrink:0;display:flex;flex-direction:column;background:#101720;color:#d6dce5;padding:0 12px 14px}.ik-brand{min-height:105px;display:flex;flex-direction:column;align-items:center;justify-content:center;border-bottom:1px solid #28313d;margin-bottom:18px;color:#f8bf32}.ik-brand-mark{font-size:28px;line-height:1}.ik-brand-name{font:700 19px 'Playfair Display',serif;letter-spacing:2px}.ik-brand-sub{margin-top:1px;font-size:10px;letter-spacing:3px}.ik-side-label{padding:0 10px 9px;color:#7e8b9d;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase}.ik-nav{display:grid;gap:5px}.ik-nav button{width:100%;display:flex;align-items:center;gap:12px;padding:12px;border:0;border-radius:7px;background:transparent;color:#bdc6d2;font:500 13px 'DM Sans',sans-serif;text-align:left;cursor:pointer}.ik-nav button:hover{background:#1d2937;color:#fff}.ik-nav button.active{color:#fff;background:#253241;box-shadow:inset 3px 0 #f4b91b}.ik-nav-icon{width:17px;text-align:center;font-size:16px}.ik-nav-count{margin-left:auto;border-radius:20px;padding:3px 6px;background:#ed414e;color:#fff;font-size:10px}.ik-sidebar-bottom{margin-top:auto;border-top:1px solid #28313d;padding-top:12px}.ik-main{min-width:0;flex:1}.ik-topbar{min-height:62px;padding:12px 27px;display:flex;align-items:center;justify-content:space-between;gap:15px;background:#fff;border-bottom:1px solid #e8ecf2}.ik-breadcrumb{color:#8792a1;font-size:12px}.ik-breadcrumb strong{color:#293444}.ik-top-right{display:flex;align-items:center;gap:18px}.ik-top-date{color:#778395;font-size:12px}.ik-avatar{width:38px;height:38px;display:grid;place-items:center;border-radius:50%;background:#fff0c8;color:#8d6400;font-weight:800}.ik-content{width:100%;max-width:1600px;margin:0 auto;padding:27px}.ik-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:22px}.ik-heading h1{margin:0 0 6px;font:700 30px 'Playfair Display',serif;color:#17202d}.ik-heading p{margin:0;color:#8791a0;font-size:14px}.ik-heading-right{display:flex;align-items:center;flex-wrap:wrap;gap:10px}.ik-live{display:inline-flex;align-items:center;gap:7px;padding:11px 14px;border:1px solid #e6ebf1;border-radius:8px;background:#fff;color:#5f6c7c}.ik-live-dot{width:8px;height:8px;border-radius:50%;background:#e64c55}.ik-live-dot.on{background:#1eaa6d}.ik-btn{border:0;border-radius:8px;background:#f7bd28;padding:12px 16px;color:#24201a;font:700 12px 'DM Sans',sans-serif;cursor:pointer}.ik-btn:hover{background:#e9ab0f}.ik-btn:disabled{opacity:.6;cursor:wait}.ik-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-bottom:20px}.ik-stat,.ik-panel{min-width:0;border:1px solid #e8ecf2;border-radius:12px;background:#fff;box-shadow:0 2px 7px #18233404}.ik-stat{padding:20px}.ik-stat-top{display:flex;align-items:center;justify-content:space-between;gap:10px;color:#657184;font-size:14px;font-weight:600}.ik-stat-icon{width:40px;height:40px;display:grid;place-items:center;border-radius:50%;font-size:19px;font-weight:700}.ik-stat-icon.green{color:#16865b;background:#d9f8e9}.ik-stat-icon.gold{color:#bc8200;background:#fff0cb}.ik-stat-icon.blue{color:#1879c9;background:#dcefff}.ik-stat-icon.purple{color:#8748db;background:#eee1ff}.ik-stat-value{margin-top:12px;color:#17202d;font-size:34px;line-height:1.1;font-weight:800}.ik-stat-note{margin-top:10px;color:#8a95a4;font-size:12px}.ik-stat-note span{color:#169b63;font-weight:700}.ik-secondary-stats{display:flex;flex-wrap:wrap;gap:22px;padding:16px 20px;margin-bottom:22px;border:1px solid #e8ecf2;border-radius:10px;background:#fff;color:#748092;font-size:13px}.ik-secondary-stats strong{color:#273244;margin-left:5px}.ik-secondary-stats .ik-revenue{margin-left:auto}.ik-panels{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(230px,.8fr) minmax(250px,1fr);gap:16px;align-items:stretch}.ik-panel-header{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:18px 20px 0}.ik-panel-header h2{margin:0;color:#253041;font:700 17px 'Playfair Display',serif}.ik-panel-subtitle{margin-top:5px;color:#9099a7;font-size:12px}.ik-chart-wrap{padding:12px}.ik-chart{display:block;width:100%;overflow:visible}.ik-chart-label{fill:#8993a2;font:10px 'DM Sans',sans-serif}.ik-chart-grid{stroke:#edf0f5;stroke-width:1}.ik-chart-line{fill:none;stroke:#2997f3;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}.ik-dish-list,.ik-recent-list{padding:12px 16px 16px}.ik-dish{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f0f2f6}.ik-dish:last-child,.ik-recent-row:last-child{border-bottom:0}.ik-dish-image{width:36px;height:36px;flex-shrink:0;display:grid;place-items:center;border-radius:8px;background:linear-gradient(145deg,#fff2cc,#f8dca0);font-size:18px}.ik-dish-name{min-width:0;overflow:hidden;color:#394456;font-size:12px;font-weight:600;text-overflow:ellipsis;white-space:nowrap}.ik-dish-caption{margin-top:3px;color:#9aa2ae;font-size:10px}.ik-dish-count{margin-left:auto;color:#536072;font-size:11px;font-weight:800}.ik-recent-row{display:grid;grid-template-columns:1.1fr 1fr;gap:8px;padding:11px 0;border-bottom:1px solid #f0f2f6}.ik-recent-order{overflow:hidden;color:#334052;font-size:11px;font-weight:800;text-overflow:ellipsis;white-space:nowrap}.ik-recent-customer{overflow:hidden;margin-top:4px;color:#8993a2;font-size:10px;text-overflow:ellipsis;white-space:nowrap}.ik-recent-right{text-align:right}.ik-badge{display:inline-block;max-width:100%;padding:5px 8px;border-radius:20px;font-size:10px;font-weight:800;white-space:nowrap}.ik-recent-time{margin-top:5px;color:#8d97a6;font-size:10px}.ik-empty{padding:28px 16px;color:#8b95a3;text-align:center;font-size:12px}.ik-orders-section{margin-top:22px;overflow:hidden;border:1px solid #e8ecf2;border-radius:12px;background:#fff}.ik-orders-toolbar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;padding:18px 20px;border-bottom:1px solid #edf0f4}.ik-orders-toolbar h2{margin:0;font-size:16px;font-weight:800}.ik-orders-toolbar p{margin:5px 0 0;color:#8a95a4;font-size:12px}.ik-orders-toolbar select,.ik-status-select{max-width:100%;padding:9px 10px;border:1px solid #dfe5ed;border-radius:6px;background:#fff;color:#344052;font:12px 'DM Sans',sans-serif}.ik-table-wrap{overflow-x:auto}.ik-table{width:100%;min-width:850px;border-collapse:collapse;text-align:left}.ik-table th{padding:13px 15px;background:#f8f9fc;color:#8792a2;font-size:10px;letter-spacing:.6px;text-transform:uppercase}.ik-table td{padding:14px 15px;border-top:1px solid #f0f2f6;color:#465164;font-size:12px;vertical-align:middle}.ik-table tbody tr:hover{background:#fffcf3}.ik-order-id{color:#273345;font-weight:800}.ik-alert{padding:12px 15px;margin-bottom:14px;border-radius:8px;font-size:13px}.ik-alert.error{color:#a52432;background:#ffe5e8}.ik-alert.success{color:#146b46;background:#dff8e9}.ik-footer{padding:20px 0 0;color:#8b95a3;font-size:11px;text-align:center}.ik-auth-loading{min-height:100vh;display:grid;place-items:center;background:#f4f6fa;color:#273244;font:600 15px 'DM Sans',sans-serif}@media(max-width:1250px){.ik-panels{grid-template-columns:repeat(2,minmax(0,1fr))}.ik-panels .ik-panel:first-child{grid-column:1/-1}}@media(max-width:850px){.ik-sidebar{width:72px;padding-inline:8px}.ik-brand{min-height:80px}.ik-brand-mark{font-size:23px}.ik-brand-name{font-size:10px;letter-spacing:1px}.ik-brand-sub,.ik-side-label,.ik-nav-text,.ik-nav-count{display:none}.ik-nav button{justify-content:center;padding:12px 5px}.ik-nav-icon{font-size:17px}.ik-topbar{padding:12px 18px}.ik-content{padding:20px 16px 30px}.ik-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){.ik-sidebar{width:55px;padding-inline:5px}.ik-brand{min-height:65px}.ik-brand-mark{font-size:20px}.ik-brand-name{font-size:8px}.ik-topbar{padding:11px 12px}.ik-top-date{display:none}.ik-content{padding:18px 10px 25px}.ik-heading h1{font-size:23px}.ik-heading-right{width:100%}.ik-live{flex:1}.ik-stats{gap:9px}.ik-stat{padding:12px}.ik-stat-value{font-size:25px}.ik-stat-top{font-size:11px}.ik-stat-icon{width:30px;height:30px}.ik-secondary-stats{gap:10px 16px}.ik-secondary-stats .ik-revenue{margin-left:0}.ik-panels{grid-template-columns:minmax(0,1fr)}.ik-panels .ik-panel:first-child{grid-column:auto}.ik-panel-header{padding:14px 13px 0}.ik-orders-toolbar{align-items:flex-start}}
      `}</style>

      <aside className="ik-sidebar">
        <div className="ik-brand"><div className="ik-brand-mark">♨</div><div className="ik-brand-name">IKUZWE</div><div className="ik-brand-sub">RESTAURANT</div></div>
        <div className="ik-side-label">Workspace</div>
        <nav className="ik-nav" aria-label="Admin navigation">
          {[["Dashboard", "▦"], ["Orders", "▤"], ["Menu", "♨"], ["Customers", "♙"], ["Reports", "▥"], ["Settings", "⚙"]].map(([label, icon]) => <button type="button" key={label} className={activeNav === label ? "active" : ""} onClick={() => { setActiveNav(label); if (label === "Orders") document.getElementById("ik-all-orders")?.scrollIntoView({ behavior: "smooth" }); }}><span className="ik-nav-icon">{icon}</span><span className="ik-nav-text">{label}</span>{label === "Orders" && orders.length > 0 && <span className="ik-nav-count">{orders.length}</span>}</button>)}
        </nav>
        <div className="ik-sidebar-bottom">
          <button type="button" onClick={() => navigate("/")}><span className="ik-nav-icon">↪</span><span className="ik-nav-text">Back to Website</span></button>
          <button type="button" onClick={logout} style={{ color: "#ffb6b6" }}><span className="ik-nav-icon">⇥</span><span className="ik-nav-text">Logout</span></button>
        </div>
      </aside>

      <main className="ik-main">
        <header className="ik-topbar"><div className="ik-breadcrumb">Workspace&nbsp; / &nbsp;<strong>{activeNav}</strong></div><div className="ik-top-right"><span className="ik-top-date">{new Date().toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</span><div className="ik-avatar" title={admin.name || "Administrator"}>{(admin.name || admin.username || "A").charAt(0).toUpperCase()}</div></div></header>
        <div className="ik-content">
          <div className="ik-heading"><div><h1>Admin Dashboard</h1><p>Welcome back, {admin.name || admin.username || "Admin"}! Here is what is happening today.</p></div><div className="ik-heading-right"><span className="ik-live"><span className={`ik-live-dot ${socketConnected ? "on" : ""}`} />{socketConnected ? "Live updates active" : "Connecting to live updates"}</span><button type="button" className="ik-btn" onClick={loadOrders} disabled={loading}>↻ &nbsp;{loading ? "Loading..." : "Refresh"}</button></div></div>
          {error && <div className="ik-alert error" role="alert">{error}</div>}{notice && <div className="ik-alert success" role="status">{notice}<button type="button" onClick={() => setNotice("")} style={{ float: "right", border: 0, background: "transparent", cursor: "pointer", color: "inherit" }}>Dismiss ×</button></div>}
          <section className="ik-stats" aria-label="Order statistics">{stats.map((stat) => <article className="ik-stat" key={stat.label}><div className="ik-stat-top"><span>{stat.label}</span><span className={`ik-stat-icon ${stat.tone}`}>{stat.icon}</span></div><div className="ik-stat-value">{stat.value}</div><div className="ik-stat-note"><span>●</span> &nbsp;{stat.note}</div></article>)}</section>
          <div className="ik-secondary-stats"><span>Cancelled Orders<strong>{orders.filter((o) => o.status === "Cancelled").length}</strong></span><span>Delivered Orders<strong>{orders.filter((o) => o.status === "Delivered").length}</strong></span><span className="ik-revenue">Non-cancelled order value <strong>{money(revenue)}</strong></span></div>
          <section className="ik-panels">
            <article className="ik-panel"><div className="ik-panel-header"><div><h2>Orders Overview</h2><div className="ik-panel-subtitle">Orders received over the last 7 days</div></div><span style={{ color: "#2498f4", fontSize: 12 }}>● Daily orders</span></div><div className="ik-chart-wrap"><svg className="ik-chart" viewBox="0 0 300 165" role="img" aria-label="Order counts over the last seven days"><defs><linearGradient id="ikChartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2498f4" stopOpacity=".25"/><stop offset="100%" stopColor="#2498f4" stopOpacity=".015"/></linearGradient></defs>{[25,55,85,115].map((y) => <line key={y} x1="18" y1={y} x2="280" y2={y} className="ik-chart-grid"/>)}{[0,1,2,3].map((i) => <text key={i} x="10" y={119-i*30} textAnchor="end" className="ik-chart-label">{Math.round((Math.max(...weeklyOrders.map((d) => d.count),1)*i)/3)}</text>)}<path d={`${chartPath} L 278 130 L 20 130 Z`} fill="url(#ikChartFill)"/><path d={chartPath} className="ik-chart-line"/>{chartPoints.map((point) => <g key={point.label}><circle cx={point.x} cy={point.y} r="3" fill="#fff" stroke="#2498f4" strokeWidth="2"/><text x={point.x} y="148" textAnchor="middle" className="ik-chart-label">{point.label}</text></g>)}</svg></div></article>
            <article className="ik-panel"><div className="ik-panel-header"><div><h2>Popular Dishes</h2><div className="ik-panel-subtitle">Based on recorded orders</div></div><span style={{ color: "#c18b0c", fontSize: 18 }}>✦</span></div><div className="ik-dish-list">{popularDishes.length === 0 ? <div className="ik-empty">Dish statistics will appear when orders arrive.</div> : popularDishes.map(([name, quantity], index) => <div className="ik-dish" key={name}><div className="ik-dish-image">{["🍗","🥩","🐟","🍚","🍟"][index%5]}</div><div style={{ minWidth: 0 }}><div className="ik-dish-name">{name}</div><div className="ik-dish-caption">Items ordered</div></div><div className="ik-dish-count">{quantity}</div></div>)}</div></article>
            <article className="ik-panel"><div className="ik-panel-header"><div><h2>Recent Orders</h2><div className="ik-panel-subtitle">Latest customer activity</div></div><span style={{ color: "#8993a2", fontSize: 17 }}>◷</span></div><div className="ik-recent-list">{orders.length === 0 ? <div className="ik-empty">No recent orders yet.</div> : orders.slice(0,5).map((order) => { const style = STATUS_STYLE[order.status] || STATUS_STYLE.Pending; return <div className="ik-recent-row" key={order.orderNumber}><div><div className="ik-recent-order">{order.orderNumber}</div><div className="ik-recent-customer">{order.customerName || "Guest"}</div></div><div className="ik-recent-right"><span className="ik-badge" style={{ color: style.color, background: style.bg }}>{order.status || "Pending"}</span><div className="ik-recent-time">{shortTime(order.createdAt)}</div></div></div>; })}</div></article>
          </section>
          <section className="ik-orders-section" id="ik-all-orders"><div className="ik-orders-toolbar"><div><h2>Order Management</h2><p>Change an order status to update its progress.</p></div><select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter orders"><option value="All">All Orders</option>{STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select></div>
            {loading && orders.length === 0 ? <div className="ik-empty">Loading orders...</div> : filteredOrders.length === 0 ? <div className="ik-empty">{orders.length === 0 ? "No orders yet. New customer orders will appear here." : "No orders match this filter."}</div> : <div className="ik-table-wrap"><table className="ik-table"><thead><tr><th>Order ID</th><th>Customer</th><th>Table</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Order Date</th></tr></thead><tbody>{filteredOrders.map((order) => { const style = STATUS_STYLE[order.status] || STATUS_STYLE.Pending; return <tr key={order._id || order.orderNumber}><td className="ik-order-id">{order.orderNumber}</td><td><strong>{order.customerName || "Guest"}</strong><div className="ik-recent-customer">{order.customerPhone || "No phone"}</div></td><td>{order.tableNumber || "—"}</td><td>{(order.items || []).map((item, index) => <div key={`${item.name}-${index}`}>{item.name} × {item.quantity}</div>)}</td><td><strong>{money(order.totalAmount)}</strong></td><td>{order.paymentMethod || "Cash"}</td><td><span className="ik-badge" style={{ color: style.color, background: style.bg }}>{order.status || "Pending"}</span><div><select className="ik-status-select" aria-label={`Change status for ${order.orderNumber}`} value={order.status || "Pending"} disabled={updating === order.orderNumber} onChange={(event) => updateStatus(order.orderNumber, event.target.value)}>{STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select></div>{updating === order.orderNumber && <div className="ik-recent-customer">Saving...</div>}</td><td>{shortDate(order.createdAt)}<div className="ik-recent-customer">{shortTime(order.createdAt)}</div></td></tr>; })}</tbody></table></div>}
            <div style={{ padding: "12px 16px", borderTop: "1px solid #edf0f4", color: "#8993a2", fontSize: 11 }}>Showing {filteredOrders.length} of {orders.length} orders<span style={{ float: "right" }}>{socketConnected ? "● Live connection active" : "○ Reconnecting"}</span></div>
          </section>
          <footer className="ik-footer">IKUZWE RESTAURANT · ADMINISTRATION</footer>
        </div>
      </main>
    </div>
  );
}

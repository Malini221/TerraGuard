import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { UserOptions } from 'jspdf-autotable';

// --- Interfaces ---
interface Driver { name: string; aadhaar: string; }
interface Violation { id: number; latitude: number; longitude: number; time: string; driver?: Driver; }
interface jsPDFWithPlugin extends jsPDF { autoTable: (options: UserOptions) => jsPDF; }

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
});

export default function App() {
  const [lang, setLang] = useState<'EN' | 'TN'>('EN');
  const [view, setView] = useState<'splash' | 'auth' | 'forgot' | 'dashboard' | 'admin'>('splash');
  const [isSignup, setIsSignup] = useState(false);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState(""); 
  const [status, setStatus] = useState("SECURE");
  const [truckPos, setTruckPos] = useState<[number, number]>([13.0827, 80.2707]);
  const [violations, setViolations] = useState<Violation[]>([]);

  const miningZone: [number, number][] = [[13.09, 80.27], [13.09, 80.28], [13.08, 80.28], [13.08, 80.27]];

  const t = {
    welcome: lang === 'EN' ? 'TERRAGUARD' : 'டெர்ராகார்ட்',
    subtitle: lang === 'EN' ? 'ENVIRONMENTAL COMPLIANCE UNIT' : 'சுற்றுச்சூழல் இணக்கப் பிரிவு',
    cta: lang === 'EN' ? 'Click to enter portal' : 'நுழைய இங்கே கிளிக் செய்யவும்',
    signin: lang === 'EN' ? 'Sign In' : 'உள்நுழைக',
    signup: lang === 'EN' ? 'Sign Up' : 'பதிவு செய்க',
    id: lang === 'EN' ? 'Aadhaar Number' : 'ஆதார் எண்',
    pass: lang === 'EN' ? 'Password' : 'கடவுச்சொல்',
    forgot: lang === 'EN' ? 'Forgot Password?' : 'கடவுச்சொல் மறந்ததா?',
    admin: lang === 'EN' ? 'OFFICIAL LOGIN' : 'அதிகாரப்பூர்வ உள்நுழைவு',
    reset: lang === 'EN' ? 'Reset Map' : 'மீட்டமைக்க',
    start: lang === 'EN' ? 'START GPS' : 'ஜிபிஎஸ் தொடங்கு',
    export: lang === 'EN' ? 'Download PDF' : 'PDF தரவிறக்கம்'
  };

  const downloadPDF = () => {
    const doc = new jsPDF() as jsPDFWithPlugin;
    doc.text("TerraGuard Official Violation Report", 14, 15);
    const tableRows = violations.map(v => [v.driver?.name || "Unknown", v.driver?.aadhaar || "N/A", `${v.latitude.toFixed(4)}, ${v.longitude.toFixed(4)}`, new Date(v.time).toLocaleString()]);
    doc.autoTable({ head: [['Driver', 'Aadhaar', 'Location', 'Timestamp']], body: tableRows, startY: 20, theme: 'grid' });
    doc.save(`TerraGuard_Report_${Date.now()}.pdf`);
  };

  useEffect(() => {
    if (view === 'admin') {
      const loadData = async () => {
        try {
          const res = await fetch('http://localhost:5000/api/admin/violations');
          setViolations(await res.json());
        } catch (e) { console.error(e); }
      };
      loadData();
    }
  }, [view]);

  // SECURE AUTH HANDLER
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || (isSignup && !userName)) {
      alert("Please fill in all details before proceeding!");
      return;
    }
    const endpoint = isSignup ? 'register-driver' : 'login-driver';
    try {
      const response = await fetch(`http://localhost:5000/api/${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userName, aadhaar: userId }),
      });
      const data = await response.json();
      if (response.ok) { setUserName(data.name); setView('dashboard'); }
      else alert(data.error);
    } catch { alert("Connection Error. Is Backend running?"); }
  };

  if (view === 'splash') return (
    <div onClick={() => setView('auth')} style={splashStyle}>
      <div style={langSelectorContainer}>
        <button style={lang === 'TN' ? activeLangBtn : inactiveLangBtn} onClick={(e) => { e.stopPropagation(); setLang('TN'); }}>தமிழ்</button>
        <button style={lang === 'EN' ? activeLangBtn : inactiveLangBtn} onClick={(e) => { e.stopPropagation(); setLang('EN'); }}>English</button>
      </div>
      <h1 style={welcomeFont}>{t.welcome}</h1>
      <p style={{ opacity: 0.7, letterSpacing: '2px' }}>{t.subtitle}</p>
      <p style={{ marginTop: '50px', fontSize: '0.9rem', color: '#ddd' }}>{t.cta}</p>
    </div>
  );

  if (view === 'auth') return (
    <div style={authBg}>
      <div style={authCard}>
        <div style={{ flex: 1, padding: '40px' }}>
          <h2>{isSignup ? t.signup : t.signin}</h2>
          <form onSubmit={handleAuth}>
            {isSignup && <input style={inputS} placeholder="Full Name" onChange={e => setUserName(e.target.value)} />}
            <input style={inputS} placeholder={t.id} onChange={e => setUserId(e.target.value)} />
            <input style={inputS} type="password" placeholder={t.pass} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
               <input style={{ ...inputS, width: '100px', marginBottom: 0 }} placeholder="OTP" />
               {!isSignup && <span onClick={(e) => { e.preventDefault(); setView('forgot'); }} style={{ fontSize: '12px', color: '#4c1d95', cursor: 'pointer', fontWeight: 'bold' }}>{t.forgot}</span>}
            </div>
            <button style={btnS} type="submit">{isSignup ? t.signup : t.signin}</button>
          </form>
          <p onClick={() => setIsSignup(!isSignup)} style={{ cursor: 'pointer', color: '#4c1d95', marginTop: '15px', textAlign: 'center' }}>{isSignup ? 'Login' : 'Create Account'}</p>
          <hr style={{ margin: '20px 0', opacity: 0.1 }} />
          <button onClick={() => { if(prompt("PIN:")==="2026") setView('admin'); }} style={{ ...btnS, background: '#1e293b' }}>{t.admin}</button>
        </div>
        <div style={sidePanel}><h2>TerraGuard</h2><p>Digital Compliance Leash</p></div>
      </div>
    </div>
  );

  if (view === 'admin') return (
    <div style={{ height: '100vh', background: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column' }}>
      <header style={adminHead}>
        <h2>GOVERNMENT CONTROL PANEL</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
           <button onClick={downloadPDF} style={resetBtn}>{t.export}</button>
           <button onClick={() => setView('auth')} style={logoutBtn}>Logout</button>
        </div>
      </header>
      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
           <table style={tableS}>
            <thead><tr style={{ borderBottom: '1px solid #334155' }}><th style={pad}>Driver</th><th style={pad}>Location</th><th style={pad}>Status</th></tr></thead>
            <tbody>
              {violations.map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={pad}>{v.driver?.name}</td><td style={pad}>{v.latitude.toFixed(3)}, {v.longitude.toFixed(3)}</td><td style={{ ...pad, color: '#ef4444' }}>PENALTY</td>
                </tr>
              ))}
            </tbody>
           </table>
        </div>
        <div style={{ flex: 1 }}><MapContainer center={[13.0827, 80.2707]} zoom={11} style={{ height: '100%' }}><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />{violations.map(v => (<CircleMarker key={v.id} center={[v.latitude, v.longitude]} radius={15} pathOptions={{ color: 'red' }}><Popup>Violation: {v.driver?.name}</Popup></CircleMarker>))}</MapContainer></div>
      </div>
    </div>
  );

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: status === "BREACH DETECTED" ? '#991b1b' : '#4c1d95', color: 'white', padding: '10px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>{t.welcome}: {userName}</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
           <button style={langToggleBtn} onClick={() => setLang(lang === 'EN' ? 'TN' : 'EN')}>{lang === 'EN' ? 'TN' : 'EN'}</button>
           <button onClick={() => { setStatus("SECURE"); setTruckPos([13.0827, 80.2707]); }} style={resetBtn}>{t.reset}</button>
           <button onClick={() => {
              setStatus("TRACKING");
              const iv = setInterval(() => {
                setTruckPos(p => {
                  const nl = p[0]+0.001;
                  if(nl > 13.09) { 
                    clearInterval(iv); setStatus("BREACH DETECTED");
                    new Audio('https://assets.mixkit.co/active_storage/sfx/940/940-preview.mp3').play();
                    alert("🚨 ALERT: Geofence Breach logged!");
                    fetch('http://localhost:5000/api/log-violation', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({aadhaar: userId, latitude: nl, longitude: p[1], message: "Geofence Breach"})});
                  }
                  return [nl, p[1]];
                });
              }, 1000);
           }} style={gpsBtn}>{t.start}</button>
        </div>
      </header>
      <MapContainer center={[13.0827, 80.2707]} zoom={13} style={{ flex: 1 }}><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><Polygon positions={miningZone} pathOptions={{ color: 'green' }} /><Marker position={truckPos} icon={DefaultIcon} /></MapContainer>
    </div>
  );
}

// --- Styles ---
const welcomeFont: React.CSSProperties = { fontSize: '5rem', fontWeight: 800, margin: 0, letterSpacing: '-2px' };
const splashStyle: React.CSSProperties = { height: '100vh', background: 'linear-gradient(to bottom right, #4c1d95, #1e1b4b)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', textAlign: 'center', position: 'relative' };
const langSelectorContainer: React.CSSProperties = { position: 'absolute', top: '30px', right: '30px', display: 'flex', gap: '10px' };
const activeLangBtn: React.CSSProperties = { background: '#22c55e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', fontWeight: 'bold' };
const inactiveLangBtn: React.CSSProperties = { background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px' };
const authBg: React.CSSProperties = { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' };
const authCard: React.CSSProperties = { display: 'flex', width: '800px', background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' };
const sidePanel: React.CSSProperties = { flex: 1, background: '#4c1d95', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px' };
const inputS: React.CSSProperties = { width: '100%', padding: '14px', marginBottom: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f1f5f9' };
const btnS: React.CSSProperties = { width: '100%', padding: '14px', background: '#4c1d95', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' };
const gpsBtn: React.CSSProperties = { background: '#22c55e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const resetBtn: React.CSSProperties = { background: 'white', color: '#4c1d95', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const langToggleBtn: React.CSSProperties = { background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' };
const adminHead: React.CSSProperties = { padding: '20px 40px', background: '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const logoutBtn: React.CSSProperties = { background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' };
const tableS: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', background: '#1e293b', borderRadius: '15px', overflow: 'hidden' };
const pad: React.CSSProperties = { padding: '20px', textAlign: 'left' };
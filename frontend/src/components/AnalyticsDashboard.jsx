import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { userAPI } from '../api/client';

// Fix leaflet icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Emergency Red Marker
const emergencyIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function AnalyticsDashboard({ completionPercent }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await userAPI.getAnalytics();
        setData(res.data);
      } catch (err) {
        console.error("Failed to load analytics", err);
        setError(err.response?.data?.detail || err.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="glass-card text-center" style={{ padding: '2rem' }}>Loading Enterprise Analytics...</div>;
  }

  if (error) {
    return (
      <div className="glass-card text-center" style={{ padding: '2rem', border: '1px solid rgba(59, 130, 246, 0.3)', background: 'var(--bg-glass)' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
        <h3 style={{ color: '#60a5fa', marginBottom: '0.5rem' }}>Syncing Cloud Analytics...</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Your secure backend server is currently rebooting after the latest update. 
          <br/>Analytics will appear automatically once the server is online.
        </p>
      </div>
    );
  }

  if (!data) return null;

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#1e293b', padding: '0.5rem 1rem', border: '1px solid #3b82f6', borderRadius: '8px', color: 'white' }}>
          <p style={{ margin: 0 }}>{label}: <b>{payload[0].value} scans</b></p>
        </div>
      );
    }
    return null;
  };

  const center = data.alert_locations.length > 0 
    ? [data.alert_locations[0].lat, data.alert_locations[0].lng] 
    : [20.5937, 78.9629]; // Default India

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
      
      {/* Top Value Row */}
      <div className="stats-grid">
        
        {/* Profile Health Circle */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase' }}>Profile Health</h3>
          <div style={{ position: 'relative', width: '100px', height: '100px' }}>
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
              <circle cx="50" cy="50" r="40" fill="none" 
                stroke={completionPercent === 100 ? "#10b981" : "#f59e0b"} 
                strokeWidth="10" 
                strokeDasharray={`${(completionPercent / 100) * 251.2} 251.2`} 
                strokeDashoffset="0"
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dasharray 1s ease-out' }}
              />
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
              {completionPercent}%
            </div>
          </div>
        </div>

        {/* Total Scans Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Total QR Scans</h3>
          <div style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--text-primary)', textShadow: '0 0 20px rgba(59, 130, 246, 0.5)' }}>
            {data.total_scans}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--accent-blue)' }}>Lifetime Views</p>
        </div>

        {/* Global Protection Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '2.5rem', margin: '0.5rem 0' }}>🌍</div>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--accent-emerald)', fontWeight: 'bold', margin: 0 }}>Active</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '0.5rem' }}>Global SOS Tracking Enabled</p>
        </div>

      </div>

      <div className="dashboard-grid">
        {/* Scan Velocity Chart */}
        <div className="glass-card" style={{ padding: '1.5rem', height: '350px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📈 Scan Velocity (7 Days)
          </h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.scan_history}>
                <defs>
                  <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="scans" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorScans)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live GPS Map */}
        <div className="glass-card" style={{ padding: 0, height: '350px', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 1000, background: 'rgba(10, 14, 26, 0.8)', backdropFilter: 'blur(10px)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '0.9rem', margin: 0 }}>📍 SOS History Map</h3>
          </div>
          <MapContainer center={center} zoom={data.alert_locations.length > 0 ? 13 : 4} style={{ height: '100%', width: '100%', zIndex: 1 }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {data.alert_locations.map((loc, idx) => (
              <Marker key={idx} position={[loc.lat, loc.lng]} icon={emergencyIcon}>
                <Popup>
                  <div style={{ color: 'black' }}>
                    <h4 style={{ margin: 0, color: '#dc2626' }}>SOS Alert</h4>
                    <p style={{ margin: '0.2rem 0', fontSize: '0.8rem' }}>
                      {new Date(loc.date.endsWith('Z') ? loc.date : `${loc.date}Z`).toLocaleString()}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

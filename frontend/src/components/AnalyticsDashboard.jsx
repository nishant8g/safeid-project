import { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend, BarChart, Bar
} from 'recharts';
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

const emergencyIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#a855f7'];

export default function AnalyticsDashboard({ completionPercent }) {
  const [data, setData] = useState(() => {
    const cached = localStorage.getItem('resq_analytics_cache');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState(null);

  useEffect(() => {
    let retryTimer;
    const fetchAnalytics = async () => {
      try {
        const res = await userAPI.getAnalytics();
        setData(res.data);
        localStorage.setItem('resq_analytics_cache', JSON.stringify(res.data));
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error("Sync error, retrying...", err);
        setError("Syncing...");
        setLoading(false);
        retryTimer = setTimeout(fetchAnalytics, 5000);
      }
    };
    
    fetchAnalytics();
    return () => clearTimeout(retryTimer);
  }, []);

  if (loading && !data) {
    return (
      <div className="glass-card text-center" style={{ padding: '3rem' }}>
        <div className="spinner" style={{ margin: '0 auto 1.5rem auto' }}></div>
        <p style={{ letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: '700' }}>Initializing Secure Node...</p>
      </div>
    );
  }

  if (!data) return null;

  const radialData = [
    { name: 'Completion', value: completionPercent, fill: completionPercent === 100 ? '#10b981' : '#22d3ee' }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card" style={{ padding: '0.5rem 1.25rem', border: '1px solid var(--accent-cyan)', boxShadow: '0 0 20px rgba(34, 211, 238, 0.2)' }}>
          <p style={{ margin: 0, fontWeight: '700', color: 'var(--text-primary)' }}>{label}</p>
          <p style={{ margin: 0, color: 'var(--accent-cyan)', fontSize: '1.2rem', fontWeight: '900' }}>{payload[0].value} Scans</p>
        </div>
      );
    }
    return null;
  };

  const center = data.alert_locations.length > 0 
    ? [data.alert_locations[0].lat, data.alert_locations[0].lng] 
    : [20.5937, 78.9629];

  return (
    <div className="analytics-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Visual KPI Row */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        
        {/* Profile Health Radial */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', border: '1px solid rgba(6, 182, 212, 0.1)' }}>
          <div style={{ width: '120px', height: '120px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" 
                barSize={12} data={radialData} startAngle={90} endAngle={450}
              >
                <RadialBar background dataKey="value" cornerRadius={10} fill="#06b6d4" />
              </RadialBarChart>
            </ResponsiveContainer>
            <div style={{ position: 'relative', top: '-75px', textAlign: 'center', fontSize: '1.4rem', fontWeight: '900', color: 'white' }}>
              {completionPercent}%
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Identity Health</h3>
            <p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'white' }}>
              {completionPercent === 100 ? 'Fully Shielded' : 'Action Required'}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Security score based on profile completion.</p>
          </div>
        </div>

        {/* Scan Bar Highlight */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Scans</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', lineHeight: 1 }}>{data?.total_scans || 0}</div>
            </div>
            <div style={{ height: '60px', width: '120px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.scan_history?.slice(-5)}>
                  <Bar dataKey="scans" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{ padding: '0.5rem', background: 'rgba(6, 182, 212, 0.05)', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.1)', fontSize: '0.75rem', color: '#06b6d4', fontWeight: '600' }}>
            ⚡ Activity Detected in Last 7 Days
          </div>
        </div>

        {/* Active Node Status */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <div className="status-pulse" style={{ width: '60px', height: '60px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '12px', height: '12px', background: 'var(--accent-emerald)', borderRadius: '50%', boxShadow: '0 0 15px var(--accent-emerald)' }}></div>
          </div>
          <div>
            <h3 style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', textTransform: 'uppercase', fontWeight: '800' }}>Protection Live</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>All alert nodes operational.</p>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Latency: 14ms | Global v2.4</div>
          </div>
        </div>

      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Main Velocity Area Chart */}
        <div className="glass-card" style={{ padding: '2rem', height: '400px', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'white' }}>Scan Velocity Architecture</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Temporal heat distribution of identity access.</p>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.scan_history || []}>
                <defs>
                  <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => val.split('-').slice(1).join('/')}
                />
                <YAxis hide domain={[0, 'dataMax + 2']} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="scans" 
                  stroke="#06b6d4" 
                  strokeWidth={5} 
                  fillOpacity={1} 
                  fill="url(#colorScans)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SOS Spatial Distribution */}
        <div className="glass-card" style={{ padding: 0, height: '400px', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', zIndex: 1000, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)', padding: '0.75rem 1.25rem', borderRadius: '14px', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
            <h3 style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-primary)', fontWeight: '800', letterSpacing: '0.05em' }}>📍 GEOSPATIAL LOOPS</h3>
          </div>
          <MapContainer 
            center={center} 
            zoom={data?.alert_locations?.length > 0 ? 12 : 4} 
            style={{ height: '100%', width: '100%', zIndex: 1, filter: 'invert(90%) hue-rotate(180deg) brightness(105%) contrast(85%)' }}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            {(data?.alert_locations || []).map((loc, idx) => (
              <Marker key={idx} position={[loc.lat, loc.lng]} icon={emergencyIcon}>
                <Popup>
                  <div style={{ padding: '0.5rem', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 0.25rem 0', fontWeight: '800', color: '#ef4444' }}>EMERGENCY EVENT</p>
                    <p style={{ margin: 0, fontSize: '0.75rem' }}>{new Date(loc.date).toLocaleString()}</p>
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

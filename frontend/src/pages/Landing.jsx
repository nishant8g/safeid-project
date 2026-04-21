import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ShieldCheck, Activity, Lock, Smartphone, Wifi, HeartPulse, Stethoscope, BriefcaseMedical, CheckCircle, Navigation, Zap, Nfc } from 'lucide-react';

/* ─── Animated 3D Mesh Network Background (Nova Frost Theme) ─── */
function MeshBackground() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const animFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height;
    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Nodes
    const NODE_COUNT = 55; // Reduced from 90 to optimize performance
    const nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 600 + 100,            // depth 100..700
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        vz: (Math.random() - 0.5) * 0.3,
        baseRadius: Math.random() * 2 + 1,
      });
    }

    const CONNECT_DIST = 250;
    const PERSPECTIVE = 800;

    const project = (node) => {
      const mx = (mouseRef.current.x - 0.5) * 80;
      const my = (mouseRef.current.y - 0.5) * 50;
      const scale = PERSPECTIVE / (PERSPECTIVE + node.z);
      return {
        px: (node.x - width / 2 + mx) * scale + width / 2,
        py: (node.y - height / 2 + my) * scale + height / 2,
        scale,
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Update positions
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        n.z += n.vz;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
        if (n.z < 50 || n.z > 750) n.vz *= -1;
      }

      // Sort by z for painter's algorithm
      const sorted = [...nodes].sort((a, b) => b.z - a.z);
      const projected = sorted.map((n) => ({ ...n, ...project(n) }));

      // Draw connections
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const a = projected[i];
          const b = projected[j];
          const dx = a.px - b.px;
          const dy = a.py - b.py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const opacity = (1 - dist / CONNECT_DIST) * 0.2 * Math.min(a.scale, b.scale);
            ctx.beginPath();
            ctx.moveTo(a.px, a.py);
            ctx.lineTo(b.px, b.py);
            ctx.strokeStyle = `rgba(96, 165, 250, ${opacity})`;
            ctx.lineWidth = 1 * Math.min(a.scale, b.scale);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const p of projected) {
        const r = p.baseRadius * p.scale;
        
        ctx.beginPath();
        ctx.arc(p.px, p.py, r * 2.5, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(p.px, p.py, 0, p.px, p.py, r * 2.5);
        gradient.addColorStop(0, `rgba(59, 130, 246, ${0.7 * p.scale})`);
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.px, p.py, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 182, 212, ${0.9 * p.scale})`;
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    const handleMouseMove = (e) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.9 }} />;
}

/* ─── Animated Counter Component ─── */
function AnimatedCounter({ end, suffix = '', label }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      if (typeof end === 'string') {
        // Handle string values (like 'AES-256') without animating
        setCount(end);
        return;
      }
      
      let start = 0;
      const duration = 2000;
      const startTime = performance.now();
      const animate = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * end));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, end]);

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ fontSize: 'clamp(2.5rem, 4vw, 3rem)', fontWeight: '900', color: '#0f172a', letterSpacing: '-1px' }}>
        {count}{typeof count === 'number' && suffix}
      </span>
      <span style={{ color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1.5px', fontSize: '0.85rem' }}>
        {label}
      </span>
    </div>
  );
}

/* ─── MAIN LANDING PAGE COMPONENT ─── */
export default function Landing() {
  const { isAuthenticated } = useAuth();

  // Framer Motion Variants
  const fadeUpVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  return (
    <div style={{ position: 'relative', overflowX: 'hidden', minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)', fontFamily: "'Inter', sans-serif" }}>

      {/* Global CSS override just for this page to make navbar NOT fixed */}
      <style>{`
        body:has(.landing-light) .navbar {
          position: absolute !important;
        }
      `}</style>
      
      {/* Ambient background blur circles with Emergency Pulse Effect (Optimized for Performance) */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
        <MeshBackground />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4], background: ['radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(255,255,255,0) 60%)', 'radial-gradient(circle, rgba(96, 165, 250, 0.2) 0%, rgba(255,255,255,0) 60%)', 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(255,255,255,0) 60%)'] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: 'absolute', top: '-10%', right: '-10%', width: '1000px', height: '1000px', borderRadius: '50%', willChange: 'transform, opacity' }}
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3], background: ['radial-gradient(circle, rgba(129, 140, 248, 0.2) 0%, rgba(255,255,255,0) 60%)', 'radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, rgba(255,255,255,0) 60%)', 'radial-gradient(circle, rgba(129, 140, 248, 0.2) 0%, rgba(255,255,255,0) 60%)'] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '800px', height: '800px', borderRadius: '50%', willChange: 'transform, opacity' }}
        />
        <motion.div
          animate={{ y: [-20, 20, -20], opacity: [0.2, 0.4, 0.2], background: ['radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(255,255,255,0) 50%)', 'radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, rgba(255,255,255,0) 50%)', 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(255,255,255,0) 50%)'] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{ position: 'absolute', top: '30%', left: '20%', width: '100vw', height: '800px', borderRadius: '50%', willChange: 'transform, opacity' }}
        />
      </div>

      {/* Hero Section */}
      <section style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '100px', paddingBottom: '60px' }}>
        
        <motion.div 
          className="container"
          style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
          initial="hidden" animate="visible" variants={staggerContainer}
        >
          {/* Badge */}
          <motion.div variants={fadeUpVariant} style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 24px', background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0, 97, 255, 0.2)', borderRadius: '100px', marginBottom: '32px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)' }}>
            <span style={{ display: 'block', width: '8px', height: '8px', background: '#0061FF', borderRadius: '50%', marginRight: '10px', boxShadow: '0 0 10px #0061FF' }} />
            <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0061FF', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Next-Gen Emergency Response</span>
          </motion.div>

          {/* Title */}
          <motion.h1 variants={fadeUpVariant} style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: '900', color: '#0f172a', lineHeight: '1.2', letterSpacing: '-0.03em', maxWidth: '800px', marginBottom: '24px' }}>
            Your Digital Shield in <br/>
            <span style={{ background: 'linear-gradient(135deg, #0061FF 0%, #9D50BB 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Critical Moments
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={fadeUpVariant} style={{ fontSize: 'clamp(0.95rem, 1.6vw, 1.15rem)', color: '#475569', maxWidth: '800px', lineHeight: '1.6', marginBottom: '40px' }}>
            SafeID uses advanced QR and NFC technology to instantly provide first responders with your life-saving medical data and alert your emergency contacts.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={fadeUpVariant} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to={isAuthenticated ? '/dashboard' : '/register'} style={{ padding: '16px 36px', background: 'linear-gradient(135deg, #0061FF 0%, #0044CC 100%)', color: 'white', borderRadius: '14px', fontSize: '1.1rem', fontWeight: '700', textDecoration: 'none', boxShadow: '0 10px 25px -5px rgba(0, 97, 255, 0.4)', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '10px' }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 35px -5px rgba(0, 97, 255, 0.5)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 97, 255, 0.4)'; }}
            >
              {isAuthenticated ? 'Enter Dashboard' : 'Protect Yourself Now'}
              <span>&rarr;</span>
            </Link>
            
            <a href="#how-it-works" style={{ padding: '16px 36px', background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', color: '#0f172a', border: '1px solid rgba(15, 23, 42, 0.1)', borderRadius: '14px', fontSize: '1.1rem', fontWeight: '700', textDecoration: 'none', transition: 'all 0.3s ease' }}
               onMouseOver={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'rgba(0, 97, 255, 0.3)'; }}
               onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)'; e.currentTarget.style.borderColor = 'rgba(15, 23, 42, 0.1)'; }}
            >
              See How It Works
            </a>
          </motion.div>

          {/* High-End DOM UI Hero Mockup replacing Abstract Graphics */}
        </motion.div>
      </section>

      {/* High-Tech Grid Features - Neat and equal sizing */}
      <section style={{ padding: '120px 24px', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '16px' }}>Enterprise-Grade Security</h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>Combining robust encryption with seamless accessibility to ensure your data is perfectly strictly safe, yet instantly available when it matters.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px' }}>
            
            {/* Box 1: Alerts */}
            <motion.div 
              style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(24px)', borderRadius: '30px', padding: '40px', border: '1px solid rgba(255, 255, 255, 1)', boxShadow: '0 20px 40px rgba(67, 56, 202, 0.06), 0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', height: '100%', transition: 'all 0.3s ease', cursor: 'default' }}
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUpVariant}
              whileHover={{ y: -8, scale: 1.01, boxShadow: '0 30px 60px rgba(67, 56, 202, 0.12)' }}
            >
              <div style={{ width: '64px', height: '64px', background: 'rgba(0, 97, 255, 0.1)', color: '#0061FF', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <Wifi size={32} strokeWidth={2.5} />
              </div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>Instant Alerts</h3>
              <p style={{ fontSize: '1rem', color: '#475569', lineHeight: '1.6', flexGrow: 1 }}>When your QR code or NFC tag is scanned, SafeID instantly dispatches a high-priority SMS and WhatsApp alert to your contacts.</p>
            </motion.div>

            {/* Box 2: Encryption */}
            <motion.div 
              style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(24px)', borderRadius: '30px', padding: '40px', border: '1px solid rgba(255, 255, 255, 1)', boxShadow: '0 20px 40px rgba(67, 56, 202, 0.06), 0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease', cursor: 'default' }}
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUpVariant}
              whileHover={{ y: -8, scale: 1.01, boxShadow: '0 30px 60px rgba(67, 56, 202, 0.12)' }}
            >
              <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ width: '64px', height: '64px', background: 'rgba(6, 182, 212, 0.1)', color: '#0891b2', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <Lock size={32} strokeWidth={2.5} />
                </div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>AES-256 Vault</h3>
                <p style={{ color: '#475569', fontSize: '1rem', lineHeight: '1.6', flexGrow: 1 }}>Your health data is sealed with military-grade encryption within our secure vaults. Only physically verified scans can decrypt your vital info.</p>
              </div>
              <motion.div 
                animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                style={{ position: 'absolute', right: '-50px', bottom: '-50px', width: '200px', height: '200px', border: '2px dashed rgba(67, 56, 202, 0.15)', borderRadius: '50%', zIndex: 1 }}
              />
            </motion.div>

            {/* Box 3: NFC */}
            <motion.div 
              style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(24px)', borderRadius: '30px', padding: '40px', border: '1px solid rgba(255, 255, 255, 1)', boxShadow: '0 20px 40px rgba(67, 56, 202, 0.06), 0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', height: '100%', transition: 'all 0.3s ease', cursor: 'default' }}
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUpVariant}
              whileHover={{ y: -8, scale: 1.01, boxShadow: '0 30px 60px rgba(67, 56, 202, 0.12)' }}
            >
              <div style={{ width: '64px', height: '64px', background: 'rgba(157, 80, 187, 0.1)', color: '#9D50BB', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <Nfc size={32} strokeWidth={2.5} />
              </div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>NFC Smart Tags</h3>
              <p style={{ color: '#475569', fontSize: '1rem', lineHeight: '1.6', flexGrow: 1 }}>Embed your profile into smart bracelets or wallet cards. A tap from any modern smartphone unlocks your emergency profile immediately.</p>
            </motion.div>

            {/* Box 4: ABHA */}
            <motion.div 
              style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(24px)', borderRadius: '30px', padding: '40px', border: '1px solid rgba(255, 255, 255, 1)', boxShadow: '0 20px 40px rgba(67, 56, 202, 0.06), 0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', height: '100%', transition: 'all 0.3s ease', cursor: 'default' }}
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUpVariant}
              whileHover={{ y: -8, scale: 1.01, boxShadow: '0 30px 60px rgba(67, 56, 202, 0.12)' }}
            >
              <div style={{ width: '64px', height: '64px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <Stethoscope size={32} strokeWidth={2.5} />
              </div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>ABHA Health Sync</h3>
              <p style={{ color: '#475569', fontSize: '1rem', lineHeight: '1.6', flexGrow: 1 }}>Connect seamlessly with your official ABHA Health ID. First responders get highly comprehensive, authorized access to your verified medical records instantly.</p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* How it Works Flowchart - Simplified & Cleaned */}
      <section id="how-it-works" style={{ padding: '100px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <span style={{ color: '#0061FF', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Implementation</span>
            <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', color: '#0f172a', fontWeight: '900', marginTop: '16px', letterSpacing: '-0.02em' }}>3 Steps to Protection</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            {[
              { num: '01', title: 'Create Profile', desc: 'Securely log your critical conditions, allergies, and emergency contacts.' },
              { num: '02', title: 'Link Identifier', desc: 'Get your unique cryptographic QR code, physical NFC tag, or link your ABHA card.' },
              { num: '03', title: 'Global Protection', desc: 'Responders globally can scan your SafeID to access data and trigger GPS alerts.' }
            ].map((step, idx) => (
              <motion.div 
                key={idx}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUpVariant}
                whileHover={{ y: -6, scale: 1.01, boxShadow: '0 30px 60px rgba(67, 56, 202, 0.12)' }}
                style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255, 255, 255, 1)', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(67, 56, 202, 0.06), 0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: '100%', cursor: 'default' }}
              >
                <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: 'linear-gradient(135deg, #0061FF 0%, #00E5FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: '900', color: 'white', marginBottom: '24px' }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: '1.4rem', color: '#0f172a', fontWeight: '800', marginBottom: '12px' }}>{step.title}</h3>
                <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.6', margin: 0, flexGrow: 1 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern CTA Section */}
      <section style={{ padding: '80px 24px 120px', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUpVariant}
          style={{ maxWidth: '800px', margin: '0 auto', background: 'linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%)', border: '1px solid #bae6fd', borderRadius: '32px', padding: '60px 40px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}
        >
          <div style={{ width: '80px', height: '80px', background: '#0f172a', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px', boxShadow: '0 10px 25px rgba(15, 23, 42, 0.3)' }}>
            <Zap color="white" size={36} />
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: '900', color: '#0f172a', marginBottom: '20px', letterSpacing: '-0.02em', lineHeight: '1.1' }}>
            Don't leave your <br/> safety to chance.
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '40px', maxWidth: '400px', margin: '0 auto 40px' }}>
            Set up your digital medical identity in under 2 minutes. Free and straightforward.
          </p>
          <Link to={isAuthenticated ? '/dashboard' : '/register'} style={{ display: 'inline-flex', padding: '20px 48px', background: '#0f172a', color: 'white', fontSize: '1.1rem', borderRadius: '16px', fontWeight: '800', textDecoration: 'none', boxShadow: '0 15px 30px rgba(15, 23, 42, 0.25)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(15, 23, 42, 0.35)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(15, 23, 42, 0.25)'; }}
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Create Free Account'}
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '60px 40px 40px', background: 'transparent', position: 'relative', zIndex: 10, color: '#64748b', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        {/* Relocated Global Stats */}
        <div style={{ maxWidth: '1200px', margin: '0 auto 60px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', padding: '0 24px' }}>
          <AnimatedCounter end="AES-256" label="Encryption Standard" />
          <AnimatedCounter end={1} suffix="s" label="Scan to Alert Time" />
          <AnimatedCounter end={99} suffix=".9%" label="System Reliability" />
          <AnimatedCounter end="24/7" label="Secure Availability" />
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>🛡️</span>
            <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>SafeID</span>
          </div>
          
          <div style={{ display: 'flex', gap: '32px', fontSize: '0.95rem', fontWeight: '500', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Terms of Service</a>
            <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Contact Support</a>
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '1.2rem' }}>
            <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e=>e.currentTarget.style.color='#0f172a'} onMouseOut={e=>e.currentTarget.style.color='#94a3b8'}>𝕏</a>
            <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e=>e.currentTarget.style.color='#0f172a'} onMouseOut={e=>e.currentTarget.style.color='#94a3b8'}>in</a>
            <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e=>e.currentTarget.style.color='#0f172a'} onMouseOut={e=>e.currentTarget.style.color='#94a3b8'}>IG</a>
          </div>
        </div>
        <div style={{ maxWidth: '1200px', margin: '40px auto 0', textAlign: 'center', fontSize: '0.85rem' }}>
          &copy; {new Date().getFullYear()} SafeID Inc. All rights reserved. Designed to save lives.
        </div>
      </footer>
    </div>
  );
}

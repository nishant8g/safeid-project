import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ShieldCheck, Activity, Lock, Smartphone, Wifi, HeartPulse, Stethoscope, BriefcaseMedical, CheckCircle, Navigation, Zap, Nfc } from 'lucide-react';
import MidnightAuroraOrb from '../components/Three/MidnightAuroraOrb';

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
      <span style={{ fontSize: 'clamp(2.5rem, 4vw, 3rem)', fontWeight: '900', color: 'white', letterSpacing: '-1px' }}>
        {count}{typeof count === 'number' && suffix}
      </span>
      <span style={{ color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1.5px', fontSize: '0.85rem' }}>
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
    <div style={{ position: 'relative', overflowX: 'hidden', minHeight: '100vh', background: '#020617', fontFamily: "'Inter', sans-serif" }}>

      {/* Global CSS override just for this page to make navbar NOT fixed */}
      <style>{`
        body:has(.landing-light) .navbar {
          position: absolute !important;
        }
        .hero-text {
          text-shadow: 0 0 40px rgba(6, 182, 212, 0.2);
        }
      `}</style>

      {/* Persistent Midnight 3D Background */}
      <MidnightAuroraOrb />

      {/* Ambient glass layers for readability */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 50% 50%, rgba(2, 6, 23, 0.4) 0%, rgba(2, 6, 23, 0.8) 100%)', pointerEvents: 'none', zIndex: 1 }} />

      {/* Hero Section */}
      <section style={{ position: 'relative', zIndex: 10, minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '100px', paddingBottom: '20px' }}>

        <motion.div
          className="container"
          style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
          initial="hidden" animate="visible" variants={staggerContainer}
        >
          {/* Badge */}
          <motion.div variants={fadeUpVariant} style={{ display: 'inline-flex', alignItems: 'center', padding: '8px 20px', background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0, 97, 255, 0.15)', borderRadius: '100px', marginBottom: '12px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)' }}>
            <span style={{ display: 'block', width: '6px', height: '6px', background: '#0061FF', borderRadius: '50%', marginRight: '8px', boxShadow: '0 0 10px #0061FF' }} />
            <span style={{ fontWeight: '700', fontSize: '0.75rem', color: '#0061FF', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Next-Gen Emergency Response</span>
          </motion.div>

          {/* Title */}
          <motion.h1 className="hero-text" variants={fadeUpVariant} style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)', fontWeight: '900', color: 'white', lineHeight: '1.05', letterSpacing: '-0.04em', maxWidth: '900px', marginBottom: '10px' }}>
            Your Digital Shield in <br />
            <span style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #d946ef 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Critical Moments
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={fadeUpVariant} style={{ fontSize: 'clamp(1rem, 1.8vw, 1.2rem)', color: '#94a3b8', maxWidth: '820px', lineHeight: '1.5', marginBottom: '28px', fontWeight: '500' }}>
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

      {/* High-Tech Grid Features - Balanced and Premium */}
      <section style={{ padding: '20px 24px 60px', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
            <motion.div 
              style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(30px)', borderRadius: '32px', padding: '48px', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', height: '100%', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', cursor: 'default' }}
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant}
              whileHover={{ y: -10, boxShadow: '0 40px 80px rgba(6, 182, 212, 0.15)', borderColor: 'rgba(6, 182, 212, 0.3)' }}
            >
              <div style={{ width: '60px', height: '60px', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                <Wifi size={30} strokeWidth={2.5} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Instant Alerts</h3>
              <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: '1.6', flexGrow: 1, fontWeight: '500' }}>When your QR code or NFC tag is scanned, SafeID instantly dispatches a high-priority SMS and WhatsApp alert to your contacts.</p>
            </motion.div>

            {/* Box 2: Encryption */}
            <motion.div 
              style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(30px)', borderRadius: '32px', padding: '48px', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', cursor: 'default' }}
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant}
              whileHover={{ y: -10, boxShadow: '0 40px 80px rgba(217, 70, 239, 0.15)', borderColor: 'rgba(217, 70, 239, 0.3)' }}
            >
              <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ width: '60px', height: '60px', background: 'rgba(217, 70, 239, 0.1)', color: '#d946ef', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px', border: '1px solid rgba(217, 70, 239, 0.2)' }}>
                  <Lock size={30} strokeWidth={2.5} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'white', marginBottom: '16px' }}>AES-256 Vault</h3>
                <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: '1.6', flexGrow: 1, fontWeight: '500' }}>Your health data is sealed with military-grade encryption within our secure vaults. Only physically verified scans can decrypt your vital info.</p>
              </div>
              <motion.div 
                animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                style={{ position: 'absolute', right: '-40px', bottom: '-40px', width: '180px', height: '180px', border: '2px dashed rgba(217, 70, 239, 0.1)', borderRadius: '50%', zIndex: 1 }}
              />
            </motion.div>

            {/* Box 3: NFC */}
            <motion.div 
              style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(30px)', borderRadius: '32px', padding: '48px', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', height: '100%', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', cursor: 'default' }}
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant}
              whileHover={{ y: -10, boxShadow: '0 40px 80px rgba(168, 85, 247, 0.15)', borderColor: 'rgba(168, 85, 247, 0.3)' }}
            >
              <div style={{ width: '60px', height: '60px', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                <Nfc size={30} strokeWidth={2.5} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'white', marginBottom: '16px' }}>NFC Smart Tags</h3>
              <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: '1.6', flexGrow: 1, fontWeight: '500' }}>Embed your profile into smart bracelets or wallet cards. A tap from any modern smartphone unlocks your emergency profile immediately.</p>
            </motion.div>

            {/* Box 4: ABHA */}
            <motion.div 
              style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(30px)', borderRadius: '32px', padding: '48px', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', height: '100%', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', cursor: 'default' }}
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant}
              whileHover={{ y: -10, boxShadow: '0 40px 80px rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
            >
              <div style={{ width: '60px', height: '60px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <Stethoscope size={30} strokeWidth={2.5} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'white', marginBottom: '16px' }}>ABHA Health Sync</h3>
              <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: '1.6', flexGrow: 1, fontWeight: '500' }}>Connect seamlessly with your official ABHA Health ID. First responders get highly comprehensive, authorized access to your verified medical records instantly.</p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* How it Works Flowchart - Simplified & Cleaned */}
      <section id="how-it-works" style={{ padding: '100px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <div style={{ textAlign: 'center', marginBottom: '70px' }}>
            <span style={{ color: '#06b6d4', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.8rem' }}>Implementation</span>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: 'white', fontWeight: '900', marginTop: '12px', letterSpacing: '-0.02em', marginBottom: '16px' }}>3 Steps to Protection</h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem' }}>Our platform ensures a frictionless onboarding experience for lifecycle-long safety.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            {[
              { num: '01', title: 'Create Profile', desc: 'Securely log your critical conditions, allergies, and emergency contacts.' },
              { num: '02', title: 'Link Identifier', desc: 'Get your unique cryptographic QR code, physical NFC tag, or link your ABHA card.' },
              { num: '03', title: 'Global Protection', desc: 'Responders globally can scan your SafeID to access data and trigger GPS alerts.' }
            ].map((step, idx) => (
              <motion.div 
                key={idx}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUpVariant}
                whileHover={{ y: -10, borderColor: 'rgba(255, 255, 255, 0.2)' }}
                style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', padding: '48px 40px', borderRadius: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: '100%', cursor: 'default', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
              >
                <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '900', color: 'white', marginBottom: '28px', boxShadow: '0 10px 20px rgba(6, 182, 212, 0.2)' }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: '1.4rem', color: 'white', fontWeight: '800', marginBottom: '16px' }}>{step.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: '1.6', margin: 0, flexGrow: 1, opacity: 0.9 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern CTA Section */}
      <section style={{ padding: '80px 24px 120px', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUpVariant}
          style={{ maxWidth: '800px', margin: '0 auto', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)', borderRadius: '32px', padding: '60px 40px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}
        >
          <div style={{ width: '80px', height: '80px', background: 'var(--accent-cyan)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px', boxShadow: '0 10px 25px rgba(6, 182, 212, 0.3)' }}>
            <Zap color="#0f172a" size={36} />
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: '900', color: 'white', marginBottom: '20px', letterSpacing: '-0.02em', lineHeight: '1.1' }}>
            Don't leave your <br /> safety to chance.
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '40px', maxWidth: '400px', margin: '0 auto 40px' }}>
            Set up your digital medical identity in under 2 minutes. Free and straightforward.
          </p>
          <Link to={isAuthenticated ? '/dashboard' : '/register'} style={{ display: 'inline-flex', padding: '20px 48px', background: 'white', color: '#0f172a', fontSize: '1.1rem', borderRadius: '16px', fontWeight: '800', textDecoration: 'none', boxShadow: '0 15px 30px rgba(255, 255, 255, 0.1)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(255, 255, 255, 0.2)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(255, 255, 255, 0.1)'; }}
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Create Free Account'}
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '80px 40px 40px', background: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(10px)', position: 'relative', zIndex: 10, color: '#64748b', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        {/* Relocated Global Stats - Information Bar Style */}
        <div style={{ maxWidth: '1200px', margin: '0 auto 80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '40px', padding: '40px', background: 'rgba(255, 255, 255, 0.5)', borderRadius: '32px', border: '1px solid rgba(255, 255, 255, 0.8)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
          <AnimatedCounter end="AES-256" label="Encryption Standard" />
          <AnimatedCounter end={1} suffix="s" label="Scan to Alert Time" />
          <AnimatedCounter end={99} suffix=".9%" label="System Reliability" />
          <AnimatedCounter end="24/7" label="Secure Availability" />
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.8rem' }}>🛡️</span>
            <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.8px' }}>SafeID</span>
          </div>
          
          <div style={{ display: 'flex', gap: '40px', fontSize: '1rem', fontWeight: '600', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="#" style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e=>e.currentTarget.style.color='#0061FF'} onMouseOut={e=>e.currentTarget.style.color='#64748b'}>Privacy Policy</a>
            <a href="#" style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e=>e.currentTarget.style.color='#0061FF'} onMouseOut={e=>e.currentTarget.style.color='#64748b'}>Terms of Service</a>
            <a href="#" style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e=>e.currentTarget.style.color='#0061FF'} onMouseOut={e=>e.currentTarget.style.color='#64748b'}>Contact Support</a>
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '1.2rem' }}>
            <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#0f172a'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>𝕏</a>
            <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#0f172a'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>in</a>
            <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#0f172a'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>IG</a>
          </div>
        </div>
        <div style={{ maxWidth: '1200px', margin: '40px auto 0', textAlign: 'center', fontSize: '0.85rem' }}>
          &copy; {new Date().getFullYear()} SafeID Inc. All rights reserved. Designed to save lives.
        </div>
      </footer>
    </div>
  );
}

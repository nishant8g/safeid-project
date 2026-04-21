import { useEffect, useRef } from 'react';

export default function MeshBackground() {
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
    const NODE_COUNT = 55; // Optimized for performance
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

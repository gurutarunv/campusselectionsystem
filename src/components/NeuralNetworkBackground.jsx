import { useEffect, useRef } from 'react';

export default function NeuralNetworkBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Color palette: subtle blue, cyan, and soft violet
    const nodeColors = [
      { r: 37, g: 99, b: 235 },   // Primary Blue #2563eb
      { r: 14, g: 165, b: 233 },  // Cyan #0ea5e9
      { r: 99, g: 102, b: 241 },  // Indigo #6366f1
      { r: 139, g: 92, b: 246 }   // Soft Violet #8b5cf6
    ];

    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Node count adapted to screen resolution for optimal performance
    const isMobile = width < 768;
    const nodeCount = isMobile ? 26 : Math.min(58, Math.floor((width * height) / 26000));
    const maxDistance = isMobile ? 110 : 150;

    class Node {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * (isMobile ? 0.25 : 0.4);
        this.vy = (Math.random() - 0.5) * (isMobile ? 0.25 : 0.4);
        this.baseRadius = Math.random() * 1.8 + 1.8;
        this.radius = this.baseRadius;
        this.colorObj = nodeColors[Math.floor(Math.random() * nodeColors.length)];
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.015 + Math.random() * 0.015;
      }

      update() {
        if (!prefersReducedMotion) {
          this.x += this.vx;
          this.y += this.vy;

          if (this.x < 0 || this.x > width) this.vx *= -1;
          if (this.y < 0 || this.y > height) this.vy *= -1;

          this.pulsePhase += this.pulseSpeed;
          this.radius = this.baseRadius + Math.sin(this.pulsePhase) * 0.6;
        }
      }

      draw() {
        const { r, g, b } = this.colorObj;

        // Soft outer glow
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.08)`;
        ctx.fill();

        // Inner node core
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.65)`;
        ctx.fill();
      }
    }

    const nodes = Array.from({ length: nodeCount }, () => new Node());

    const drawLines = () => {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.22;
            const c1 = nodes[i].colorObj;
            const c2 = nodes[j].colorObj;

            const gradient = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
            gradient.addColorStop(0, `rgba(${c1.r}, ${c1.g}, ${c1.b}, ${alpha})`);
            gradient.addColorStop(1, `rgba(${c2.r}, ${c2.g}, ${c2.b}, ${alpha})`);

            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      drawLines();
      nodes.forEach((node) => {
        node.update();
        node.draw();
      });

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      if (prefersReducedMotion) {
        render();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="neural-network-canvas"
      aria-hidden="true"
    />
  );
}

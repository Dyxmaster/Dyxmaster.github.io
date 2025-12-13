(() => {
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.left = "0";
  canvas.style.top = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  let w, h, dpr;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  const fireworks = [];

  function randomColor() {
    const colors = [
      "#60a5fa", "#f472b6", "#34d399",
      "#facc15", "#a78bfa", "#22d3ee"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function createFirework(x, y) {
    const count = 28;
    const color = randomColor();

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      fireworks.push({
        x,
        y,
        vx: Math.cos(angle) * (2 + Math.random() * 2),
        vy: Math.sin(angle) * (2 + Math.random() * 2),
        alpha: 1,
        radius: 2 + Math.random() * 2,
        color
      });
    }
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);

    for (let i = fireworks.length - 1; i >= 0; i--) {
      const p = fireworks[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.04; // gravity
      p.alpha -= 0.015;

      if (p.alpha <= 0) {
        fireworks.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${hexToRgb(p.color)},${p.alpha})`;
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
  }

  window.addEventListener("click", (e) => {
    createFirework(e.clientX, e.clientY);
  }, { passive: true });

  animate();
})();

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

  const rockets = []; 
  // 增加一个 crackles 数组用于二次爆炸的、生命周期极短的粒子
  const crackles = []; 
  const fireworks = [];

  function randomColor() {
    // 颜色改为 HSL 格式，方便在动画中进行色相（Hue）偏移
    const hue = Math.floor(Math.random() * 360);
    // 返回 HSL 字符串，方便在 animate 中动态调整亮度/饱和度
    return { h: hue, s: '100%', l: '65%' };
  }

  // 修改 hexToRgb 辅助函数，使其支持 HSL 对象
  function colorToRgb(color) {
    if (typeof color === 'string') {
        const n = parseInt(color.slice(1), 16);
        return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
    }
    // HSL 转 RGB
    // 这里使用 CSS HSL 格式，方便直接在 rgba() 中使用
    return `hsl(${color.h}, ${color.s}, ${color.l})`;
  }


  function createFirework(x, y, colorOverride = null, particleCount = 40, speedScale = 1.0) {
    const count = particleCount; 
    const color = colorOverride || randomColor();

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      // 增强速度随机性
      const speed = (2 + Math.random() * 4.5) * speedScale; 
      fireworks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        radius: 1.5 + Math.random() * 2,
        color,
        // 记录粒子创建时的色相
        initialHue: color.h, 
        life: 1, // 初始生命值
        lastX: x, 
        lastY: y,
        // 增加一个属性来控制二次爆炸的概率
        hasCrackled: false 
      });
    }
  }

  // 新增：二次爆炸粒子
  function createCrackle(x, y, color) {
    const count = 8; // 更少的粒子
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        // 极快的速度，极短的寿命
        const speed = 0.5 + Math.random() * 1.5; 
        crackles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1,
            radius: 0.5 + Math.random() * 1,
            color,
            life: 0.5, // 寿命更短
            lastX: x,
            lastY: y
        });
    }
  }

  function launchRocket(targetX, targetY) {
    const color = randomColor();
    // 增加火箭爆炸粒子数量的随机性
    const explosionSize = 30 + Math.random() * 40; 
    
    // 计算起始位置 (底部随机偏移)
    const startX = w * 0.4 + Math.random() * w * 0.2; 

    // 计算朝向目标的矢量
    const dx = targetX - startX;
    const dy = targetY - h;
    const distance = Math.sqrt(dx * dx + dy * dy);
    // 速度因子，确保火箭到达目标
    const velocityFactor = distance / (18 + Math.random() * 5); 

    rockets.push({
      x: startX, 
      y: h,
      targetX: targetX,
      targetY: targetY,
      // 速度现在取决于距离，更真实
      vx: dx / distance * velocityFactor * 0.5, 
      vy: dy / distance * velocityFactor * 0.5,
      alpha: 1,
      color,
      radius: 3.5,
      lastX: startX,
      lastY: h,
      explosionSize // 存储爆炸大
    });
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);

    // --- 1. Animate and Draw Rockets (Launch Phase) ---
    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];

      // Draw the rocket trail
      ctx.beginPath();
      // 使用 quadraticCurveTo 绘制弯曲的轨迹
      ctx.moveTo(r.lastX, r.lastY);
      ctx.lineTo(r.x, r.y); 
      // 颜色保持不变，但透明度基于 alpha
      ctx.strokeStyle = `hsla(${r.color.h}, ${r.color.s}, ${r.color.l}, ${r.alpha * 0.7})`; 
      ctx.lineWidth = r.radius * 2;
      ctx.stroke();

      r.lastX = r.x;
      r.lastY = r.y;

      r.x += r.vx;
      r.y += r.vy;
      // 火箭发射阶段重力影响较小，但在接近顶点时会减速
      r.vy += 0.05; 

      // 判断是否到达目标或开始下落
      if (r.y <= r.targetY || r.vy > 0) { 
        // 爆炸时使用存储的爆炸大小
        createFirework(r.x, r.y, r.color, r.explosionSize, 1.0); 
        rockets.splice(i, 1);
        continue;
      }
      
      // Draw the rocket head
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${r.color.h}, ${r.color.s}, ${r.color.l}, ${r.alpha})`;
      ctx.fill();
    }


    // --- 2. Animate and Draw Fireworks (Explosion Phase) ---
    for (let i = fireworks.length - 1; i >= 0; i--) {
      const p = fireworks[i];

      // **特效增强点 1: 颜色变化 (Hue Shift) **
      // 随着 alpha 降低，色相略微偏移 (模拟颜色烧尽)
      const currentHue = p.initialHue + (1 - p.alpha) * 30; // 最大偏移 30 度
      // 亮度也随之降低
      const currentL = 50 + p.alpha * 15; // L 从 65 降到 50

      // Draw particle trail
      ctx.beginPath();
      ctx.moveTo(p.lastX, p.lastY);
      // 绘制更长的轨迹
      ctx.lineTo(p.x + p.vx * 1.5, p.y + p.vy * 1.5); 
      // 使用变化的颜色和 alpha 绘制轨迹
      ctx.strokeStyle = `hsla(${currentHue}, ${p.color.s}, ${currentL}%, ${p.alpha * 0.5})`;
      ctx.lineWidth = p.radius * 0.8;
      ctx.stroke();

      p.lastX = p.x;
      p.lastY = p.y;
      
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06; 
      p.alpha -= 0.02; // 寿命稍长

      // **特效增强点 2: 二次爆炸/爆裂 (Crackles) **
      // 当 alpha 接近 0.4 且未爆裂时，有概率触发
      if (p.alpha <= 0.4 && !p.hasCrackled && Math.random() < 0.1) {
          createCrackle(p.x, p.y, {h: currentHue, s: '100%', l: '70%'});
          p.hasCrackled = true;
      }
      
      if (p.alpha <= 0) {
        fireworks.splice(i, 1);
        continue;
      }

      // Draw the particle head
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      // 使用变化的颜色绘制粒子头部
      ctx.fillStyle = `hsla(${currentHue}, ${p.color.s}, ${currentL}%, ${p.alpha})`;
      ctx.fill();
    }
    
    // --- 3. Animate and Draw Crackles (Secondary Explosion) ---
    for (let i = crackles.length - 1; i >= 0; i--) {
        const c = crackles[i];
        
        c.x += c.vx;
        c.y += c.vy;
        c.vy += 0.02; // 极小的重力
        c.alpha -= 0.05; // 极快的淡出

        if (c.alpha <= 0) {
            crackles.splice(i, 1);
            continue;
        }

        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        // Crackle 粒子是白色或高亮的
        ctx.fillStyle = `hsla(${c.color.h}, ${c.color.s}, ${c.color.l}, ${c.alpha})`;
        ctx.fill();
    }
    // =======================================================


    requestAnimationFrame(animate);
  }

  // --- 鼠标和触摸事件处理 (保持兼容性) ---
  
  function handleLaunch(clientX, clientY) {
    launchRocket(clientX, clientY);
  }

  function handleSparkle(clientX, clientY) {
    if (Math.random() < 0.2) { 
      // 移动时的火花效果也使用 createFirework，但粒子更少，速度更慢
      createFirework(clientX, clientY, randomColor(), 8, 0.5); 
    }
  }

  // Mouse Events
  window.addEventListener("click", (e) => {
    handleLaunch(e.clientX, e.clientY);
  }, { passive: true });

  let isMoving = false;
  window.addEventListener("mousedown", () => { isMoving = true; });
  window.addEventListener("mouseup", () => { isMoving = false; });
  window.addEventListener("mousemove", (e) => {
    if (isMoving) { 
        handleSparkle(e.clientX, e.clientY);
    }
  }, { passive: true });

  // Touch Events (For Mobile Compatibility)
  window.addEventListener("touchstart", (e) => {
    isMoving = true;
    if (e.touches.length === 1) {
        handleLaunch(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });
  
  window.addEventListener("touchend", () => { isMoving = false; });
  
  window.addEventListener("touchmove", (e) => {
    // 确保只有单指触摸时才触发火花
    if (isMoving && e.touches.length === 1) { 
        handleSparkle(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  animate();
})();
<script>
  // @ts-nocheck
  import { onMount, onDestroy } from 'svelte';
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
  import { MotionPathPlugin } from 'gsap/dist/MotionPathPlugin';
  import Lenis from '@studio-freight/lenis';
  import TokenLookup from '$lib/features/radar/components/TokenLookup.svelte';

  let caToCopy = "example";
  let copiedCA = false;
  function copyCA() {
    navigator.clipboard.writeText(caToCopy);
    copiedCA = true;
    setTimeout(() => copiedCA = false, 2000);
  }

  // Custom ScrambleText implementation (pengganti premium plugin)
  function scrambleText(element, finalString, durationMs = 1100, delayMs = 150) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const totalFrames = Math.round((durationMs / 1000) * 60);
    let frame = 0;
    
    setTimeout(() => {
      const animate = () => {
        let output = "";
        const progress = frame / totalFrames;
        for (let i = 0; i < finalString.length; i++) {
          if (finalString[i] === " " || finalString[i] === ".") { 
            output += finalString[i]; 
            continue; 
          }
          if (i < finalString.length * progress) {
            output += finalString[i];
          } else {
            output += chars[Math.floor(Math.random() * chars.length)];
          }
        }
        element.textContent = output;
        if (frame < totalFrames) {
          frame++;
          requestAnimationFrame(animate);
        } else {
          element.textContent = finalString;
        }
      };
      requestAnimationFrame(animate);
    }, delayMs);
  }

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lenis = null;

    if (!reduceMotion) {
      lenis = new Lenis({ duration: 1.05, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }

    const railFill = document.getElementById("railFill");
    const railDot = document.getElementById("railDot");

    function updateRail() {
      if (!railFill || !railDot) return;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const p = docH > 0 ? Math.min(1, Math.max(0, window.scrollY / docH)) : 0;
      railFill.style.height = (p * 100) + "%";
      railDot.style.top = (p * 100) + "%";
    }

    if (lenis) { lenis.on("scroll", updateRail); } 
    else { window.addEventListener("scroll", updateRail, { passive: true }); }
    window.addEventListener("resize", updateRail);
    updateRail();

    // FINAL SECTION (Sticky Footer Reveal) - In/Out animation
    const rbgLines = document.querySelectorAll(".rbg-line");
    if (rbgLines.length && !reduceMotion) {
      rbgLines.forEach((line) => {
        const len = line.getTotalLength ? line.getTotalLength() : 1600;
        line.style.strokeDasharray = len;
        line.style.strokeDashoffset = len;
        line.style.animationPlayState = "paused";
      });
      gsap.set(".reveal-stat", { opacity: 0, y: 8 });
      
      ScrollTrigger.create({
        trigger: ".reveal-spacer",
        start: "top bottom",
        end: "bottom top",
        toggleActions: "play reverse play reverse", // Animasi in/out berulang
        onEnter: () => {
          rbgLines.forEach((line, i) => {
            gsap.to(line, {
              strokeDashoffset: 0, duration: 1.6, delay: i * 0.05, ease: "power2.out",
              onComplete: () => { line.style.animationPlayState = "running"; }
            });
          });
          gsap.to(".reveal-stat", { opacity: 1, y: 0, duration: 0.6, delay: 0.6 });
        },
        onLeaveBack: () => {
          // Exit animation saat scroll naik
          rbgLines.forEach((line) => {
            const len = line.getTotalLength ? line.getTotalLength() : 1600;
            gsap.to(line, { strokeDashoffset: len, duration: 0.5, ease: "power2.in" });
            line.style.animationPlayState = "paused";
          });
          gsap.to(".reveal-stat", { opacity: 0, y: 8, duration: 0.3 });
        }
      });
    }

    // HOW IT WORKS - Pinned Section
    const procSteps = document.querySelectorAll(".proc-step");
    const procPanels = document.querySelectorAll(".proc-panel");
    let lastStage = -1;

    function animateStage(idx) {
      if (idx === lastStage) return;
      lastStage = idx;
      if (reduceMotion) return;

      if (idx === 0) {
        const rl = document.getElementById("procReadLine");
        const rd = document.getElementById("procReadDot");
        if (rl && rd && rl.getTotalLength) {
          const len = rl.getTotalLength();
          gsap.set(rl, { strokeDasharray: len, strokeDashoffset: len });
          gsap.to(rl, { strokeDashoffset: 0, duration: 0.8, ease: "power2.out" });
          gsap.fromTo(rd, { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.35, delay: 0.7, ease: "back.out(2)" });
        }
      } else if (idx === 1) {
        gsap.fromTo(".proc-group-dot", { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.4, stagger: 0.08, ease: "back.out(2)" });
        gsap.fromTo(".proc-group-line", { opacity: 0 }, { opacity: 1, duration: 0.4, stagger: 0.07, delay: 0.15 });
      } else if (idx === 2) {
        const bl = document.getElementById("procBreakLine");
        const bd = document.getElementById("procBreakDot");
        if (bl && bd && bl.getTotalLength) {
          const blen = bl.getTotalLength();
          gsap.set(bl, { strokeDasharray: blen, strokeDashoffset: blen });
          gsap.to(bl, { strokeDashoffset: 0, duration: 1, ease: "power2.out" });
          gsap.fromTo(bd, { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.3, delay: 0.9, ease: "back.out(2)" });
        }
      }
    }

    if (procSteps.length) {
      ScrollTrigger.create({
        trigger: "#howProc",
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          const idx = Math.min(2, Math.floor(self.progress * 3));
          procSteps.forEach((s, i) => { s.classList.toggle("on", i === idx); });
          procPanels.forEach((p, i) => { p.classList.toggle("on", i === idx); });
          animateStage(idx);
        }
      });
      if(procSteps[0]) procSteps[0].classList.add("on");
      if(procPanels[0]) procPanels[0].classList.add("on");
      animateStage(0);
    }

    // HERO SECTION & GLOBAL REVEALS
    if (!reduceMotion) {
      const headline = document.getElementById("heroHeadline");
      if (headline) {
        const finalText = headline.textContent;
        headline.textContent = "";
        scrambleText(headline, finalText, 1100, 100);
      }

      // Hero lines
      const lines = document.querySelectorAll(".hero-signals polyline");
      lines.forEach((line, i) => {
        if (line.getTotalLength) {
          const len = line.getTotalLength();
          line.style.strokeDasharray = len;
          line.style.strokeDashoffset = len;
          gsap.to(line, { strokeDashoffset: 0, duration: 1.3, delay: 0.5 + i * 0.06, ease: "power2.out" });
        }
      });

      // Hero Breakout annotation
      gsap.fromTo("#breakoutLine ~ line, .annotation-label", { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 1.6 });

      // Hero Pulse (Bola merah yang berjalan)
      const breakoutPath = [
        { x: 0, y: 230 }, { x: 40, y: 228 }, { x: 80, y: 229 }, { x: 120, y: 220 },
        { x: 160, y: 208 }, { x: 200, y: 192 }, { x: 240, y: 174 }, { x: 280, y: 158 },
        { x: 320, y: 144 }, { x: 360, y: 134 }, { x: 380, y: 128 }
      ];
      gsap.fromTo("#heroPulse", { opacity: 0 }, { opacity: 1, duration: 0.4, delay: 1.8 });
      gsap.to("#heroPulse", {
        motionPath: { path: breakoutPath, curviness: 1.15 },
        duration: 3.2, repeat: -1, ease: "sine.inOut", delay: 1.8
      });

      // Semua section reveal in/out dengan multi-arah
      const revealElements = [
        { selector: ".reveal-up", props: { y: 30, x: 0 } },
        { selector: ".reveal-left", props: { x: -40, y: 0 } },
        { selector: ".reveal-right", props: { x: 40, y: 0 } }
      ];

      revealElements.forEach(({selector, props}) => {
        gsap.utils.toArray(selector).forEach((el) => {
          gsap.fromTo(el,
            { opacity: 0, ...props },
            { opacity: 1, x: 0, y: 0, duration: 0.8, ease: "power2.out",
              scrollTrigger: { trigger: el, start: "top 85%", end: "bottom top", toggleActions: "play reverse play reverse" } }
          );
        });
      });
    }

    // Flashlight Effect Tracker
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
      heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        heroSection.style.setProperty('--mouse-x', `${x}px`);
        heroSection.style.setProperty('--mouse-y', `${y}px`);
      });
    }

    setTimeout(() => ScrollTrigger.refresh(), 500);
  });
  
  onDestroy(() => {
    if (typeof window !== 'undefined') {
       ScrollTrigger.getAll().forEach(t => t.kill());
    }
  });
</script>

<svelte:head>
  <title>Tycho - Narrative Radar</title>
  <meta name="description" content="See the meta before it's the meta. Tracking pump.fun and Solana narratives in real-time." />
  
  <meta property="og:title" content="Tycho Narrative Radar" />
  <meta property="og:description" content="See the meta before it's the meta. Tracking pump.fun and Solana narratives in real-time." />
  <meta property="og:image" content="https://tycho.xyz/images/og-image.jpg" />
  <meta property="og:type" content="website" />
  
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Tycho Narrative Radar" />
  <meta name="twitter:description" content="See the meta before it's the meta. Tracking pump.fun and Solana narratives in real-time." />
  <meta name="twitter:image" content="https://tycho.xyz/images/og-image.jpg" />
</svelte:head>



<div class="rail" aria-hidden="true">
  <div class="rail-track">
    <div class="rail-fill" id="railFill"></div>
    <div class="rail-dot" id="railDot"></div>
  </div>
  <span class="rail-label mono">signal</span>
</div>

<footer class="reveal-footer">
  <div class="reveal-bg" aria-hidden="true">
        <svg viewBox="0 0 1600 800" preserveAspectRatio="xMidYMid slice">
        <polyline class="rbg-line" points="0,509.1 200,506.0 400,501.1 600,503.9 800,497.7 1000,505.1 1200,492.7 1400,493.1 1600,494.9" fill="none" stroke="var(--state-active)" stroke-width="1.3" opacity="0.26" stroke-linecap="round" stroke-linejoin="round" style="--base-op:0.26; animation-delay:1.95s; animation-duration:6.4s;"/>
        <polyline class="rbg-line" points="0,645.9 200,645.5 400,646.4 600,643.1 800,641.5 1000,633.9 1200,633.1 1400,635.9 1600,626.1" fill="none" stroke="var(--state-active)" stroke-width="1.3" opacity="0.23" stroke-linecap="round" stroke-linejoin="round" style="--base-op:0.23; animation-delay:0.78s; animation-duration:7.7s;"/>
        <polyline class="rbg-line" points="0,460.9 200,466.4 400,464.0 600,459.3 800,460.6 1000,457.1 1200,463.7 1400,459.7 1600,452.8" fill="none" stroke="var(--state-quiet)" stroke-width="1.1" opacity="0.19" stroke-linecap="round" stroke-linejoin="round" style="--base-op:0.19; animation-delay:0.71s; animation-duration:8.1s;"/>
        <polyline class="rbg-line" points="0,380.7 200,375.7 400,371.6 600,381.7 800,377.4 1000,379.1 1200,373.0 1400,376.3 1600,380.8" fill="none" stroke="var(--state-quiet)" stroke-width="1.1" opacity="0.21" stroke-linecap="round" stroke-linejoin="round" style="--base-op:0.21; animation-delay:1.41s; animation-duration:5.6s;"/>
        <polyline class="rbg-line" points="0,688.5 200,690.7 400,686.7 600,688.3 800,685.4 1000,692.7 1200,682.2 1400,686.2 1600,689.1" fill="none" stroke="var(--state-quiet)" stroke-width="1.1" opacity="0.2" stroke-linecap="round" stroke-linejoin="round" style="--base-op:0.2; animation-delay:1.89s; animation-duration:5.6s;"/>
        <polyline class="rbg-line" points="0,67.2 200,64.3 400,66.6 600,64.8 800,61.9 1000,65.2 1200,69.6 1400,66.2 1600,59.1" fill="none" stroke="var(--state-quiet)" stroke-width="1.1" opacity="0.19" stroke-linecap="round" stroke-linejoin="round" style="--base-op:0.19; animation-delay:1.95s; animation-duration:8.0s;"/>
        <polyline class="rbg-line" points="0,552.5 200,544.3 400,535.8 600,537.8 800,531.1 1000,527.5 1200,518.4 1400,508.7 1600,497.2" fill="none" stroke="var(--state-fast)" stroke-width="1.5" opacity="0.34" stroke-linecap="round" stroke-linejoin="round" style="--base-op:0.34; animation-delay:1.38s; animation-duration:8.4s;"/>
        <polyline class="rbg-line" points="0,242.5 200,239.1 400,247.7 600,246.4 800,245.5 1000,240.7 1200,238.5 1400,233.1 1600,235.2" fill="none" stroke="var(--state-quiet)" stroke-width="1.1" opacity="0.16" stroke-linecap="round" stroke-linejoin="round" style="--base-op:0.16; animation-delay:2.17s; animation-duration:8.2s;"/>
        <polyline class="rbg-line" points="0,733.8 200,726.1 400,732.1 600,731.2 800,731.3 1000,724.1 1200,717.4 1400,722.0 1600,723.6" fill="none" stroke="var(--state-active)" stroke-width="1.3" opacity="0.24" stroke-linecap="round" stroke-linejoin="round" style="--base-op:0.24; animation-delay:0.36s; animation-duration:7.1s;"/>
        <polyline class="rbg-line" points="0,116.1 200,108.0 400,101.2 600,95.5 800,85.7 1000,82.9 1200,73.3 1400,73.6 1600,62.2" fill="none" stroke="var(--state-fast)" stroke-width="1.5" opacity="0.42" stroke-linecap="round" stroke-linejoin="round" style="--base-op:0.42; animation-delay:0.55s; animation-duration:5.3s;"/>
        <polyline class="rbg-line" points="0,23.1 200,16.0 400,24.4 600,16.6 800,16.7 1000,16.2 1200,19.7 1400,21.9 1600,19.0" fill="none" stroke="var(--state-quiet)" stroke-width="1.1" opacity="0.18" stroke-linecap="round" stroke-linejoin="round" style="--base-op:0.18; animation-delay:1.07s; animation-duration:7.2s;"/>
        <polyline class="rbg-line" points="0,200.9 200,193.9 400,193.6 600,189.7 800,182.9 1000,186.6 1200,179.9 1400,177.5 1600,179.9" fill="none" stroke="var(--state-active)" stroke-width="1.3" opacity="0.31" stroke-linecap="round" stroke-linejoin="round" style="--base-op:0.31; animation-delay:0.12s; animation-duration:7.6s;"/>
        <polyline class="rbg-line" points="0,424.7 200,424.5 400,415.0 600,414.9 800,417.9 1000,412.0 1200,411.4 1400,413.6 1600,417.4" fill="none" stroke="var(--state-quiet)" stroke-width="1.1" opacity="0.14" stroke-linecap="round" stroke-linejoin="round" style="--base-op:0.14; animation-delay:0.17s; animation-duration:8.2s;"/>
        <polyline class="rbg-line" points="0,334.8 200,326.5 400,313.3 600,307.2 800,308.2 1000,295.0 1200,290.1 1400,284.1 1600,281.7" fill="none" stroke="var(--state-fast)" stroke-width="1.5" opacity="0.31" stroke-linecap="round" stroke-linejoin="round" style="--base-op:0.31; animation-delay:1.99s; animation-duration:5.7s;"/>
        <polyline class="rbg-line" points="0,160.1 200,149.7 400,134.9 600,131.1 800,122.7 1000,114.6 1200,104.3 1400,93.5 1600,81.1" fill="none" stroke="var(--state-breakout)" stroke-width="2" opacity="0.61" stroke-linecap="round" stroke-linejoin="round" style="--base-op:0.61; animation-delay:0.48s; animation-duration:5.2s;"/>
        <polyline class="rbg-line" points="0,597.8 200,593.3 400,597.1 600,601.2 800,595.2 1000,588.2 1200,592.4 1400,595.2 1600,584.5" fill="none" stroke="var(--state-quiet)" stroke-width="1.1" opacity="0.14" stroke-linecap="round" stroke-linejoin="round" style="--base-op:0.14; animation-delay:0.15s; animation-duration:8.4s;"/>
        <polyline class="rbg-line" points="0,288.8 200,288.2 400,281.1 600,280.9 800,287.1 1000,285.2 1200,281.6 1400,280.2 1600,284.4" fill="none" stroke="var(--state-quiet)" stroke-width="1.1" opacity="0.22" stroke-linecap="round" stroke-linejoin="round" style="--base-op:0.22; animation-delay:0.69s; animation-duration:6.1s;"/>
        <polyline class="rbg-line" points="0,776.5 200,781.9 400,781.8 600,770.4 800,777.5 1000,776.6 1200,770.8 1400,775.8 1600,775.2" fill="none" stroke="var(--state-quiet)" stroke-width="1.1" opacity="0.19" stroke-linecap="round" stroke-linejoin="round" style="--base-op:0.19; animation-delay:0.29s; animation-duration:6.4s;"/>
      </svg>
  </div>
  <div class="reveal-inner">
    <span class="reveal-kicker mono">narrative radar — no login, always live</span>
    <h2 class="reveal-word">TYCHO</h2>
    <h3 class="mono" style="font-size: clamp(18px, 4vw, 24px); letter-spacing: 0.15em; color: var(--text-secondary); font-weight: 500; margin-top: -15px; margin-bottom: 24px;">NARRATIVE RADAR</h3>
    <p class="reveal-stat mono">6 narratives forming right now · 1 breaking out</p>
    <a href="/radar" class="reveal-cta">Open the radar</a>
  </div>
</footer>

<div class="page-wrapper">

  <nav>
    <!-- Kiri: Brand Logo -->
    <div class="brand" style="flex: 1; align-items: center;">
      <a href="/" class="hover:opacity-80 transition-opacity flex items-center">
        <img src="/images/logo.png" alt="Tycho Logo" style="height: 48px; width: auto; margin-right: 14px;"/>
      </a>
      <span class="kicker mono" style="margin-top: 6px;">narrative radar</span>
    </div>
    
    <!-- Tengah: Track Record -->
    <div style="flex: 1; text-align: center;">
      <a href="/track-record" class="nav-link mono">track record</a>
    </div>
    
    <!-- Kanan: Radar + X -->
    <div style="flex: 1; display: flex; align-items: center; justify-content: flex-end; gap: 24px;">
      <a href="/radar" class="nav-link mono">/radar →</a>
      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" class="nav-link" style="display: flex; align-items: center; color: var(--text-primary);">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </a>
    </div>
  </nav>

  <section class="hero spotlight-container" style="position: relative;">
    <!-- Faint background logo (Full coverage wrapper so mask coords match hero) -->
    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; overflow: hidden;">
      <img src="/images/logo.png" alt="" style="position: absolute; top: -10%; right: -10%; width: 75%; max-width: 900px; height: auto; filter: grayscale(100%); opacity: 0.03; mix-blend-mode: screen;" />
    </div>
    
    <!-- Revealed flashlight logo (Full coverage wrapper) -->
    <div class="mobile-spotlight-anim" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; overflow: hidden; -webkit-mask-image: radial-gradient(circle 350px at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 100%); mask-image: radial-gradient(circle 350px at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 100%);">
      <img src="/images/logo.png" alt="" style="position: absolute; top: -10%; right: -10%; width: 75%; max-width: 900px; height: auto; filter: grayscale(100%); opacity: 0.35; mix-blend-mode: screen;" />
    </div>

    <div class="hero-topline" style="position: relative; z-index: 1;">
      <div class="meta-block mono">
        <span class="meta-label">tracking</span>
        <span class="meta-value">pump.fun · solana</span>
      </div>
      <a href="/radar" class="pill-tag mono"><i></i>narrative radar +</a>
    </div>

    <div class="hero-main" style="position: relative; z-index: 1;">
      <div>
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
          <span class="pill-tag mono" style="padding: 4px 10px; font-size: 11px; border-color: var(--accent); color: var(--text-primary); cursor: default;">
            <i style="background: var(--state-breakout); margin-right: 6px;"></i>live
          </span>
          <button type="button" class="ca-copy-btn mono" onclick={copyCA}>
            <span style="opacity: 0.5;">CA:</span>
            <span>{caToCopy.slice(0,6)}...{caToCopy.slice(-4)}</span>
            <span class="copy-feedback" class:active={copiedCA}>{copiedCA ? 'copied!' : 'copy'}</span>
          </button>
        </div>
        <p class="hero-eyebrow mono">no login required</p>
        <h1 id="heroHeadline">See the meta before it's the meta.</h1>
        <p>Every new Pump.fun launch gets read for what it means, not what it costs, then grouped with the others that mean the same thing. Most groups stay quiet. Watch for the one that doesn't.</p>
        <div class="mt-[10px]">
          <TokenLookup />
          <a href="/radar" class="cta-secondary mono !ml-0 opacity-70 hover:opacity-100" style="display: block; margin-top: -12px;">or just open /radar →</a>
        </div>
      </div>

      <div class="hero-signals" aria-hidden="true">
        <svg viewBox="0 0 470 320" preserveAspectRatio="xMidYMid meet">
          <polyline points="0,22 40,19 80,21 120,18 160,20 200,22 240,19 280,21 320,20 360,18 380,19" fill="none" stroke="var(--state-quiet)" stroke-width="1.2" opacity="0.4" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="0,48 40,45 80,47 120,49 160,46 200,44 240,47 280,45 320,48 360,46 380,47" fill="none" stroke="var(--state-quiet)" stroke-width="1.2" opacity="0.35" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="0,73 40,71 80,74 120,72 160,70 200,73 240,71 280,74 320,72 360,71 380,73" fill="none" stroke="var(--state-quiet)" stroke-width="1.2" opacity="0.4" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="0,100 40,99 80,100 120,97 160,95 200,96 240,93 280,92 320,90 360,89 380,88" fill="none" stroke="var(--state-active)" stroke-width="1.4" opacity="0.55" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="0,126 40,123 80,125 120,127 160,124 200,122 240,125 280,123 320,126 360,124 380,125" fill="none" stroke="var(--state-quiet)" stroke-width="1.2" opacity="0.3" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="0,152 40,150 80,151 120,146 160,142 200,136 240,130 280,126 320,120 360,116 380,112" fill="none" stroke="var(--state-fast)" stroke-width="1.6" opacity="0.7" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="0,178 40,175 80,177 120,179 160,176 200,174 240,177 280,175 320,178 360,176 380,177" fill="none" stroke="var(--state-quiet)" stroke-width="1.2" opacity="0.35" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="0,204 40,202 80,203 120,200 160,198 200,199 240,196 280,195 320,193 360,192 380,191" fill="none" stroke="var(--state-active)" stroke-width="1.4" opacity="0.5" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline id="breakoutLine" points="0,230 40,228 80,229 120,220 160,208 200,192 240,174 280,158 320,144 360,134 380,128" fill="none" stroke="var(--state-breakout)" stroke-width="2.4" opacity="1" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="0,256 40,253 80,255 120,257 160,254 200,252 240,255 280,253 320,256 360,254 380,255" fill="none" stroke="var(--state-quiet)" stroke-width="1.2" opacity="0.3" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="0,282 40,280 80,281 120,276 160,271 200,264 240,258 280,252 320,246 360,241 380,236" fill="none" stroke="var(--state-fast)" stroke-width="1.6" opacity="0.6" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="0,308 40,305 80,307 120,309 160,306 200,304 240,307 280,305 320,308 360,306 380,307" fill="none" stroke="var(--state-quiet)" stroke-width="1.2" opacity="0.35" stroke-linecap="round" stroke-linejoin="round"/>
          <circle id="heroPulse" cx="0" cy="230" r="3.5" fill="var(--state-breakout)"/>
          <line x1="380" y1="128" x2="404" y2="112" stroke="var(--state-breakout)" stroke-width="0.75" opacity="0.6"/>
          <text x="408" y="110" class="annotation-label">+340%</text>
        </svg>
      </div>
    </div>
  </section>

  <div class="trace-divider" aria-hidden="true">
    <svg viewBox="0 0 680 28" preserveAspectRatio="none">
      <polyline points="0,16 60,15 120,17 180,14 240,16 300,18 360,13 420,16 480,15 540,17 600,14 680,16" fill="none" stroke="var(--divider)" stroke-width="1"/>
    </svg>
  </div>

  <p class="eyebrow-rule">at a glance</p>
  <div class="stats reveal-up">
    <div class="stat"><div class="stat-n mono">3</div><p>signals read per launch — name, ticker, image</p></div>
    <div class="stat"><div class="stat-n mono">&lt;5<span style="font-size:0.5em">min</span></div><p>from launch to grouped into a theme</p></div>
    <div class="stat"><div class="stat-n mono">0</div><p>logins required to watch the radar</p></div>
  </div>

  <section class="section reveal-left">
    <p class="section-label mono"><svg viewBox="0 0 40 14" width="40" height="14"><polyline points="0,10 10,9 20,7 30,8 40,4" fill="none" stroke="currentColor" stroke-width="1"/></svg>what it reads</p>
    <div class="section-body">
      <p>Every launch is just three small signals — a name, a ticker, an image. Alone, none of them mean much. Tycho reads all of them anyway, the moment they go live, and starts asking one question: what does this look like it's part of.</p>
    </div>
  </section>

  <section class="section reveal-right">
    <p class="section-label mono"><svg viewBox="0 0 40 14" width="40" height="14"><polyline points="0,12 10,10 20,11 30,5 40,3" fill="none" stroke="currentColor" stroke-width="1"/></svg>what forms</p>
    <div class="section-body">
      <p>Most groups stay small — a handful of tokens, a passing joke, gone within the hour. A few don't stop. They widen, they brighten, and by the time everyone's calling it a meta, Tycho already has an hour of its shape on record.</p>
    </div>
  </section>

  <p class="eyebrow-rule">how it works</p>
  <section class="proc" id="howProc">
    <div class="proc-sticky">
      <div class="proc-grid" style="position: relative; z-index: 1;">
        <ol class="proc-steps" id="procSteps">
          <li class="proc-step" data-n="01">
            <h3>Every launch gets read</h3>
            <p>Name, ticker, and image, the moment it goes live on Pump.fun.</p>
          </li>
          <li class="proc-step" data-n="02">
            <h3>Similar ones get grouped</h3>
            <p>By theme, automatically, not by chart or by hand.</p>
          </li>
          <li class="proc-step" data-n="03">
            <h3>The shape tells the story</h3>
            <p>A climbing trace means a narrative is forming, not a passing joke.</p>
          </li>
        </ol>
        <div class="proc-stage" id="procStage" style="position: relative; overflow: hidden; display: flex; flex-direction: column;">
          
          <!-- Radar Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-bottom: 1px solid var(--divider); font-size: 10px; font-family: var(--font-mono); color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.1em; background: rgba(0,0,0,0.2); z-index: 2;">
            <span>Narrative.Radar_OS</span>
            <span style="display: flex; align-items: center; gap: 6px;"><i style="width: 6px; height: 6px; border-radius: 50%; background: var(--state-breakout); animation: pulseRadarDot 2s infinite;"></i> LIVE TRACKING</span>
          </div>
          
          <!-- Background Grid & Sweep -->
          <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px); background-size: 24px 24px; z-index: 0; pointer-events: none;"></div>
          <div class="radar-sweep" style="position: absolute; top: -100%; left: 0; width: 100%; height: 100%; background: linear-gradient(to bottom, transparent, rgba(62,191,176,0.1) 100%); border-bottom: 1px solid rgba(62,191,176,0.4); z-index: 0; pointer-events: none; animation: scanRadar 4s linear infinite;"></div>
          
          <!-- Corner Reticles -->
          <div style="position: absolute; top: 46px; left: 14px; width: 12px; height: 12px; border-top: 1px solid var(--text-tertiary); border-left: 1px solid var(--text-tertiary); opacity: 0.6; z-index: 2;"></div>
          <div style="position: absolute; top: 46px; right: 14px; width: 12px; height: 12px; border-top: 1px solid var(--text-tertiary); border-right: 1px solid var(--text-tertiary); opacity: 0.6; z-index: 2;"></div>
          <div style="position: absolute; bottom: 14px; left: 14px; width: 12px; height: 12px; border-bottom: 1px solid var(--text-tertiary); border-left: 1px solid var(--text-tertiary); opacity: 0.6; z-index: 2;"></div>
          <div style="position: absolute; bottom: 14px; right: 14px; width: 12px; height: 12px; border-bottom: 1px solid var(--text-tertiary); border-right: 1px solid var(--text-tertiary); opacity: 0.6; z-index: 2;"></div>

          <div style="position: relative; flex: 1; width: 100%; z-index: 1;">
            <div class="proc-panel" data-panel="0">
              <span class="proc-tag mono">reading</span>
              <svg viewBox="0 0 220 160" width="70%">
                <polyline id="procReadLine" points="20,90 70,88 120,91" fill="none" stroke="var(--state-quiet)" stroke-width="1.6" stroke-linecap="round"/>
                <circle cx="120" cy="91" r="3.5" fill="var(--state-quiet)" id="procReadDot"/>
              </svg>
            </div>
            <div class="proc-panel" data-panel="1">
              <span class="proc-tag mono">grouping</span>
              <svg viewBox="0 0 220 160" width="70%">
                <line class="proc-group-line" x1="60" y1="50" x2="110" y2="85" stroke="var(--divider)" stroke-width="1"/>
                <line class="proc-group-line" x1="160" y1="55" x2="110" y2="85" stroke="var(--divider)" stroke-width="1"/>
                <line class="proc-group-line" x1="55" y1="120" x2="110" y2="85" stroke="var(--divider)" stroke-width="1"/>
                <line class="proc-group-line" x1="155" y1="115" x2="110" y2="85" stroke="var(--divider)" stroke-width="1"/>
                <circle class="proc-group-dot" cx="60" cy="50" r="4" fill="var(--state-active)"/>
                <circle class="proc-group-dot" cx="160" cy="55" r="4" fill="var(--state-active)"/>
                <circle class="proc-group-dot" cx="55" cy="120" r="4" fill="var(--state-active)"/>
                <circle class="proc-group-dot" cx="155" cy="115" r="4" fill="var(--state-active)"/>
                <circle cx="110" cy="85" r="6" fill="var(--state-active)" opacity="0.85"/>
              </svg>
            </div>
            <div class="proc-panel" data-panel="2">
              <span class="proc-tag mono">breaking out</span>
              <svg viewBox="0 0 220 160" width="70%">
                <polyline id="procBreakLine" points="10,130 40,126 70,118 100,98 130,72 160,48 190,32" fill="none" stroke="var(--state-breakout)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="190" cy="32" r="4" fill="var(--state-breakout)" id="procBreakDot"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="trace-divider" aria-hidden="true">
    <svg viewBox="0 0 680 28" preserveAspectRatio="none">
      <polyline points="0,16 60,17 120,14 180,16 240,13 300,16 360,18 420,15 480,16 540,14 600,17 680,15" fill="none" stroke="var(--divider)" stroke-width="1"/>
    </svg>
  </div>

  <section class="section reveal-left">
    <p class="section-label mono">track record</p>
    <div class="section-body">
      <p>Not just what's forming now — what already did. Every theme Tycho ever flagged as breaking out stays on public record, cooled or not.</p>
      <div class="tr-preview-list">
        <div class="tr-preview-row"><span class="tr-name">sentient toasters</span><span class="tr-peak">44 tokens</span><span class="tr-growth">+690%</span></div>
        <div class="tr-preview-row"><span class="tr-name">haunted vending machines</span><span class="tr-peak">31 tokens</span><span class="tr-growth">+510%</span></div>
        <div class="tr-preview-row"><span class="tr-name">bureaucrat frogs</span><span class="tr-peak">26 tokens</span><span class="tr-growth">+388%</span></div>
      </div>
      <p style="margin-top:16px;"><a href="/track-record" class="cta-secondary mono" style="margin-left:0;">see the full track record →</a></p>
    </div>
  </section>

  <div class="trace-divider" aria-hidden="true">
    <svg viewBox="0 0 680 28" preserveAspectRatio="none">
      <polyline points="0,16 60,17 120,14 180,16 240,13 300,16 360,18 420,15 480,16 540,14 600,17 680,15" fill="none" stroke="var(--divider)" stroke-width="1"/>
    </svg>
  </div>

  <section class="section reveal-right">
    <p class="section-label mono">who it's for</p>
    <div class="section-body">
      <p>Built for the people who'd rather catch a narrative on the way up than read about it after it's already named. No history to dig through, no wallets to track — just what's forming, right now.</p>
    </div>
  </section>

  <section class="section reveal-left">
    <p class="section-label mono"><svg viewBox="0 0 40 14" width="40" height="14"><polyline points="0,7 10,8 20,4 30,6 40,2" fill="none" stroke="currentColor" stroke-width="1"/></svg>the artifact</p>
    <div class="section-body">
      <p>Every hour, the loudest shapes get compressed into one card — the themes that grew, and by how much. Posted automatically the moment something breaks out, not just when someone remembers to share it.</p>
      <div class="mini-share-card">
        <p class="eyebrow mono">shareable artifact</p>
        <p class="card-title">Meta this hour</p>
        <ul>
          <li><span><span class="swatch" style="background:var(--state-breakout)"></span>Retro game villains</span><span class="mono">22</span></li>
          <li><span><span class="swatch" style="background:var(--state-fast)"></span>Cats in tiny hats</span><span class="mono">14</span></li>
          <li><span><span class="swatch" style="background:var(--state-fast)"></span>AI poker bots</span><span class="mono">9</span></li>
        </ul>
        <p class="card-footer">tycho.xyz/radar · generated 4:12pm</p>
      </div>
      <p style="margin-top:16px;"><a href="/track-record" class="cta-secondary mono" style="margin-left:0;">see every past breakout — track record →</a></p>
    </div>
  </section>

  <section class="final-cta reveal-up">
    <a href="/radar" class="cta-primary">Open the radar</a>
    <a href="/radar" class="cta-secondary mono">tycho.xyz/radar →</a>
  </section>

</div>

<div class="reveal-spacer"></div>



<style>
  
  
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin: 0; background: var(--bg); color: var(--text-primary); font-family: var(--font-display); line-height: 1.5; -webkit-font-smoothing: antialiased; }
  a { color: inherit; }
  a:focus-visible, button:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
  .mono { font-family: var(--font-mono); }

  /* ============ vital rail — signature left-edge scroll signal ============ */
  .rail { position: fixed; left: 16px; top: 0; bottom: 0; width: 30px; z-index: 40; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; }
  .rail-track { width: 1px; height: 42vh; background: var(--divider); position: relative; }
  .rail-fill { position: absolute; top: 0; left: 0; width: 1px; background: var(--accent); height: 0%; }
  .rail-dot { position: absolute; left: -2.5px; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); top: 0; box-shadow: 0 0 0 4px rgba(224,168,74,0.14); }
  .rail-label { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.28em; color: var(--text-tertiary); writing-mode: vertical-rl; margin-top: 16px; }
  @media (max-width: 900px) { .rail { display: none; } }

  .reveal-footer { position: fixed; bottom: 0; left: 0; right: 0; height: 100vh; z-index: 1; display: flex; align-items: center; justify-content: center; background: var(--surface); overflow: hidden; }
  .reveal-bg { position: absolute; inset: 0; z-index: 0; }
  .reveal-bg svg { width: 100%; height: 100%; display: block; }
  @keyframes rbg-breathe { 0%, 100% { opacity: var(--base-op, 0.3); } 50% { opacity: calc(var(--base-op, 0.3) * 1.7); } }
  .rbg-line { animation-name: rbg-breathe; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
  .reveal-inner { position: relative; z-index: 1; text-align: center; padding: 60px 40px; }
  .reveal-inner::before {
    content: ""; position: absolute; inset: -70px -140px; z-index: -1; border-radius: 50%;
    background: radial-gradient(ellipse 60% 65% at 50% 50%, var(--surface) 0%, rgba(10,13,18,0.7) 55%, transparent 78%);
  }
  .reveal-kicker { font-size: 12.5px; color: var(--text-tertiary); display: block; margin-bottom: 22px; }
  .reveal-signals { width: 230px; margin: 0 auto 20px; }
  :global(.reveal-signals svg) { display: block; width: 100%; height: auto; overflow: visible; }
  .reveal-word { font-size: clamp(56px, 12vw, 128px); font-weight: 700; letter-spacing: -0.01em; margin: 0; color: var(--text-primary); }
  .reveal-stat { font-size: 12.5px; color: var(--text-secondary); margin: 20px 0 30px; }
  .reveal-cta { display: inline-block; font-size: 13.5px; font-weight: 600; color: var(--bg); background: var(--accent); padding: 12px 22px; border-radius: 4px; text-decoration: none; transition: transform .2s ease; }
  .reveal-cta:hover { transform: translateY(-2px); }

  .page-wrapper { position: relative; z-index: 10; background: var(--bg); }
  .reveal-spacer { height: 100vh; }

  nav { display: flex; align-items: center; justify-content: space-between; padding: 20px 32px 20px 62px; border-bottom: 1px solid var(--divider); }
  .brand { display: flex; align-items: baseline; gap: 10px; }
  .brand .wordmark { font-size: 18px; font-weight: 700; }
  .brand .kicker { font-size: 12px; color: var(--text-tertiary); }
  .nav-link { font-size: 13px; color: var(--text-secondary); text-decoration: none; }

  .hero { max-width: 1180px; margin: 0 auto; padding: 56px 32px 60px 62px; }

  .hero-topline { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 56px; flex-wrap: wrap; gap: 16px; }
  .meta-block { display: flex; flex-direction: column; gap: 5px; font-size: 12px; }
  .meta-label { color: var(--text-tertiary); }
  .meta-value { color: var(--text-secondary); }
  .pill-tag { display: inline-flex; align-items: center; gap: 7px; font-size: 12px; color: var(--text-secondary); border: 1px solid var(--divider); padding: 8px 16px; border-radius: 20px; text-decoration: none; transition: border-color .2s ease, color .2s ease; }
  .pill-tag:hover { border-color: var(--accent); color: var(--text-primary); }
  .pill-tag i { width: 6px; height: 6px; border-radius: 50%; background: var(--state-active); display: inline-block; }

  .hero-main { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; }
  @media (max-width: 880px) { .hero-main { grid-template-columns: 1fr; gap: 36px; } }

  .hero-eyebrow { font-size: 13px; color: var(--text-tertiary); margin: 0 0 20px; }
  .hero h1 { font-family: var(--font-serif); font-weight: 400; font-size: clamp(42px, 7vw, 88px); line-height: 1.05; margin: 0 0 26px; letter-spacing: -0.005em; max-width: 13ch; min-height: 1.05em; }
  .hero p { font-size: 17px; line-height: 1.65; color: var(--text-secondary); max-width: 46ch; margin: 0 0 30px; }
  .cta-primary { display: inline-block; font-size: 14px; font-weight: 600; color: var(--bg); background: var(--accent); padding: 12px 22px; border-radius: 4px; text-decoration: none; transition: transform .2s ease; }
  .cta-primary:hover { transform: translateY(-2px); }
  .cta-secondary { display: inline-block; font-size: 14px; color: var(--text-secondary); text-decoration: none; margin-left: 18px; }

  .hero-signals { position: relative; height: 420px; }
  .hero-signals::before { content: ""; position: absolute; inset: -30px 0 -30px -10px; z-index: 0; pointer-events: none; background: radial-gradient(ellipse 60% 55% at 58% 42%, rgba(22,34,50,0.55) 0%, transparent 72%); }
  .hero-signals svg { width: 100%; height: 100%; display: block; overflow: visible; position: relative; z-index: 1; }
  .hero-signals::after { content: ""; position: absolute; inset: 0; pointer-events: none; z-index: 2; background-image: radial-gradient(circle, rgba(62,191,176,0.16) 1px, transparent 1px); background-size: 9px 9px; -webkit-mask-image: radial-gradient(ellipse 68% 58% at 55% 45%, black 0%, transparent 75%); mask-image: radial-gradient(ellipse 68% 58% at 55% 45%, black 0%, transparent 75%); }
  .annotation-label { font-family: var(--font-mono); font-size: 12px; fill: var(--state-breakout); font-weight: 600; }
  @media (max-width: 880px) { .hero-signals { height: 260px; } }

  .trace-divider { max-width: 1180px; margin: 0 auto; padding: 0 32px 0 62px; }
  .trace-divider svg { width: 100%; height: 28px; display: block; }

  /* eyebrow + rule — full width section intro used before the stat band and the procedure */
  .eyebrow-rule { display: flex; align-items: center; gap: 14px; max-width: 1180px; margin: 0 auto; padding: 0 32px 0 62px; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--text-tertiary); }
  .eyebrow-rule::after { content: ""; height: 1px; flex: 1; background: var(--divider); }

  /* stat band */
  .stats { max-width: 1180px; margin: 24px auto 0; padding: 0 32px 0 62px; display: grid; grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 780px) { .stats { grid-template-columns: 1fr; } }
  .stat { background: var(--bg); padding: 30px 26px; border-right: 1px solid var(--divider); }
  .stat:last-child { border-right: none; }
  @media (max-width: 780px) { .stat { border-right: none; border-bottom: 1px solid var(--divider); } .stat:last-child { border-bottom: none; } }
  .stat-n { font-family: var(--font-serif); font-size: clamp(34px, 4vw, 52px); line-height: 1; color: var(--text-primary); }
  .stat p { margin: 12px 0 0; font-size: 14px; color: var(--text-secondary); max-width: 28ch; }

  .section { max-width: 1180px; margin: 0 auto; padding: 50px 32px 50px 62px; display: grid; grid-template-columns: 190px 1fr; gap: 36px; }
  @media (max-width: 780px) { .section { grid-template-columns: 1fr; gap: 14px; padding-left: 32px; } }
  .section-label { font-size: 12.5px; color: var(--text-tertiary); margin: 4px 0 0; display: flex; align-items: center; gap: 10px; }
  .section-label svg { flex-shrink: 0; }
  .section-body { max-width: 640px; }
  .section-body p { font-size: 17px; line-height: 1.68; color: var(--text-secondary); margin: 0 0 16px; }
  .section-body p:last-child { margin-bottom: 0; }
  :global(.section-body p strong) { color: var(--text-primary); font-weight: 600; }

  /* ============ procedure — pinned scrollytelling for how it works ============ */
  .proc { height: 300vh; position: relative; }
  .proc-sticky { position: sticky; top: 0; height: 100vh; display: flex; align-items: center; overflow: hidden; }
  .proc-grid { display: grid; grid-template-columns: 0.85fr 1.15fr; gap: clamp(28px, 5vw, 70px); max-width: 1180px; margin: 0 auto; padding: 0 32px 0 62px; width: 100%; align-items: center; }
  @media (max-width: 880px) { .proc-grid { grid-template-columns: 1fr; } }
  .proc-steps { list-style: none; margin: 22px 0 0; padding: 0; }
  .proc-step { padding: 20px 0 20px 34px; border-top: 1px solid var(--divider); position: relative; opacity: 0.32; transition: opacity 0.4s ease; }
  .proc-step::before { content: attr(data-n); position: absolute; left: 0; top: 20px; font-family: var(--font-mono); font-size: 11px; color: var(--text-tertiary); }
  :global(.proc-step.on) { opacity: 1; }
  :global(.proc-step.on)::before { color: var(--accent); }
  .proc-step h3 { font-size: 17px; margin: 0 0 6px; font-weight: 600; }
  .proc-step p { font-size: 14.5px; color: var(--text-secondary); margin: 0; max-width: 40ch; }
  .proc-stage { border: 1px solid var(--divider); background: var(--surface); aspect-ratio: 4/3; position: relative; overflow: hidden; border-radius: 6px; }
  .proc-panel { position: absolute; inset: 0; display: grid; place-items: center; opacity: 0; transition: opacity 0.5s ease; }
  :global(.proc-panel.on) { opacity: 1; }
  .proc-tag { position: absolute; top: 14px; left: 16px; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.18em; color: var(--text-tertiary); text-transform: uppercase; }

  :global(.how-steps) { list-style: none; margin: 26px 0 0; padding: 0; display: flex; flex-direction: column; gap: 15px; }
  :global(.how-steps) li { font-size: 15px; color: var(--text-secondary); line-height: 1.55; padding-left: 30px; position: relative; }
  :global(.how-steps) b { position: absolute; left: 0; top: 0; font-family: var(--font-mono); font-size: 12px; color: var(--accent); font-weight: 600; }

  .mini-share-card { margin-top: 26px; border: 1px solid var(--divider); border-radius: 6px; padding: 18px 20px; background: var(--surface); max-width: 340px; }
  .mini-share-card .eyebrow { font-size: 11px; color: var(--text-tertiary); margin: 0 0 4px; }
  .mini-share-card .card-title { font-size: 14.5px; font-weight: 700; margin: 0 0 12px; }
  .mini-share-card ul { list-style: none; padding: 0; margin: 0 0 12px; display: flex; flex-direction: column; gap: 7px; font-size: 12.5px; }
  .mini-share-card li { display: flex; justify-content: space-between; align-items: center; }
  .mini-share-card .swatch { width: 7px; height: 7px; border-radius: 50%; margin-right: 8px; display: inline-block; }
  .mini-share-card .card-footer { font-size: 10.5px; color: var(--text-tertiary); font-family: var(--font-mono); border-top: 1px solid var(--divider); padding-top: 9px; }

  .tr-preview-list { display: flex; flex-direction: column; margin-top: 24px; border-top: 1px solid var(--divider); max-width: 560px; }
  .tr-preview-row { display: grid; grid-template-columns: 1fr 90px 110px; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid var(--divider); font-size: 13px; }
  .tr-preview-row .tr-name { color: var(--text-primary); }
  .tr-preview-row .tr-peak { font-family: var(--font-mono); color: var(--text-secondary); text-align: right; }
  .tr-preview-row .tr-growth { font-family: var(--font-mono); color: var(--state-breakout); font-weight: 600; text-align: right; }

  .final-cta { max-width: 1180px; margin: 0 auto; padding: 10px 32px 100px 62px; }

  .reveal-up, .reveal-left, .reveal-right { opacity: 0; }

  .ca-copy-btn { display: flex; align-items: center; gap: 8px; font-size: 11.5px; background: transparent; border: 1px solid var(--divider); padding: 4px 12px; border-radius: 20px; cursor: pointer; color: var(--text-primary); transition: all 0.2s; }
  .ca-copy-btn:hover { border-color: var(--accent); }
  .copy-feedback { color: var(--accent); opacity: 0.7; margin-left: 2px; }
  .copy-feedback.active { opacity: 1; font-weight: 600; }

  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    .reveal-up, .reveal-left, .reveal-right { opacity: 1 !important; }
    .rbg-line { animation: none !important; }
  }

  @media (max-width: 768px) {
    .mobile-spotlight-anim {
      -webkit-mask-image: radial-gradient(circle at center, black 0%, transparent 100%) !important;
      mask-image: radial-gradient(circle at center, black 0%, transparent 100%) !important;
      -webkit-mask-repeat: no-repeat !important;
      mask-repeat: no-repeat !important;
      -webkit-mask-position: 50% 70% !important;
      mask-position: 50% 70% !important;
      animation: pulseSpotlight 3.5s ease-in-out infinite alternate !important;
    }
  }

  @keyframes pulseSpotlight {
    0% { -webkit-mask-size: 0px 0px; mask-size: 0px 0px; }
    100% { -webkit-mask-size: 1400px 1400px; mask-size: 1400px 1400px; }
  }

  @keyframes pulseRadarDot {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  @keyframes scanRadar {
    0% { transform: translateY(0); }
    100% { transform: translateY(200%); }
  }

</style>

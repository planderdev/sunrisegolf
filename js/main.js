/* =========================================================
   SUNRISE GOLF CLUB — interactions
   GSAP parallax · AOS · Swiper · pricing tabs
   ========================================================= */
(function () {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  let lenis = null;

  /* ---------------------------------------------------------
     IMAGERY — Unsplash sources with graceful gradient fallback
  --------------------------------------------------------- */
  const SAFE = {
    range:   "photo-1535131749006-b7f58c99034b",
    screen:  "photo-1593111774240-d529f12cf4bb",
    putting: "photo-1587174486073-ae5e5cff23aa",
    bunker:  "photo-1535132011086-b8818f016104",
    lounge:  "photo-1600585154340-be6161a56a0c",
    access:  "photo-1486406146926-c627a92ad1ab",
    course:  "photo-1592919505780-303950717480",
    arch:    "photo-1500932334442-8761ee4810a7",
    range2:  "photo-1535131749006-b7f58c99034b",
    screen2: "photo-1593111774240-d529f12cf4bb",
    short:   "photo-1587174486073-ae5e5cff23aa",
    lounge2: "photo-1564013799919-ab600027ffc6",
    dawn:    "photo-1506905925346-21bda4d32df4",
    facility1: "assets/images/gallery-1.jpg",
    facility2: "assets/images/gallery-2.jpg",
    facility3: "assets/images/gallery-3.jpg",
    facility4: "assets/images/gallery-4.jpg",
    facility5: "assets/images/gallery-5.jpg",
    facility6: "assets/images/gallery-6.jpg",
    facility7: "assets/images/gallery-7.jpg",
    facility8: "assets/images/gallery-8.jpg",
    facility9: "assets/images/gallery-9.jpg"
  };
  const FALLBACK = "linear-gradient(150deg,#EFE7D9,#D8CBB4)";
  const imgUrl = (id) => id.includes("/") ? id : `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=72`;
  function paintBg(el) {
    el.style.backgroundImage = FALLBACK;
    const id = SAFE[el.dataset.bg];
    if (!id) return;
    const probe = new Image();
    probe.onload = () => { el.style.backgroundImage = `url("${imgUrl(id)}")`; };
    probe.src = imgUrl(id);
  }
  $$("[data-bg]").forEach(paintBg);

  /* ---------------------------------------------------------
     ROSE CURVE loader — r = a·cos(5θ)  (math-curve-loaders)
  --------------------------------------------------------- */
  (function rose() {
    const ghost = $("#roseGhost"), trail = $("#roseTrail");
    if (!ghost || !trail) return;
    const A = 9.2, K = 5, scale = 3.25, breath = 0.86, N = 440, pts = [];
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * Math.PI * 2;
      const r = A * breath * Math.cos(K * t);
      pts.push((50 + Math.cos(t) * r * scale).toFixed(2) + " " + (50 + Math.sin(t) * r * scale).toFixed(2));
    }
    const d = "M" + pts.join(" L");
    ghost.setAttribute("d", d);
    trail.setAttribute("d", d);
    const L = trail.getTotalLength(), T = L * 0.32;
    trail.style.strokeDasharray = `${T} ${L}`;
    if (!reduceMotion && trail.animate) {
      trail.animate([{ strokeDashoffset: 0 }, { strokeDashoffset: -L }],
        { duration: 5400, iterations: Infinity, easing: "linear" });
    } else {
      trail.style.strokeDashoffset = String(-L * 0.25);
    }
  })();

  /* ---------------------------------------------------------
     HERO VIDEO — graceful fallback
  --------------------------------------------------------- */
  const video = $("#heroVideo");
  const heroMedia = $("#heroMedia");
  if (video) {
    const fail = () => heroMedia && heroMedia.classList.add("is-failed");
    video.addEventListener("error", fail);
    video.addEventListener("stalled", () => { if (video.readyState < 2) fail(); });
    const p = video.play();
    if (p && p.catch) p.catch(() => {/* autoplay blocked: poster stays */});
  }

  /* ---------------------------------------------------------
     PRELOADER
  --------------------------------------------------------- */
  const pre = $("#preloader");
  const bar = $("#preloaderBar");
  function startHero() {
    if (typeof gsap === "undefined") return;
    const items = $$("[data-stagger]");
    if (reduceMotion) { gsap.set(items, { opacity: 1, y: 0 }); return; }
    gsap.fromTo(items, { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: "power3.out", stagger: 0.13, delay: 0.1 });
  }
  (function preload() {
    if (!pre) { startHero(); return; }
    let v = 0;
    const t = setInterval(() => {
      v += Math.max(1, Math.round((100 - v) * 0.13));
      if (v >= 100) {
        v = 100; clearInterval(t);
        setTimeout(() => { pre.classList.add("is-done"); startHero(); }, 320);
      }
      if (bar) bar.style.width = v + "%";
    }, reduceMotion ? 24 : 80);
  })();

  /* ---------------------------------------------------------
     NAV — stuck state + mobile menu
  --------------------------------------------------------- */
  const nav = $("#nav");
  const burger = $("#navBurger");
  const setStuck = () => nav.classList.toggle("is-stuck", window.scrollY > 40);
  setStuck();
  window.addEventListener("scroll", setStuck, { passive: true });
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
    if (lenis) { open ? lenis.stop() : lenis.start(); }
  });
  $$("#navLinks a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    })
  );

  /* ---------------------------------------------------------
     FLOATING MENU + Top button (crownpark style)
  --------------------------------------------------------- */
  const floating = $("#floating");
  const floatToggle = $("#floatingToggle");
  const topBtn = $("#topBtn");
  if (floating && floatToggle) {
    floatToggle.addEventListener("click", () => {
      const open = floating.classList.toggle("is-open");
      floatToggle.setAttribute("aria-expanded", String(open));
      floatToggle.setAttribute("aria-label", open ? "바로가기 닫기" : "바로가기 열기");
    });
    $$("#floatingMore a").forEach((a) => a.addEventListener("click", () => floating.classList.remove("is-open")));
  }
  if (topBtn) {
    topBtn.addEventListener("click", () => {
      if (lenis) lenis.scrollTo(0, { duration: 1.2 });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    });
    const toggleTop = () => topBtn.classList.toggle("is-shown", window.scrollY > 600);
    toggleTop();
    window.addEventListener("scroll", toggleTop, { passive: true });
  }

  /* ---------------------------------------------------------
     ABOUT — static fallback toggle (mobile / reduced motion)
  --------------------------------------------------------- */
  const aboutSec = $("#about");
  if (aboutSec) {
    const setStatic = () => aboutSec.classList.toggle("is-static", reduceMotion || window.matchMedia("(max-width:991px)").matches);
    setStatic();
    window.addEventListener("resize", setStatic);
  }

  /* ---------------------------------------------------------
     MEMBERSHIP — tab switcher (progressive enhancement)
  --------------------------------------------------------- */
  const rates = $("#rates");
  if (rates) {
    rates.classList.add("is-enhanced");
    const tabs = $$(".rates__tab", rates);
    const panels = $$(".rates__panel", rates);
    tabs.forEach((tab) =>
      tab.addEventListener("click", () => {
        const cat = tab.dataset.cat;
        tabs.forEach((t) => t.classList.toggle("is-active", t === tab));
        panels.forEach((p) => p.classList.toggle("is-active", p.dataset.panel === cat));
      })
    );
  }

  /* ---------------------------------------------------------
     FACILITIES — "Around Spots"-style filter carousel (Swiper)
  --------------------------------------------------------- */
  (function facilities() {
    const track = $("#facTrack");
    if (!track || typeof Swiper === "undefined") return;
    const FACIL = [
      { no: "01", cat: "PRACTICE", en: "Driving range",          title: "드라이빙레인지",   desc: "최대 비거리 300야드의 탁 트인 연습 공간.",             bg: "facility1" },
      { no: "02", cat: "PRACTICE", en: "Batter's box",           title: "타석",             desc: "실제 라운드 감각을 준비하는 쾌적한 타석.",             bg: "facility2" },
      { no: "03", cat: "PRACTICE", en: "Putting exercise field", title: "퍼팅연습장",       desc: "거리감과 터치를 세밀하게 다듬는 퍼팅 연습 공간.",       bg: "facility3" },
      { no: "04", cat: "PRACTICE", en: "Bunker exercise field",  title: "벙커연습장",       desc: "벙커샷을 실전처럼 반복 연습할 수 있는 전용 공간.",      bg: "facility4" },
      { no: "05", cat: "SCREEN",   en: "Screen golf",            title: "스크린골프",       desc: "다양한 코스를 즐기며 실전 감각을 이어가는 스크린 시설.", bg: "facility5" },
      { no: "06", cat: "AMENITY",  en: "Golf shop",              title: "골프샵",           desc: "엄선된 골프용품을 만날 수 있는 클럽 내 골프샵.",        bg: "facility6" },
      { no: "07", cat: "AMENITY",  en: "Restaurant & Cafe",      title: "레스토랑 & 카페",  desc: "연습 전후 여유롭게 머무를 수 있는 식음 공간.",          bg: "facility7" },
      { no: "08", cat: "AMENITY",  en: "Parking lot",            title: "주차장",           desc: "편안한 방문을 돕는 넉넉한 주차 공간.",                 bg: "facility8" },
      { no: "09", cat: "AMENITY",  en: "A steam car wash",       title: "스팀 세차장",      desc: "클럽 방문과 함께 이용할 수 있는 스팀 세차 시설.",       bg: "facility9" }
    ];
    const tabs = $$(".fac__tab");
    const progress = $("#facProgress");
    const playBtn = $("#facPlay");
    let sw = null, playing = !reduceMotion;

    const slide = (f) => `<div class="swiper-slide fac-card">
        <div class="fac-card__media"><div class="fac-card__img" data-bg="${f.bg}"></div><span class="fac-card__cat">${f.cat.charAt(0) + f.cat.slice(1).toLowerCase()}</span></div>
        <div class="fac-card__body">
          <div class="fac-card__top"><span class="fac-card__en">${f.en}</span><span class="fac-card__no">${f.no}</span></div>
          <h3>${f.title}</h3><p>${f.desc}</p>
        </div></div>`;

    function build(cat) {
      const items = cat === "ALL" ? FACIL : FACIL.filter((f) => f.cat === cat);
      if (sw) { sw.destroy(true, true); sw = null; }
      track.innerHTML = items.map(slide).join("");
      $$("[data-bg]", track).forEach(paintBg);
      sw = new Swiper(".fac-swiper", {
        slidesPerView: "auto", spaceBetween: 24, grabCursor: true,
        navigation: { prevEl: ".fac__prev", nextEl: ".fac__next" },
        loop: items.length > 2, speed: 700,
        autoplay: (reduceMotion || !playing) ? false : { delay: 3800, disableOnInteraction: false }
      });
      if (progress) {
        progress.style.width = "0%";
        sw.on("autoplayTimeLeft", (s, t, p) => { progress.style.width = ((1 - p) * 100) + "%"; });
      }
    }

    tabs.forEach((tab) =>
      tab.addEventListener("click", () => {
        if (tab.classList.contains("is-active")) return;
        tabs.forEach((t) => t.classList.toggle("is-active", t === tab));
        build(tab.dataset.cat);
      })
    );

    const playIcon = $("#facPlayIcon");
    const setPlayIcon = (p) => { if (playIcon) playIcon.className = p ? "ri-pause-line" : "ri-play-fill"; };
    if (playBtn) {
      if (reduceMotion) setPlayIcon(false);
      playBtn.addEventListener("click", () => {
        if (!sw) return;
        playing = !playing;
        if (playing) { sw.autoplay.start(); setPlayIcon(true); playBtn.setAttribute("aria-label", "자동재생 일시정지"); }
        else { sw.autoplay.stop(); if (progress) progress.style.width = "0%"; setPlayIcon(false); playBtn.setAttribute("aria-label", "자동재생 재생"); }
      });
    }

    build("ALL");
  })();

  /* ---------------------------------------------------------
     FAQ — single-open accordion
  --------------------------------------------------------- */
  const accItems = $$(".acc__item");
  accItems.forEach((item) =>
    item.addEventListener("toggle", () => {
      if (item.open) accItems.forEach((o) => { if (o !== item) o.open = false; });
    })
  );

  /* ---------------------------------------------------------
     COUNT-UP stats
  --------------------------------------------------------- */
  $$("[data-count]").forEach((el) => {
    const target = parseInt(el.dataset.count, 10);
    let done = false;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !done) {
          done = true;
          if (reduceMotion) { el.textContent = target; io.disconnect(); return; }
          const dur = 1500, t0 = performance.now();
          const tick = (now) => {
            const k = Math.min(1, (now - t0) / dur);
            el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
            if (k < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        }
      });
    }, { threshold: 0.6 });
    io.observe(el);
  });

  /* ---------------------------------------------------------
     SMOOTH SCROLL + SCROLL ANIMATIONS (cruziana-style)
     Lenis inertia · GSAP ScrollTrigger · pinned horizontal gallery
  --------------------------------------------------------- */
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    // --- Lenis buttery inertia scroll ---
    if (!reduceMotion && typeof Lenis !== "undefined") {
      lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      // smooth anchor navigation
      $$('a[href^="#"]').forEach((a) => {
        a.addEventListener("click", (e) => {
          const id = a.getAttribute("href");
          if (id.length > 1) {
            const el = document.querySelector(id);
            if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -8, duration: 1.2 }); }
          }
        });
      });
    }

    // --- top scroll-progress bar ---
    gsap.to("#scrollbar", { scaleX: 1, ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

    if (!reduceMotion) {
      // hero parallax
      gsap.to(".hero__video", { scale: 1.12, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".hero__inner", { yPercent: -8, opacity: 0.4, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

      // ABOUT "sec01" reveal — center arch image expands to fullscreen,
      // side fragments slide away, title inverts to white (desktop only)
      gsap.matchMedia().add("(min-width: 992px)", () => {
        const apin = $(".about__pin");
        if (!apin) return;
        const tl = gsap.timeline({
          scrollTrigger: { trigger: apin, start: "top top", end: "+=900", scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true }
        });
        tl.to(".about .s1, .about .s2, .about .s4, .about .s5", { xPercent: -60, opacity: 0, ease: "none" }, 0);
        tl.fromTo(".about .s3",
          { width: "24vw", height: "50vh", borderRadius: "999px 999px 0 0" },
          { width: "100vw", height: "100vh", borderRadius: 0, ease: "none" }, 0.05);
        tl.to(".about__title .eyebrow, .about__h", { color: "#fff", ease: "none" }, 0);
        tl.to(".about__lead", { color: "rgba(255,255,255,.85)", ease: "none" }, 0);
        tl.to(".about__title", { y: -30, ease: "none" }, 0);
        tl.to(".about__content", { opacity: 1, ease: "none" }, 0.45);
      });

      // pinned horizontal gallery — desktop only (gsap.matchMedia auto
      // sets up >720px and tears down below, matching the CSS breakpoint)
      const track = $("#hscrollTrack"), hscroll = $("#hscroll"), pin = $("#galleryPin");
      if (track && hscroll && pin) {
        gsap.matchMedia().add("(min-width: 721px)", () => {
          hscroll.classList.add("is-pinned");
          const amount = () => Math.max(0, track.scrollWidth - hscroll.clientWidth);
          gsap.to(track, {
            x: () => -amount(), ease: "none",
            scrollTrigger: {
              trigger: pin, start: "top top", end: () => "+=" + amount(),
              pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true
            }
          });
          return () => { hscroll.classList.remove("is-pinned"); gsap.set(track, { clearProps: "transform" }); };
        });
      }
    }

    window.addEventListener("load", () => ScrollTrigger.refresh());
  }

  /* ---------------------------------------------------------
     AOS
  --------------------------------------------------------- */
  if (typeof AOS !== "undefined") {
    AOS.init({ duration: 1000, easing: "ease-out-cubic", once: true, offset: 80, disable: reduceMotion });
  }
})();

(function(){
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- conmutador de vistas ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var views = {
    viewF: document.getElementById("viewF"),
    viewC: document.getElementById("viewC"),
    viewA: document.getElementById("viewA"),
    viewB: document.getElementById("viewB"),
    viewH: document.getElementById("viewH")
  };

  function show(id){
    Object.keys(views).forEach(function(k){ views[k].classList.toggle("is-on", k === id); });
    tabs.forEach(function(t){ t.setAttribute("aria-selected", String(t.dataset.view === id)); });
    window.scrollTo({ top: 0, behavior: "auto" });
    document.getElementById("stickB").classList.remove("up");
    closeLight();
    reveal();
  }
  tabs.forEach(function(t){ t.addEventListener("click", function(){ show(t.dataset.view); }); });
  document.querySelectorAll("[data-goto]").forEach(function(b){
    b.addEventListener("click", function(){ show(b.dataset.goto); });
  });

  /* ---------- revelado al scroll ---------- */
  var io = null;
  if ("IntersectionObserver" in window && !reduce){
    io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
  }
  function reveal(){
    var els = document.querySelectorAll(".view.is-on .rv:not(.in), .view.is-on #pathAnim:not(.in)");
    Array.prototype.forEach.call(els, function(el){
      if (io) { io.observe(el); } else { el.classList.add("in"); }
    });
  }
  reveal();

  /* ---------- rail de capítulos (Propuesta B) ---------- */
  var railLinks = Array.prototype.slice.call(document.querySelectorAll("#viewB .rail a"));
  var stick = document.getElementById("stickB");
  var heroB = document.querySelector("#viewB .heroB");

  function onScroll(){
    if (views.viewB.classList.contains("is-on")){
      if (heroB){ stick.classList.toggle("up", window.scrollY > heroB.offsetHeight * 0.75); }
      var best = null, bestTop = Infinity;
      railLinks.forEach(function(a){
        var t = document.querySelector(a.getAttribute("href"));
        if (!t) return;
        var top = Math.abs(t.getBoundingClientRect().top - 140);
        if (t.getBoundingClientRect().top < window.innerHeight * 0.6 && top < bestTop){ bestTop = top; best = a; }
      });
      railLinks.forEach(function(a){ a.classList.toggle("on", a === best); });
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- módulo de reserva (demostrativo) ---------- */
  var RATE = 690, CLEAN = 180, PORTAL = 0.152;
  // formato es-ES fijo: no dependemos de los datos de locale del navegador
  function eur(n){
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " €";
  }

  function calc(form){
    var i = new Date(form.elements.in.value), o = new Date(form.elements.out.value);
    var n = Math.round((o - i) / 86400000);
    if (!isFinite(n) || n < 1) n = 1;
    var base = n * RATE, total = base + CLEAN, save = Math.round(total * PORTAL);
    form.querySelector('[data-k="nights"]').textContent = n + (n === 1 ? " noche × " : " noches × ") + eur(RATE);
    form.querySelector('[data-k="base"]').textContent = eur(base);
    form.querySelector('[data-k="total"]').textContent = eur(total);
    form.querySelector('[data-k="save"]').textContent = "Ahorra " + eur(save) + " frente al mismo alojamiento en portales.";
  }

  /* ---------- Definitiva: el hero pasa del mediodía a la hora azul ---------- */
  var fhero  = document.getElementById("fhero");
  var slides = Array.prototype.slice.call(fhero.querySelectorAll(".fstage img"));
  var hours  = Array.prototype.slice.call(fhero.querySelectorAll(".fhours button"));
  var slide = 0, heroTimer = null;

  function setSlide(i){
    slide = i;
    slides.forEach(function(im, n){ im.classList.toggle("on", n === i); });
    hours.forEach(function(b, n){ b.setAttribute("aria-pressed", String(n === i)); });
    fhero.classList.toggle("is-night", i === 1);
  }
  function autoHero(){
    clearInterval(heroTimer);
    if (reduce) return;                       // sin movimiento automático si se pide reducirlo
    heroTimer = setInterval(function(){
      if (views.viewF.classList.contains("is-on")) setSlide((slide + 1) % slides.length);
    }, 7000);
  }
  hours.forEach(function(b, n){
    b.addEventListener("click", function(){ setSlide(n); autoHero(); });
  });
  autoHero();

  /* ---------- Definitiva: pestañas, galería y buscador ---------- */
  var ftabs = Array.prototype.slice.call(document.querySelectorAll(".ftab"));
  ftabs.forEach(function(t){
    t.addEventListener("click", function(){
      ftabs.forEach(function(o){ o.setAttribute("aria-selected", String(o === t)); });
      document.querySelectorAll("#viewF .fpanel").forEach(function(p){
        p.classList.toggle("on", p.id === t.dataset.ftab);
      });
    });
  });

  var fchips = Array.prototype.slice.call(document.querySelectorAll(".fchip"));
  var fshots = Array.prototype.slice.call(document.querySelectorAll("#fgrid button"));
  fchips.forEach(function(c){
    c.addEventListener("click", function(){
      fchips.forEach(function(o){ o.setAttribute("aria-pressed", String(o === c)); });
      var f = c.dataset.ff;
      fshots.forEach(function(s){ s.hidden = !(f === "all" || s.dataset.c === f); });
    });
  });

  var fs = document.getElementById("fsearch");
  fs.addEventListener("submit", function(e){
    e.preventDefault();
    var target = document.querySelector('[data-book="F"]');
    target.elements.in.value  = document.getElementById("f-in").value;
    target.elements.out.value = document.getElementById("f-out").value;
    target.elements.hu.value  = document.getElementById("f-g").value;
    calc(target);
    document.getElementById("f-reserva").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  });

  /* ---------- Propuesta C: pestañas de espacios ---------- */
  var htabs = Array.prototype.slice.call(document.querySelectorAll(".htab"));
  htabs.forEach(function(t){
    t.addEventListener("click", function(){
      htabs.forEach(function(o){ o.setAttribute("aria-selected", String(o === t)); });
      document.querySelectorAll("#viewH .hpanel").forEach(function(p){
        p.classList.toggle("on", p.id === t.dataset.tab);
      });
    });
  });

  /* ---------- Propuesta C: filtro de galería ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".hchip"));
  var shots = Array.prototype.slice.call(document.querySelectorAll("#hgrid button"));
  chips.forEach(function(c){
    c.addEventListener("click", function(){
      chips.forEach(function(o){ o.setAttribute("aria-pressed", String(o === c)); });
      var f = c.dataset.f;
      shots.forEach(function(s){ s.hidden = !(f === "all" || s.dataset.c === f); });
    });
  });

  /* ---------- Propuesta C: visor de fotografía ---------- */
  var light = document.getElementById("hlight");
  var lightImg = light.querySelector("img");
  var lightCap = light.querySelector(".cap");
  var lastFocus = null;

  function closeLight(){ light.classList.remove("on"); if (lastFocus) { lastFocus.focus(); lastFocus = null; } }

  // el visor sirve a las dos galerías y a las piezas de vídeo del boceto
  var media = Array.prototype.slice.call(document.querySelectorAll("#viewF .fmcard, #viewF .fvert figure"));
  media.forEach(function(m){
    m.dataset.cap = "En la web final aquí se reproduce el vídeo. En el boceto se muestra un fotograma.";
    if (m.tagName === "FIGURE") m.style.cursor = "pointer";
  });

  shots.concat(fshots, media).forEach(function(s){
    s.addEventListener("click", function(){
      lastFocus = s;
      lightImg.src = s.querySelector("img").src;
      lightImg.alt = s.querySelector("img").alt;
      lightCap.textContent = s.dataset.cap || "";
      light.classList.add("on");
      light.querySelector(".cls").focus();
    });
  });
  light.querySelector(".cls").addEventListener("click", closeLight);
  light.addEventListener("click", function(e){ if (e.target === light) closeLight(); });
  document.addEventListener("keydown", function(e){ if (e.key === "Escape") closeLight(); });

  /* ---------- Propuesta C: buscador del hero ---------- */
  var hs = document.getElementById("hsearch");
  hs.addEventListener("submit", function(e){
    e.preventDefault();
    var target = document.querySelector('[data-book="H"]');
    target.elements.in.value = document.getElementById("h-in").value;
    target.elements.out.value = document.getElementById("h-out").value;
    target.elements.hu.value = document.getElementById("h-g").value;
    calc(target);
    document.getElementById("h-reserva").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  });

  document.querySelectorAll("[data-book]").forEach(function(form){
    form.addEventListener("input", function(){ calc(form); });
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var b = form.querySelector(".bkbtn");
      var original = b.textContent;
      b.textContent = "Solicitud enviada — le respondemos hoy";
      b.disabled = true;
      setTimeout(function(){ b.textContent = original; b.disabled = false; }, 2600);
    });
    calc(form);
  });
})();

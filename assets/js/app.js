(function(){
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    var els = document.querySelectorAll(".rv:not(.in)");
    Array.prototype.forEach.call(els, function(el){
      if (io) { io.observe(el); } else { el.classList.add("in"); }
    });
  }
  reveal();

  /* ---------- módulo de reserva ---------- */
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

  /* ---------- vídeo de fondo ambiente (Vimeo/YouTube) ----------
     Cualquier elemento con [data-bg-embed] no vacío recibe un vídeo
     silencioso en bucle detrás de su fotografía. Vacío = solo foto. */
  function bgEmbedUrl(url){
    var m;
    if ((m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([\w-]{11})/))){
      var id = m[1];
      return "https://www.youtube.com/embed/" + id +
             "?autoplay=1&mute=1&loop=1&controls=0&playsinline=1&modestbranding=1&rel=0&playlist=" + id;
    }
    if ((m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)))
      return "https://player.vimeo.com/video/" + m[1] + "?background=1&autoplay=1&loop=1&muted=1";
    return url;
  }
  if (!reduce){
    Array.prototype.forEach.call(document.querySelectorAll("[data-bg-embed]"), function(el){
      var src = el.getAttribute("data-bg-embed");
      if (!src) return;                       // sin enlace todavía: se queda la foto
      var img = el.querySelector("img");
      var f = document.createElement("iframe");
      f.className = "bgvid";
      f.title = "Vídeo ambiente";
      f.setAttribute("allow", "autoplay; fullscreen");
      f.setAttribute("frameborder", "0");
      f.src = bgEmbedUrl(src);
      el.insertBefore(f, img ? img.nextSibling : el.firstChild);
    });
  }

  /* ---------- pestañas de espacios ---------- */
  var ftabs = Array.prototype.slice.call(document.querySelectorAll(".ftab"));
  ftabs.forEach(function(t){
    t.addEventListener("click", function(){
      ftabs.forEach(function(o){ o.setAttribute("aria-selected", String(o === t)); });
      document.querySelectorAll(".fpanel").forEach(function(p){
        p.classList.toggle("on", p.id === t.dataset.ftab);
      });
    });
  });

  /* ---------- filtro de galería ---------- */
  var fchips = Array.prototype.slice.call(document.querySelectorAll(".fchip"));
  var fshots = Array.prototype.slice.call(document.querySelectorAll("#fgrid button"));
  fchips.forEach(function(c){
    c.addEventListener("click", function(){
      fchips.forEach(function(o){ o.setAttribute("aria-pressed", String(o === c)); });
      var f = c.dataset.ff;
      fshots.forEach(function(s){ s.hidden = !(f === "all" || s.dataset.c === f); });
    });
  });

  /* ---------- visor de fotografía ---------- */
  var light = document.getElementById("hlight");
  var lightImg = light.querySelector("img");
  var lightFrame = light.querySelector(".frame iframe");
  var lightCap = light.querySelector(".cap");
  var lastFocus = null;

  // Convierte un enlace normal de YouTube/Vimeo en su URL para incrustar.
  function embedUrl(url){
    var m;
    if ((m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{11})/)))
      return "https://www.youtube.com/embed/" + m[1] + "?autoplay=1&rel=0";
    if ((m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)))
      return "https://player.vimeo.com/video/" + m[1] + "?autoplay=1";
    return url; // ya es una URL de incrustar
  }

  function closeLight(){
    light.classList.remove("on", "video");
    lightFrame.removeAttribute("src");
    if (lastFocus) { lastFocus.focus(); lastFocus = null; }
  }

  // el visor sirve a la galería y a las piezas de vídeo
  var media = Array.prototype.slice.call(document.querySelectorAll(".fmcard, .fvert figure"));
  media.forEach(function(m){
    m.dataset.cap = m.dataset.cap || "Vídeo de la villa";
    if (m.tagName === "FIGURE") m.style.cursor = "pointer";
  });

  fshots.concat(media).forEach(function(s){
    s.addEventListener("click", function(){
      lastFocus = s;
      lightCap.textContent = s.dataset.cap || "";
      // Si hay un enlace de vídeo (Vimeo/YouTube), se incrusta; si no, se ve la foto.
      if (s.dataset.embed) {
        lightFrame.src = embedUrl(s.dataset.embed);
        light.classList.add("on", "video");
      } else {
        lightImg.src = s.querySelector("img").src;
        lightImg.alt = s.querySelector("img").alt;
        light.classList.remove("video");
        light.classList.add("on");
      }
      light.querySelector(".cls").focus();
    });
  });
  light.querySelector(".cls").addEventListener("click", closeLight);
  light.addEventListener("click", function(e){ if (e.target === light) closeLight(); });
  document.addEventListener("keydown", function(e){ if (e.key === "Escape") closeLight(); });

  /* ---------- buscador del hero → formulario de reserva ---------- */
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

  /* ---------- formulario de reserva ---------- */
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

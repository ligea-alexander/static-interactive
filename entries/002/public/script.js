/* ---------- configuration and asset loading ---------- */
gsap.registerPlugin(ScrollTrigger, GSDevTools);

const ARTBOARD_PREVIEW_COUNT = 4;

let directions = [];
let slides = [];
let railButtons = [];
let current = 0;
let animating = false;
let panelOpen = false;
const variantState = [];
const artboardState = [];

function resolveAssetPath(assetPath) {
  if (!assetPath) return "";
  if (/^(https?:)?\/\//i.test(assetPath) || /^data:/i.test(assetPath)) return assetPath;
  const normalized = String(assetPath)
    .replace(/^\.?\//, "")
    .replace(/^\/+/, "");
  if (normalized.startsWith("entries/002/assets/")) return `assets/${normalized.slice("entries/002/assets/".length)}`;
  if (normalized.startsWith("../")) return normalized;
  if (normalized.startsWith("assets/") || normalized.startsWith("direction-")) return normalized;
  return `assets/${normalized}`;
}

async function loadSvgAsset(svgPath, container) {
  if (!svgPath || !container) return;
  try {
    const response = await fetch(resolveAssetPath(svgPath));
    if (!response.ok) throw new Error(`SVG fetch failed: ${response.status}`);
    container.innerHTML = `<div class="external-animation">${await response.text()}</div>`;
  } catch (error) {
    console.error("Could not load SVG asset:", error);
    container.innerHTML = "<p>Missing SVG asset for this direction.</p>";
  }
}

/* ---------- API data layer ---------- */
function normalizeDirection(direction, index) {
  return {
    ...direction,
    title: direction.title || `Direction ${String(index + 1).padStart(2, "0")}`,
    sketchSrc: resolveAssetPath(direction.sketchSrc),
    captionSketch: direction.captionSketch || "add sketch crop",
    captionArtboard: direction.captionArtboard || "add Illustrator export",
    artboards: Array.isArray(direction.artboards) ? direction.artboards : [],
    animations: Array.isArray(direction.animations)
      ? direction.animations.map((animation) => ({ ...animation, caption: animation.caption || "" }))
      : [],
    notes: direction.notes || "<p>No notes have been added for this direction.</p>",
  };
}

async function loadDirections() {
  try {
    const response = await fetch("../data/directions.json");
    if (!response.ok) throw new Error(`API request failed: ${response.status}`);
    const payload = await response.json();
    const records = Array.isArray(payload) ? payload : payload.directions;
    if (!Array.isArray(records)) throw new Error("API response does not contain directions");
    directions = records.map(normalizeDirection);
  } catch (error) {
    console.error("Could not load directions:", error);
    directions = [];
  }
  renderDeck();
}

/* ---------- deck rendering ---------- */
function arrowsHtml(index) {
  return `
  <button class="icon-btn variant-arrow prev" data-i="${index}" data-dir="-1" aria-label="Previous version">&#8249;</button>
  <button class="icon-btn variant-arrow next" data-i="${index}" data-dir="1" aria-label="Next version">&#8250;</button>`;
}

function renderArtboardContactSheet(index) {
  const direction = directions[index];
  const content = document.getElementById(`artboard-content-${index}`);
  if (!direction || !content) return;
  const start = artboardState[index] || 0;
  content.innerHTML = direction.artboards
    .slice(start, start + ARTBOARD_PREVIEW_COUNT)
    .map((variant) => {
      const source = resolveAssetPath(variant.src || variant.content || variant.path);
      return `<div class="artboard-cell">${variant.kind === "image" ? `<img src="${source}" alt="Illustrator artboard for ${direction.title}">` : variant.content}</div>`;
    })
    .join("");
}

function renderArtboardControls(index) {
  const direction = directions[index];
  const frame = document.getElementById(`artboard-frame-${index}`);
  if (!direction || !frame || direction.artboards.length <= ARTBOARD_PREVIEW_COUNT) return;

  frame.querySelectorAll(".artboard-arrow").forEach((button) => button.remove());
  const start = artboardState[index] || 0;
  const lastStart = Math.floor((direction.artboards.length - 1) / ARTBOARD_PREVIEW_COUNT) * ARTBOARD_PREVIEW_COUNT;
  frame.insertAdjacentHTML(
    "beforeend",
    `<button class="icon-btn artboard-arrow prev" data-i="${index}" aria-label="Previous artboards" ${start === 0 ? "disabled" : ""}>&#8249;</button>
     <button class="icon-btn artboard-arrow next" data-i="${index}" aria-label="Next artboards" ${start >= lastStart ? "disabled" : ""}>&#8250;</button>`,
  );
}

function bindArtboardControls() {
  document.querySelectorAll(".artboard-arrow").forEach((button) =>
    button.addEventListener("click", () => {
      const index = Number(button.dataset.i);
      const direction = directions[index];
      const lastStart = Math.floor((direction.artboards.length - 1) / ARTBOARD_PREVIEW_COUNT) * ARTBOARD_PREVIEW_COUNT;
      const step = button.classList.contains("next") ? ARTBOARD_PREVIEW_COUNT : -ARTBOARD_PREVIEW_COUNT;
      artboardState[index] = Math.max(0, Math.min(lastStart, (artboardState[index] || 0) + step));
      renderArtboardContactSheet(index);
      renderArtboardControls(index);
      bindArtboardControls();
    }),
  );
}

async function renderAnimationVariant(index) {
  const direction = directions[index];
  const variant = direction?.animations?.[variantState[index]?.anim];
  const container = document.getElementById(`stage-${index}`);
  const caption = document.getElementById(`caption-motion-${index}`);
  if (!variant || !container || !caption) return;
  container.innerHTML = "";
  if (variant.svgPath) {
    await loadSvgAsset(variant.svgPath, container);

    if (index === 0) {
      initPrimitiveOverlap(container);
    }
  }
  caption.textContent = variant.caption;
}

function renderDeck() {
  const trackElement = document.getElementById("track");
  const rail = document.getElementById("rail");
  if (!trackElement || !rail) return;
  trackElement.innerHTML = "";
  rail.innerHTML = "";
  variantState.length = 0;
  artboardState.length = 0;

  if (!directions.length) {
    trackElement.innerHTML = `<section class="slide"><p class="placeholder">No directions are available from the API.</p></section>`;
    slides = gsap.utils.toArray(".slide");
    railButtons = [];
    return;
  }

  directions.forEach((direction, index) => {
    const hasSketch = Boolean(direction.sketchSrc);
    const hasArtboards = direction.artboards.length > 0;
    const hasAnimations = direction.animations.length > 0;
    variantState[index] = { anim: 0 };
    artboardState[index] = 0;
    const slide = document.createElement("section");
    slide.className = "slide";
    slide.id = `slide-${index}`;
    slide.innerHTML = `
      <div class="slide-head"><p><span class="num">${String(index + 1).padStart(2, "0")}</span>${direction.title}</p><span class="dotted-rule"></span></div>
      <div class="panels">
        <figure class="panel"><div class="panel-frame sketch ${hasSketch ? "" : "placeholder"}">${hasSketch ? `<img src="${direction.sketchSrc}" alt="Sketch crop for ${direction.title}">` : `<p>Drop in the cropped sketch for ${direction.title}.</p>`}</div><figcaption><span class="mono num">fig. 1</span><span class="mono desc">${hasSketch ? direction.captionSketch : "add sketch crop"}</span></figcaption></figure>
        <figure class="panel"><div class="panel-frame artboard ${hasArtboards ? "" : "placeholder"}" id="artboard-frame-${index}"><div class="variant-content ${direction.artboards.length > 1 ? "contact-sheet" : ""}" id="artboard-content-${index}"></div></div><figcaption><span class="mono num">fig. 2</span><span class="mono desc">${hasArtboards ? direction.captionArtboard : "add Illustrator export"}</span></figcaption></figure>
      </div>
      <div class="stage"><div class="stage-body ${hasAnimations ? "" : "placeholder"}"><button class="mono read-more notes-corner" data-i="${index}">Notes on this direction</button>${hasAnimations ? `<div class="live-slot" id="stage-${index}"></div><button class="icon-btn replay-btn" data-i="${index}" aria-label="Replay animation">&#8635;</button>${direction.animations.length > 1 ? arrowsHtml(index) : ""}` : `<p>Motion behavior for ${direction.title} has not been added.</p>`}</div><div class="stage-caption"><span class="mono"><span class="num">fig. 3</span> — <span id="caption-motion-${index}">${hasAnimations ? "" : "add motion idea"}</span>. <button class="mono read-more inline-notes" data-i="${index}">Notes on this direction</button></span></div></div>`;
    trackElement.appendChild(slide);

    const railButton = document.createElement("button");
    railButton.textContent = String(index + 1).padStart(2, "0");
    railButton.dataset.i = index;
    if (index === 0) railButton.classList.add("active");
    railButton.addEventListener("click", () => gotoSlide(index));
    rail.appendChild(railButton);
    if (hasArtboards) {
      renderArtboardContactSheet(index);
      renderArtboardControls(index);
    }
  });

  bindDeckControls();
  slides = gsap.utils.toArray(".slide");
  railButtons = gsap.utils.toArray(".rail button");
}

function bindDeckControls() {
  document.querySelectorAll(".variant-arrow").forEach((button) =>
    button.addEventListener("click", () => {
      const index = Number(button.dataset.i);
      const count = directions[index].animations.length;
      variantState[index].anim = (variantState[index].anim + Number(button.dataset.dir) + count) % count;
      renderAnimationVariant(index);
    }),
  );
  document
    .querySelectorAll(".read-more")
    .forEach((button) => button.addEventListener("click", () => openPanel(Number(button.dataset.i))));
  document
    .querySelectorAll(".replay-btn")
    .forEach((button) => button.addEventListener("click", () => renderAnimationVariant(Number(button.dataset.i))));
  bindArtboardControls();
}

/* ---------- navigation ---------- */
const MOBILE_QUERY = "(max-width: 680px)";
const track = document.getElementById("track");
const hint = document.getElementById("hint");
const projectHeader = document.getElementById("project-header");

function isMobileLayout() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function measureHeader() {
  if (!projectHeader) return;
  document.documentElement.style.setProperty("--header-h", `${projectHeader.getBoundingClientRect().height}px`);
}

measureHeader();
if (document.fonts?.ready) document.fonts.ready.then(measureHeader);

function setActiveRail(index) {
  railButtons.forEach((button, buttonIndex) => button.classList.toggle("active", buttonIndex === index));
}

function gotoSlide(index) {
  if (index < 0 || index >= slides.length || animating) return;
  closePanel();
  animating = true;
  current = index;
  setActiveRail(index);
  gsap.to(track, {
    x: -index * window.innerWidth,
    duration: 0.85,
    ease: "power3.inOut",
    onComplete: () => {
      animating = false;
      renderAnimationVariant(index);
    },
  });
  if (index > 0 && hint) gsap.to(hint, { opacity: 0, duration: 0.4 });
}

function handleDeckKeydown(event) {
  if (panelOpen) {
    if (event.key === "Escape") closePanel();
    return;
  }
  if (["ArrowRight", "ArrowDown", "PageDown"].includes(event.key)) gotoSlide(current + 1);
  if (["ArrowLeft", "ArrowUp", "PageUp"].includes(event.key)) gotoSlide(current - 1);
}

const navigationMedia = gsap.matchMedia();

navigationMedia.add("(min-width: 681px)", () => {
  const observer = ScrollTrigger.observe({
    id: "direction-navigation",
    target: window,
    type: "wheel,touch",
    wheelSpeed: -1,
    tolerance: 50,
    preventDefault: true,
    ignore: "button, a, .notes-panel, .panel-overlay, .lightbox-overlay",
    onUp: () => !panelOpen && gotoSlide(current + 1),
    onDown: () => !panelOpen && gotoSlide(current - 1),
  });

  window.addEventListener("keydown", handleDeckKeydown);
  gsap.set(track, { x: -current * window.innerWidth });

  return () => {
    observer.kill();
    window.removeEventListener("keydown", handleDeckKeydown);
  };
});

navigationMedia.add(MOBILE_QUERY, () => {
  gsap.set(track, { clearProps: "transform" });
  directions.forEach((direction, index) => {
    if (direction.animations.length) renderAnimationVariant(index);
  });
});

window.addEventListener("resize", () => {
  measureHeader();
  if (!isMobileLayout()) gsap.set(track, { x: -current * window.innerWidth });
});

/* ---------- notes, lightbox, and theme ---------- */
const panel = document.getElementById("notes-panel");
const overlay = document.getElementById("panel-overlay");
function openPanel(index) {
  const direction = directions[index];
  document.getElementById("panel-num").textContent = `${String(index + 1).padStart(2, "0")} — notes`;
  document.getElementById("panel-title").textContent = direction.title;
  document.getElementById("panel-body").innerHTML = direction.notes;
  panel.classList.add("open");
  overlay.classList.add("open");
  panelOpen = true;
}
function closePanel() {
  panel.classList.remove("open");
  overlay.classList.remove("open");
  panelOpen = false;
}
document.getElementById("panel-close").addEventListener("click", closePanel);
overlay.addEventListener("click", closePanel);

const lightbox = document.getElementById("lightbox-overlay");
function closeLightbox() {
  lightbox.classList.remove("open");
  panelOpen = false;
}
document.getElementById("open-lightbox").addEventListener("click", () => {
  lightbox.classList.add("open");
  panelOpen = true;
});
document.getElementById("lightbox-close").addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

const themeButton = document.getElementById("theme-toggle");
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.getElementById("theme-icon-sun").style.display = theme === "dark" ? "none" : "block";
  document.getElementById("theme-icon-moon").style.display = theme === "dark" ? "block" : "none";
  document.getElementById("theme-tooltip").textContent =
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
}

applyTheme(localStorage.getItem("pixlbloom-theme") === "dark" ? "dark" : "light");
themeButton.addEventListener("click", () => {
  const nextTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  localStorage.setItem("pixlbloom-theme", nextTheme);
});

loadDirections().then(() => {
  if (!isMobileLayout() && slides.length) {
    gsap.set(track, { x: 0 });
    renderAnimationVariant(0);
  } else if (isMobileLayout()) {
    directions.forEach((direction, index) => {
      if (direction.animations.length) renderAnimationVariant(index);
    });
  }
});

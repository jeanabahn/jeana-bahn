let modalImages = [];
let modalImgIndex = 0;
let zoomScale = 1;
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let imgPos = { x: 0, y: 0 };
let modalTrigger = null;

function createModal() {
  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal-overlay" id="modalOverlay">
      <button class="modal-close" type="button" aria-label="Schließen">&times;</button>
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <div class="modal-img-section">
          <div class="modal-img-wrap" id="modalImgWrap" role="button" tabindex="0" aria-label="Bild vergrößern oder verkleinern">
            <img id="modalImg" src="" alt="">
          </div>
          <button class="modal-img-btn prev" id="modalPrev" type="button" aria-label="Vorheriges Bild">&#8592;</button>
          <button class="modal-img-btn next" id="modalNext" type="button" aria-label="Nächstes Bild">&#8594;</button>
          <div class="modal-thumbnails" id="modalThumbs"></div>
        </div>
        <div class="modal-content">
          <h3 id="modalTitle"></h3>
          <div class="modal-detail">
            <span class="modal-price" id="modalPriceRow"><strong>Preis:</strong> <span id="modalPreis"></span></span>
            <span><strong>Größe:</strong> <span id="modalGroesse"></span></span>
            <span><strong>Technik:</strong> <span id="modalTechnik"></span></span>
          </div>
          <a href="mailto:jeana.bahn@icloud.com" class="btn modal-request">Werk anfragen</a>
        </div>
      </div>
    </div>
  `);
}

function openWerk(id) {
  const werk = getWerk(id);
  if (!werk) return;

  modalTrigger = document.activeElement;
  modalImages = werk.bilder;
  modalImgIndex = 0;
  document.getElementById("modalTitle").textContent = werk.titel;
  document.getElementById("modalGroesse").textContent = werk.groesse;
  document.getElementById("modalTechnik").textContent = werk.technik;
  document.getElementById("modalPreis").textContent = werk.preis || "";
  document.getElementById("modalPriceRow").classList.toggle("hidden", !werk.preis);

  const thumbs = document.getElementById("modalThumbs");
  thumbs.replaceChildren(...werk.bilder.map((src, index) => {
    const image = document.createElement("img");
    image.src = src;
    image.alt = `${werk.titel}, Ansicht ${index + 1}`;
    image.addEventListener("click", () => {
      modalImgIndex = index;
      renderModalImage();
    });
    return image;
  }));

  const hasMultipleImages = werk.bilder.length > 1;
  thumbs.style.display = hasMultipleImages ? "flex" : "none";
  document.getElementById("modalPrev").classList.toggle("hidden", !hasMultipleImages);
  document.getElementById("modalNext").classList.toggle("hidden", !hasMultipleImages);

  renderModalImage();
  document.getElementById("modalOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
  document.querySelector(".modal-close").focus();
}

function renderModalImage() {
  const image = document.getElementById("modalImg");
  image.src = modalImages[modalImgIndex];
  image.alt = document.getElementById("modalTitle").textContent;
  resetZoom();
  document.querySelectorAll("#modalThumbs img").forEach((thumb, index) => {
    thumb.classList.toggle("active", index === modalImgIndex);
  });
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
  document.body.style.overflow = "";
  resetZoom();
  if (modalTrigger) modalTrigger.focus();
}

function modalSlide(direction) {
  modalImgIndex = (modalImgIndex + direction + modalImages.length) % modalImages.length;
  renderModalImage();
}

function resetZoom() {
  zoomScale = 1;
  imgPos = { x: 0, y: 0 };
  applyTransform();
  document.getElementById("modalImgWrap").classList.remove("zoomed");
}

function applyTransform() {
  document.getElementById("modalImg").style.transform =
    `translate(${imgPos.x}px, ${imgPos.y}px) scale(${zoomScale})`;
}

function initModal() {
  createModal();
  const overlay = document.getElementById("modalOverlay");
  const wrap = document.getElementById("modalImgWrap");

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay || event.target.closest(".modal-close")) closeModal();
  });
  document.getElementById("modalPrev").addEventListener("click", () => modalSlide(-1));
  document.getElementById("modalNext").addEventListener("click", () => modalSlide(1));

  wrap.addEventListener("click", () => {
    if (isDragging) return;
    zoomScale = zoomScale === 1 ? 2.5 : 1;
    wrap.classList.toggle("zoomed", zoomScale > 1);
    if (zoomScale === 1) imgPos = { x: 0, y: 0 };
    applyTransform();
  });
  wrap.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      wrap.click();
    }
  });

  wrap.addEventListener("wheel", (event) => {
    event.preventDefault();
    zoomScale = Math.min(5, Math.max(1, zoomScale - event.deltaY * 0.002));
    if (zoomScale === 1) imgPos = { x: 0, y: 0 };
    wrap.classList.toggle("zoomed", zoomScale > 1);
    applyTransform();
  }, { passive: false });

  wrap.addEventListener("mousedown", (event) => {
    if (zoomScale === 1) return;
    isDragging = false;
    dragStart = { x: event.clientX - imgPos.x, y: event.clientY - imgPos.y };

    const onMove = (moveEvent) => {
      isDragging = true;
      imgPos = { x: moveEvent.clientX - dragStart.x, y: moveEvent.clientY - dragStart.y };
      applyTransform();
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      setTimeout(() => { isDragging = false; }, 50);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });

  document.addEventListener("keydown", (event) => {
    if (!overlay.classList.contains("open")) return;
    if (event.key === "Escape") closeModal();
    if (event.key === "ArrowRight" && modalImages.length > 1) modalSlide(1);
    if (event.key === "ArrowLeft" && modalImages.length > 1) modalSlide(-1);
    if (event.key === "Tab") {
      const focusable = [...overlay.querySelectorAll(
        'button:not(.hidden), [href], [tabindex]:not([tabindex="-1"])'
      )].filter((element) => element.offsetParent !== null);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}

function initNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("mainNav");
  if (!toggle || !nav) return;

  const closeNavigation = () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.querySelector(".sr-only").textContent = "Navigation öffnen";
    nav.classList.remove("open");
  };

  toggle.addEventListener("click", () => {
    const opening = toggle.getAttribute("aria-expanded") === "false";
    toggle.setAttribute("aria-expanded", String(opening));
    toggle.querySelector(".sr-only").textContent = opening ? "Navigation schließen" : "Navigation öffnen";
    nav.classList.toggle("open", opening);
  });
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeNavigation();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) closeNavigation();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initModal();
  initNavigation();
});

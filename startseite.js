let carouselIndex = 0;
let isAnimating = false;
let originalCount = 0;
let carouselHovered = false;
let carouselFocused = false;
let slideTimer = null;
let resizeFrame = null;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function getCardStep() {
  const gallery = document.getElementById("gallery");
  const card = gallery?.querySelector(".card");
  if (!gallery || !card) return 0;

  const gap = Number.parseFloat(getComputedStyle(gallery).gap) || 20;
  return card.getBoundingClientRect().width + gap;
}

function setCarouselPosition(animate) {
  const gallery = document.getElementById("gallery");
  if (!gallery) return;

  const step = getCardStep();
  gallery.style.transition = animate ? "transform 0.45s ease" : "none";
  gallery.style.transform = `translateX(-${carouselIndex * step}px)`;
}

function slide(direction) {
  if (isAnimating || !originalCount) return;
  isAnimating = true;
  carouselIndex += direction;
  setCarouselPosition(true);

  slideTimer = setTimeout(() => {
    if (carouselIndex >= originalCount * 2) carouselIndex -= originalCount;
    if (carouselIndex < originalCount) carouselIndex += originalCount;
    setCarouselPosition(false);
    isAnimating = false;
  }, 460);
}

function handleCarouselResize() {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(() => {
    clearTimeout(slideTimer);
    isAnimating = false;

    while (carouselIndex >= originalCount * 2) carouselIndex -= originalCount;
    while (carouselIndex < originalCount) carouselIndex += originalCount;
    setCarouselPosition(false);
  });
}

function initCarousel() {
  const gallery = document.getElementById("gallery");
  if (!gallery) return;

  const cards = [...gallery.querySelectorAll(".card")];
  originalCount = cards.length;
  const appendClone = (card) => {
    const clone = card.cloneNode(true);
    clone.tabIndex = -1;
    clone.setAttribute("aria-hidden", "true");
    gallery.appendChild(clone);
  };

  cards.forEach(appendClone);
  cards.forEach(appendClone);
  carouselIndex = originalCount;
  setCarouselPosition(false);

  const images = [...gallery.querySelectorAll("img")];
  const refreshWhenImagesReady = () => {
    if (images.every((img) => img.complete)) {
      handleCarouselResize();
    }
  };

  images.forEach((img) => {
    if (img.complete) return;
    img.addEventListener("load", handleCarouselResize, { once: true });
  });

  const wrapper = document.querySelector(".carousel-wrapper");
  if (!wrapper) return;

  wrapper.addEventListener("mouseenter", () => { carouselHovered = true; });
  wrapper.addEventListener("mouseleave", () => { carouselHovered = false; });
  wrapper.addEventListener("focusin", () => { carouselFocused = true; });
  wrapper.addEventListener("focusout", (event) => {
    if (!wrapper.contains(event.relatedTarget)) carouselFocused = false;
  });
  new ResizeObserver(handleCarouselResize).observe(wrapper);
  window.addEventListener("load", refreshWhenImagesReady);

  setInterval(() => {
    const modalOpen = document.getElementById("modalOverlay").classList.contains("open");
    if (!carouselHovered && !carouselFocused && !reduceMotion && !modalOpen) slide(1);
  }, 3600);
}

function handleContact(event) {
  event.preventDefault();
  const success = document.getElementById("formSuccess");
  success.style.display = "block";
  event.target.reset();
  setTimeout(() => { success.style.display = "none"; }, 5000);
}

document.addEventListener("DOMContentLoaded", () => {
  renderWerke("gallery", "carousel");
  initCarousel();
  const prevBtn = document.querySelector(".carousel-wrapper .carousel-btn.prev");
  const nextBtn = document.querySelector(".carousel-wrapper .carousel-btn.next");
  if (prevBtn) prevBtn.addEventListener("click", () => slide(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => slide(1));
  document.querySelector(".contact-form").addEventListener("submit", handleContact);
  // Recalculate carousel when modal closes (scrollbars/layout may change)
  document.addEventListener("modalClosed", handleCarouselResize);
});

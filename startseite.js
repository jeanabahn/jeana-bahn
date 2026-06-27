let carouselIndex = 0;
let isAnimating = false;
let originalCount = 0;
let carouselHovered = false;
let carouselFocused = false;
let slideTimer = null;
let resizeFrame = null;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function getCardStep() {
  const card = document.querySelector("#gallery .card");
  return card ? card.offsetWidth + 20 : 0;
}

function setCarouselPosition(animate) {
  const gallery = document.getElementById("gallery");
  gallery.style.transition = animate ? "transform 0.45s ease" : "none";
  gallery.style.transform = `translateX(-${carouselIndex * getCardStep()}px)`;
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

  const wrapper = document.querySelector(".carousel-wrapper");
  wrapper.addEventListener("mouseenter", () => { carouselHovered = true; });
  wrapper.addEventListener("mouseleave", () => { carouselHovered = false; });
  wrapper.addEventListener("focusin", () => { carouselFocused = true; });
  wrapper.addEventListener("focusout", (event) => {
    if (!wrapper.contains(event.relatedTarget)) carouselFocused = false;
  });
  new ResizeObserver(handleCarouselResize).observe(wrapper);

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
  document.querySelector(".carousel-btn.prev").addEventListener("click", () => slide(-1));
  document.querySelector(".carousel-btn.next").addEventListener("click", () => slide(1));
  document.querySelector(".contact-form").addEventListener("submit", handleContact);
});

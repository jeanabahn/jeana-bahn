const WERKE = [
  {
    id: "wald-mit-sonne",
    titel: "Wald mit Sonne",
    bilder: ["bilder/wald-mit-sonne.jpg"],
    groesse: "80 × 80 cm",
    technik: "Öl auf Leinwand",
    preis: null
  },
  {
    id: "perlen",
    titel: "Perlen",
    bilder: ["bilder/perlen.jpg"],
    groesse: "20 × 50 cm",
    technik: "Öl auf Leinwand",
    preis: null
  },
  {
    id: "pouring-blau",
    titel: "Pouring Blau",
    bilder: ["bilder/pouring-blau.jpg"],
    groesse: "80 × 80 cm",
    technik: "Acryl Pouring",
    preis: null
  }
];

function getWerk(id) {
  return WERKE.find((werk) => werk.id === id);
}

function createWerkCard(werk, variant = "carousel") {
  const card = document.createElement("div");
  card.className = "card";
  card.tabIndex = 0;
  card.dataset.werkId = werk.id;
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", `${werk.titel} ansehen`);

  const image = document.createElement("img");
  image.src = werk.bilder[0];
  image.alt = werk.titel;
  image.loading = variant === "grid" ? "lazy" : "eager";

  const info = document.createElement("div");
  info.className = "card-info";

  const title = document.createElement("p");
  title.textContent = werk.titel;

  const details = document.createElement("div");
  details.className = "details";

  if (werk.preis) {
    const price = document.createElement("span");
    price.textContent = `Preis: ${werk.preis}`;
    details.appendChild(price);
  }

  const size = document.createElement("span");
  size.textContent = `Größe: ${werk.groesse}`;
  details.appendChild(size);

  const technique = document.createElement("span");
  technique.textContent = `Technik: ${werk.technik}`;
  details.appendChild(technique);

  info.append(title, details);
  card.append(image, info);

  return card;
}

function renderWerke(containerId, variant = "carousel") {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.replaceChildren(...WERKE.map((werk) => createWerkCard(werk, variant)));
  container.addEventListener("click", (event) => {
    const card = event.target.closest(".card");
    if (card) openWerk(card.dataset.werkId);
  });
  container.addEventListener("keydown", (event) => {
    const card = event.target.closest(".card");
    if (card && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      openWerk(card.dataset.werkId);
    }
  });
}

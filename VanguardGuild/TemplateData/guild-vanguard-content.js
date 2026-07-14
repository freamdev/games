(() => {
  "use strict";

  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  async function getJson(path) {
    const response = await fetch(path, { cache: "no-cache" });
    if (!response.ok) throw new Error(`${path} returned ${response.status}`);
    return response.json();
  }

  function setupCarousel(carousel, heroCount) {
    const previous = document.querySelector("#heroes-previous");
    const next = document.querySelector("#heroes-next");
    if (!previous || !next || heroCount < 1) return;

    const cardStep = () => {
      const card = carousel.querySelector(".character-card");
      if (!card) return carousel.clientWidth;
      const gap = Number.parseFloat(getComputedStyle(carousel).columnGap) || 24;
      return card.getBoundingClientRect().width + gap;
    };

    const middleSetStart = () => cardStep() * heroCount;
    let isResetting = false;

    // Temporarily disable smooth scrolling while moving between identical
    // duplicate sets. The user sees the same card, so the reset is invisible.
    const jumpWithoutAnimation = (left) => {
      const previousBehavior = carousel.style.scrollBehavior;
      carousel.style.scrollBehavior = "auto";
      carousel.scrollLeft = left;
      carousel.getBoundingClientRect();
      carousel.style.scrollBehavior = previousBehavior;
    };

    // Three repeated sets allow the user to keep moving in either direction.
    requestAnimationFrame(() => {
      jumpWithoutAnimation(middleSetStart());
    });

    const normalizePosition = () => {
      if (isResetting) return;

      const setWidth = middleSetStart();
      if (!setWidth) return;

      if (carousel.scrollLeft < setWidth * 0.5) {
        isResetting = true;
        jumpWithoutAnimation(carousel.scrollLeft + setWidth);
        requestAnimationFrame(() => { isResetting = false; });
      } else if (carousel.scrollLeft > setWidth * 1.5) {
        isResetting = true;
        jumpWithoutAnimation(carousel.scrollLeft - setWidth);
        requestAnimationFrame(() => { isResetting = false; });
      }
    };

    let scrollTimer;
    carousel.addEventListener("scroll", () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(normalizePosition, 90);
    }, { passive: true });

    previous.addEventListener("click", () => {
      carousel.scrollBy({ left: -cardStep(), behavior: "smooth" });
    });

    next.addEventListener("click", () => {
      carousel.scrollBy({ left: cardStep(), behavior: "smooth" });
    });

    window.addEventListener("resize", () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        jumpWithoutAnimation(middleSetStart());
      }, 120);
    });
  }

  async function loadHeroes() {
    const carousel = document.querySelector("#hero-carousel");
    if (!carousel) return;

    try {
      const heroes = await getJson("Content/heroes.json");
      const repeatedHeroes = [...heroes, ...heroes, ...heroes];

      carousel.innerHTML = repeatedHeroes.map((hero, index) => `
        <article class="character-card character-card--${escapeHtml(hero.accent || "purple")}" data-hero-id="${escapeHtml(hero.id)}" ${index < heroes.length || index >= heroes.length * 2 ? 'aria-hidden="true"' : ""}>
          <img src="${escapeHtml(hero.image)}" alt="${escapeHtml(hero.alt || hero.name)}" loading="lazy">
          <div class="character-copy">
            <span>${escapeHtml(hero.role)}</span>
            <h3>${escapeHtml(hero.name)}</h3>
            <p>${escapeHtml(hero.description)}</p>
            <div class="character-tags">
              ${(hero.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
            </div>
          </div>
        </article>
      `).join("");

      setupCarousel(carousel, heroes.length);
    } catch (error) {
      console.error(error);
      carousel.innerHTML = '<p class="content-message">Hero data could not be loaded. Serve the site through GitHub Pages or a local web server.</p>';
    }
  }

  let screenshotItems = [];
  let activeScreenshotIndex = 0;

  function showScreenshot(index) {
    if (!screenshotItems.length) return;

    activeScreenshotIndex = (index + screenshotItems.length) % screenshotItems.length;
    const item = screenshotItems[activeScreenshotIndex];
    const image = document.querySelector("#media-lightbox-image");
    const title = document.querySelector("#media-lightbox-title");
    const description = document.querySelector("#media-lightbox-description");
    const counter = document.querySelector("#media-lightbox-counter");

    image.src = item.image;
    image.alt = item.alt || item.title || "Guild Vanguard screenshot";
    title.textContent = item.title || "";
    description.textContent = item.description || "";
    counter.textContent = `${activeScreenshotIndex + 1} / ${screenshotItems.length}`;
  }

  function openLightbox(index = 0) {
    const lightbox = document.querySelector("#media-lightbox");
    if (!lightbox || !screenshotItems.length) return;

    showScreenshot(index);
    lightbox.hidden = false;
    document.body.classList.add("has-lightbox");
    document.querySelector("#media-lightbox-close")?.focus();
  }

  function closeLightbox() {
    const lightbox = document.querySelector("#media-lightbox");
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.classList.remove("has-lightbox");
  }

  async function loadScreenshots() {
    const gallery = document.querySelector("#media-gallery");
    if (!gallery) return;

    try {
      screenshotItems = await getJson("Content/screenshots.json");

      if (!screenshotItems.length) {
        gallery.innerHTML = '<p class="content-message">No screenshots have been added yet.</p>';
        return;
      }

      const first = screenshotItems[0];
      const countLabel = screenshotItems.length > 1
        ? `<span class="media-card__count">View gallery · ${screenshotItems.length} images</span>`
        : '<span class="media-card__count">View screenshot</span>';

      gallery.innerHTML = `
        <button class="media-card media-card--featured" type="button" aria-label="Open screenshot gallery">
          <img src="${escapeHtml(first.image)}" alt="${escapeHtml(first.alt || first.title)}" loading="lazy">
          <span class="media-card__copy">
            <strong>${escapeHtml(first.title)}</strong>
            <span>${escapeHtml(first.description || "")}</span>
            ${countLabel}
          </span>
        </button>
      `;

      gallery.querySelector(".media-card")?.addEventListener("click", () => openLightbox(0));
    } catch (error) {
      console.error(error);
      gallery.innerHTML = '<p class="content-message">Screenshot data could not be loaded. Serve the site through GitHub Pages or a local web server.</p>';
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadHeroes();
    loadScreenshots();

    document.querySelector("#media-lightbox-close")?.addEventListener("click", closeLightbox);
    document.querySelector("#media-lightbox-previous")?.addEventListener("click", () => showScreenshot(activeScreenshotIndex - 1));
    document.querySelector("#media-lightbox-next")?.addEventListener("click", () => showScreenshot(activeScreenshotIndex + 1));

    document.querySelector("#media-lightbox")?.addEventListener("click", (event) => {
      if (event.target.id === "media-lightbox") closeLightbox();
    });

    document.addEventListener("keydown", (event) => {
      const lightbox = document.querySelector("#media-lightbox");
      if (!lightbox || lightbox.hidden) return;

      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") showScreenshot(activeScreenshotIndex - 1);
      if (event.key === "ArrowRight") showScreenshot(activeScreenshotIndex + 1);
    });
  });
})();

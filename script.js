const makeRange = (start, end) =>
  Array.from({ length: end - start + 1 }, (_, index) => start + index);

const projects = {
  about: {
    label: "ABOUT ME",
    pages: [2],
    chapters: ["关于我 · 经历与技能"],
  },
  yuanjian: {
    label: "缘见 APP · UI/UX REDESIGN",
    pages: makeRange(3, 22),
    chapters: [
      "项目封面",
      "体验再定位",
      "用户反馈",
      "问题拆解",
      "竞品分析",
      "业务聚焦",
      "设计目标",
      "用户访谈",
      "情绪版",
      "视觉语言",
      "品牌色",
      "视觉呈现",
      "社交路径",
      "推荐页迭代",
      "滑动反馈",
      "消息页重构",
      "激励体系",
      "页面速览",
      "项目复盘",
      "经验梳理",
    ],
  },
  lucky: {
    label: "LUCKY 拉奇 · IP DESIGN",
    pages: makeRange(23, 34),
    chapters: [
      "IP 项目封面",
      "拉奇的故事",
      "形象特征",
      "角色三视图",
      "三维动作",
      "缺省页设计",
      "夏日造型",
      "户外造型",
      "宅家场景",
      "露营场景",
      "徽章与抱枕",
      "贴纸与 ID 卡",
    ],
  },
};

const tallPageHeights = {
  7: 1500,
  10: 2000,
  15: 1991,
  16: 1585,
  17: 1625,
  18: 1621,
  20: 2000,
  27: 1591,
  28: 1824,
};

const pagePath = (page) => `assets/portfolio/page-${String(page).padStart(2, "0")}.jpg`;
const pageHeight = (page) => tallPageHeights[page] || 1350;

function renderGalleries() {
  document.querySelectorAll("[data-gallery]").forEach((gallery) => {
    const key = gallery.dataset.gallery;
    const project = projects[key];

    gallery.innerHTML = project.pages
      .map((page, index) => {
        const localNumber = String(index + 1).padStart(2, "0");
        const sourceNumber = String(page).padStart(2, "0");
        const chapter = project.chapters[index];
        return `
          <figure class="artwork" data-project="${key}" data-index="${index}">
            <button
              class="artwork-button"
              type="button"
              data-open-project="${key}"
              data-open-index="${index}"
              data-cursor="VIEW"
              aria-label="全屏查看：${chapter}"
            >
              <img
                src="${pagePath(page)}"
                alt="${project.label}：${chapter}"
                width="2400"
                height="${pageHeight(page)}"
                loading="lazy"
                decoding="async"
              />
            </button>
            <figcaption><span>${localNumber} / ${String(project.pages.length).padStart(2, "0")}</span><span>${chapter} · 原排版 ${sourceNumber}</span></figcaption>
          </figure>`;
      })
      .join("");
  });
}

renderGalleries();

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function startIntro() {
  const count = document.querySelector(".intro-count");
  const duration = reduceMotion ? 1 : 760;
  const startedAt = performance.now();

  function update(now) {
    const progress = Math.min((now - startedAt) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    count.textContent = String(Math.max(1, Math.round(1 + eased * 34))).padStart(2, "0");

    if (progress < 1) {
      requestAnimationFrame(update);
      return;
    }

    window.setTimeout(() => {
      document.body.classList.add("is-ready");
      document.body.classList.remove("is-loading");
      window.setTimeout(() => document.querySelector("#intro")?.remove(), reduceMotion ? 10 : 950);
    }, reduceMotion ? 0 : 160);
  }

  requestAnimationFrame(update);
}

if (document.readyState === "complete") {
  startIntro();
} else {
  window.addEventListener("load", startIntro, { once: true });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { rootMargin: "0px 0px -10%", threshold: 0.08 },
);

document.querySelectorAll("[data-reveal]").forEach((element) => revealObserver.observe(element));

const artworkObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const artwork = entry.target;
      const gallery = artwork.closest("[data-gallery]");
      const section = gallery.closest(".case-study");
      const currentIndex = Number(artwork.dataset.index);
      const project = projects[artwork.dataset.project];

      gallery.querySelectorAll(".artwork.is-current").forEach((item) => item.classList.remove("is-current"));
      artwork.classList.add("is-current", "is-seen");
      section.querySelector("[data-current]").textContent = String(currentIndex + 1).padStart(2, "0");
      section.querySelector("[data-chapter]").textContent = project.chapters[currentIndex];
    });
  },
  { rootMargin: "-26% 0px -56%", threshold: 0 },
);

document.querySelectorAll(".artwork").forEach((artwork) => artworkObserver.observe(artwork));

document.querySelectorAll("[data-gallery-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const gallery = document.querySelector(`[data-gallery="${button.dataset.galleryToggle}"]`);
    const isGrid = gallery.classList.toggle("view-grid");
    button.setAttribute("aria-pressed", String(isGrid));
    button.querySelector("span").textContent = isGrid ? "叙事视图" : "网格视图";
    button.querySelector("i").textContent = isGrid ? "☷" : "▦";
  });
});

const lightbox = document.querySelector("#lightbox");
const lightboxImage = lightbox.querySelector("[data-lightbox-image]");
const lightboxProject = lightbox.querySelector("[data-lightbox-project]");
const lightboxIndex = lightbox.querySelector("[data-lightbox-index]");
const lightboxCaption = lightbox.querySelector("[data-lightbox-caption]");
let activeProject = "yuanjian";
let activeIndex = 0;

function updateLightbox() {
  const project = projects[activeProject];
  const page = project.pages[activeIndex];
  lightboxImage.classList.remove("is-zoomed");
  lightboxImage.src = pagePath(page);
  lightboxImage.alt = `${project.label}：${project.chapters[activeIndex]}`;
  lightboxProject.textContent = project.label;
  lightboxIndex.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(project.pages.length).padStart(2, "0")}`;
  lightboxCaption.textContent = `${project.chapters[activeIndex]} · 作品集原排版 ${String(page).padStart(2, "0")}`;
}

function openLightbox(projectKey, index) {
  activeProject = projectKey;
  activeIndex = Number(index);
  updateLightbox();
  if (!lightbox.open) lightbox.showModal();
}

function moveLightbox(direction) {
  const length = projects[activeProject].pages.length;
  activeIndex = (activeIndex + direction + length) % length;
  updateLightbox();
}

document.addEventListener("click", (event) => {
  const projectButton = event.target.closest("[data-open-project]");
  if (projectButton) {
    openLightbox(projectButton.dataset.openProject, projectButton.dataset.openIndex);
    return;
  }

  const singlePageButton = event.target.closest("[data-page]");
  if (singlePageButton) {
    openLightbox("about", 0);
  }
});

lightbox.querySelector("[data-lightbox-close]").addEventListener("click", () => lightbox.close());
lightbox.querySelector("[data-lightbox-prev]").addEventListener("click", () => moveLightbox(-1));
lightbox.querySelector("[data-lightbox-next]").addEventListener("click", () => moveLightbox(1));
lightboxImage.addEventListener("click", () => lightboxImage.classList.toggle("is-zoomed"));
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});

document.addEventListener("keydown", (event) => {
  if (!lightbox.open) return;
  if (event.key === "ArrowLeft") moveLightbox(-1);
  if (event.key === "ArrowRight") moveLightbox(1);
});

const menuButton = document.querySelector(".menu-toggle");
menuButton.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("menu-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".site-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

let ticking = false;
function updateScrollEffects() {
  const scrollTop = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
  document.querySelector(".scroll-progress span").style.transform = `scaleX(${progress})`;

  const heroOffset = Math.min(scrollTop * 0.22, window.innerHeight * 0.25);
  document.querySelector(".hero").style.setProperty("--hero-y", `${heroOffset}px`);
  ticking = false;
}

window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      requestAnimationFrame(updateScrollEffects);
      ticking = true;
    }
  },
  { passive: true },
);
updateScrollEffects();

document.querySelectorAll("[data-tilt]").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    if (reduceMotion) return;
    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    card.style.setProperty("--rx", `${(0.5 - y) * 5}deg`);
    card.style.setProperty("--ry", `${(x - 0.5) * 5}deg`);
    card.style.setProperty("--mx", `${x * 100}%`);
    card.style.setProperty("--my", `${y * 100}%`);
  });

  card.addEventListener("pointerleave", () => {
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
  });
});

document.querySelectorAll(".magnetic").forEach((element) => {
  element.addEventListener("pointermove", (event) => {
    if (reduceMotion || window.matchMedia("(pointer: coarse)").matches) return;
    const bounds = element.getBoundingClientRect();
    const x = event.clientX - bounds.left - bounds.width / 2;
    const y = event.clientY - bounds.top - bounds.height / 2;
    element.style.transform = `translate(${x * 0.13}px, ${y * 0.13}px)`;
  });
  element.addEventListener("pointerleave", () => {
    element.style.transform = "translate(0, 0)";
  });
});

const cursor = document.querySelector(".cursor");
const cursorText = cursor.querySelector("span");
let pointerX = -100;
let pointerY = -100;
let cursorX = -100;
let cursorY = -100;
let cursorActive = false;

if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduceMotion) {
  document.body.classList.add("has-custom-cursor");

  document.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
  });

  document.addEventListener("pointerover", (event) => {
    const target = event.target.closest("[data-cursor]");
    cursorActive = Boolean(target);
    cursor.classList.toggle("is-active", cursorActive);
    if (target) cursorText.textContent = target.dataset.cursor;
  });

  document.addEventListener("pointerout", (event) => {
    if (!event.target.closest("[data-cursor]")) return;
    const nextTarget = event.relatedTarget?.closest?.("[data-cursor]");
    if (!nextTarget) {
      cursorActive = false;
      cursor.classList.remove("is-active");
    }
  });

  const animateCursor = () => {
    cursorX += (pointerX - cursorX) * 0.18;
    cursorY += (pointerY - cursorY) * 0.18;
    const scale = cursorActive ? 1 : 0.18;
    cursor.style.transform = `translate3d(${cursorX - 36}px, ${cursorY - 36}px, 0) scale(${scale})`;
    requestAnimationFrame(animateCursor);
  };
  animateCursor();
}

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const value = button.dataset.copy;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(value);
      } else {
        const input = document.createElement("textarea");
        input.value = value;
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
      }
      button.textContent = "已复制 ✓";
      button.classList.add("is-copied");
      window.setTimeout(() => {
        button.textContent = "复制邮箱";
        button.classList.remove("is-copied");
      }, 1800);
    } catch {
      window.location.href = `mailto:${value}`;
    }
  });
});

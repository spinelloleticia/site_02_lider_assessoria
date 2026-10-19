
"use strict";

/* ========================================
   CONFIGURAÇÕES
======================================== */

const WHATSAPP_NUMBER = "5597981175782";

function openWhatsApp(message) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

/* Executa o callback no instante em que a tela de abertura termina */
function whenSiteReady(callback, maxWait = 16000) {
  const root = document.documentElement;
  let done = false;
  let observer;

  const run = () => {
    if (done) return;
    done = true;
    if (observer) observer.disconnect();
    callback();
  };

  // sem tela de abertura: começa na hora
  if (!document.getElementById("lider-loader") &&
      !root.classList.contains("lider-loading")) {
    run();
    return;
  }

  // começa quando o site é liberado, por qualquer caminho
  observer = new MutationObserver(() => {
    if (!root.classList.contains("lider-loading")) run();
  });
  observer.observe(root, { attributes: true, attributeFilter: ["class"] });

  window.addEventListener("lider:loaded", run, { once: true });
  setTimeout(run, maxWait); // segurança
}

/* ========================================
   CARREGAMENTO INICIAL (loader antigo, opcional)
======================================== */

const pageLoader = document.getElementById("page-loader");

function hideLoader() {
  if (pageLoader) pageLoader.classList.add("is-hidden");
}

window.addEventListener("load", () => setTimeout(hideLoader, 350));
setTimeout(hideLoader, 2500);

/* ========================================
   ANO AUTOMÁTICO NO RODAPÉ
======================================== */

const currentYear = document.getElementById("current-year");
if (currentYear) currentYear.textContent = new Date().getFullYear();

/* ========================================
   MENU MOBILE
======================================== */

const menuToggle = document.getElementById("menu-toggle");
const nav = document.getElementById("nav");

function closeMenu() {
  if (!menuToggle || !nav) return;

  menuToggle.classList.remove("active");
  nav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menu");
  document.body.classList.remove("menu-open");
}

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");

    menuToggle.classList.toggle("active", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
    document.body.classList.toggle("menu-open", isOpen);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 800) closeMenu();
  });
}

/* ========================================
   CABEÇALHO, PROGRESSO E BOTÃO TOPO
======================================== */

const header = document.querySelector(".header");
const scrollProgress = document.getElementById("scroll-progress");
const backToTop = document.getElementById("back-to-top");

let scrollTicking = false;

function updateScrollEffects() {
  const scrollTop = window.scrollY;
  const scrollableHeight =
    document.documentElement.scrollHeight - window.innerHeight;

  const progress = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;

  if (scrollProgress) scrollProgress.style.width = `${progress}%`;
  if (header) header.classList.toggle("scrolled", scrollTop > 20);
  if (backToTop) backToTop.classList.toggle("visible", scrollTop > 500);

  scrollTicking = false;
}

window.addEventListener("scroll", () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(updateScrollEffects);
    scrollTicking = true;
  }
}, { passive: true });

updateScrollEffects();

if (backToTop) {
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ========================================
   ANIMAÇÕES AO ENTRAR NA TELA
   (só começam quando a abertura termina)
======================================== */

const revealElements = document.querySelectorAll(".reveal");
let revealStarted = false;

function startReveal() {
  if (revealStarted) return;
  revealStarted = true;

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -35px 0px" }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("visible"));
  }
}

whenSiteReady(startReveal);

/* ========================================
   WHATSAPP: BOTÕES E SERVIÇOS
======================================== */

document.querySelectorAll("[data-whatsapp]").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();

    const service = button.dataset.service;
    const customMessage = button.dataset.message;

    let message = customMessage ||
      "Olá! Vim pelo site da Líder Assessoria Contábil e gostaria de informações.";

    if (service) {
      message = `Olá! Vim pelo site da Líder Assessoria Contábil e gostaria de informações sobre: ${service}.`;
    }

    openWhatsApp(message);
  });
});

/* ========================================
   DIAGNÓSTICO INTERATIVO
======================================== */

const diagnosisSteps = [...document.querySelectorAll(".diagnosis-step")];

const diagnosisControls = document.getElementById("diagnosis-controls");
const diagnosisBack = document.getElementById("diagnosis-back");
const diagnosisNext = document.getElementById("diagnosis-next");
const diagnosisResult = document.getElementById("diagnosis-result");
const diagnosisSummary = document.getElementById("diagnosis-summary");
const sendDiagnosis = document.getElementById("send-diagnosis");
const restartDiagnosis = document.getElementById("restart-diagnosis");
const progressFill = document.getElementById("diagnosis-progress-fill");
const stepLabel = document.getElementById("step-label");
const progressPercent = document.getElementById("progress-percent");

let currentStep = 0;

const diagnosisAnswers = { profile: "", need: "", urgency: "" };

function updateDiagnosis() {
  diagnosisSteps.forEach((step, index) => {
    step.classList.toggle("active", index === currentStep);
  });

  if (diagnosisBack) diagnosisBack.disabled = currentStep === 0;

  const group = diagnosisSteps[currentStep]?.querySelector("[data-group]")?.dataset.group;
  const hasAnswer = group ? Boolean(diagnosisAnswers[group]) : false;

  if (diagnosisNext) {
    diagnosisNext.disabled = !hasAnswer;
    diagnosisNext.innerHTML =
      currentStep === diagnosisSteps.length - 1
        ? "Ver resultado <span>→</span>"
        : "Continuar <span>→</span>";
  }

  const completedSteps = currentStep + 1;
  const percentage = Math.round((completedSteps / diagnosisSteps.length) * 100);

  if (progressFill) progressFill.style.width = `${percentage}%`;

  if (stepLabel) {
    stepLabel.textContent =
      `ETAPA ${String(completedSteps).padStart(2, "0")} DE ${String(diagnosisSteps.length).padStart(2, "0")}`;
  }

  if (progressPercent) progressPercent.textContent = `${percentage}%`;
}

document.querySelectorAll(".choice").forEach((choice) => {
  choice.addEventListener("click", () => {
    const group = choice.dataset.group;
    const value = choice.dataset.value;

    if (!group || !value) return;

    diagnosisAnswers[group] = value;

    document.querySelectorAll(`.choice[data-group="${group}"]`).forEach((option) => {
      const isSelected = option === choice;
      option.classList.toggle("selected", isSelected);
      option.setAttribute("aria-pressed", String(isSelected));
    });

    updateDiagnosis();
  });
});

if (diagnosisNext) {
  diagnosisNext.addEventListener("click", () => {
    const currentGroup = diagnosisSteps[currentStep]?.querySelector("[data-group]")?.dataset.group;

    if (!currentGroup || !diagnosisAnswers[currentGroup]) return;

    if (currentStep < diagnosisSteps.length - 1) {
      currentStep += 1;
      updateDiagnosis();
      return;
    }

    const resultMessage =
      `Olá! Vim pelo site da Líder Assessoria Contábil e respondi ao diagnóstico inicial.\n\n` +
      `Meu perfil: ${diagnosisAnswers.profile}\n` +
      `Minha necessidade: ${diagnosisAnswers.need}\n` +
      `Quando preciso de ajuda: ${diagnosisAnswers.urgency}\n\n` +
      `Gostaria de conversar com a equipe sobre os próximos passos.`;

    if (diagnosisSummary) {
      diagnosisSummary.textContent =
        `Você informou que é: ${diagnosisAnswers.profile}. ` +
        `Sua necessidade principal é: ${diagnosisAnswers.need}. ` +
        `Prazo: ${diagnosisAnswers.urgency.toLowerCase()}.`;
    }

    diagnosisSteps.forEach((step) => step.classList.remove("active"));

    if (diagnosisControls) diagnosisControls.hidden = true;
    if (diagnosisResult) diagnosisResult.hidden = false;
    if (progressFill) progressFill.style.width = "100%";
    if (stepLabel) stepLabel.textContent = "DIAGNÓSTICO CONCLUÍDO";
    if (progressPercent) progressPercent.textContent = "100%";

    if (sendDiagnosis) {
      sendDiagnosis.onclick = () => openWhatsApp(resultMessage);
    }
  });
}

if (diagnosisBack) {
  diagnosisBack.addEventListener("click", () => {
    if (currentStep > 0) {
      currentStep -= 1;
      updateDiagnosis();
    }
  });
}

if (restartDiagnosis) {
  restartDiagnosis.addEventListener("click", () => {
    currentStep = 0;

    diagnosisAnswers.profile = "";
    diagnosisAnswers.need = "";
    diagnosisAnswers.urgency = "";

    document.querySelectorAll(".choice").forEach((choice) => {
      choice.classList.remove("selected");
      choice.setAttribute("aria-pressed", "false");
    });

    if (diagnosisResult) diagnosisResult.hidden = true;
    if (diagnosisControls) diagnosisControls.hidden = false;

    updateDiagnosis();
  });
}

if (diagnosisSteps.length) updateDiagnosis();

/* ========================================
   SIMULADOR INFORMATIVO DO MEI
======================================== */

const openedThisYear = document.getElementById("opened-this-year");
const openingMonth = document.getElementById("opening-month");
const meiRevenue = document.getElementById("mei-revenue");
const remainingValue = document.getElementById("remaining-value");
const revenueFill = document.getElementById("revenue-fill");
const revenueStatus = document.getElementById("revenue-status");
const revenuePercent = document.getElementById("revenue-percent");
const calculateMei = document.getElementById("calculate-mei");
const sendMeiResult = document.getElementById("send-mei-result");

// Limite vigente em 2026. Confira se houver mudança na lei.
const MEI_ANNUAL_LIMIT = 81000;

let meiCalculation = null;

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

if (openedThisYear && openingMonth) {
  openedThisYear.addEventListener("change", () => {
    openingMonth.disabled = openedThisYear.value === "no";
  });
}

function calculateMeiLimit() {
  const month = Number(openingMonth?.value);
  const revenue = Number(meiRevenue?.value);

  if (!Number.isFinite(month) || month < 1 || month > 12) {
    alert("Selecione o mês de abertura do MEI.");
    return;
  }

  if (
    !meiRevenue ||
    meiRevenue.value.trim() === "" ||
    !Number.isFinite(revenue) ||
    revenue < 0
  ) {
    alert("Informe um faturamento válido, igual ou maior que zero.");
    meiRevenue?.focus();
    return;
  }

  // Limite proporcional só vale no ano de abertura; depois, o limite é integral.
  const activeMonths = openedThisYear?.value === "no" ? 12 : 13 - month;
  const proportionalLimit = (MEI_ANNUAL_LIMIT / 12) * activeMonths;
  const remaining = proportionalLimit - revenue;
  const percentage = proportionalLimit > 0 ? (revenue / proportionalLimit) * 100 : 0;
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  let status;

  if (percentage > 120) {
    status = "Bem acima do limite: converse com a contabilidade";
  } else if (percentage > 100) {
    status = "Acima do limite, dentro da margem de 20%";
  } else if (percentage >= 80) {
    status = "Atenção: perto do limite estimado";
  } else {
    status = "Dentro do limite proporcional estimado";
  }

  if (remainingValue) {
    remainingValue.textContent = currencyFormatter.format(Math.max(remaining, 0));
  }

  if (revenueFill) revenueFill.style.width = `${clampedPercentage}%`;
  if (revenueStatus) revenueStatus.textContent = status;

  if (revenuePercent) {
    revenuePercent.textContent =
      `${percentage.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
  }

  meiCalculation = {
    month,
    revenue,
    activeMonths,
    proportionalLimit,
    remaining,
    percentage,
    status
  };

  if (sendMeiResult) sendMeiResult.dataset.calculated = "true";
}

if (calculateMei) calculateMei.addEventListener("click", calculateMeiLimit);

if (meiRevenue) {
  meiRevenue.addEventListener("keydown", (event) => {
    if (event.key === "Enter") calculateMeiLimit();
  });
}

if (sendMeiResult) {
  sendMeiResult.addEventListener("click", () => {
    if (!meiCalculation) {
      alert("Primeiro, informe seu faturamento e clique em calcular.");
      meiRevenue?.focus();
      return;
    }

    const monthName = openedThisYear?.value === "no"
      ? "Aberto em anos anteriores"
      : openingMonth.options[openingMonth.selectedIndex].text;

    const message =
      `Olá! Fiz uma estimativa informativa do meu faturamento pelo site da Líder Assessoria Contábil.\n\n` +
      `Mês de abertura: ${monthName}\n` +
      `Faturamento informado: ${currencyFormatter.format(meiCalculation.revenue)}\n` +
      `Limite proporcional estimado: ${currencyFormatter.format(meiCalculation.proportionalLimit)}\n` +
      `Resultado da estimativa: ${meiCalculation.status}\n\n` +
      `Gostaria de confirmar como essas informações se aplicam ao meu caso.`;

    openWhatsApp(message);
  });
}

/* ========================================
   FAQ: UM ITEM ABERTO POR VEZ
======================================== */

const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;

    faqItems.forEach((otherItem) => {
      if (otherItem !== item) otherItem.open = false;
    });
  });
});

/* ========================================
   NAVEGAÇÃO: SEÇÃO ATIVA
======================================== */

const observedSections = document.querySelectorAll("main section[id]");
const sectionLinks = document.querySelectorAll('.nav a[href^="#"]');

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        sectionLinks.forEach((link) => {
          link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${entry.target.id}`
          );
        });
      });
    },
    { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
  );

  observedSections.forEach((section) => sectionObserver.observe(section));
}

/* ========================================
   MOVIMENTO SUTIL DOS CUBOS COM O MOUSE
   Só em dispositivos com mouse.
======================================== */

const floatingScene = document.querySelector(".floating-scene");
const heroSection = document.querySelector(".hero");
const floatingCubes = document.querySelectorAll(".cube");

const canUseFinePointer =
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const prefersReducedMotion =
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (floatingScene && heroSection && canUseFinePointer && !prefersReducedMotion) {
  let pointerX = 0;
  let pointerY = 0;
  let frameRequested = false;

  // o evento vem do .hero, porque o .floating-scene tem pointer-events: none
  heroSection.addEventListener("pointermove", (event) => {
    const rect = floatingScene.getBoundingClientRect();

    pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

    if (frameRequested) return;
    frameRequested = true;

    window.requestAnimationFrame(() => {
      floatingCubes.forEach((cube, index) => {
        const factor = 5 + (index % 3) * 3;
        cube.style.marginLeft = `${pointerX * factor}px`;
        cube.style.marginTop = `${pointerY * factor}px`;
      });

      frameRequested = false;
    });
  });

  heroSection.addEventListener("pointerleave", () => {
    floatingCubes.forEach((cube) => {
      cube.style.marginLeft = "0px";
      cube.style.marginTop = "0px";
    });
  });
}

/* ========================================
   ENTRADA ANIMADA APÓS A TELA DE ABERTURA
======================================== */

(function heroIntro() {
  if (prefersReducedMotion || !heroSection) return;

  const root = document.documentElement;
  root.classList.add("js-intro");

  // Título: cada palavra vira uma "máscara" para subir sozinha
  const heroTitle = heroSection.querySelector("h1");

  function splitWords(element) {
    let index = 0;

    (function walk(node) {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const fragment = document.createDocumentFragment();

          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;

            if (/^\s+$/.test(part)) {
              fragment.append(part);
              return;
            }

            const word = document.createElement("span");
            const inner = document.createElement("span");
            word.className = "w";
            inner.style.setProperty("--wi", index++);
            inner.textContent = part;
            word.append(inner);
            fragment.append(word);
          });

          child.replaceWith(fragment);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          walk(child);
        }
      });
    })(element);
  }

  if (heroTitle) {
    heroTitle.setAttribute("aria-label", heroTitle.textContent.trim());
    splitWords(heroTitle);
  }

  // [seletor, atraso inicial (s), intervalo entre itens (s)]
  const sequence = [
    [".header .brand", 0, 0],
    [".header .nav > *", 0.1, 0.05],
    [".hero .eyebrow", 0.2, 0],
    [".hero-description", 0.8, 0],
    [".hero-actions", 0.9, 0],
    [".hero-details", 1.0, 0],
    [".hero .dashboard-card", 0.4, 0],
    [".hero .note-top", 1.0, 0],
    [".hero .note-bottom", 1.15, 0],
    [".scroll-hint", 1.3, 0]
  ];

  sequence.forEach(([selector, delay, step]) => {
    document.querySelectorAll(selector).forEach((element, i) => {
      element.classList.add("intro-item");
      element.style.setProperty("--d", `${(delay + i * step).toFixed(2)}s`);
    });
  });

  // dispara quando a abertura termina
  whenSiteReady(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => root.classList.add("site-in"));
    });
  });
})();

/* ========================================
   ESTADO INICIAL
======================================== */

document.documentElement.classList.add("js-ready");

/* ========================================
   BOLINHA QUE SEGUE O CURSOR
   Só em dispositivos com mouse.
======================================== */

const canFollowCursor = canUseFinePointer && !prefersReducedMotion;

if (canFollowCursor) {
  const dot = document.createElement("div");
  const ring = document.createElement("div");
  dot.className = "cursor-dot";
  ring.className = "cursor-ring";
  document.body.append(ring, dot);

  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

  window.addEventListener("pointermove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    dot.style.transform =
      `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    document.documentElement.classList.add("cursor-active");
  }, { passive: true });

  document.documentElement.addEventListener("mouseleave", () => {
    document.documentElement.classList.remove("cursor-active");
  });

  document.addEventListener("pointerover", (event) => {
    const interactive = event.target.closest(
      "a, button, summary, select, input, label, .choice"
    );
    ring.classList.toggle("is-hover", Boolean(interactive));
  });

  // o círculo persegue o ponto com um pequeno atraso
  (function followCursor() {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    ring.style.transform =
      `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(followCursor);
  })();
}

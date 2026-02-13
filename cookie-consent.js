(function () {
  const STORAGE_KEY = "mz_cookie_consent_v1";

  const state = {
    consent: null, // { necessary: true, analytics: boolean, ts: number }
  };

  function loadConsent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function saveConsent(consent) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  }

  function applyConsent(consent) {
    // Qui abiliti eventuali script "analytics" SOLO se consent.analytics = true
    // Se in futuro aggiungi Google Analytics/Meta Pixel, li carichi dentro questo if.
    if (consent && consent.analytics) {
      // esempio: carica script analytics qui
      // loadScript("https://www.googletagmanager.com/gtag/js?id=G-XXXX");
      // window.dataLayer = window.dataLayer || [];
      // function gtag(){dataLayer.push(arguments);}
      // gtag('js', new Date());
      // gtag('config', 'G-XXXX', { anonymize_ip: true });
    }
  }

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === "class") node.className = v;
      else if (k === "html") node.innerHTML = v;
      else node.setAttribute(k, v);
    });
    children.forEach((c) => node.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
    return node;
  }

  function openModal() {
    document.getElementById("mz-cc-modal")?.classList.remove("hidden");
    document.getElementById("mz-cc-backdrop")?.classList.remove("hidden");
  }

  function closeModal() {
    document.getElementById("mz-cc-modal")?.classList.add("hidden");
    document.getElementById("mz-cc-backdrop")?.classList.add("hidden");
  }

  function hideBanner() {
    document.getElementById("mz-cc-banner")?.classList.add("hidden");
  }

  function showBanner() {
    document.getElementById("mz-cc-banner")?.classList.remove("hidden");
  }

  function setConsent(consent) {
    const payload = { necessary: true, analytics: !!consent.analytics, ts: Date.now() };
    saveConsent(payload);
    state.consent = payload;
    applyConsent(payload);
    hideBanner();
    closeModal();
  }

  function render() {
    // CSS minimale (non pesa e non dipende da Tailwind)
    const style = el("style", {
      html: `
      .mz-cc-hidden{display:none}
      #mz-cc-banner{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:1100px;margin:0 auto;background:#0f172a;color:#fff;border-radius:16px;box-shadow:0 12px 30px rgba(0,0,0,.25);padding:16px}
      #mz-cc-banner p{margin:0;font-size:14px;line-height:1.4;color:rgba(255,255,255,.85)}
      #mz-cc-banner h3{margin:0 0 6px 0;font-size:16px}
      .mz-cc-row{display:flex;gap:12px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap}
      .mz-cc-actions{display:flex;gap:10px;flex-wrap:wrap}
      .mz-cc-btn{border:1px solid rgba(255,255,255,.25);background:transparent;color:#fff;padding:10px 12px;border-radius:12px;font-weight:700;font-size:13px;cursor:pointer}
      .mz-cc-btn:hover{background:rgba(255,255,255,.08)}
      .mz-cc-btn-primary{background:#2d7bc9;border-color:#2d7bc9}
      .mz-cc-btn-primary:hover{filter:brightness(.95)}
      .mz-cc-link{color:#93c5fd;text-decoration:underline}
      #mz-cc-backdrop{position:fixed;inset:0;background:rgba(2,6,23,.55);z-index:10000}
      #mz-cc-modal{position:fixed;left:16px;right:16px;top:50%;transform:translateY(-50%);max-width:720px;margin:0 auto;background:#fff;color:#0f172a;border-radius:18px;z-index:10001;box-shadow:0 16px 40px rgba(0,0,0,.35);padding:18px}
      #mz-cc-modal h3{margin:0 0 6px 0;font-size:18px}
      #mz-cc-modal p{margin:0 0 10px 0;color:#334155;font-size:14px;line-height:1.5}
      .mz-cc-card{border:1px solid #e2e8f0;border-radius:14px;padding:12px;margin-top:10px}
      .mz-cc-card label{display:flex;gap:10px;align-items:flex-start;cursor:pointer}
      .mz-cc-card small{display:block;color:#64748b;margin-top:4px}
      .mz-cc-modal-actions{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;margin-top:14px}
      .mz-cc-btn-dark{background:#0f172a;color:#fff;border-color:#0f172a}
      .mz-cc-btn-dark:hover{filter:brightness(.95)}
      @media (min-width:768px){#mz-cc-banner{padding:18px 20px}}
    `,
    });

    const banner = el("div", { id: "mz-cc-banner" }, [
      el("div", { class: "mz-cc-row" }, [
        el("div", {}, [
          el("h3", {}, ["Cookie e Privacy"]),
          el("p", {
            html:
              `Usiamo cookie <strong>tecnici</strong> necessari al funzionamento del sito. Con il tuo consenso, possiamo usare cookie <strong>statistici</strong> (analytics) per migliorare i contenuti. ` +
              `Puoi scegliere ora o in qualsiasi momento dalla <a class="mz-cc-link" href="privacy.html">Privacy Policy</a>.`,
          }),
        ]),
        el("div", { class: "mz-cc-actions" }, [
          el("button", { class: "mz-cc-btn mz-cc-btn-primary", type: "button", id: "mz-cc-accept" }, ["Accetta"]),
          el("button", { class: "mz-cc-btn", type: "button", id: "mz-cc-reject" }, ["Rifiuta"]),
          el("button", { class: "mz-cc-btn", type: "button", id: "mz-cc-customize" }, ["Personalizza"]),
        ]),
      ]),
    ]);

    const backdrop = el("div", { id: "mz-cc-backdrop", class: "hidden" }, []);
    const modal = el("div", { id: "mz-cc-modal", class: "hidden" }, [
      el("h3", {}, ["Preferenze cookie"]),
      el("p", {}, [
        "Puoi scegliere quali cookie autorizzare. I cookie tecnici sono sempre attivi perché indispensabili al funzionamento del sito.",
      ]),
      el("div", { class: "mz-cc-card" }, [
        el("label", {}, [
          el("input", { type: "checkbox", checked: "checked", disabled: "disabled" }),
          el("div", {}, [
            el("div", { html: "<strong>Cookie tecnici (necessari)</strong>" }),
            el("small", {}, ["Consentono il corretto funzionamento del sito e la sicurezza. Non richiedono consenso."]),
          ]),
        ]),
      ]),
      el("div", { class: "mz-cc-card" }, [
        el("label", {}, [
          el("input", { type: "checkbox", id: "mz-cc-analytics" }),
          el("div", {}, [
            el("div", { html: "<strong>Cookie statistici (analytics)</strong>" }),
            el("small", {}, ["Ci aiutano a capire come viene usato il sito, in forma aggregata, per migliorarlo."]),
          ]),
        ]),
      ]),
      el("div", { class: "mz-cc-modal-actions" }, [
        el("button", { class: "mz-cc-btn", type: "button", id: "mz-cc-cancel" }, ["Annulla"]),
        el("button", { class: "mz-cc-btn mz-cc-btn-dark", type: "button", id: "mz-cc-save" }, ["Salva preferenze"]),
      ]),
    ]);

    document.head.appendChild(style);
    document.body.appendChild(banner);
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);

    // Click handlers
    document.getElementById("mz-cc-accept").addEventListener("click", () => setConsent({ analytics: true }));
    document.getElementById("mz-cc-reject").addEventListener("click", () => setConsent({ analytics: false }));
    document.getElementById("mz-cc-customize").addEventListener("click", () => openModal());

    backdrop.addEventListener("click", closeModal);
    document.getElementById("mz-cc-cancel").addEventListener("click", closeModal);
    document.getElementById("mz-cc-save").addEventListener("click", () => {
      const analytics = !!document.getElementById("mz-cc-analytics").checked;
      setConsent({ analytics });
    });
  }

  function init() {
    state.consent = loadConsent();
    render();

    if (state.consent) {
      // Se già scelto, non mostro banner e applico preferenze
      hideBanner();
      applyConsent(state.consent);
    } else {
      showBanner();
    }

    // Se in futuro vuoi un link "Modifica cookie" nel footer:
 window.mzOpenCookieSettings = function () {
  // Legge la scelta salvata (se c'è)
  let c = null;
  try {
    c = JSON.parse(localStorage.getItem("mz_cookie_consent_v1"));
  } catch (e) {}

  // Pre-imposta checkbox analytics nel popup (se esiste)
  const cb = document.getElementById("mz-cc-analytics");
  if (cb) cb.checked = !!(c && c.analytics);

  // ✅ Apri direttamente popup + sfondo
  const modal = document.getElementById("mz-cc-modal");
  const back = document.getElementById("mz-cc-backdrop");

  if (modal && back) {
    modal.classList.remove("hidden");
    back.classList.remove("hidden");
    return;
  }

  // Fallback: se popup non esiste, mostra almeno il banner
  const banner = document.getElementById("mz-cc-banner");
  if (banner) {
    banner.classList.remove("hidden");
    banner.scrollIntoView({ behavior: "smooth", block: "end" });
  }
};

  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

// ✅ APRI IMPOSTAZIONI COOKIE (compatibile con COOKIE PRO)
window.mzOpenCookieSettings = function () {
  // Legge la scelta salvata dal COOKIE PRO
  let c = null;
  try {
    c = JSON.parse(localStorage.getItem("mz_cookie_consent_v1"));
  } catch (e) {}

  // Pre-imposta la checkbox analytics nel modal (se esiste)
  const cb = document.getElementById("mz-cc-analytics");
  if (cb) cb.checked = !!(c && c.analytics);

  // Mostra modal + sfondo
  const modal = document.getElementById("mz-cc-modal");
  const back = document.getElementById("mz-cc-backdrop");
  if (modal) modal.classList.remove("hidden");
  if (back) back.classList.remove("hidden");
};



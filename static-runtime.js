(function () {
  const q = (selector, root = document) => root.querySelector(selector);
  const qa = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const pageKey = `topdisk-pages-edit:${location.pathname}`;

  function toast(message) {
    let node = q("#static-toast");
    if (!node) {
      node = document.createElement("div");
      node.id = "static-toast";
      node.className = "editor-toast";
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.style.display = "block";
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { node.style.display = "none"; }, 1800);
  }

  function restoreSavedPage() {
    try {
      const saved = JSON.parse(localStorage.getItem(pageKey) || "null");
      const root = q("#site-root");
      if (saved?.html && root) root.innerHTML = saved.html;
      if (saved?.red) document.documentElement.style.setProperty("--red", saved.red);
      if (saved?.ink) document.documentElement.style.setProperty("--ink", saved.ink);
    } catch { /* Ignore invalid local drafts. */ }
  }

  function bindHeader() {
    const menuButton = q(".menu-button");
    const menu = q(".mobile-menu");
    menuButton?.addEventListener("click", () => {
      const open = !menuButton.classList.contains("active");
      menuButton.classList.toggle("active", open);
      menu?.classList.toggle("open", open);
      menuButton.setAttribute("aria-expanded", String(open));
    });
    q(".lang")?.addEventListener("click", event => {
      const button = event.currentTarget;
      const next = button.textContent.trim().startsWith("EN") ? "中文" : "EN";
      button.innerHTML = `${next} <span>⌄</span>`;
      toast(next === "中文" ? "中文内容将在正式内容阶段补齐" : "Language switched to English");
    });
  }

  function openQuote(mode) {
    q("#static-quote-modal")?.remove();
    const wrap = document.createElement("div");
    wrap.id = "static-quote-modal";
    wrap.className = "modal-backdrop";
    wrap.innerHTML = `<div class="quote-modal" role="dialog" aria-modal="true"><button class="modal-close" aria-label="Close">×</button><span class="eyebrow">PROJECT INQUIRY</span><h2>${mode}</h2><p>Fields marked * help us route your request faster.</p><form><div class="form-row"><label>Work email *<input type="email" placeholder="name@company.com" required></label><label>Company *<input placeholder="Company name" required></label></div><div class="form-row"><label>Product interest *<select required><option value="">Select a product</option><option>SSD</option><option>USB Flash Drive</option><option>MicroSD Card</option><option>SD NAND / Embedded</option><option>Not sure yet</option></select></label><label>Project stage<select><option>Concept / Evaluation</option><option>Sample validation</option><option>Pilot run</option><option>Mass production</option></select></label></div><label>Project requirement *<textarea required placeholder="Application, capacity, interface, target quantity, schedule, customization..."></textarea></label><label class="check"><input type="checkbox" required><span>I agree to be contacted about this project inquiry.</span></label><button class="btn btn-red form-submit" type="submit">Submit requirement <span>↗</span></button></form></div>`;
    document.body.appendChild(wrap);
    const close = () => wrap.remove();
    q(".modal-close", wrap).addEventListener("click", close);
    wrap.addEventListener("click", event => { if (event.target === wrap) close(); });
    q("form", wrap).addEventListener("submit", event => {
      event.preventDefault();
      q(".quote-modal", wrap).innerHTML = `<div class="success-state"><span>✓</span><h2>Requirement received.</h2><p>This is a prototype confirmation. The final website can connect this form to email, CRM or your inquiry system.</p><button class="btn btn-dark">Close</button></div>`;
      q("button", wrap).addEventListener("click", close);
    });
  }

  function bindQuoteActions() {
    const patterns = ["Get a Quote", "Request Sample", "Contact Sales", "Submit Project Requirement", "Request Quote", "Start solution matching", "Discuss your project", "Contact our team", "sales@topdisk.com"];
    qa("button").forEach(button => {
      const text = button.textContent.trim();
      if (patterns.some(pattern => text.includes(pattern))) button.addEventListener("click", () => openQuote(text.replace("↗", "").trim()));
    });
    q(".download-btn")?.addEventListener("click", () => toast("Datasheet PDF will be connected in the final content phase"));
    q(".play")?.addEventListener("click", () => toast("Company video placeholder"));
  }

  function bindProducts() {
    const cards = qa(".catalog-card");
    if (!cards.length) return;
    const input = q(".search-box input");
    const categories = qa(".filter-group button");
    let active = "All Products";
    function update() {
      const query = (input?.value || "").trim().toLowerCase();
      let count = 0;
      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        const category = active === "All Products" || text.includes(active.toLowerCase().replace(" card", ""));
        const match = !query || text.includes(query);
        card.style.display = category && match ? "" : "none";
        if (category && match) count++;
      });
      const counter = q(".catalog-top p b");
      if (counter) counter.textContent = String(count);
    }
    categories.forEach(button => button.addEventListener("click", () => {
      active = button.textContent.replace(/\d+$/, "").trim();
      categories.forEach(item => item.classList.toggle("active", item === button));
      update();
    }));
    input?.addEventListener("input", update);
    q(".filter-title button")?.addEventListener("click", () => {
      active = "All Products";
      if (input) input.value = "";
      categories.forEach((item, index) => item.classList.toggle("active", index === 0));
      update();
    });
    qa(".filter-collapse button").forEach(button => button.addEventListener("click", () => {
      button.classList.toggle("active");
      const mark = q("span", button);
      if (mark) mark.textContent = button.classList.contains("active") ? "−" : "＋";
      toast("Detailed filter options are reserved for the formal product database");
    }));
  }

  function bindIndustries() {
    const data = [
      ["01", "Compact storage with stable lifecycle support for always-connected devices.", "SD NAND · eMMC · MicroSD"],
      ["02", "Sustained write endurance for continuous recording and edge intelligence.", "High-endurance MicroSD · SSD"],
      ["03", "Wide-temperature options and controlled BOM for demanding environments.", "Industrial SSD · Embedded"],
      ["04", "Reliable boot and data storage for gateways, routers and edge nodes.", "M.2 SSD · SD NAND"],
      ["05", "Flexible capacity, ID design and packaging for global product launches.", "USB · MicroSD · SSD"],
    ];
    const buttons = qa(".industry-list button");
    buttons.forEach((button, index) => button.addEventListener("mouseenter", () => select(index)));
    buttons.forEach((button, index) => button.addEventListener("click", () => select(index)));
    function select(index) {
      buttons.forEach((button, current) => button.classList.toggle("active", current === index));
      const art = q(".industry-art");
      if (art) {
        art.className = `industry-art art-${index}`;
        const label = q(":scope > span", art);
        if (label) label.textContent = `APPLICATION / ${data[index][0]}`;
      }
      const copy = qa(".industry-caption p");
      if (copy[0]) copy[0].textContent = data[index][1];
      if (copy[1]) copy[1].textContent = data[index][2];
    }
  }

  function bindDetail() {
    const tabs = qa(".detail-tabs button");
    const heading = q(".detail-content h2");
    tabs.forEach(button => button.addEventListener("click", () => {
      tabs.forEach(item => item.classList.toggle("active", item === button));
      if (heading) heading.textContent = button.textContent === "Overview" ? "Performance you can design around." : button.textContent;
    }));
    const dots = qa(".gallery-dots button");
    dots.forEach(dot => dot.addEventListener("click", () => dots.forEach(item => item.classList.toggle("active", item === dot))));
  }

  function bindVisualEditor() {
    const root = q(".visual-editor-root");
    const panel = q(".editor-panel", root);
    const fab = q(".editor-fab", root);
    if (!root || !panel || !fab) return;
    const close = q(".editor-panel-head button", panel);
    const editButton = q(".editor-mode > button", panel);
    const previewButtons = qa(".editor-segment button", panel);
    const colorInputs = qa('.editor-colors input[type="color"]', panel);
    const fileInput = q('input[type="file"]', panel);
    const imageButton = q(".editor-wide-button", panel);
    const sectionGroup = q(".editor-sections", panel);
    const footerButtons = qa(".editor-footer button", panel);
    let editing = false;
    let selected = null;
    const editable = () => qa("#site-root h1,#site-root h2,#site-root h3,#site-root p,#site-root .eyebrow,#site-root .status-pill,#site-root .metric b,#site-root .metric span,#site-root dt,#site-root dd,#site-root .product-label");
    const visuals = () => qa("#site-root .product-visual,#site-root .factory-visual,#site-root .mfg-hero-art,#site-root .industry-art");
    function scanSections() {
      if (!sectionGroup) return;
      qa(".editor-section-row", sectionGroup).forEach(node => node.remove());
      qa("#site-root main > section").forEach((section, index) => {
        const label = (q("h1,h2,h3", section)?.textContent || `Section ${index + 1}`).trim();
        const row = document.createElement("div");
        row.className = "editor-section-row";
        row.innerHTML = `<span title="${label.replaceAll('"', '&quot;')}">${label}</span><button title="Move up">↑</button><button title="Move down">↓</button><button title="Show or hide">${section.style.display === "none" ? "○" : "●"}</button>`;
        const buttons = qa("button", row);
        buttons[0].onclick = () => { if (section.previousElementSibling) section.parentElement.insertBefore(section, section.previousElementSibling); scanSections(); };
        buttons[1].onclick = () => { if (section.nextElementSibling) section.parentElement.insertBefore(section.nextElementSibling, section); scanSections(); };
        buttons[2].onclick = () => { section.style.display = section.style.display === "none" ? "" : "none"; scanSections(); };
        sectionGroup.appendChild(row);
      });
    }
    function setPanel(open) {
      panel.classList.toggle("open", open);
      fab.classList.toggle("active", open);
      fab.innerHTML = `<span>✦</span>${open ? "Close Editor" : "Visual Editor"}`;
      if (open) scanSections();
    }
    fab.addEventListener("click", () => setPanel(!panel.classList.contains("open")));
    close?.addEventListener("click", () => setPanel(false));
    editButton?.addEventListener("click", () => {
      editing = !editing;
      document.documentElement.classList.toggle("visual-editing", editing);
      editable().forEach(node => { node.contentEditable = editing ? "true" : "false"; node.spellcheck = false; });
      editButton.classList.toggle("active", editing);
      editButton.textContent = editing ? "✓ Editing enabled" : "Enable direct editing";
    });
    visuals().forEach(node => node.addEventListener("click", event => {
      if (!editing) return;
      event.preventDefault();
      event.stopPropagation();
      visuals().forEach(item => item.classList.remove("editor-selected"));
      node.classList.add("editor-selected");
      selected = node;
      imageButton.disabled = false;
      imageButton.textContent = "Replace selected visual";
    }, true));
    imageButton?.addEventListener("click", () => fileInput?.click());
    fileInput?.addEventListener("change", () => {
      const file = fileInput.files?.[0];
      if (!file || !selected) return;
      const reader = new FileReader();
      reader.onload = () => {
        selected.style.backgroundImage = `linear-gradient(rgba(15,16,18,.12),rgba(15,16,18,.12)),url(${reader.result})`;
        selected.style.backgroundSize = "cover";
        selected.style.backgroundPosition = "center";
        selected.classList.add("has-editor-image");
        toast("Image replaced");
      };
      reader.readAsDataURL(file);
    });
    colorInputs[0]?.addEventListener("input", event => document.documentElement.style.setProperty("--red", event.target.value));
    colorInputs[1]?.addEventListener("input", event => document.documentElement.style.setProperty("--ink", event.target.value));
    previewButtons[0]?.addEventListener("click", () => {
      document.documentElement.classList.remove("editor-mobile-preview");
      previewButtons.forEach((button, index) => button.classList.toggle("active", index === 0));
    });
    previewButtons[1]?.addEventListener("click", () => {
      document.documentElement.classList.add("editor-mobile-preview");
      previewButtons.forEach((button, index) => button.classList.toggle("active", index === 1));
    });
    footerButtons[0]?.addEventListener("click", () => {
      const site = q("#site-root");
      localStorage.setItem(pageKey, JSON.stringify({
        html: site?.innerHTML,
        red: getComputedStyle(document.documentElement).getPropertyValue("--red").trim(),
        ink: getComputedStyle(document.documentElement).getPropertyValue("--ink").trim(),
      }));
      toast("Changes saved in this browser");
    });
    footerButtons[1]?.addEventListener("click", () => location.reload());
    footerButtons[2]?.addEventListener("click", () => {
      const url = URL.createObjectURL(new Blob([document.documentElement.outerHTML], { type: "text/html" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "TOPDISK_Edited_Prototype.html";
      link.click();
      URL.revokeObjectURL(url);
      toast("HTML exported");
    });
    footerButtons[3]?.addEventListener("click", () => {
      if (confirm("Reset saved visual edits?")) { localStorage.removeItem(pageKey); location.reload(); }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    restoreSavedPage();
    qa(".reveal").forEach(node => node.classList.add("visible"));
    bindHeader();
    bindQuoteActions();
    bindProducts();
    bindIndustries();
    bindDetail();
    bindVisualEditor();
  });
})();

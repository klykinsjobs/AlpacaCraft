const $ = (id) => document.getElementById(id);

function setYear() {
  $("year").textContent = new Date().getFullYear();
}

function initCTA() {
    $("ctaButton").addEventListener("click", () => {
        $("collection").scrollIntoView({ behavior: "smooth" });
    });
}

function initContactForm() {
    const form = $("contactForm");
    const status = $("formStatus");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const { name, email, message } = form;

        if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
            status.textContent = "Please fill out all fields.";
            status.style.color = "#b33";
            return;
        }

        status.textContent = "Message received! (Mock submission)";
        status.style.color = "#6b4f3f";
        form.reset();
    });
}

function initCookies() {
    const banner = $("cookieBanner");
    const btn = $("acceptCookies");

    const accepted = localStorage.getItem("cookiesAccepted") === "true";
    banner.style.display = accepted ? "none" : "flex";

    btn.addEventListener("click", () => {
        localStorage.setItem("cookiesAccepted", "true");
        banner.style.display = "none";
    });
}

function initTheme() {
    const toggle = $("themeToggle");
    const meta = $("themeColorMeta");

    const apply = (mode) => {
        document.body.classList.toggle("dark-mode", mode === "dark");
        toggle.textContent = mode === "dark" ? "☀️" : "🌙";
        meta.setAttribute("content", mode === "dark" ? "#1f1a17" : "#faf7f2");
        localStorage.setItem("theme", mode);
    };

    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    apply(stored || (prefersDark ? "dark" : "light"));

    toggle.addEventListener("click", () => {
        const next = document.body.classList.contains("dark-mode") ? "light" : "dark";
        apply(next);
    });
}

function initMenu() {
    const toggle = $("menuToggle");
    const nav = document.querySelector(".nav");

    document.querySelectorAll(".nav a").forEach(link => {
        link.addEventListener("click", () => {
            nav.classList.remove("open");
        });
    });

    toggle.addEventListener("click", () => {
        nav.classList.toggle("open");
    });
}

function createProductStore() {
    let products = [];

    async function load(url = "products.json") {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load products");

        products = await res.json();
        return products;
    }

    function getById(id) {
        return products.find((p) => p.id === id);
    }

    return { load, getById };
}

function createModal() {
    const modal = $("productModal");
    const img = $("modalImg");
    const title = $("modalTitle");
    const desc = $("modalDesc");

    const closeBtn = $("closeModal");
    const okBtn = $("okModal");

    let lastFocused = null;

    function open(product, triggerEl) {
        if (!product) return;

        lastFocused = triggerEl || document.activeElement;

        img.className = `modal-img ${product.theme}`;
        title.textContent = product.title;
        desc.textContent = product.desc;

        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");

        setTimeout(() => closeBtn.focus(), 0);
    }

    function close() {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");

        if (lastFocused) lastFocused.focus();
    }

    closeBtn.addEventListener("click", close);
    okBtn.addEventListener("click", close);

    modal.addEventListener("click", (e) => {
        if (e.target === modal) close();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") close();

        if (e.key === "Enter") {
            const card = document.activeElement?.closest?.(".product-card");
            if (card && modal.getAttribute("aria-hidden") === "true") return;
        }
    });

    return { open, close };
}

function createProductGrid({ containerId, onSelect }) {
    const grid = $(containerId);

    function render(products) {
        grid.innerHTML = products
        .map((p) => `
        <article class="product-card" tabindex="0" data-id="${p.id}">
            <div class="product-img ${p.theme}" aria-hidden="true"></div>
            <div class="product-info">
                <h3>${p.title}</h3>
                <p>${p.desc}</p>
            </div>
        </article>
        `).join("");
    }

    function bindEvents() {
        grid.addEventListener("click", (e) => {
            const card = e.target.closest(".product-card");
            if (!card) return;

            onSelect(card.dataset.id, card);
        });

        grid.addEventListener("keydown", (e) => {
            if (e.key !== "Enter") return;

            const card = document.activeElement.closest(".product-card");
            if (!card) return;

            onSelect(card.dataset.id, card);
        });
    }

    bindEvents();

    return { render };
}

async function initApp() {
    setYear();
    initCTA();
    initContactForm();
    initCookies();
    initTheme();
    initMenu();

    const store = createProductStore();
    const modal = createModal();

    const grid = createProductGrid({
        containerId: "productGrid",
        onSelect: (id, el) => {
            const product = store.getById(id);
            modal.open(product, el);
        },
    });

    const products = await store.load();
    grid.render(products);
}

initApp();

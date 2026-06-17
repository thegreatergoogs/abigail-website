/* =========================================================
   Abigail Tyson — interactions
   Vanilla JS: mobile nav, scroll state, active links,
   reveal-on-scroll, animated progress bars, contact form.
   ========================================================= */
(function () {
    "use strict";

    const nav = document.getElementById("nav");
    const toggle = document.getElementById("navToggle");
    const menu = document.getElementById("navMenu");
    const navLinks = Array.from(document.querySelectorAll(".nav__link"));

    /* ---------- mobile menu toggle ---------- */
    function setMenu(open) {
        menu.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }

    if (toggle && menu) {
        toggle.addEventListener("click", function () {
            setMenu(!menu.classList.contains("open"));
        });

        // Close the menu after choosing a destination (mobile).
        navLinks.forEach(function (link) {
            link.addEventListener("click", function () {
                setMenu(false);
            });
        });

        // Close on Escape.
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") setMenu(false);
        });
    }

    /* ---------- navbar shadow on scroll ---------- */
    function onScroll() {
        if (nav) nav.classList.toggle("scrolled", window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    /* ---------- active section highlighting ---------- */
    const linkById = {};
    navLinks.forEach(function (link) {
        const id = link.getAttribute("href").replace("#", "");
        linkById[id] = link;
    });

    const sections = Object.keys(linkById)
        .map(function (id) { return document.getElementById(id); })
        .filter(Boolean);

    if ("IntersectionObserver" in window && sections.length) {
        const spy = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        navLinks.forEach(function (l) { l.classList.remove("is-active"); });
                        const active = linkById[entry.target.id];
                        if (active) active.classList.add("is-active");
                    }
                });
            },
            { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
        );
        sections.forEach(function (section) { spy.observe(section); });
    }

    /* ---------- reveal-on-scroll ---------- */
    const reveals = Array.from(document.querySelectorAll(".reveal"));
    if ("IntersectionObserver" in window && reveals.length) {
        const revealObserver = new IntersectionObserver(
            function (entries, obs) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.14 }
        );
        reveals.forEach(function (el) { revealObserver.observe(el); });
    } else {
        reveals.forEach(function (el) { el.classList.add("is-visible"); });
    }

    /* ---------- animated progress bars ---------- */
    const progressEls = Array.from(document.querySelectorAll(".progress"));
    function fill(el) {
        const pct = Math.max(0, Math.min(100, Number(el.dataset.progress) || 0));
        const bar = el.querySelector(".progress__bar");
        if (bar) {
            // next frame so the transition runs from 0
            requestAnimationFrame(function () { bar.style.width = pct + "%"; });
        }
    }
    if ("IntersectionObserver" in window && progressEls.length) {
        const barObserver = new IntersectionObserver(
            function (entries, obs) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        fill(entry.target);
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );
        progressEls.forEach(function (el) { barObserver.observe(el); });
    } else {
        progressEls.forEach(fill);
    }

    /* ---------- contact form -> Netlify Forms (AJAX) ---------- */
    const form = document.getElementById("contactForm");
    const note = document.getElementById("formNote");

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            if (!form.checkValidity()) {
                if (note) note.textContent = "Please fill in every field first.";
                form.reportValidity();
                return;
            }

            // Netlify injects the reCAPTCHA widget (and its g-recaptcha-response
            // field) at deploy time; only enforce it when the widget is present.
            const captcha = form.querySelector("[name='g-recaptcha-response']");
            if (captcha && !captcha.value) {
                if (note) note.textContent = "Please complete the reCAPTCHA below.";
                return;
            }

            const data = new URLSearchParams(new FormData(form)).toString();
            const submitBtn = form.querySelector("button[type='submit']");

            if (note) note.textContent = "Sending…";
            if (submitBtn) submitBtn.disabled = true;

            fetch(form.getAttribute("action") || "/", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: data,
            })
                .then(function (res) {
                    if (!res.ok) throw new Error("Bad response: " + res.status);
                    if (note) note.textContent = "Thanks! Your message is on its way.";
                    form.reset();
                })
                .catch(function () {
                    if (note) note.textContent =
                        "Sorry, something went wrong — please try again in a moment.";
                })
                .finally(function () {
                    if (submitBtn) submitBtn.disabled = false;
                });
        });
    }

    /* ---------- footer year ---------- */
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();

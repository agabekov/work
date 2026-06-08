'use strict';

// Runs with `defer`, so the DOM is parsed by the time this executes.
(function () {
    const root = document.documentElement;
    const themeLabels = { light: 'Ночью', dark: 'Днём' };
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function readStoredTheme() {
        try {
            return localStorage.getItem('theme');
        } catch (e) {
            return null;
        }
    }

    function storeTheme(value) {
        try {
            localStorage.setItem('theme', value);
        } catch (e) {
            /* private mode / storage disabled — non-fatal */
        }
    }

    function syncToggle() {
        if (!themeToggle) {
            return;
        }
        const isDark = root.classList.contains('dark-theme');
        themeToggle.textContent = isDark ? themeLabels.dark : themeLabels.light;
    }

    function applyTheme(isDark) {
        root.classList.toggle('dark-theme', isDark);
        syncToggle();
    }

    // The theme class was already applied before first paint by the inline
    // <head> script; here we only sync the toggle's label and state.
    syncToggle();

    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            const nextIsDark = !root.classList.contains('dark-theme');
            applyTheme(nextIsDark);
            storeTheme(nextIsDark ? 'dark' : 'light');
        });
    }

    // Follow the OS theme only while the user hasn't made a manual choice.
    prefersDark.addEventListener('change', function (e) {
        if (readStoredTheme() === null) {
            applyTheme(e.matches);
        }
    });

    // Drop the first-paint transition guard once the initial styles have settled,
    // so theme switches still animate but the initial load doesn't.
    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            root.classList.remove('no-transitions');
        });
    });

    // ----- Reveal: header + sections -----
    const name = document.getElementById('name');
    const title = document.getElementById('title');
    const sections = document.querySelectorAll('.typed-section');

    function revealHeader() {
        if (name) {
            name.style.opacity = '1';
        }
        if (title) {
            title.style.opacity = '1';
        }
    }

    function revealSection(section) {
        section.classList.add('visible');
        const content = section.querySelector('.content');
        if (content) {
            content.style.opacity = '1';
        }
    }

    if (prefersReducedMotion.matches) {
        // No motion: show everything immediately.
        revealHeader();
        sections.forEach(revealSection);
    } else {
        requestAnimationFrame(revealHeader);

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(function (entries, obs) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        revealSection(entry.target);
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });

            sections.forEach(function (section) {
                observer.observe(section);
            });
        } else {
            sections.forEach(revealSection);
        }
    }

    // Reveal mechanism is now established; cancel the no-JS visibility failsafe
    // armed by the inline <head> script so it doesn't redundantly force-reveal.
    clearTimeout(window.__revealFailsafe);
})();

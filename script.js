'use strict';

// Runs with `defer`, so the DOM is parsed by the time this executes.
(function () {
    const root = document.documentElement;
    const themeLabels = {
        light: 'Переключить на тёмную тему',
        dark: 'Переключить на светлую тему',
    };
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

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
        const themeColor = document.querySelector('meta[name="theme-color"]');
        if (themeColor) {
            themeColor.content = getComputedStyle(root).getPropertyValue('--color-background').trim();
        }
        if (!themeToggle) {
            return;
        }
        const isDark = root.classList.contains('dark-theme');
        themeToggle.setAttribute('aria-pressed', String(isDark));
        themeToggle.setAttribute('aria-label', isDark ? themeLabels.dark : themeLabels.light);
        themeToggle.title = isDark ? themeLabels.dark : themeLabels.light;
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

})();

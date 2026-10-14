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

    // Pack the unordered client list using rendered widths, keeping DOM and
    // visual reading order identical. Desktop restores the source order.
    const clients = document.querySelector('.client-grid');
    if (clients) {
        const originalItems = Array.from(clients.children);
        const mobileLayout = window.matchMedia('(max-width: 760px)');
        let frame = 0;
        let observedWidth = 0;

        originalItems.forEach(function (item) {
            const name = document.createElement('span');
            name.textContent = item.textContent;
            item.replaceChildren(name);
        });

        function arrangeClients() {
            frame = 0;
            const containerWidth = clients.getBoundingClientRect().width;
            const available = containerWidth - 1;
            if (available <= 0) return;

            // One hidden, same-styled list measures names and the separator in
            // a single layout pass, including the active font and text scale.
            const measure = clients.cloneNode(false);
            measure.classList.add('is-measuring');
            measure.setAttribute('aria-hidden', 'true');
            const separator = document.createElement('li');
            separator.appendChild(document.createElement('span'));
            measure.appendChild(separator);
            originalItems.forEach(function (item) {
                const copy = item.cloneNode(true);
                copy.classList.add('row-end');
                measure.appendChild(copy);
            });
            clients.parentNode.appendChild(measure);
            const gap = separator.getBoundingClientRect().width;
            const entries = originalItems.map(function (item, index) {
                return { item, index, width: Math.min(available, measure.children[index + 1].getBoundingClientRect().width) };
            });
            measure.remove();

            const rows = [];
            if (mobileLayout.matches) {
                // Best-fit decreasing fills gaps with shorter names instead
                // of leaving them stranded at the end of the source list.
                entries.sort((a, b) => b.width - a.width || a.index - b.index);
                entries.forEach(function (entry) {
                    let target = null;
                    let remainder = Infinity;
                    rows.forEach(function (row) {
                        const free = available - row.width - gap - entry.width;
                        if (free >= 0 && free < remainder) {
                            target = row;
                            remainder = free;
                        }
                    });
                    if (target) {
                        target.items.push(entry);
                        target.width += gap + entry.width;
                    } else {
                        rows.push({ items: [entry], width: entry.width });
                    }
                });

                // Prefer a pair to a short singleton when another row can
                // donate a name without creating another short singleton.
                rows.forEach(function (row) {
                    if (row.items.length !== 1 || row.width >= available * .7) return;
                    let donor = null;
                    let candidate = null;
                    rows.forEach(function (other) {
                        if (other === row || other.items.length < 2) return;
                        other.items.forEach(function (entry) {
                            const remaining = other.width - entry.width - gap;
                            if (row.width + gap + entry.width > available) return;
                            if (other.items.length === 2 && remaining < available * .7) return;
                            if (!candidate || entry.width < candidate.width) {
                                donor = other;
                                candidate = entry;
                            }
                        });
                    });
                    if (candidate) {
                        donor.items.splice(donor.items.indexOf(candidate), 1);
                        donor.width -= candidate.width + gap;
                        row.items.push(candidate);
                        row.width += candidate.width + gap;
                    }
                });
            } else {
                entries.forEach(function (entry) {
                    let row = rows[rows.length - 1];
                    if (!row || row.width + gap + entry.width > available) {
                        row = { items: [], width: 0 };
                        rows.push(row);
                    }
                    row.width += (row.items.length ? gap : 0) + entry.width;
                    row.items.push(entry);
                });
            }

            const fragment = document.createDocumentFragment();
            rows.forEach(function (row) {
                row.items.forEach(function (entry, index) {
                    entry.item.classList.toggle('row-end', index === row.items.length - 1);
                    // Reserve the unused tail so flex wrapping keeps the
                    // measured rows intact after the singleton rebalance.
                    entry.item.style.marginInlineEnd = index === row.items.length - 1
                        ? Math.max(0, containerWidth - row.width) + 'px' : '';
                    fragment.appendChild(entry.item);
                });
            });
            clients.appendChild(fragment);
        }

        function scheduleClients() {
            if (!frame) frame = requestAnimationFrame(arrangeClients);
        }

        window.addEventListener('resize', scheduleClients);
        if ('ResizeObserver' in window) {
            new ResizeObserver(function (entries) {
                const width = entries[0].contentRect.width;
                if (width !== observedWidth) {
                    observedWidth = width;
                    scheduleClients();
                }
            }).observe(clients);
        }
        if (document.fonts) {
            document.fonts.ready.then(scheduleClients);
            document.fonts.addEventListener('loadingdone', scheduleClients);
        }
        scheduleClients();
    }

})();

document.addEventListener('DOMContentLoaded', function() {
    const themeLabels = {
        light: 'Ночью',
        dark: 'Днём'
    };

    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    let currentTheme = localStorage.getItem('theme');
    const hasManualPreference = currentTheme !== null;

    if (!hasManualPreference) {
        currentTheme = prefersDarkScheme.matches ? 'dark' : 'light';
    }

    function updateThemeButtonText() {
        if (!themeToggle) {
            return;
        }

        const isDark = document.body.classList.contains('dark-theme');
        themeToggle.textContent = isDark ? themeLabels.dark : themeLabels.light;
    }

    if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }

    updateThemeButtonText();

    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-theme');

            const isDark = document.body.classList.contains('dark-theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateThemeButtonText();
        });
    }

    prefersDarkScheme.addEventListener('change', function(e) {
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.remove('dark-theme');
            }

            updateThemeButtonText();
        }
    });

    const name = document.getElementById('name');
    const title = document.getElementById('title');

    setTimeout(() => {
        if (name) {
            name.style.opacity = '1';
        }

        if (title) {
            title.style.opacity = '1';
        }
    }, 300);

    const sections = document.querySelectorAll('.typed-section');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                const content = entry.target.querySelector('.content');
                if (content && !content.classList.contains('typed')) {
                    content.style.opacity = '1';
                    const textElements = content.querySelectorAll('p, h3, h4, li, blockquote p, cite, .client-item, .education-item, .work-period, .company-name, .social a');
                    textElements.forEach(element => {
                        element.style.opacity = '1';
                    });
                    content.classList.add('typed');
                }
            }
        });
    }, { threshold: 0.2 });

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    const navLinks = document.querySelectorAll('nav a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (!targetElement) {
                return;
            }

            window.scrollTo({
                top: targetElement.offsetTop - 40,
                behavior: 'smooth'
            });
        });
    });
});

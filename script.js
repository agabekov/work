// Удаляю ненужные глобальные переменные и функции для отзывов
document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle functionality
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Check for saved theme preference or use system preference
    let currentTheme = localStorage.getItem('theme');
    const userHasManualPreference = currentTheme !== null;
    
    // If no manual preference, use system preference
    if (!userHasManualPreference) {
        currentTheme = prefersDarkScheme.matches ? 'dark' : 'light';
    }
    
    // Apply theme on page load
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.textContent = 'Днём';
    } else {
        document.body.classList.remove('dark-theme');
        themeToggle.textContent = 'Ночью';
    }
    
    // Toggle theme when button is clicked
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        
        // Update button text based on current theme
        const isDark = document.body.classList.contains('dark-theme');
        themeToggle.textContent = isDark ? 'Днём' : 'Ночью';
        
        // Save manual preference to localStorage
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
    
    // Listen for changes in system color scheme preference
    prefersDarkScheme.addEventListener('change', function(e) {
        // Only apply system preference if user hasn't set a manual preference
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                document.body.classList.add('dark-theme');
                themeToggle.textContent = 'Днём';
            } else {
                document.body.classList.remove('dark-theme');
                themeToggle.textContent = 'Ночью';
            }
        }
    });

    // Initial animation for header
    const name = document.getElementById('name');
    const title = document.getElementById('title');
    
    setTimeout(() => {
        name.style.opacity = '1';
        title.style.opacity = '1';
    }, 300);

    // Scroll-based section activation and typewriter effect
    const sections = document.querySelectorAll('.typed-section');
    
    // Observer for section visibility
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Start typewriter effect when section is visible
                const content = entry.target.querySelector('.content');
                if (content && !content.classList.contains('typed')) {
                    typewriterEffect(content);
                    content.classList.add('typed');
                }
            }
        });
    }, { threshold: 0.2 });
    
    // Observe all sections
    sections.forEach(section => {
        sectionObserver.observe(section);
    });
    
    // Typewriter effect function
    function typewriterEffect(contentElement) {
        // Make content visible first
        contentElement.style.opacity = '1';
        
        // Get all direct text containers within the content
        const textElements = contentElement.querySelectorAll('p, h3, h4, li, blockquote p, cite, .client-item, .education-item, .work-period, .company-name, .social a');
        
        // Save original content and prepare elements
        const originalContent = [];
        
        textElements.forEach(element => {
            // Store original content
            originalContent.push(element.innerHTML);
            
            // Set min-height to maintain the space
            const tempElement = element.cloneNode(true);
            document.body.appendChild(tempElement);
            tempElement.style.visibility = 'hidden';
            tempElement.style.position = 'absolute';
            tempElement.style.width = getComputedStyle(element).width;
            const height = tempElement.offsetHeight;
            document.body.removeChild(tempElement);
            
            element.style.minHeight = `${height}px`;
            
            // Clear text
            element.innerHTML = '';
            
            // Hide cursor initially
            element.classList.add('no-cursor');
        });
        
        // Start typing the first element
        typeElementSequentially(textElements, originalContent, 0, contentElement);
    }
    
    // Function to type elements one after another
    function typeElementSequentially(elements, originalContent, elementIndex, contentElement) {
        if (elementIndex >= elements.length) {
            // Удаляю проверку на testimonials section и запуск ротации
            return;
        }
        
        const element = elements[elementIndex];
        
        // Show cursor on current element
        element.classList.remove('no-cursor');
        element.classList.add('typing');
        
        // Type the current element
        let html = '';
        let cursor = 0;
        const content = originalContent[elementIndex];
        let inHighlightSpan = false;
        
        function typeNextChar() {
            if (cursor < content.length) {
                // Start of highlight span
                if (content.substring(cursor).startsWith('<span class="highlight">')) {
                    inHighlightSpan = true;
                    html += '<span class="highlight">';
                    cursor += 24; // Length of '<span class="highlight">'
                } 
                // End of highlight span
                else if (inHighlightSpan && content.substring(cursor).startsWith('</span>')) {
                    inHighlightSpan = false;
                    html += '</span>';
                    cursor += 7; // Length of '</span>'
                }
                // Handle HTML entities like &nbsp;
                else if (content.substring(cursor).startsWith('&') && content.substring(cursor).includes(';')) {
                    const entityEnd = content.indexOf(';', cursor) + 1;
                    html += content.substring(cursor, entityEnd);
                    cursor = entityEnd;
                }
                // Other HTML tags
                else if (content.substring(cursor).startsWith('<')) {
                    const tagEnd = content.indexOf('>', cursor) + 1;
                    html += content.substring(cursor, tagEnd);
                    cursor = tagEnd;
                } 
                // Regular characters
                else {
                    html += content[cursor];
                    cursor++;
                }
                
                element.innerHTML = html;
                setTimeout(typeNextChar, 22); // typing speed (balanced between 15ms and 30ms)
            } else {
                // When typing is complete, remove the typing class to hide the cursor
                element.classList.remove('typing');
                // Add back the no-cursor class to ensure no cursor appears
                element.classList.add('no-cursor');
                
                setTimeout(() => {
                    typeElementSequentially(elements, originalContent, elementIndex + 1, contentElement);
                }, 300);
            }
        }
        
        typeNextChar();
    }
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            window.scrollTo({
                top: targetElement.offsetTop - 40,
                behavior: 'smooth'
            });
        });
    });
}); 
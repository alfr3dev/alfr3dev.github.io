// ===================================
// SCROLL EFFECTS FOR HEADER
// ===================================
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// ===================================
// INTERSECTION OBSERVER FOR SECTIONS
// ===================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// ===================================
// VIDEO CONTROLS - PLAY ON HOVER
// ===================================
const portfolioItems = document.querySelectorAll('.portfolio-item');

portfolioItems.forEach(item => {
    const video = item.querySelector('.portfolio-video');
    
    if (video) {
        // Play video on hover
        item.addEventListener('mouseenter', () => {
            video.play().catch(error => {
                console.log('Video autoplay prevented:', error);
            });
        });

        // Pause video when mouse leaves
        item.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0; // Reset to beginning
        });

        // Click to open project (optional)
        item.addEventListener('click', () => {
            const projectName = item.dataset.project;
            if (projectName) {
                openProject(projectName);
            }
        });
    }
});

// ===================================
// BACKGROUND VIDEO CONTROL
// ===================================
const bgVideo = document.getElementById('bgVideo');

if (bgVideo) {
    // Ensure background video plays
    bgVideo.play().catch(error => {
        console.log('Background video autoplay prevented:', error);
    });

    // Pause background video when scrolling for performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (bgVideo && !bgVideo.paused) {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                // Resume after scrolling stops
            }, 150);
        }
    });
}

// ===================================
// MAIN VIDEO PLAYER CONTROLS
// ===================================
const mainVideo = document.getElementById('mainVideo');

if (mainVideo) {
    // Add custom controls or analytics
    mainVideo.addEventListener('play', () => {
        console.log('Main video started playing');
    });

    mainVideo.addEventListener('pause', () => {
        console.log('Main video paused');
    });

    mainVideo.addEventListener('ended', () => {
        console.log('Main video ended');
        // You can add autoplay next video logic here
    });
}

// ===================================
// NEWSLETTER FORM HANDLER
// ===================================
const newsletterForm = document.getElementById('newsletterForm');
const emailInput = document.getElementById('emailInput');
const formMessage = document.getElementById('formMessage');

if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const email = emailInput.value;
        
        // Show loading state
        formMessage.textContent = 'Enviando...';
        formMessage.className = 'form-message';
        
        try {
            // Aquí puedes integrar tu servicio de email (Mailchimp, SendGrid, etc.)
            // Por ahora, simulamos un envío exitoso
            await simulateEmailSubmit(email);
            
            // Success message
            formMessage.textContent = '¡GRACIAS! Email recibido - DEREK';
            formMessage.classList.add('success');
            
            // Reset form
            newsletterForm.reset();
            
            // Clear message after 5 seconds
            setTimeout(() => {
                formMessage.textContent = '';
                formMessage.className = 'form-message';
            }, 5000);
            
        } catch (error) {
            // Error message
            formMessage.textContent = 'SORRY, Email no fue recolectado. Intenta de nuevo.';
            formMessage.classList.add('error');
            
            setTimeout(() => {
                formMessage.textContent = '';
                formMessage.className = 'form-message';
            }, 5000);
        }
    });
}

// Simulate email submission (replace with real API call)
function simulateEmailSubmit(email) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate success
            if (email.includes('@')) {
                resolve({ success: true });
            } else {
                reject({ error: 'Invalid email' });
            }
        }, 1500);
    });
}

// ===================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const headerOffset = 100;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===================================
// PROJECT MODAL OR NAVIGATION
// ===================================
function openProject(projectName) {
    // You can implement a modal here or navigate to project page
    console.log(`Opening project: ${projectName}`);
    
    // Example: Open in modal
    alert(`Ver proyecto: ${projectName}`);
    
    // Or navigate to dedicated page:
    // window.location.href = `/projects/${projectName}`;
}

// ===================================
// LAZY LOADING FOR VIDEOS
// ===================================
const lazyVideos = document.querySelectorAll('video[data-src]');

if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const video = entry.target;
                video.src = video.dataset.src;
                video.load();
                videoObserver.unobserve(video);
            }
        });
    });

    lazyVideos.forEach(video => {
        videoObserver.observe(video);
    });
}

// ===================================
// PERFORMANCE: PAUSE OFFSCREEN VIDEOS
// ===================================
function handleVideoVisibility() {
    const videos = document.querySelectorAll('video');
    
    videos.forEach(video => {
        const rect = video.getBoundingClientRect();
        const isVisible = (
            rect.top >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
        );
        
        if (!isVisible && !video.paused) {
            video.pause();
        }
    });
}

// Check video visibility on scroll (throttled)
let scrollTimer;
window.addEventListener('scroll', () => {
    if (scrollTimer) {
        clearTimeout(scrollTimer);
    }
    scrollTimer = setTimeout(handleVideoVisibility, 100);
});

// ===================================
// CURSOR EFFECTS (OPTIONAL)
// ===================================
function createCustomCursor() {
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);
    
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    function updateCursor() {
        cursorX += (mouseX - cursorX) * 0.1;
        cursorY += (mouseY - cursorY) * 0.1;
        
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        
        requestAnimationFrame(updateCursor);
    }
    
    updateCursor();
}

// Uncomment to enable custom cursor
// createCustomCursor();

// ===================================
// ANALYTICS / TRACKING (OPTIONAL)
// ===================================
function trackEvent(eventName, eventData) {
    // Integrate with Google Analytics, Mixpanel, etc.
    console.log('Track Event:', eventName, eventData);
    
    // Example with Google Analytics
    // if (typeof gtag !== 'undefined') {
    //     gtag('event', eventName, eventData);
    // }
}

// Track CTA clicks
document.querySelectorAll('.cta-button').forEach(button => {
    button.addEventListener('click', () => {
        trackEvent('cta_click', {
            button_text: button.textContent.trim(),
            page_location: window.location.pathname
        });
    });
});

// ===================================
// CONSOLE MESSAGE
// ===================================
console.log('%c👋 Hola! Bienvenido a DERRK.COM', 'font-size: 20px; font-weight: bold; color: #000;');
console.log('%c🎨 Sitio creado con pasión por la animación 3D', 'font-size: 14px; color: #666;');

// ===================================
// INITIALIZE ON DOM LOAD
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Website initialized successfully');
    
    // Check if videos are supported
    const testVideo = document.createElement('video');
    if (testVideo.canPlayType) {
        console.log('Video support: ✓');
    } else {
        console.warn('Video support: ✗ - Videos may not play correctly');
    }
});
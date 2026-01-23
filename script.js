// ===================================
// SCROLL EFFECTS FOR HEADER
// ===================================
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    const scrollThreshold = 200; // Aparece después de 200px de scroll
    
    if (window.scrollY > scrollThreshold) {
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
// VIDEO AUTOPLAY - SIN INTERFERENCIA
// ===================================
const portfolioItems = document.querySelectorAll('.portfolio-item');

// Simplemente observa si los videos están en pantalla
const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const video = entry.target.querySelector('.portfolio-video');
        
        if (video) {
            if (entry.isIntersecting) {
                // Está visible - asegurar que esté reproduciendo
                if (video.paused) {
                    video.play().catch(error => {
                        console.log('Video autoplay prevented:', error);
                    });
                }
            } else {
                // No está visible - pausar para ahorrar recursos
                video.pause();
            }
        }
    });
}, {
    threshold: 0.2 // Solo necesita 20% visible para empezar
});

// Observar cada portfolio item
portfolioItems.forEach(item => {
    const video = item.querySelector('.portfolio-video');
    
    if (video) {
        // Observar visibilidad
        videoObserver.observe(item);
        
        // Click para abrir proyecto
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
    // Asegurar que el video de fondo se reproduce
    bgVideo.play().catch(error => {
        console.log('Background video autoplay prevented:', error);
    });
}

// ===================================
// MAIN VIDEO PLAYER CONTROLS
// ===================================
const mainVideo = document.getElementById('mainVideo');

if (mainVideo) {
    mainVideo.addEventListener('play', () => {
        console.log('Main video started playing');
    });

    mainVideo.addEventListener('pause', () => {
        console.log('Main video paused');
    });

    mainVideo.addEventListener('ended', () => {
        console.log('Main video ended');
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

// Simulate email submission
function simulateEmailSubmit(email) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
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
    console.log(`Opening project: ${projectName}`);
    alert(`Ver proyecto: ${projectName}`);
}

// ===================================
// ANALYTICS / TRACKING (OPTIONAL)
// ===================================
function trackEvent(eventName, eventData) {
    console.log('Track Event:', eventName, eventData);
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
console.log('%c👋 Hola! Bienvenido a ALFR3DEV.COM', 'font-size: 20px; font-weight: bold; color: #000;');
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

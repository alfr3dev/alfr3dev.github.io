// ===================================
// PREVENIR SCROLL AUTOMÁTICO AL CARGAR
// ===================================
// Forzar scroll al inicio antes de que se cargue todo
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// Scroll instantáneo al inicio
window.scrollTo(0, 0);



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
// VIDEO AUTOPLAY - MEJORADO PARA MÓVILES
// ===================================
const portfolioItems = document.querySelectorAll('.portfolio-item');

// Función para intentar reproducir video
function tryPlayVideo(video) {
    if (video && video.paused) {
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log('Video playing:', video.src);
                })
                .catch(error => {
                    console.log('Video autoplay prevented:', error);
                    
                    // Si falla el autoplay, intentar después de interacción del usuario
                    const enableVideoOnInteraction = () => {
                        video.play()
                            .then(() => {
                                console.log('Video started after user interaction');
                                // Remover los listeners después de que funcione
                                document.removeEventListener('touchstart', enableVideoOnInteraction);
                                document.removeEventListener('click', enableVideoOnInteraction);
                            })
                            .catch(err => console.log('Still cannot play:', err));
                    };
                    
                    // Agregar listeners una sola vez
                    if (!video.dataset.listenerAdded) {
                        document.addEventListener('touchstart', enableVideoOnInteraction, { once: true });
                        document.addEventListener('click', enableVideoOnInteraction, { once: true });
                        video.dataset.listenerAdded = 'true';
                    }
                });
        }
    }
}

// Observador mejorado para videos
const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const video = entry.target.querySelector('.portfolio-video');
        
        if (video) {
            if (entry.isIntersecting) {
                // Está visible - intentar reproducir
                video.load(); // Cargar el video primero
                setTimeout(() => tryPlayVideo(video), 100);
            } else {
                // No está visible - pausar para ahorrar recursos
                video.pause();
            }
        }
    });
}, {
    threshold: 0.2,
    rootMargin: '50px' // Empezar a cargar un poco antes
});

// Observar cada portfolio item y agregar eventos
portfolioItems.forEach(item => {
    const video = item.querySelector('.portfolio-video');
    
    if (video) {
        // Configurar el video
        video.setAttribute('muted', 'true');
        video.muted = true;
        video.setAttribute('playsinline', 'true');
        video.playsInline = true;
        
        // Observar visibilidad
        videoObserver.observe(item);
        
        // Intentar reproducir cuando el video esté listo
        video.addEventListener('loadedmetadata', () => {
            console.log('Video metadata loaded:', video.src);
        });
        
        video.addEventListener('loadeddata', () => {
            console.log('Video data loaded:', video.src);
            if (isVideoInViewport(item)) {
                tryPlayVideo(video);
            }
        });
        
        // Click para abrir proyecto
        item.addEventListener('click', () => {
            const projectName = item.dataset.project;
            if (projectName) {
                openProject(projectName);
            }
        });
        
        // Touch/click también puede activar el video
        item.addEventListener('touchstart', () => {
            tryPlayVideo(video);
        }, { passive: true });
    }
});

// Función helper para verificar si el elemento está en viewport
function isVideoInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// ===================================
// BACKGROUND VIDEO - HERO SECTION
// ===================================
const bgVideo = document.getElementById('bgVideo');
if (bgVideo) {
    bgVideo.addEventListener('loadeddata', () => {
        console.log('Background video loaded');
        tryPlayVideo(bgVideo);
    });
    
    // Asegurar que el video de fondo se reproduzca
    setTimeout(() => {
        tryPlayVideo(bgVideo);
    }, 500);
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
    
    // Para iOS, asegurar que playsinline esté configurado
    mainVideo.setAttribute('playsinline', 'true');
    mainVideo.playsInline = true;
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
    
    // Asegurar que estamos en el inicio
    window.scrollTo(0, 0);
    
    // Habilitar smooth scroll después de cargar
    setTimeout(() => {
        document.documentElement.classList.add('loaded');
    }, 100);
    
    // Check if videos are supported
    const testVideo = document.createElement('video');
    if (testVideo.canPlayType) {
        console.log('Video support: ✓');
        console.log('MP4 support:', testVideo.canPlayType('video/mp4'));
    } else {
        console.warn('Video support: ✗ - Videos may not play correctly');
    }
    
    // Detectar tipo de dispositivo
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    console.log('Mobile device:', isMobile);
    console.log('iOS device:', isIOS);
    
    // Para dispositivos móviles, intentar activar todos los videos después de primer toque
    if (isMobile) {
        const activateAllVideos = () => {
            console.log('Activating all videos after user interaction');
            document.querySelectorAll('video').forEach(video => {
                tryPlayVideo(video);
            });
        };
        
        document.addEventListener('touchstart', activateAllVideos, { once: true });
        document.addEventListener('click', activateAllVideos, { once: true });
    }
});

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
// (oculto al inicio, aparece solo al subir, se oculta al bajar)
// ===================================
(() => {
    const header = document.getElementById('header');
    let lastScrollY = window.scrollY;
    let ticking = false;
    const minScrollToHide = 80; // no mostrar mientras se está muy arriba de la página

    function updateHeader() {
        const currentScrollY = window.scrollY;
        const scrollingDown = currentScrollY > lastScrollY;

        if (currentScrollY <= minScrollToHide) {
            // Cerca del tope: siempre oculto, igual que en la carga inicial
            header.classList.remove('scrolled');
        } else if (scrollingDown) {
            header.classList.remove('scrolled');
        } else {
            header.classList.add('scrolled');
        }

        lastScrollY = currentScrollY;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateHeader);
            ticking = true;
        }
    });
})();

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
const portfolioItems = document.querySelectorAll('.portfolio-card');

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
    }

    // Click para abrir la sub-tarjeta de detalle (aplica a TODAS las tarjetas)
    item.addEventListener('click', () => {
        openProjectModal(item);
    });
});


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
// PROJECT DETAIL MODAL (sub-tarjeta)
// ===================================
const projectModal = document.getElementById('projectModal');
const modalMedia = document.getElementById('modalMedia');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalIndex = document.getElementById('modalIndex');
let modalCloseTimeout = null;

// Estado del carrusel de la galería dentro del modal
let gallerySlides = [];
let currentSlideIndex = 0;

// Recolecta el media principal de la tarjeta + los medios extra
// definidos en el atributo data-gallery (JSON) de la tarjeta.
function getCardGallery(card) {
    const items = [];

    const mainVideo = card.querySelector('.portfolio-video');
    const mainImage = card.querySelector('.portfolio-image');

    if (mainVideo) {
        const src = mainVideo.querySelector('source')?.src || mainVideo.currentSrc;
        if (src) items.push({ type: 'video', src });
    } else if (mainImage) {
        items.push({ type: 'image', src: mainImage.src });
    }

    const galleryAttr = card.getAttribute('data-gallery');
    if (galleryAttr) {
        try {
            const extra = JSON.parse(galleryAttr);
            if (Array.isArray(extra)) {
                extra.forEach(item => {
                    if (item && item.src && (item.type === 'video' || item.type === 'image')) {
                        items.push(item);
                    }
                });
            }
        } catch (error) {
            console.warn('data-gallery inválido en una tarjeta de portafolio:', error);
        }
    }

    return items;
}

// Construye el carrusel (track + flechas + puntos) dentro de modalMedia
function renderGalleryCarousel(items, title) {
    gallerySlides = items;
    currentSlideIndex = 0;
    modalMedia.innerHTML = '';

    const track = document.createElement('div');
    track.className = 'project-modal-track';

    items.forEach((item, index) => {
        const slide = document.createElement('div');
        slide.className = 'project-modal-slide';

        if (item.type === 'video') {
            const video = document.createElement('video');
            video.src = item.src;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.setAttribute('aria-hidden', 'true');
            if (index === 0) video.autoplay = true;
            slide.appendChild(video);
        } else {
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = `${title} - imagen ${index + 1}`;
            slide.appendChild(img);
        }

        track.appendChild(slide);
    });

    modalMedia.appendChild(track);

    // Solo mostrar controles de navegación si hay más de un elemento
    if (items.length > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'project-modal-nav prev';
        prevBtn.setAttribute('aria-label', 'Media anterior');
        prevBtn.innerHTML = '&#10094;';
        prevBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            goToSlide(currentSlideIndex - 1);
        });

        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'project-modal-nav next';
        nextBtn.setAttribute('aria-label', 'Siguiente media');
        nextBtn.innerHTML = '&#10095;';
        nextBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            goToSlide(currentSlideIndex + 1);
        });

        const dotsWrap = document.createElement('div');
        dotsWrap.className = 'project-modal-dots';
        items.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'project-modal-dot' + (index === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Ir a media ${index + 1}`);
            dot.addEventListener('click', (event) => {
                event.stopPropagation();
                goToSlide(index);
            });
            dotsWrap.appendChild(dot);
        });

        modalMedia.appendChild(prevBtn);
        modalMedia.appendChild(nextBtn);
        modalMedia.appendChild(dotsWrap);

        // Soporte de swipe en táctil
        let touchStartX = 0;
        modalMedia.addEventListener('touchstart', (event) => {
            touchStartX = event.touches[0].clientX;
        }, { passive: true });

        modalMedia.addEventListener('touchend', (event) => {
            const deltaX = event.changedTouches[0].clientX - touchStartX;
            if (Math.abs(deltaX) > 40) {
                goToSlide(currentSlideIndex + (deltaX < 0 ? 1 : -1));
            }
        }, { passive: true });
    }

    updatePlayingSlide();
}

// Mueve el carrusel al índice indicado (con wrap-around)
function goToSlide(index) {
    const total = gallerySlides.length;
    if (total === 0) return;

    currentSlideIndex = (index + total) % total;

    const track = modalMedia.querySelector('.project-modal-track');
    if (track) {
        track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
    }

    modalMedia.querySelectorAll('.project-modal-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlideIndex);
    });

    updatePlayingSlide();
}

// Reproduce solo el video del slide activo y pausa el resto
function updatePlayingSlide() {
    modalMedia.querySelectorAll('.project-modal-slide video').forEach((video, index) => {
        if (index === currentSlideIndex) {
            video.currentTime = 0;
            video.play().catch(() => {});
        } else {
            video.pause();
        }
    });
}

function openProjectModal(card) {
    if (!projectModal) return;

    const title = card.querySelector('.portfolio-title')?.textContent.trim() || 'Proyecto';
    const desc = card.querySelector('.portfolio-desc')?.textContent.trim() || '';

    const allCards = Array.from(document.querySelectorAll('.portfolio-card'));
    const position = allCards.indexOf(card) + 1;

    // Limpiar media anterior
    clearTimeout(modalCloseTimeout);

    const items = getCardGallery(card);
    renderGalleryCarousel(items, title);

    modalIndex.textContent = `Proyecto ${String(position).padStart(2, '0')} / ${String(allCards.length).padStart(2, '0')}`;
    modalTitle.textContent = title;
    modalDesc.textContent = desc;

    document.body.classList.add('modal-open');
    projectModal.classList.add('active');
    projectModal.setAttribute('aria-hidden', 'false');
}

function closeProjectModal() {
    if (!projectModal) return;

    projectModal.classList.remove('active');
    projectModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');

    // Esperar a que termine la transición antes de limpiar el media (evita parpadeo)
    modalCloseTimeout = setTimeout(() => {
        modalMedia.innerHTML = '';
        gallerySlides = [];
        currentSlideIndex = 0;
    }, 450);
}

if (projectModal) {
    projectModal.addEventListener('click', (event) => {
        if (event.target.closest('[data-close]')) {
            closeProjectModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (!projectModal.classList.contains('active')) return;

        if (event.key === 'Escape') {
            closeProjectModal();
        } else if (event.key === 'ArrowRight' && gallerySlides.length > 1) {
            goToSlide(currentSlideIndex + 1);
        } else if (event.key === 'ArrowLeft' && gallerySlides.length > 1) {
            goToSlide(currentSlideIndex - 1);
        }
    });
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
    } else {
        console.warn('Video support: ✗ - Videos may not play correctly');
    }
});
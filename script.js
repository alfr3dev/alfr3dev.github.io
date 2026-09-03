// ===================================
// SCROLL SUAVE GLOBAL (Lenis)
// Da inercia a TODO el scroll de la página, no solo a la tarjeta:
// cuando algo empuja el contenido (como expandir una tarjeta), el
// desplazamiento se siente continuo en vez de "saltar".
// ===================================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let lenis = null;

if (typeof Lenis !== 'undefined' && !prefersReducedMotion) {
    lenis = new Lenis({
        duration: 1.1,                 // qué tan "larga" se siente la inercia
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.2
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
}

// ===================================
// PREVENIR SCROLL AUTOMÁTICO AL CARGAR
// ===================================
// Forzar scroll al inicio antes de que se cargue todo
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// Scroll instantáneo al inicio
window.scrollTo(0, 0);
if (lenis) lenis.scrollTo(0, { immediate: true });



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

// Envuelve el contenido actual de cada tarjeta (media + overlay) en un
// contenedor .portfolio-media, y agrega un panel .portfolio-expand vacío
// (se llena la primera vez que el usuario expande esa tarjeta).
// Así funciona automáticamente para TODAS las tarjetas, sin tocar el HTML.
portfolioItems.forEach(item => {
    const media = document.createElement('div');
    media.className = 'portfolio-media';
    while (item.firstChild) {
        media.appendChild(item.firstChild);
    }
    item.appendChild(media);

    const expand = document.createElement('div');
    expand.className = 'portfolio-expand';
    item.appendChild(expand);

    // Botón +/× SIEMPRE visible (no vive dentro de .portfolio-media,
    // porque esa imagen desaparece por completo al expandir la tarjeta;
    // este botón es lo que permite volver a colapsarla).
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'portfolio-toggle';
    toggleBtn.setAttribute('aria-label', 'Ver u ocultar detalle del proyecto');
    item.appendChild(toggleBtn);

    const video = media.querySelector('.portfolio-video');
    if (video) {
        videoObserver.observe(item);
    }

    // Clic en la miniatura (mientras es visible) o en el botón +/×:
    // expande / colapsa la tarjeta in-place
    media.addEventListener('click', () => {
        toggleCardExpansion(item);
    });

    toggleBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleCardExpansion(item);
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

        if (!target) return;

        const headerOffset = 100;

        if (lenis) {
            lenis.scrollTo(target, { offset: -headerOffset });
        } else {
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    });
});

// ===================================
// PORTFOLIO CARD EXPANDIBLE (in-place)
// ===================================
// Estado de la galería de cada tarjeta (una entrada por card)
const cardGalleryState = new WeakMap();

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

// Construye el panel de detalle (título + descripción + galería) de una
// tarjeta la primera vez que se expande. Se guarda para no reconstruirlo.
function buildCardExpansion(card) {
    const expand = card.querySelector('.portfolio-expand');
    if (!expand || expand.dataset.built === 'true') return;

    const title = card.querySelector('.portfolio-title')?.textContent.trim() || 'Proyecto';
    const hoverDesc = card.querySelector('.portfolio-desc')?.textContent.trim() || '';
    // Nombre/subtítulo propio del proyecto (opcional), se muestra dentro
    // del panel expandido, entre el título corto y la descripción larga.
    const subtitle = card.getAttribute('data-subtitle')?.trim() || '';
    // Descripción larga y propia del panel expandido. Si la tarjeta no
    // define data-full-desc, se usa la misma descripción corta del hover
    // como respaldo (para no romper tarjetas que aún no la tengan).
    const desc = card.getAttribute('data-full-desc')?.trim() || hoverDesc;
    const items = getCardGallery(card);

    const inner = document.createElement('div');
    inner.className = 'portfolio-expand-inner';

    const grid = document.createElement('div');
    grid.className = 'portfolio-expand-grid';

    // Columna de texto
    const textCol = document.createElement('div');
    textCol.className = 'portfolio-expand-text';

    const titleEl = document.createElement('h3');
    titleEl.className = 'portfolio-expand-title';
    titleEl.textContent = title;

    const elementsForTextCol = [titleEl];

    if (subtitle) {
        const subtitleEl = document.createElement('p');
        subtitleEl.className = 'portfolio-expand-subtitle';
        subtitleEl.textContent = subtitle;
        elementsForTextCol.push(subtitleEl);
    }

    const descEl = document.createElement('p');
    descEl.className = 'portfolio-expand-desc';
    descEl.textContent = desc;
    elementsForTextCol.push(descEl);

    textCol.append(...elementsForTextCol);

    // Columna de galería
    const galleryCol = document.createElement('div');
    galleryCol.className = 'portfolio-expand-gallery';
    renderCardGallery(galleryCol, items, title);

    grid.append(textCol, galleryCol);
    inner.appendChild(grid);
    expand.appendChild(inner);

    expand.dataset.built = 'true';
}

// Crea el carrusel (track + flechas + puntos) dentro del contenedor dado
function renderCardGallery(container, items, title) {
    cardGalleryState.set(container, { items, currentIndex: 0 });

    const track = document.createElement('div');
    track.className = 'portfolio-gallery-track';

    items.forEach((item, index) => {
        const slide = document.createElement('div');
        slide.className = 'portfolio-gallery-slide';

        if (item.type === 'video') {
            const video = document.createElement('video');
            video.src = item.src;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.setAttribute('aria-hidden', 'true');
            slide.appendChild(video);
        } else {
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = `${title} - imagen ${index + 1}`;
            slide.appendChild(img);
        }

        track.appendChild(slide);
    });

    container.appendChild(track);

    // Solo mostrar controles de navegación si hay más de un elemento
    if (items.length > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'portfolio-gallery-nav prev';
        prevBtn.setAttribute('aria-label', 'Media anterior');
        prevBtn.innerHTML = '&#10094;';
        prevBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            goToCardSlide(container, cardGalleryState.get(container).currentIndex - 1);
        });

        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'portfolio-gallery-nav next';
        nextBtn.setAttribute('aria-label', 'Siguiente media');
        nextBtn.innerHTML = '&#10095;';
        nextBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            goToCardSlide(container, cardGalleryState.get(container).currentIndex + 1);
        });

        const dotsWrap = document.createElement('div');
        dotsWrap.className = 'portfolio-gallery-dots';
        items.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'portfolio-gallery-dot' + (index === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Ir a media ${index + 1}`);
            dot.addEventListener('click', (event) => {
                event.stopPropagation();
                goToCardSlide(container, index);
            });
            dotsWrap.appendChild(dot);
        });

        container.append(prevBtn, nextBtn, dotsWrap);

        // Evitar que un click dentro de la galería colapse la tarjeta
        container.addEventListener('click', (event) => event.stopPropagation());

        // Soporte de swipe en táctil
        let touchStartX = 0;
        container.addEventListener('touchstart', (event) => {
            touchStartX = event.touches[0].clientX;
        }, { passive: true });

        container.addEventListener('touchend', (event) => {
            const deltaX = event.changedTouches[0].clientX - touchStartX;
            if (Math.abs(deltaX) > 40) {
                const state = cardGalleryState.get(container);
                goToCardSlide(container, state.currentIndex + (deltaX < 0 ? 1 : -1));
            }
        }, { passive: true });
    } else {
        // Con un solo media, igual evitamos que el click en la imagen colapse
        container.addEventListener('click', (event) => event.stopPropagation());
    }
}

// Mueve el carrusel de una tarjeta al índice indicado (con wrap-around)
function goToCardSlide(container, index) {
    const state = cardGalleryState.get(container);
    if (!state) return;

    const total = state.items.length;
    if (total === 0) return;

    state.currentIndex = (index + total) % total;

    const track = container.querySelector('.portfolio-gallery-track');
    if (track) {
        track.style.transform = `translateX(-${state.currentIndex * 100}%)`;
    }

    container.querySelectorAll('.portfolio-gallery-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === state.currentIndex);
    });

    updateCardPlayingSlide(container);
}

// Reproduce solo el video del slide activo de esa galería y pausa el resto
function updateCardPlayingSlide(container) {
    const state = cardGalleryState.get(container);
    if (!state) return;

    container.querySelectorAll('.portfolio-gallery-slide video').forEach((video, index) => {
        if (index === state.currentIndex) {
            video.currentTime = 0;
            video.play().catch(() => {});
        } else {
            video.pause();
        }
    });
}

// Alterna el estado expandido/colapsado de una tarjeta
function toggleCardExpansion(card) {
    if (card.classList.contains('is-expanded')) {
        collapseCard(card);
    } else {
        expandCard(card);
    }
}

// Mientras el panel de detalle crece o se encoge, el alto total de la
// página cambia cuadro a cuadro; avisamos a Lenis en cada frame de esa
// transición para que sus límites de scroll y la inercia se mantengan
// en sync con el nuevo alto (evita saltos/"trabado" al hacer scroll).
function syncScrollDuringTransition(el) {
    if (!lenis) return;

    const expand = el.querySelector('.portfolio-expand');
    if (!expand) return;

    const start = performance.now();
    const duration = 650; // debe cubrir la transición CSS (0.6s) + margen

    function tick(now) {
        lenis.resize();
        if (now - start < duration) {
            requestAnimationFrame(tick);
        }
    }
    requestAnimationFrame(tick);
}

function expandCard(card) {
    buildCardExpansion(card);
    card.classList.add('is-expanded');

    const galleryCol = card.querySelector('.portfolio-expand-gallery');
    if (galleryCol) {
        updateCardPlayingSlide(galleryCol);
    }

    syncScrollDuringTransition(card);
}

function collapseCard(card) {
    card.classList.remove('is-expanded');

    // Pausar cualquier video de la galería (el video principal de la
    // miniatura sigue su propio ciclo de vida vía videoObserver)
    const galleryCol = card.querySelector('.portfolio-expand-gallery');
    if (galleryCol) {
        galleryCol.querySelectorAll('video').forEach(video => video.pause());
    }

    syncScrollDuringTransition(card);
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
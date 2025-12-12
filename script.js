const VIEWPORT_HEIGHT = window.innerHeight;

const SCROLL_DISTANCE = VIEWPORT_HEIGHT;

let hero;
let curtainLeft;
let curtainRight;
let mainContent;

let curtainFullyOpen = false;
let ticking = false;

function handleScroll() {
    if (curtainFullyOpen) {
        return;
    }

    const scrollPosition = window.scrollY || window.pageYOffset;

    const progress = Math.min(scrollPosition / SCROLL_DISTANCE, 1);

    updateCurtainPosition(progress);

    if (progress >= 1 && !curtainFullyOpen) {
        onCurtainFullyOpen();
    }
}

function updateCurtainPosition(progress) {
    const displacement = progress * 100;

    curtainLeft.style.transform = `translateX(-${displacement}%)`;

    curtainRight.style.transform = `translateX(${displacement}%)`;

    hero.style.opacity = 1 - (progress * 0.2);
}

function onCurtainFullyOpen() {
    curtainFullyOpen = true;

    hero.style.opacity = '0';
    hero.style.pointerEvents = 'none';

    setTimeout(() => {
        hero.style.display = 'none';
    }, 300);

    hero.classList.add('curtain-opened');
}

function requestScrollUpdate() {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            handleScroll();
            ticking = false;
        });
        ticking = true;
    }
}

function init() {
    // Seleciona os elementos DOM
    hero = document.getElementById('hero');
    curtainLeft = document.querySelector('.curtain-left');
    curtainRight = document.querySelector('.curtain-right');
    mainContent = document.getElementById('main-content');

    if (!hero || !curtainLeft || !curtainRight || !mainContent) {
        console.error('Erro: Elementos da cortina não encontrados!');
        return;
    }

    curtainLeft.style.transform = 'translateX(0)';
    curtainRight.style.transform = 'translateX(0)';

    hero.style.opacity = '1';

    handleScroll();
}

// Listener de scroll otimizado com requestAnimationFrame
window.addEventListener('scroll', requestScrollUpdate, { passive: true });

// Executa a inicialização quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (!curtainFullyOpen) {
            // Força recalculo da posição das cortinas
            curtainFullyOpen = false;
            handleScroll();
        }
    }, 250);
});

function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16); // 60fps
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target + '%';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start) + '%';
        }
    }, 16);
}

function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

let counterAnimated = false;
function checkCounterVisibility() {
    const counter = document.getElementById('stat-counter');
    if (!counter || counterAnimated) return;

    const rect = counter.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

    if (isVisible) {
        counterAnimated = true;
        animateCounter(counter, 45, 2500);
        window.removeEventListener('scroll', checkCounterVisibility);
    }
}

window.addEventListener('scroll', checkCounterVisibility);
window.addEventListener('load', checkCounterVisibility);


function initGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            // Se esta imagem já está expandida, colapsa
            if (this.classList.contains('expanded')) {
                this.classList.remove('expanded');
            } else {
                galleryItems.forEach(otherItem => {
                    otherItem.classList.remove('expanded');
                });

                this.classList.add('expanded');
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', initGallery);
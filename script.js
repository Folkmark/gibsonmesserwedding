// Shared nav + scroll-reveal logic (all pages except home loader)
document.addEventListener("DOMContentLoaded", () => {

    // --- Menu Toggle -----------------------------------------
    const menuToggle = document.getElementById("menu-toggle");
    const menuLinks  = document.querySelectorAll(".menu-close-trigger");

    menuToggle.addEventListener("click", () => {
        const opening = !document.body.classList.contains("menu-open");
        document.body.classList.toggle("menu-open");
        if (!opening) {
            // Menu just closed — re-evaluate hero nav mode
            const hero = document.querySelector('.hero');
            const nav  = document.querySelector('nav');
            if (hero && nav) {
                nav.classList.toggle('nav--hero', hero.getBoundingClientRect().bottom > 0);
            }
        } else {
            // Menu opening — remove hero mode so blend doesn't interfere
            document.querySelector('nav')?.classList.remove('nav--hero');
        }
    });

    menuLinks.forEach(link => {
        link.addEventListener("click", () => {
            document.body.classList.remove("menu-open");
        });
    });

    // --- Hero Nav Mode ---------------------------------------
    const hero = document.querySelector('.hero');
    const nav  = document.querySelector('nav');
    if (hero && nav) {
        const updateNavMode = () => {
            if (!document.body.classList.contains('menu-open')) {
                nav.classList.toggle('nav--hero', hero.getBoundingClientRect().bottom > 0);
            }
        };
        updateNavMode();
        window.addEventListener('scroll', updateNavMode, { passive: true });
        // Re-check when menu closes in case scroll happened while open
        document.body.addEventListener('menu-closed', updateNavMode);
    }

    // --- Scroll Reveal ---------------------------------------
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: "0px 0px -15% 0px",
        threshold: 0.1
    });

    document.querySelectorAll(".reveal-up, .image-wrapper").forEach(el => {
        revealObserver.observe(el);
    });
});

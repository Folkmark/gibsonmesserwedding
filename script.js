// Shared nav + scroll-reveal logic (all pages except home loader)
document.addEventListener("DOMContentLoaded", () => {

    // --- Menu Toggle -----------------------------------------
    const menuToggle = document.getElementById("menu-toggle");
    const menuLinks  = document.querySelectorAll(".menu-close-trigger");

    menuToggle.addEventListener("click", () => {
        document.body.classList.toggle("menu-open");
    });

    menuLinks.forEach(link => {
        link.addEventListener("click", () => {
            document.body.classList.remove("menu-open");
        });
    });

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

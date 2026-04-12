/**
 * Gibson–Messer RSVP Modal
 *
 * Opens the full RSVP form as a pop-up card when any /rsvp/ link is
 * clicked on inner pages. The dedicated /rsvp/ page is unchanged and
 * remains reachable as a direct-link fallback.
 *
 * Usage: add  <script src="/rsvp-modal.js"></script>  before </body>
 * on any page that should show the modal instead of navigating.
 */
(function () {
    'use strict';

    // ─── Config ──────────────────────────────────────────────────────────────

    var RSVP_URL        = '/rsvp/';
    var RSVP_SCRIPT     = '/rsvp/rsvp.js';
    var CLOSE_DELAY_MS  = 550;   // slightly longer than CSS transition

    // ─── Build dialog ────────────────────────────────────────────────────────

    var modal = document.createElement('dialog');
    modal.id        = 'rsvp-modal';
    modal.className = 'rsvp-modal';
    modal.setAttribute('aria-label', 'Respond to invitation');

    modal.innerHTML =
        '<div class="rsvp-modal__chrome">' +
            '<button class="rsvp-modal__close subheader-font" aria-label="Close">' +
                '&#215;' +
            '</button>' +
        '</div>' +
        '<div class="rsvp-modal__body">' +
            '<div class="rsvp-modal__loader" role="status" aria-label="Loading RSVP form">' +
                '<span class="rsvp-modal__dot"></span>' +
                '<span class="rsvp-modal__dot"></span>' +
                '<span class="rsvp-modal__dot"></span>' +
            '</div>' +
        '</div>';

    document.body.appendChild(modal);

    var closeBtn = modal.querySelector('.rsvp-modal__close');
    var bodyEl   = modal.querySelector('.rsvp-modal__body');

    // ─── Load state ──────────────────────────────────────────────────────────

    var formReady   = false;
    var formLoading = false;

    // ─── Open / close ────────────────────────────────────────────────────────

    function openModal(e) {
        if (e) e.preventDefault();
        modal.showModal();
        // Double rAF: flush layout before applying transition class so the
        // browser registers the starting transform before animating to is-open.
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                modal.classList.add('is-open');
            });
        });
        loadFormOnce();
    }

    function closeModal() {
        modal.classList.remove('is-open');
        var done = false;
        function finish() {
            if (done) return;
            done = true;
            modal.close();
            resetForm();
        }
        modal.addEventListener('transitionend', finish, { once: true });
        setTimeout(finish, CLOSE_DELAY_MS);
    }

    // ─── Form loading ────────────────────────────────────────────────────────

    function loadFormOnce() {
        if (formReady || formLoading) return;
        formLoading = true;

        fetch(RSVP_URL)
            .then(function (res) {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.text();
            })
            .then(function (html) {
                var parser  = new DOMParser();
                var doc     = parser.parseFromString(html, 'text/html');
                var section = doc.querySelector('.rsvp-section');
                if (!section) throw new Error('.rsvp-section not found in /rsvp/');

                // Replace loader with actual form markup
                bodyEl.innerHTML = section.outerHTML;

                // Scroll modal to top whenever a new step enters
                watchStepTransitions();

                // Dynamically load rsvp.js — its IIFE calls init() automatically
                return loadScript(RSVP_SCRIPT);
            })
            .then(function () {
                formReady   = true;
                formLoading = false;
            })
            .catch(function () {
                // Graceful fallback: navigate to the dedicated page
                window.location.href = RSVP_URL;
            });
    }

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            var s    = document.createElement('script');
            s.src    = src;
            s.onload  = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    // ─── Step scroll helper ───────────────────────────────────────────────────

    function watchStepTransitions() {
        var observer = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
                if (mutations[i].target.classList.contains('step--entered')) {
                    modal.scrollTo({ top: 0, behavior: 'smooth' });
                    break;
                }
            }
        });
        document.querySelectorAll('.rsvp-step').forEach(function (el) {
            observer.observe(el, { attributes: true, attributeFilter: ['class'] });
        });
    }

    // ─── State reset on close ────────────────────────────────────────────────

    function resetForm() {
        // window.__rsvpReset is defined inside rsvp.js once it loads
        if (typeof window.__rsvpReset === 'function') {
            window.__rsvpReset();
        }
        modal.scrollTo({ top: 0 });
    }

    // ─── Intercept /rsvp/ link clicks ────────────────────────────────────────

    document.addEventListener('click', function (e) {
        var el = e.target.closest('a[href]');
        if (!el) return;
        var href = el.getAttribute('href') || '';
        if (href === '/rsvp/' || href === '/rsvp') {
            openModal(e);
        }
    });

    // ─── Close triggers ───────────────────────────────────────────────────────

    closeBtn.addEventListener('click', closeModal);

    // ESC fires 'cancel' on <dialog>; prevent the browser's default
    // immediate close so our exit animation can play first.
    modal.addEventListener('cancel', function (e) {
        e.preventDefault();
        closeModal();
    });

}());

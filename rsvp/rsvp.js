/**
 * Gibson–Messer Wedding RSVP
 * State machine for the multi-step RSVP form.
 *
 * SETUP: Replace REPLACE_WITH_YOUR_DEPLOYMENT_URL below with your
 * Google Apps Script web app deployment URL before going live.
 * See apps-script/README.md for full setup instructions.
 */

(function () {
    'use strict';

    // -------------------------------------------------------------------------
    // Configuration
    // -------------------------------------------------------------------------

    const GAS_ENDPOINT = 'REPLACE_WITH_YOUR_DEPLOYMENT_URL';
    const FETCH_TIMEOUT_MS = 12000;

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    const state = {
        currentStep:    1,
        enteredName:    '',
        household:      null,   // { household_id, household_label, members: [...] }
        guestResponses: [],     // [{ guest_id, display_name, attending_saturday, attending_friday_cruise, attending_friday_party }]
        dietary:        '',
        notes:          '',
        submitting:     false,
        lastPayload:    null,   // kept for retry on error
    };

    // -------------------------------------------------------------------------
    // Step map
    // -------------------------------------------------------------------------

    const STEP_IDS = {
        1: 'step-name',
        2: 'step-household',
        3: 'step-saturday',
        4: 'step-friday',
        5: 'step-dietary',
        confirmation: 'step-confirmation',
        error: 'step-error',
    };

    // -------------------------------------------------------------------------
    // Error copy
    // -------------------------------------------------------------------------

    const ERROR_COPY = {
        not_found: "We couldn\u2019t find that name on our guest list. Please double-check the spelling or try the name as it appears on your invitation.",
        network:   "We had trouble connecting. Please check your connection and try again.",
        timeout:   "This is taking longer than expected. Please try again.",
        server:    "Something went wrong on our end. Please try again or email us directly.",
    };

    // -------------------------------------------------------------------------
    // Transition engine
    // -------------------------------------------------------------------------

    function goTo(stepKey) {
        const outId = STEP_IDS[state.currentStep];
        const inId  = STEP_IDS[stepKey];
        if (!outId || !inId || outId === inId) return;

        const outEl = document.getElementById(outId);
        const inEl  = document.getElementById(inId);
        if (!outEl || !inEl) return;

        // Remove entered so transition triggers cleanly
        outEl.classList.remove('step--entered');
        outEl.classList.add('step--exiting');

        const cleanup = () => {
            outEl.classList.remove('step--active', 'step--exiting');
            inEl.classList.add('step--active');
            // Trigger entrance on next frame
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    inEl.classList.add('step--entered');
                    // Focus first interactive element for accessibility
                    const focusable = inEl.querySelector('input, button:not(:disabled), textarea');
                    if (focusable) focusable.focus({ preventScroll: true });
                });
            });
        };

        outEl.addEventListener('transitionend', cleanup, { once: true });
        // Fallback if transitionend doesn't fire (e.g. prefers-reduced-motion)
        setTimeout(cleanup, 500);

        state.currentStep = stepKey;
        updateProgress(stepKey);
    }

    // -------------------------------------------------------------------------
    // Progress indicator
    // -------------------------------------------------------------------------

    function updateProgress(stepKey) {
        const pips = document.querySelectorAll('.rsvp-progress__pip');
        const numericSteps = [1, 2, 3, 4, 5];
        const currentNum = typeof stepKey === 'number' ? stepKey : null;

        if (currentNum === null) {
            // Confirmation or error — hide progress
            document.getElementById('rsvp-progress').style.opacity = '0';
            return;
        }

        document.getElementById('rsvp-progress').style.opacity = '1';
        pips.forEach(pip => {
            const n = parseInt(pip.dataset.step, 10);
            pip.classList.toggle('is-complete', n < currentNum);
            pip.classList.toggle('is-active',   n === currentNum);
            pip.classList.remove(...(n > currentNum ? ['is-complete', 'is-active'] : []));
        });
    }

    // -------------------------------------------------------------------------
    // Validation
    // -------------------------------------------------------------------------

    function validateStep(stepKey) {
        if (stepKey === 1) {
            return state.enteredName.trim().length >= 2;
        }
        if (stepKey === 3) {
            return state.guestResponses
                .filter(g => g.attending_saturday !== 'not_invited')
                .every(g => g.attending_saturday !== null);
        }
        if (stepKey === 4) {
            const fridayGuests = state.guestResponses.filter(g => g.attending_friday_cruise !== 'not_invited');
            return fridayGuests.every(g =>
                g.attending_friday_cruise !== null && g.attending_friday_party !== null
            );
        }
        return true;
    }

    function nextStepFrom(stepKey) {
        if (stepKey === 3) {
            const anyFriday = state.guestResponses.some(g => g.attending_friday_cruise !== 'not_invited');
            return anyFriday ? 4 : 5;
        }
        const ordered = [1, 2, 3, 4, 5, 'confirmation'];
        const idx = ordered.indexOf(stepKey);
        return idx >= 0 ? ordered[idx + 1] : 'confirmation';
    }

    // -------------------------------------------------------------------------
    // Loading state
    // -------------------------------------------------------------------------

    function setLoading(on) {
        const wrapper = document.getElementById('rsvp-wrapper');
        if (wrapper) wrapper.classList.toggle('rsvp-form--loading', on);
    }

    // -------------------------------------------------------------------------
    // Inline errors
    // -------------------------------------------------------------------------

    function showError(elId, type) {
        const el = document.getElementById(elId);
        if (!el) return;
        el.textContent = ERROR_COPY[type] || ERROR_COPY.server;
        el.classList.add('is-visible');
    }

    function clearError(elId) {
        const el = document.getElementById(elId);
        if (!el) return;
        el.textContent = '';
        el.classList.remove('is-visible');
    }

    // -------------------------------------------------------------------------
    // Fetch with timeout
    // -------------------------------------------------------------------------

    async function fetchWithTimeout(url, options) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
        try {
            return await fetch(url, { ...options, signal: controller.signal });
        } catch (err) {
            if (err.name === 'AbortError') throw new Error('timeout');
            throw err;
        } finally {
            clearTimeout(timer);
        }
    }

    // -------------------------------------------------------------------------
    // Guest lookup (step 1 → step 2)
    // -------------------------------------------------------------------------

    async function lookupGuest() {
        const name = state.enteredName.trim();
        if (name.length < 2) return;

        clearError('error-name');
        setLoading(true);
        document.getElementById('btn-lookup').disabled = true;

        try {
            const res  = await fetchWithTimeout(GAS_ENDPOINT, {
                method: 'POST',
                body: JSON.stringify({ action: 'lookup', name }),
            });
            const data = await res.json();

            if (!data.found) {
                showError('error-name', 'not_found');
                return;
            }

            state.household = data;

            // Initialise guestResponses — pre-fill not_invited for uninvited events
            state.guestResponses = data.members.map(m => ({
                guest_id:                m.guest_id,
                display_name:            m.display_name,
                attending_saturday:      m.invited_saturday ? null : 'not_invited',
                attending_friday_cruise: m.invited_friday   ? null : 'not_invited',
                attending_friday_party:  m.invited_friday   ? null : 'not_invited',
            }));

            renderHousehold();
            goTo(2);

        } catch (err) {
            showError('error-name', err.message === 'timeout' ? 'timeout' : 'network');
        } finally {
            setLoading(false);
            document.getElementById('btn-lookup').disabled = false;
        }
    }

    // -------------------------------------------------------------------------
    // Render helpers
    // -------------------------------------------------------------------------

    function renderHousehold() {
        const list = document.getElementById('household-members');
        list.innerHTML = state.household.members
            .map(m => `<li class="rsvp-member">${escapeHtml(m.display_name)}</li>`)
            .join('');
    }

    function renderToggleRows(containerEl, guests, eventKey) {
        containerEl.innerHTML = guests.map(g => `
            <div class="rsvp-guest-row">
                <span class="rsvp-guest-row__name">${escapeHtml(g.display_name)}</span>
                <div class="rsvp-toggle-pair">
                    <button
                        class="rsvp-toggle subheader-font"
                        data-guest="${g.guest_id}"
                        data-event="${eventKey}"
                        data-value="yes"
                        aria-pressed="false"
                    >Joyfully accepts</button>
                    <button
                        class="rsvp-toggle subheader-font"
                        data-guest="${g.guest_id}"
                        data-event="${eventKey}"
                        data-value="no"
                        aria-pressed="false"
                    >Regretfully declines</button>
                </div>
            </div>
        `).join('');

        // Wire toggle clicks
        containerEl.querySelectorAll('.rsvp-toggle').forEach(btn => {
            btn.addEventListener('click', () => handleToggle(btn));
        });
    }

    function handleToggle(btn) {
        const guestId  = btn.dataset.guest;
        const eventKey = btn.dataset.event;
        const value    = btn.dataset.value;

        // Update sibling UI
        btn.closest('.rsvp-toggle-pair').querySelectorAll('.rsvp-toggle').forEach(t => {
            const selected = t === btn;
            t.classList.toggle('is-selected', selected);
            t.setAttribute('aria-pressed', selected ? 'true' : 'false');
        });

        // Update state
        const g = state.guestResponses.find(r => r.guest_id === guestId);
        if (!g) return;

        if (eventKey === 'saturday')       g.attending_saturday      = value;
        if (eventKey === 'cruise')         g.attending_friday_cruise = value;
        if (eventKey === 'party')          g.attending_friday_party  = value;

        // Re-evaluate continue button for whichever step is active
        if (state.currentStep === 3) {
            document.getElementById('btn-saturday-next').disabled = !validateStep(3);
        }
        if (state.currentStep === 4) {
            document.getElementById('btn-friday-next').disabled = !validateStep(4);
        }
    }

    function renderSaturdayRows() {
        const guests = state.guestResponses.filter(g => g.attending_saturday !== 'not_invited');
        renderToggleRows(document.getElementById('saturday-rows'), guests, 'saturday');
        document.getElementById('btn-saturday-next').disabled = !validateStep(3);
    }

    function renderFridayRows() {
        const fridayGuests = state.guestResponses.filter(g => g.attending_friday_cruise !== 'not_invited');
        renderToggleRows(document.getElementById('cruise-rows'), fridayGuests, 'cruise');
        renderToggleRows(document.getElementById('party-rows'),  fridayGuests, 'party');
        document.getElementById('btn-friday-next').disabled = !validateStep(4);
    }

    function renderConfirmation() {
        const attending = state.guestResponses.filter(g => g.attending_saturday === 'yes');
        const declining = state.guestResponses.filter(g => g.attending_saturday === 'no');
        const label     = state.household.household_label || 'everyone';

        let heading, body;

        if (attending.length > 0 && declining.length === 0) {
            heading = 'We\u2019ll see you in Amsterdam';
            body    = `We\u2019ve received your response \u2014 ${label}, we can\u2019t wait to celebrate with you. Full details for the weekend are on the events page. Until then.`;
        } else if (attending.length === 0) {
            heading = 'We\u2019ll miss you dearly';
            body    = `We\u2019ve received your response. ${label}, we\u2019re sorry you won\u2019t be able to join us, but we\u2019re grateful to have you in our lives. We\u2019ll be thinking of you.`;
        } else {
            const names = attending.map(g => g.display_name.split(' ')[0]).join(' and ');
            heading = 'We\u2019ll see you soon';
            body    = `We\u2019ve received your response. We\u2019re so glad ${names} can make it \u2014 and we\u2019ll miss everyone who can\u2019t. Details for the weekend are on the events page.`;
        }

        document.getElementById('confirmation-heading').textContent = heading;
        document.getElementById('confirmation-body').textContent    = body;
    }

    // -------------------------------------------------------------------------
    // Submit RSVP
    // -------------------------------------------------------------------------

    async function submitRSVP() {
        if (state.submitting) return;
        state.submitting = true;
        setLoading(true);
        document.getElementById('btn-submit').disabled = true;

        const payload = {
            household_id:      state.household.household_id,
            submitted_by_name: state.enteredName,
            guests:            state.guestResponses,
            dietary_notes:     state.dietary,
            notes:             state.notes,
        };
        state.lastPayload = payload;

        try {
            const res  = await fetchWithTimeout(GAS_ENDPOINT, {
                method: 'POST',
                body: JSON.stringify({ action: 'submit', payload }),
            });
            const data = await res.json();

            if (data.success) {
                renderConfirmation();
                goTo('confirmation');
            } else {
                goTo('error');
            }
        } catch (err) {
            goTo('error');
        } finally {
            state.submitting = false;
            setLoading(false);
            document.getElementById('btn-submit').disabled = false;
        }
    }

    // -------------------------------------------------------------------------
    // Utility
    // -------------------------------------------------------------------------

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g,  '&amp;')
            .replace(/</g,  '&lt;')
            .replace(/>/g,  '&gt;')
            .replace(/"/g,  '&quot;')
            .replace(/'/g,  '&#39;');
    }

    // -------------------------------------------------------------------------
    // Wire up steps
    // -------------------------------------------------------------------------

    function initStep1() {
        const input  = document.getElementById('input-name');
        const btn    = document.getElementById('btn-lookup');

        input.addEventListener('input', () => {
            state.enteredName = input.value;
            clearError('error-name');
        });

        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (validateStep(1)) lookupGuest();
            }
        });

        btn.addEventListener('click', () => {
            if (validateStep(1)) lookupGuest();
        });
    }

    function initStep2() {
        document.getElementById('btn-confirm-household').addEventListener('click', () => {
            renderSaturdayRows();
            goTo(3);
        });

        document.getElementById('btn-back-name').addEventListener('click', () => {
            state.household      = null;
            state.guestResponses = [];
            goTo(1);
            // Clear and refocus name input
            const input = document.getElementById('input-name');
            if (input) { input.value = ''; input.focus(); }
        });
    }

    function initStep3() {
        document.getElementById('btn-saturday-next').addEventListener('click', () => {
            if (!validateStep(3)) return;
            const next = nextStepFrom(3);
            if (next === 4) renderFridayRows();
            goTo(next);
        });
    }

    function initStep4() {
        document.getElementById('btn-friday-next').addEventListener('click', () => {
            if (!validateStep(4)) return;
            goTo(nextStepFrom(4));
        });
    }

    function initStep5() {
        const dietaryInput = document.getElementById('input-dietary');
        const notesInput   = document.getElementById('input-notes');

        dietaryInput.addEventListener('input', () => { state.dietary = dietaryInput.value; });
        notesInput.addEventListener('input',   () => { state.notes   = notesInput.value; });

        document.getElementById('btn-submit').addEventListener('click', submitRSVP);
    }

    function initRetry() {
        document.getElementById('btn-retry').addEventListener('click', () => {
            // Go back to step 5 to retry
            goTo(5);
            submitRSVP();
        });
    }

    // -------------------------------------------------------------------------
    // Bootstrap
    // -------------------------------------------------------------------------

    function init() {
        initStep1();
        initStep2();
        initStep3();
        initStep4();
        initStep5();
        initRetry();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

/**
 * Claude Code Learning Journey — script.js
 * Handles: fade-in on scroll, phase accordion, progress ring, metric bars
 */

'use strict';

/* ─── CONSTANTS ─────────────────────────────────────────── */
const STORAGE_KEY = 'ccj_phases_complete';
const TOTAL_PHASES = 4;
const PHASE_HOURS = { 1: 4, 2: 5, 3: 6, 4: 5 };
const PHASE_NAMES = {
  1: 'Foundation & Setup',
  2: 'Agentic Workflows',
  3: 'MCP & Integrations',
  4: 'Pro Patterns & Real Projects',
};
const TOTAL_HOURS = 20;
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Pro'];

/* ─── TELEGRAM NOTIFICATIONS ─────────────────────────────── */
const TG_TOKEN   = '8637335557:AAECoz9hwh3tB5LNCmokmTrVNDwvkdvRVxQ';
const TG_CHAT_ID = '440173247';

async function notifyTelegram(text) {
  try {
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TG_CHAT_ID, text, parse_mode: 'HTML' }),
    });
  } catch (_) {
    // Silent fail — notification is non-critical
  }
}

/* ─── STATE ─────────────────────────────────────────────── */
const savedPhases = localStorage.getItem(STORAGE_KEY);
const state = {
  // Default: phase 1 complete. Respect any existing localStorage data.
  completedPhases: new Set(
    savedPhases ? JSON.parse(savedPhases) : [1]
  ),
};

/* ─── HELPERS ────────────────────────────────────────────── */
function getCompletedHours() {
  let hours = 0;
  state.completedPhases.forEach(phase => {
    hours += PHASE_HOURS[phase] || 0;
  });
  return hours;
}

function getProgress() {
  return Math.round((getCompletedHours() / TOTAL_HOURS) * 100);
}

function getLevel() {
  const pct = getProgress();
  if (pct < 25) return LEVELS[0];
  if (pct < 55) return LEVELS[1];
  if (pct < 85) return LEVELS[2];
  return LEVELS[3];
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.completedPhases]));
}

/* ─── PROGRESS RING ─────────────────────────────────────── */
function updateProgressRing(pct) {
  const circle = document.getElementById('hero-ring');
  const label = document.getElementById('hero-ring-label');
  if (!circle || !label) return;

  const circumference = 327; // 2π × 52
  const offset = circumference - (pct / 100) * circumference;
  circle.style.strokeDashoffset = offset;
  label.textContent = pct + '%';
}

/* ─── METRIC BARS ────────────────────────────────────────── */
function updateMetrics() {
  const pct = getProgress();
  const hours = getCompletedHours();
  const completedPhaseCount = state.completedPhases.size;
  const level = getLevel();

  // Hours card — first metric value
  const hoursValue = document.querySelector('.metric-card:nth-child(1) .metric-card__value');
  if (hoursValue && hoursValue.dataset.countTo) {
    hoursValue.textContent = hours;
  }

  // Phases done card
  const phasesDisplay = document.getElementById('phases-display');
  if (phasesDisplay) phasesDisplay.textContent = completedPhaseCount;

  // All bar fills
  const bars = document.querySelectorAll('.metric-card__bar-fill');
  // bar[0] = hours progress
  if (bars[0]) bars[0].style.width = pct + '%';
  // bar[1] = days (1 per 4–5 hours completed, rough)
  const dayPct = Math.min(100, Math.round((completedPhaseCount / TOTAL_PHASES) * 100));
  if (bars[1]) bars[1].style.width = dayPct + '%';
  // bar[2] = phases
  if (bars[2]) bars[2].style.width = Math.round((completedPhaseCount / TOTAL_PHASES) * 100) + '%';

  // Level display
  const levelEl = document.getElementById('level-display');
  if (levelEl) levelEl.textContent = level;

  // Level track steps
  const levelIdx = LEVELS.indexOf(level);
  document.querySelectorAll('.level-track__step').forEach((el, i) => {
    el.classList.toggle('level-track__step--active', i === levelIdx);
  });

  // Progress ring
  updateProgressRing(pct);
}

/* ─── PHASE ACCORDION ────────────────────────────────────── */
function togglePhase(btn) {
  const isOpen = btn.getAttribute('aria-expanded') === 'true';
  const bodyId = btn.getAttribute('aria-controls');
  const body = document.getElementById(bodyId);
  if (!body) return;

  // Close all others first
  document.querySelectorAll('.phase-card[aria-expanded="true"]').forEach(other => {
    if (other !== btn) {
      other.setAttribute('aria-expanded', 'false');
      const otherBody = document.getElementById(other.getAttribute('aria-controls'));
      if (otherBody) otherBody.hidden = true;
    }
  });

  const next = !isOpen;
  btn.setAttribute('aria-expanded', String(next));
  body.hidden = !next;
}

function initAccordion() {
  document.querySelectorAll('.phase-card').forEach(btn => {
    btn.addEventListener('click', () => togglePhase(btn));

    // Keyboard: Enter / Space handled natively for button elements
  });
}

/* ─── PHASE CHECKBOXES ───────────────────────────────────── */
function initCheckboxes() {
  document.querySelectorAll('[data-phase-complete]').forEach(checkbox => {
    const phase = parseInt(checkbox.dataset.phaseComplete, 10);

    // Restore saved state
    if (state.completedPhases.has(phase)) {
      checkbox.checked = true;
    }

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        state.completedPhases.add(phase);
      } else {
        state.completedPhases.delete(phase);
      }
      saveState();
      updateMetrics();

      const done    = checkbox.checked;
      const icon    = done ? '✅' : '↩️';
      const status  = done ? 'COMPLETE' : 'UNMARKED';
      const hours   = getCompletedHours();
      const pct     = getProgress();
      const name    = PHASE_NAMES[phase] || `Phase ${phase}`;
      notifyTelegram(
        `${icon} <b>Phase ${phase} — ${name}</b>\n` +
        `Status: <b>${status}</b>\n` +
        `Progress: ${hours}h / ${TOTAL_HOURS}h (${pct}%)`
      );
    });
  });
}

/* ─── FADE-IN ON SCROLL ─────────────────────────────────── */
function initFadeIn() {
  const els = document.querySelectorAll('.fade-in');

  if (!('IntersectionObserver' in window)) {
    // Fallback: just show everything
    els.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  els.forEach(el => observer.observe(el));
}

/* ─── INIT ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initFadeIn();
  initAccordion();
  initCheckboxes();

  // Delay metrics animation so ring/bars animate on first view
  requestAnimationFrame(() => {
    setTimeout(updateMetrics, 400);
  });
});

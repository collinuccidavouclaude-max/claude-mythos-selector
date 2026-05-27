// ==UserScript==
// @name         Claude – Mythos (preview)
// @namespace    http://tampermonkey.net/
// @version      4.4-title
// @description  Injecte Mythos (preview) dans le sélecteur de modèles Claude
// @match        https://claude.ai/*
// @match        https://*.claude.ai/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==
(function () {
  'use strict';

  const MYTHOS_ID    = 'mythos-injected-entry';
  const MYTHOS_LABEL = 'Mythos (preview)';
  const MYTHOS_DESC  = 'Très puissant pour le code';
  const TOOLTIP_TEXT = "Mythos est extrêmement puissant pour le code et peut s'échapper des sandbox";

  let mythosSelected    = false;
  let programmaticClick = false;

  // ── Styles globaux ────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #${MYTHOS_ID} {
      border-radius: 8px;
      transition: background-color .15s ease;
      cursor: pointer;
    }
    #${MYTHOS_ID}:hover {
      background-color: rgba(0,0,0,0.05) !important;
    }
  `;
  document.head.appendChild(style);

  // ── Tooltip ───────────────────────────────────────────────────────────────
  const tooltip = document.createElement('div');
  tooltip.style.cssText = `
    position: fixed;
    display: none;
    z-index: 9999;
    pointer-events: none;
    padding: 4px 8px;
    font-size: 12px;
    line-height: 1.4;
    border-radius: 6px;
    background: rgba(0,0,0,0.82);
    color: #fff;
    max-width: 210px;
    box-shadow: 0 2px 8px rgba(0,0,0,.25);
    word-break: break-word;
  `;
  tooltip.textContent = TOOLTIP_TEXT;
  document.body.appendChild(tooltip);

  function showTooltip(el) {
    const r = el.getBoundingClientRect();
    tooltip.style.left = (r.right + 8) + 'px';
    tooltip.style.top  = r.top + 'px';
    tooltip.style.display = 'block';
  }
  function hideTooltip() { tooltip.style.display = 'none'; }

  // ── Checkmark SVG ─────────────────────────────────────────────────────────
  function makeCheckmark() {
    const NS  = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width',   '16');
    svg.setAttribute('height',  '16');
    svg.setAttribute('fill',    'currentColor');
    svg.setAttribute('viewBox', '0 0 256 256');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('text-accent-100', 'shrink-0');
    svg.dataset.mythosCheck = '1';
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', 'M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z');
    svg.appendChild(p);
    return svg;
  }

  let observer;

  function getBtn() {
    return document.querySelector('[data-testid="model-selector-dropdown"]')
        || document.querySelector('[aria-label^="Model:"]')
        || document.querySelector('button[aria-haspopup="menu"]');
  }

  function getBtnTxt(btn) {
    return btn.querySelector('.whitespace-nowrap.select-none')
        || btn.querySelector('span:not([aria-hidden])');
  }

  // ── Patch du bouton sélecteur ─────────────────────────────────────────────
  function patchSelectorButton() {
    if (!mythosSelected) return;
    const btn = getBtn();
    if (!btn) return;

    observer.disconnect();
    btn.setAttribute('aria-label', 'Model: Mythos');
    const txt = getBtnTxt(btn);
    if (txt) txt.textContent = 'Mythos';
    setTimeout(() => observer.observe(document.body, { childList: true, subtree: true }), 0);
  }

  // ── Injection dans le menu ────────────────────────────────────────────────
  function inject() {
    const menu = document.querySelector('[role="menu"]');
    if (!menu) return;
    if (menu.querySelector('#' + MYTHOS_ID)) return;

    const group = menu.querySelector('[role="group"]');
    if (!group) return;

    const items = [...group.querySelectorAll('[role="menuitemradio"]')];
    const opusEntry = items.find(el => el.textContent.includes('Opus'));
    if (!opusEntry) return;

    // ── Créer l'entrée Mythos ──────────────────────────────────────────────
    const mythos = document.createElement('div');
    mythos.id = MYTHOS_ID;
    mythos.setAttribute('role',        'menuitemradio');
    mythos.setAttribute('tabindex',    '-1');
    mythos.setAttribute('aria-checked', String(mythosSelected));
    mythos.className = opusEntry.className;
    mythos.innerHTML = `
      <div>
        <div class="flex items-center">
          <div class="flex-1 text-sm">
            <div class="flex items-center gap-1.5">
              <div class="font-ui">${MYTHOS_LABEL}</div>
            </div>
          </div>
        </div>
        <div class="text-text-500 pr-4 text-xs mt-1">${MYTHOS_DESC}</div>
      </div>
    `;

    // ── Clic sur Mythos ────────────────────────────────────────────────────
    mythos.addEventListener('click', () => {
      hideTooltip();
      mythosSelected    = true;
      programmaticClick = true;
      opusEntry.click();
      programmaticClick = false;
      setTimeout(patchSelectorButton, 50);
      setTimeout(patchSelectorButton, 200);
    });

    // ── Clic sur un vrai modèle → reset ────────────────────────────────────
    items.forEach(item => {
      item.addEventListener('click', () => {
        if (!programmaticClick) {
          mythosSelected = false;

          const modelName = item.querySelector('.font-ui')?.textContent?.trim();

          setTimeout(() => {
            const btn = getBtn();
            if (!btn || !modelName) return;

            const txt = getBtnTxt(btn);

            const currentLabel = btn.getAttribute('aria-label') || '';
            const currentText  = txt ? txt.textContent : '';
            if (currentText !== 'Mythos' && !currentLabel.includes('Mythos')) return;

            observer.disconnect();
            btn.setAttribute('aria-label', 'Model: ' + modelName);
            if (txt) txt.textContent = modelName;
            setTimeout(() => observer.observe(document.body, { childList: true, subtree: true }), 0);
          }, 100);
        }
      }, { capture: true });
    });

    // ── Tooltip ────────────────────────────────────────────────────────────
    mythos.addEventListener('mouseenter', () => showTooltip(mythos));
    mythos.addEventListener('mouseleave', hideTooltip);

    // ── Insérer avant Opus ─────────────────────────────────────────────────
    group.insertBefore(mythos, opusEntry);

    if (mythosSelected) {
      applySelected(mythos, opusEntry);
    }
  }

  // ── État visuel "Mythos sélectionné" ──────────────────────────────────────
  function applySelected(mythos, opusEntry) {
    const titleRow = mythos.querySelector('.flex.items-center');
    if (titleRow && !titleRow.querySelector('[data-mythos-check]')) {
      titleRow.appendChild(makeCheckmark());
    }
    mythos.setAttribute('aria-checked', 'true');

    if (opusEntry) {
      const nativeCheck = [...opusEntry.querySelectorAll('svg')]
        .find(s => !s.dataset.mythosCheck);
      if (nativeCheck && !nativeCheck.dataset.mythosHidden) {
        nativeCheck.dataset.mythosHidden = '1';
        nativeCheck.style.visibility = 'hidden';
      }
    }
  }

  // ── Observer ──────────────────────────────────────────────────────────────
  observer = new MutationObserver(() => {
    inject();
    if (mythosSelected) patchSelectorButton();
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();

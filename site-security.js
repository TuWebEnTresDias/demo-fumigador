/* Contact safety contract for the fumigador demo. */
(() => {
  'use strict';
  const normalizePhone = value => {
    if (typeof value !== 'string' || value.length > 64 || !/^\+?[\d\s().-]+$/.test(value.trim())) return null;
    let national = value.replace(/\D/g, '');
    if (national.startsWith('00')) national = national.slice(2);
    if (national.startsWith('549') && national.length === 13) national = national.slice(3);
    else if (national.startsWith('54') && national.length === 12) national = national.slice(2);
    if (national.startsWith('0') && national.length === 11) national = national.slice(1);
    if (!/^[1-9]\d{9}$/.test(national) || /(\d)\1{9}/.test(national) || national.startsWith('15')) return null;
    return { national, whatsapp: '549' + national, telephone: '+549' + national, display: national.replace(/^(\d{2})(\d{4})(\d{4})$/, '$1 $2-$3') };
  };
  const params = new URLSearchParams(window.__DEMO_PARAMS__ ?? location.search);
  const personalized = document.documentElement.hasAttribute('data-personalized-demo');
  const invalid = personalized && params.has('t') && (params.getAll('t').length !== 1 || !normalizePhone(params.get('t')));
  let ready = false, failed = false;
  const lock = () => document.querySelectorAll('[data-security-submit]').forEach(button => button.disabled = true);
  const notice = text => {
    let el = document.getElementById('contactSafetyNotice');
    if (!el) { el = document.createElement('p'); el.id = 'contactSafetyNotice'; el.setAttribute('role', 'status'); document.querySelector('form')?.before(el); }
    el.textContent = text;
  };
  const apply = () => {
    if (personalized) {
      const phone = normalizePhone(params.has('t') ? params.get('t') : document.documentElement.dataset.defaultPhone);
      if (phone && !invalid) {
        document.querySelectorAll('a[href^="tel:"]').forEach(link => { if (/[0-9]/.test(link.textContent)) link.dataset.phoneDisplay = ''; link.href = 'tel:' + phone.telephone; });
        document.querySelectorAll('[data-phone-display]').forEach(el => el.textContent = '+54 9 ' + phone.display);
        document.querySelectorAll('a[href*="wa.me/"]').forEach(link => { const url = new URL(link.href); if (url.hostname === 'wa.me') { url.pathname = '/' + phone.whatsapp; link.href = url.href; link.rel = 'noopener noreferrer'; } });
      }
      if (invalid || !phone) {
        document.querySelectorAll('[data-phone-display]').forEach(el => el.textContent = 'Número inválido · contacto desactivado');
        if (invalid) {
          document.querySelectorAll('a[href^="tel:"],a[href*="wa.me/"],[data-whatsapp]').forEach(link => { link.removeAttribute('href'); link.setAttribute('aria-disabled','true'); });
          notice('El teléfono de esta demo no es válido. Revisá el enlace recibido para habilitar el contacto.');
        }
      }
    }
    if (failed || invalid) { lock(); return; }
    document.querySelectorAll('[data-security-submit]').forEach(button => button.disabled = false);
    ready = true;
  };
  document.addEventListener('submit', event => { event.preventDefault(); if (!ready || failed || invalid) { event.stopImmediatePropagation(); if (!invalid) notice('No se pudo preparar el formulario. Usá el enlace directo de contacto de la página.'); } }, true);
  document.addEventListener('click', event => { const link = event.target.closest?.('a'); if (invalid && link?.getAttribute('aria-disabled') === 'true') { event.preventDefault(); event.stopImmediatePropagation(); } }, true);
  window.addEventListener('error', event => { if (event.error || event.target?.matches?.('script[data-site-script]')) { failed = true; lock(); } }, true);
  const start = () => setTimeout(apply, 0);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
  Object.defineProperty(window, 'SiteSecurity', { value: Object.freeze({ normalizePhone, contactAllowed: () => !invalid }), configurable: false });
})();

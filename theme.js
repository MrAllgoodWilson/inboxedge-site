/* Persist only the selected appearance, never form entries or customer details. */
(function () {
  'use strict';
  const key = 'inboxedge-view';
  const allowed = ['system', 'navy', 'maroon', 'light'];
  const select = document.getElementById('site-view');
  if (!select) return;
  function apply(value) {
    const view = allowed.includes(value) ? value : 'system';
    if (view === 'system') {
      document.documentElement.removeAttribute('data-view');
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-view', view);
      document.documentElement.setAttribute('data-theme', view === 'light' ? 'light' : 'dark');
    }
    select.value = view;
  }
  let initial = 'system';
  try { initial = window.localStorage.getItem(key) || 'system'; } catch (_) { /* Session-only preference works without storage. */ }
  apply(initial);
  select.closest('.theme-control').hidden = false;
  select.addEventListener('change', function () {
    apply(select.value);
    try { window.localStorage.setItem(key, select.value); } catch (_) { /* Keep the current view usable. */ }
  });
  window.addEventListener('storage', function (event) {
    if (event.key === key || event.key === null) apply(event.newValue);
  });
}());

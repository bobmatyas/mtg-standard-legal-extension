(() => {
  let setUntil = new Map();
  let observer = null;
  let observedNode = null;

  function setCodeFromPath(pathname) {
    const match = pathname.match(/^\/card\/([^/]+)/i);
    return match ? match[1].toUpperCase() : null;
  }

  function findStandardRow() {
    for (const item of document.querySelectorAll('.card-legality-item')) {
      const dt = item.querySelector('dt');
      const dd = item.querySelector('dd');
      if (dt && dd && dt.textContent.trim().startsWith('Standard')) {
        return { dt, dd };
      }
    }
    return { dt: null, dd: null };
  }

  function sizeLegalityItems() {
    for (const item of document.querySelectorAll('.card-legality-item')) {
      item.style.height = '36px';
    }
  }

  function inject() {
    sizeLegalityItems();

    const { dt, dd } = findStandardRow();
    if (!dt || !dd || dt.hasAttribute('data-standard-until')) return;
    if (!dd.classList.contains('legal')) return;

    const code = setCodeFromPath(location.pathname);
    if (!code) return;

    const until = setUntil.get(code);
    if (until == null) return;

    dt.appendChild(document.createElement('br'));
    const label = document.createElement('b');
    label.style.fontSize = '10px';
    label.style.fontWeight = 'bold';
    label.textContent = `Until ${until}`;
    dt.appendChild(label);
    dt.setAttribute('data-standard-until', String(until));
  }

  function observeLegality() {
    const item = document.querySelector('.card-legality-item');
    const target = item ? item.parentElement : document.body;
    if (!target || target === observedNode) return;

    if (observer) observer.disconnect();
    observedNode = target;
    observer = new MutationObserver(() => {
      inject();
      observeLegality();
    });
    observer.observe(target, { childList: true, subtree: true });
  }

  async function init() {
    const response = await fetch(chrome.runtime.getURL('mtg_sets.json'));
    const sets = await response.json();
    setUntil = new Map(
      sets.map((set) => [String(set.code).toUpperCase(), set.legal_until])
    );

    inject();
    observeLegality();
    window.addEventListener('popstate', inject);
  }

  init();
})();

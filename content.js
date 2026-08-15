(() => {
  let setUntil = new Map();
  let observer = null;
  let observedNode = null;
  let siteEnabled = true;

  /**
   * Injects the Standard rotation year for the current site.
   */
  function inject() {
    if (!siteEnabled) return;

    const host = location.hostname.replace(/^www\./, '');
    if (host === 'scryfall.com') {
      injectScryfall();
      return;
    }
    if (host === 'tcgplayer.com') {
      injectTcgplayer();
      return;
    }
    if (host === 'manapool.com') {
      injectManapool();
    }
  }

  /**
   * Appends "Until {year}" to Scryfall's Standard dt when the card is legal.
   */
  function injectScryfall() {
    sizeLegalityItems();

    const { dt, dd } = findStandardRow();
    if (!dt || !dd || dt.hasAttribute('data-standard-until')) return;
    if (!dd.classList.contains('legal')) return;

    const until = untilForCode(setCodeFromPath(location.pathname));
    if (until == null) return;

    dt.appendChild(document.createElement('br'));
    const label = document.createElement('b');
    label.style.fontSize = '10px';
    label.style.fontWeight = 'bold';
    label.textContent = `Until ${until}`;
    dt.appendChild(label);
    dt.setAttribute('data-standard-until', String(until));
  }

  /**
   * Appends " (year)" to TCGPlayer's Standard legality indicator.
   */
  function injectTcgplayer() {
    const until = untilForCode(setCodeFromTcgplayerName());
    if (until == null) return;

    for (const row of document.querySelectorAll('.legalities__legality.legal')) {
      const name = row.querySelector('.legalities__legality__name');
      const indicator = row.querySelector('.legalities__legality__indicator');
      if (!name || !indicator) continue;
      if (name.textContent.trim() !== 'Standard') continue;
      if (indicator.hasAttribute('data-standard-until')) return;

      indicator.appendChild(document.createTextNode(` (${until})`));
      indicator.setAttribute('data-standard-until', String(until));
      return;
    }
  }

  /**
   * Adds a "Standard Legal Until {year}" list item on Manapool when Standard is legal.
   */
  function injectManapool() {
    const until = untilForCode(setCodeFromManapoolLink());
    if (until == null) return;

    const legalList = findManapoolLegalList();
    if (!legalList || legalList.querySelector('[data-standard-until]')) return;

    const item = document.createElement('li');
    item.className = 'text-sm font-medium text-gray-700';
    item.style.marginTop = '10px';
    item.textContent = `Standard Legal Until ${until}`;
    item.setAttribute('data-standard-until', String(until));
    legalList.appendChild(item);
  }

  /**
   * Returns the Standard dt/dd pair on a Scryfall card page.
   * @returns {{dt: Element|null, dd: Element|null}}
   */
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

  /**
   * Sets every Scryfall legality cell to 36px tall.
   */
  function sizeLegalityItems() {
    for (const item of document.querySelectorAll('.card-legality-item')) {
      item.style.height = '36px';
    }
  }

  /**
   * Finds Manapool's "Legal in:" list when it includes Standard.
   * @returns {Element|null}
   */
  function findManapoolLegalList() {
    for (const item of document.querySelectorAll('ul li')) {
      const text = item.textContent;
      if (!text.includes('Legal in:') || !/\bstandard\b/i.test(text)) continue;
      return item.parentElement;
    }
    return null;
  }

  /**
   * Reads a set code from a Scryfall or Manapool card URL.
   * @param {string} pathname
   * @returns {string|null}
   */
  function setCodeFromPath(pathname) {
    const match = pathname.match(/^\/card\/([^/]+)/i);
    return match ? match[1].toUpperCase() : null;
  }

  /**
   * Reads the set code from a TCGPlayer product title like "... (HOB)".
   * @returns {string|null}
   */
  function setCodeFromTcgplayerName() {
    const heading =
      document.querySelector('[data-testid="lblProductDetailsProductName"]') ||
      document.querySelector('h1.product-details__name');
    if (!heading) return null;
    const match = heading.textContent.match(/\(([A-Za-z0-9]+)\)\s*$/);
    return match ? match[1].toUpperCase() : null;
  }

  /**
   * Reads the set code from Manapool's set link href (`/set/hob/...`).
   * @returns {string|null}
   */
  function setCodeFromManapoolLink() {
    const link = document.querySelector('a[href^="/set/"]');
    if (!link) return null;
    const match = link.getAttribute('href').match(/^\/set\/([^/]+)/i);
    return match ? match[1].toUpperCase() : null;
  }

  /**
   * Looks up legal_until for a set code.
   * @param {string|null} code
   * @returns {number|null}
   */
  function untilForCode(code) {
    if (!code) return null;
    const until = setUntil.get(code);
    return until == null ? null : until;
  }

  /**
   * Removes this extension's injected markup from the current page.
   */
  function removeInjections() {
    const { dt } = findStandardRow();
    if (dt && dt.hasAttribute('data-standard-until')) {
      dt.querySelector('b')?.remove();
      dt.querySelector('br')?.remove();
      dt.removeAttribute('data-standard-until');
    }
    for (const item of document.querySelectorAll('.card-legality-item')) {
      item.style.height = '';
    }

    for (const indicator of document.querySelectorAll(
      '.legalities__legality__indicator[data-standard-until]'
    )) {
      const until = indicator.getAttribute('data-standard-until');
      const suffix = ` (${until})`;
      if (
        indicator.lastChild?.nodeType === Node.TEXT_NODE &&
        indicator.lastChild.textContent === suffix
      ) {
        indicator.removeChild(indicator.lastChild);
      }
      indicator.removeAttribute('data-standard-until');
    }

    document.querySelector('li[data-standard-until]')?.remove();
  }

  /**
   * Reads whether the current site is enabled in storage.
   */
  async function refreshEnabled() {
    const sites = await chrome.storage.sync.get(SITE_DEFAULTS);
    const key = siteKeyFromHost(location.hostname);
    siteEnabled = Boolean(key && sites[key] !== false);
  }

  /**
   * Re-runs injection when the page swaps card/product content.
   */
  function observePage() {
    const target = document.body;
    if (!target || target === observedNode) return;

    if (observer) observer.disconnect();
    observedNode = target;
    observer = new MutationObserver(() => {
      inject();
    });
    observer.observe(target, { childList: true, subtree: true });
  }

  /**
   * Loads mtg_sets.json and starts injection.
   */
  async function init() {
    const response = await fetch(chrome.runtime.getURL('mtg_sets.json'));
    const sets = await response.json();
    setUntil = new Map(
      sets.map((set) => [String(set.code).toUpperCase(), set.legal_until])
    );

    await refreshEnabled();
    inject();
    observePage();
    window.addEventListener('popstate', inject);
    chrome.storage.onChanged.addListener(async (_changes, area) => {
      if (area !== 'sync') return;
      await refreshEnabled();
      if (siteEnabled) inject();
      else removeInjections();
    });
  }

  init();
})();

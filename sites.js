globalThis.SITE_DEFAULTS = {
  scryfall: true,
  manapool: true,
  tcgplayer: true,
};

/**
 * Maps a page hostname to a site toggle key.
 * @param {string} hostname
 * @returns {string|null}
 */
globalThis.siteKeyFromHost = function siteKeyFromHost(hostname) {
  const host = String(hostname).replace(/^www\./, '');
  if (host === 'scryfall.com') return 'scryfall';
  if (host === 'manapool.com') return 'manapool';
  if (host === 'tcgplayer.com') return 'tcgplayer';
  return null;
};

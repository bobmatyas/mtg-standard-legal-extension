# MTG Standard Until

A Manifest V3 content script that shows when a Standard-legal card rotates, using the set list in `mtg_sets.json`.

- **Scryfall:** appends **Until {year}** to the Standard label
- **TCGPlayer:** appends **(year)** to the Standard legality indicator
- **Manapool:** adds **Standard Legal Until {year}** under the legal-formats list

## Load the extension

### Chrome / Edge

1. Open `chrome://extensions`
2. Turn on **Developer mode**
3. Click **Load unpacked**
4. Select this folder (`mtg-standard-extension`)

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select `manifest.json` in this folder

## Test pages

Scryfall:

- [Bilbo, Baggins Burglar, Take a Glance](https://scryfall.com/card/hob/34/bilbo-baggins-burglar-take-a-glance) → Until 2028
- [Floodfarm Verge](https://scryfall.com/card/dsk/259/floodfarm-verge) → Until 2027
- [Adarkar Wastes](https://scryfall.com/card/eoc/147/adarkar-wastes) → leave the Standard row alone

TCGPlayer:

- [Bilbo Baggins, Burglar](https://www.tcgplayer.com/product/708801/Magic-The%20Hobbit-Bilbo%20Baggins%20Burglar) → Legal (2028)

Manapool:

- [Bilbo Baggins, Burglar](https://manapool.com/card/hob/34/bilbo-baggins-burglar-take-a-glance) → Standard Legal Until 2028

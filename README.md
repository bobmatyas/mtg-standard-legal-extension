# Scryfall Standard Until

A Manifest V3 content script that appends **Legal Until {year}** to Scryfall’s Standard legality row when the card is Standard-legal and its set is listed in `mtg_sets.json`.

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

- [Bilbo, Baggins Burglar, Take a Glance](https://scryfall.com/card/hob/34/bilbo-baggins-burglar-take-a-glance) → Legal Until 2028
- [Floodfarm Verge](https://scryfall.com/card/dsk/259/floodfarm-verge) → Legal Until 2027
- [Adarkar Wastes](https://scryfall.com/card/eoc/147/adarkar-wastes) → leave the Standard row alone (not-legal / EOC not in JSON)

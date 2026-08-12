# Next increments

- **More templates**: add a handful more entries to `data/templates.js` (currently 3) — the UI and tests already scale with the array.
- **Story history**: persist completed stories (e.g. via `AsyncStorage`) so players can revisit past Mad Libs instead of losing them on "Start over".
- **Input validation**: nudge players toward the right word type per blank (e.g. reject empty submissions with an inline hint, or offer a `type` field on each blank for lightweight checks like "must be a number").
- **Share/export**: add a "Share my story" button using `expo-sharing`/`Share` API so a finished story can be copied or sent elsewhere.

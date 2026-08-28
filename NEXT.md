# Next increments for MadlibsApp

- `Madlibs/App.js` is dead code — `package.json` sets `"main": "expo-router/entry"`, so the router-based `app/` directory is the real entry point and `App.js` (with its own unused `StyleSheet`) is never rendered. Either delete it or repurpose/remove it to avoid confusing future contributors.
- `Link` elements in `app/index.js` and `app/page2.js` render with no styling (default blue underlined text) while everything else uses `Styles.page`. Add a shared `Styles.link` (or similar) in `styles/page-styles.js` and apply it for visual consistency.
- The app is still just two placeholder screens ("This is the index page" / "This is page 2") — the actual Mad Libs game logic (word-blank inputs, story templates, state passing between pages) hasn't been built yet. That's the natural next big increment once basic scaffolding is solid.
- Neither screen has a back button or uses the newly added header title bar's default back arrow consistently tested — worth a manual check once the app is run that expo-router's default back gesture/button works from `page2` to `index`.

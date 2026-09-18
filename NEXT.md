# Next increments for MadlibsApp

- `Madlibs/App.js` is still dead code (`package.json` `main` is `expo-router/entry`, so the
  router-based `app/` directory is the real entry point and nothing imports `App.js`).
  Deletion is deferred pending Jordan's explicit sign-off -- removing a whole file is a
  pause-and-ask trigger, so this run left it completely untouched rather than deleting it
  unilaterally.
- The `/page2` route now shows the completed story but is still literally named `page2` --
  renaming it to `/story` is a clean follow-up, deliberately deferred to avoid a
  file-rename/removal trigger in this same run.
- Persist the last-played template id (and maybe in-progress answers) with AsyncStorage so
  closing and reopening the app doesn't lose an in-progress story.
- Add a "copy story" / share action on the result screen so a finished story can be shared
  outside the app.
- Add real automated tests (e.g. Jest) for `lib/story.js` -- it's pure and was designed to be
  easy to unit test; right now it's only been verified via a one-off standalone Node harness.

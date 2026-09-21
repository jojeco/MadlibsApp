# Next increments for MadlibsApp

- `Madlibs/App.js` is still dead code (`package.json` `main` is `expo-router/entry`, so the
  router-based `app/` directory is the real entry point and nothing imports `App.js`).
  Deletion is deferred pending Jordan's explicit sign-off -- removing a whole file is a
  pause-and-ask trigger, so this run left it completely untouched rather than deleting it
  unilaterally.
- The `/page2` route now shows the completed story but is still literally named `page2` --
  renaming it to `/story` is a clean follow-up, deliberately deferred to avoid a
  file-rename/removal trigger in this same run.
- Persist `templateId` + `answers` with `@react-native-async-storage/async-storage` and rehydrate
  through `resumeGame(id)` (new dependency -- needs Jordan's sign-off). `resumeGame` plus the
  `/play/<id>?resume=1&blank=N` route gives persistence a clean seam: no reset logic to unpick.
- ~~Add a copy/share action on the result screen~~ -- done: "Share story" uses React Native's
  built-in `Share`. A true clipboard "copy" needs `expo-clipboard`, a new dependency -- ask
  Jordan first.
- Add `jest` + `jest-expo` (devDependencies, needs sign-off) and turn the one-off Node harness
  into real unit tests for `lib/story.js` (now including `blankIndexForKey` and `buildShareText`).
- The wizard mount effect in `app/play/[id].js` keys off `[id, resume, blankParam]`. For any new
  entry mode, extend that branch -- don't reintroduce conditional resetting inside `startGame`,
  which must stay a hard reset.

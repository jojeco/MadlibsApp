# Next increments for MadlibsApp

- `Madlibs/App.js` is still dead code (`package.json` `main` is `expo-router/entry`, so the
  router-based `app/` directory is the real entry point and nothing imports `App.js`).
  Deletion is deferred pending Jordan's explicit sign-off -- removing a whole file is a
  pause-and-ask trigger, so this run left it completely untouched rather than deleting it
  unilaterally.
- The `/page2` route now shows the completed story but is still literally named `page2` --
  renaming it to `/story` is a clean follow-up, deliberately deferred to avoid a
  file-rename/removal trigger in this same run.
- ~~Persist `templateId` + `answers` with `@react-native-async-storage/async-storage` and rehydrate
  through `resumeGame(id)`~~ -- done: the in-progress game is saved and restored on launch, the
  home screen shows a "Continue where you left off" card, and finished stories go into a
  "Recent stories" history capped at 10. The save/restore logic lives in `lib/persistence.js`
  (a pure, import-free module) and is covered by `npm run check`
  (`scripts/check-persistence.mjs`).
- **Important:** `@react-native-async-storage/async-storage` was only added to
  `Madlibs/package.json`'s `dependencies`; the lockfiles have not been regenerated yet. Before this builds, run
  `npx expo install @react-native-async-storage/async-storage` (or `npm install`) inside
  `Madlibs/` on a real machine and commit the resulting `Madlibs/package-lock.json` diff. Also
  check whether the root `package-lock.json` needs the same update.
- ~~Add a copy/share action on the result screen~~ -- done: "Share story" uses React Native's
  built-in `Share`. A true clipboard "copy" needs `expo-clipboard`, a new dependency -- ask
  Jordan first.
- Add `jest` + `jest-expo` (devDependencies, needs sign-off) and turn the one-off Node harnesses
  into real unit tests: this covers both `lib/story.js` (already tracked above) and the newer
  `scripts/check-persistence.mjs`, which is a zero-dependency stopgap for `lib/persistence.js`
  in the meantime.
- The wizard mount effect in `app/play/[id].js` keys off `[id, resume, blankParam]`. For any new
  entry mode, extend that branch -- don't reintroduce conditional resetting inside `startGame`,
  which must stay a hard reset.
- Let a "Recent stories" entry be re-shared through `Share` or reopened read-only, rather than
  only expanding inline on the home screen.
- Add a dedicated history-detail route instead of the inline expand/collapse on the home screen.
- Consider saving the wizard's half-typed draft for the current blank; right now only committed
  answers persist, so a word typed but not yet submitted is lost on relaunch.
- ~~`handleNext` in `app/play/[id].js` treated any `?resume=1` as "editing one finished
  word" and completed the game after a single answer~~ -- fixed: it now checks `isComplete()`
  against the in-progress answers and, when resuming mid-game, jumps to the first still-unanswered
  blank instead of finishing early.
- Follow-up (out of scope for the fix above): devices that already hit the old bug may have
  blank-riddled ("___") entries sitting in their local "Recent stories" history from before the
  fix landed; those aren't cleaned up automatically.

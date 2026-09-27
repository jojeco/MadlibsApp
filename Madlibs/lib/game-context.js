// lib/game-context.js
// Small shared game-state context: which template is active and the
// answers collected so far. Mounted once in app/_layout.js so both the
// wizard route and the result screen see the same state without needing
// to serialize answers into the URL.
//
// Also owns persistence: the in-progress game and the finished-story
// history are hydrated from storage on mount and kept saved as they
// change, via lib/storage.js (a thin AsyncStorage wrapper around the pure
// logic in lib/persistence.js).

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { addToHistory, makeHistoryEntry, newGameId } from './persistence';
import { gameStore } from './storage';
import { buildStory, getTemplate, storyToText } from './story';

const GameContext = createContext(null);

export function GameProvider({ children }) {
    const [gameId, setGameId] = useState(null);
    const [templateId, setTemplateId] = useState(null);
    const [answers, setAnswers] = useState({});
    const [history, setHistory] = useState([]);
    const [ready, setReady] = useState(false);
    const touchedRef = useRef(false);

    // Hydrate the saved game and history once on mount. If the player does
    // anything (setAnswer/startGame/resumeGame/reset) before this resolves,
    // touchedRef flips true and the loaded game snapshot is thrown away so
    // the player's live action wins -- the loaded history is still applied.
    useEffect(() => {
        let cancelled = false;

        Promise.all([gameStore.loadGame(getTemplate), gameStore.loadHistory()])
            .then(([snapshot, loadedHistory]) => {
                if (cancelled) return;
                setHistory(loadedHistory);
                if (!touchedRef.current && snapshot) {
                    setGameId(snapshot.gameId);
                    setTemplateId(snapshot.templateId);
                    setAnswers(snapshot.answers);
                }
            })
            .catch(() => {
                // loadGame/loadHistory already swallow storage errors; this is
                // a last-resort guard so hydration can never leave `ready` false.
            })
            .finally(() => {
                if (!cancelled) setReady(true);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    // Save the in-progress game whenever it changes, once hydration has
    // resolved (saving earlier would overwrite the saved game with the
    // empty initial state before it's even loaded).
    useEffect(() => {
        if (!ready) return;
        if (templateId === null) {
            gameStore.clearGame();
        } else {
            gameStore.saveGame({ gameId, templateId, answers });
        }
    }, [ready, gameId, templateId, answers]);

    // Save history whenever it changes, once hydration has resolved.
    useEffect(() => {
        if (!ready) return;
        gameStore.saveHistory(history);
    }, [ready, history]);

    const setAnswer = useCallback((key, value) => {
        touchedRef.current = true;
        setAnswers((prev) => ({ ...prev, [key]: value }));
    }, []);

    const startGame = useCallback((id) => {
        touchedRef.current = true;
        setGameId(newGameId());
        setTemplateId(id);
        setAnswers({});
    }, []);

    // Switch to a template while keeping whatever answers are already stored.
    // startGame stays the hard reset; this is the "come back and edit" path.
    const resumeGame = useCallback((id) => {
        touchedRef.current = true;
        setTemplateId(id);
    }, []);

    const reset = useCallback(() => {
        touchedRef.current = true;
        setGameId(null);
        setTemplateId(null);
        setAnswers({});
    }, []);

    // Called when the last blank is filled in. finalAnswers is passed in
    // explicitly because setAnswer's update hasn't been applied to `answers`
    // yet at the point handleNext calls this.
    const completeGame = useCallback(
        (finalAnswers) => {
            const template = getTemplate(templateId);
            if (!template) return;
            const text = storyToText(buildStory(template, finalAnswers));
            setHistory((prev) =>
                addToHistory(
                    prev,
                    makeHistoryEntry({
                        gameId: gameId || newGameId(),
                        templateId,
                        title: template.title,
                        text,
                    })
                )
            );
        },
        [gameId, templateId]
    );

    const clearHistory = useCallback(() => {
        setHistory([]);
    }, []);

    const value = useMemo(
        () => ({
            gameId,
            templateId,
            answers,
            history,
            ready,
            setAnswer,
            startGame,
            resumeGame,
            reset,
            completeGame,
            clearHistory,
        }),
        [gameId, templateId, answers, history, ready, setAnswer, startGame, resumeGame, reset, completeGame, clearHistory]
    );

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

/** Access the shared game state. Must be used within a <GameProvider>. */
export function useGame() {
    const ctx = useContext(GameContext);
    if (!ctx) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return ctx;
}

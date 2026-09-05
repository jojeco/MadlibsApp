// lib/game-context.js
// Small shared game-state context: which template is active and the
// answers collected so far. Mounted once in app/_layout.js so both the
// wizard route and the result screen see the same state without needing
// to serialize answers into the URL.

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const GameContext = createContext(null);

export function GameProvider({ children }) {
    const [templateId, setTemplateId] = useState(null);
    const [answers, setAnswers] = useState({});

    const setAnswer = useCallback((key, value) => {
        setAnswers((prev) => ({ ...prev, [key]: value }));
    }, []);

    const startGame = useCallback((id) => {
        setTemplateId(id);
        setAnswers({});
    }, []);

    const reset = useCallback(() => {
        setTemplateId(null);
        setAnswers({});
    }, []);

    const value = useMemo(
        () => ({ templateId, answers, setAnswer, startGame, reset }),
        [templateId, answers, setAnswer, startGame, reset]
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

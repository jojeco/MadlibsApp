// index.js
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Styles from '../styles/page-styles';
import TEMPLATES from '../data/templates';
import { useGame } from '../lib/game-context';
import { blankCount, getTemplate, pickRandomTemplateId } from '../lib/story';
import { answeredCount, continueHref, continueTarget } from '../lib/persistence';

const HISTORY_PREVIEW_LENGTH = 80;

export default function Page() {
    const router = useRouter();
    const { startGame, ready, templateId, answers, history, reset, clearHistory } = useGame();
    const [lastPickedId, setLastPickedId] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    function handlePick(id) {
        setLastPickedId(id);
        startGame(id);
        router.push(`/play/${id}`);
    }

    function handleSurprise() {
        const id = pickRandomTemplateId(TEMPLATES, lastPickedId);
        if (!id) return; // nothing to play; no crash, no nav
        handlePick(id);
    }

    // Only offer "Continue" once hydration has resolved, the saved
    // templateId still points at a real template, and at least one blank
    // has an answer -- a picked-but-untouched template doesn't get a card.
    const continueTemplate = ready ? getTemplate(templateId) : undefined;
    const target = continueTemplate ? continueTarget(continueTemplate, answers) : null;

    function handleContinue() {
        const href = continueHref(templateId, target);
        if (href) router.push(href);
    }

    function toggleExpanded(gameId) {
        setExpandedId((prev) => (prev === gameId ? null : gameId));
    }

    return (
        <ScrollView contentContainerStyle={Styles.screen}>
            <Text style={Styles.title}>Mad Libs</Text>
            <Text style={Styles.subtitle}>Pick a story to fill in</Text>

            {target ? (
                <View style={Styles.continueCard}>
                    <Text style={Styles.continueHeading}>Continue where you left off</Text>
                    <Text style={Styles.continueTitle}>{continueTemplate.title}</Text>
                    <Text style={Styles.continueMeta}>
                        {target.kind === 'result'
                            ? 'Finished, tap to view'
                            : `${answeredCount(continueTemplate, answers)} of ${blankCount(continueTemplate)} words filled in`}
                    </Text>
                    <View style={Styles.buttonRow}>
                        <Pressable style={Styles.button} onPress={handleContinue}>
                            <Text style={Styles.buttonText}>Continue</Text>
                        </Pressable>
                        <Pressable style={Styles.secondaryButton} onPress={reset}>
                            <Text style={Styles.secondaryButtonText}>Discard</Text>
                        </Pressable>
                    </View>
                </View>
            ) : null}

            <Pressable style={Styles.surpriseButton} onPress={handleSurprise}>
                <Text style={Styles.surpriseButtonText}>Surprise me</Text>
            </Pressable>
            {TEMPLATES.map((template) => (
                <Pressable
                    key={template.id}
                    style={Styles.card}
                    onPress={() => handlePick(template.id)}
                >
                    <Text style={Styles.cardTitle}>{template.title}</Text>
                    <Text style={Styles.cardMeta}>{blankCount(template)} blanks</Text>
                </Pressable>
            ))}

            {ready && history.length > 0 ? (
                <View>
                    <Text style={Styles.sectionHeading}>Recent stories</Text>
                    {history.map((entry) => {
                        const expanded = expandedId === entry.gameId;
                        const preview =
                            entry.text.length > HISTORY_PREVIEW_LENGTH
                                ? `${entry.text.slice(0, HISTORY_PREVIEW_LENGTH)}…`
                                : entry.text;
                        return (
                            <Pressable
                                key={entry.gameId}
                                style={Styles.historyItem}
                                onPress={() => toggleExpanded(entry.gameId)}
                            >
                                <Text style={Styles.historyTitle}>{entry.title}</Text>
                                <Text style={Styles.historyMeta}>
                                    {new Date(entry.completedAt).toLocaleDateString()}
                                </Text>
                                <Text style={Styles.historyText}>{expanded ? entry.text : preview}</Text>
                            </Pressable>
                        );
                    })}
                    <Pressable style={Styles.secondaryButton} onPress={clearHistory}>
                        <Text style={Styles.secondaryButtonText}>Clear history</Text>
                    </Pressable>
                </View>
            ) : null}
        </ScrollView>
    );
}

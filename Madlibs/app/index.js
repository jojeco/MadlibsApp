// index.js
import { useState } from 'react';
import { Pressable, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Styles from '../styles/page-styles';
import TEMPLATES from '../data/templates';
import { useGame } from '../lib/game-context';
import { blankCount, pickRandomTemplateId } from '../lib/story';

export default function Page() {
    const router = useRouter();
    const { startGame } = useGame();
    const [lastPickedId, setLastPickedId] = useState(null);

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

    return (
        <ScrollView contentContainerStyle={Styles.screen}>
            <Text style={Styles.title}>Mad Libs</Text>
            <Text style={Styles.subtitle}>Pick a story to fill in</Text>
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
        </ScrollView>
    );
}

// app/play/[id].js
// Word-collection wizard: one blank at a time, with validation and a
// visible progress indicator.
import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import Styles from '../../styles/page-styles';
import { getTemplate, validateWord } from '../../lib/story';
import { useGame } from '../../lib/game-context';

export default function PlayScreen() {
    // Route params can come back as an array when a path is matched more
    // than once; normalize to a plain string before looking the story up.
    const params = useLocalSearchParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const router = useRouter();
    const { answers, setAnswer, startGame } = useGame();
    const template = getTemplate(id);

    const [index, setIndex] = useState(0);
    const [draft, setDraft] = useState('');
    const [error, setError] = useState(null);

    // Always start this template with a clean slate, whether we arrived
    // from the picker or from "play this one again" on the result screen.
    useEffect(() => {
        if (template) {
            startGame(id);
            setIndex(0);
            setDraft('');
            setError(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!template || !Array.isArray(template.blanks) || template.blanks.length === 0) {
        return (
            <View style={Styles.screen}>
                <Text style={Styles.title}>Story not found</Text>
                <Link href="/" style={Styles.link}>
                    <Text style={Styles.linkText}>Back to stories</Text>
                </Link>
            </View>
        );
    }

    // The reset effect runs *after* render, so if this screen is reused for a
    // different story the stale index can briefly point past the new (shorter)
    // template's last blank. Clamp it so we never read an undefined blank.
    const current = Math.min(index, template.blanks.length - 1);
    const blank = template.blanks[current];
    const isLast = current === template.blanks.length - 1;

    function goToBlank(nextIndex) {
        setIndex(nextIndex);
        setDraft(answers[template.blanks[nextIndex].key] || '');
        setError(null);
    }

    function handleNext() {
        const result = validateWord(draft);
        if (!result.ok) {
            setError(result.error);
            return;
        }
        setAnswer(blank.key, result.value);
        if (isLast) {
            router.push('/page2');
        } else {
            goToBlank(current + 1);
        }
    }

    function handleBack() {
        if (current === 0) return;
        goToBlank(current - 1);
    }

    return (
        <View style={Styles.screen}>
            <Text style={Styles.progress}>
                Blank {current + 1} of {template.blanks.length}
            </Text>
            <Text style={Styles.promptLabel}>{blank.label}</Text>
            <Text style={Styles.promptExample}>e.g. {blank.example}</Text>
            <TextInput
                style={[Styles.input, error ? Styles.inputError : null]}
                value={draft}
                autoFocus
                onChangeText={(text) => {
                    setDraft(text);
                    if (error) setError(null);
                }}
                onSubmitEditing={handleNext}
                placeholder={blank.type}
            />
            {error ? <Text style={Styles.errorText}>{error}</Text> : null}
            <View style={Styles.buttonRow}>
                <Pressable
                    style={[Styles.button, current === 0 ? Styles.buttonDisabled : null]}
                    onPress={handleBack}
                    disabled={current === 0}
                >
                    <Text style={Styles.buttonText}>Back</Text>
                </Pressable>
                <Pressable style={Styles.button} onPress={handleNext}>
                    <Text style={Styles.buttonText}>{isLast ? 'See my story' : 'Next'}</Text>
                </Pressable>
            </View>
        </View>
    );
}

// page2.js
// Repurposed in place as the completed-story screen (kept at this route
// rather than renamed -- see NEXT.md for the deferred /page2 -> /story
// rename).
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import Styles from '../styles/page-styles';
import { blankIndexForKey, buildShareText, buildStory, getTemplate } from '../lib/story';
import { useGame } from '../lib/game-context';

export default function Page() {
    const router = useRouter();
    const { templateId, answers, reset } = useGame();
    const template = getTemplate(templateId);

    if (!template) {
        return (
            <View style={Styles.screen}>
                <Text style={Styles.title}>No story in progress</Text>
                <Link href="/" style={Styles.link}>
                    <Text style={Styles.linkText}>Pick a story</Text>
                </Link>
            </View>
        );
    }

    const segments = buildStory(template, answers);

    // Both actions `replace` rather than `push`: this screen reads shared game
    // state, so leaving it on the stack means the back button lands on a story
    // whose answers have since been cleared out from under it.
    function handlePlayAgain() {
        // The wizard calls startGame() on mount, which clears the old answers.
        router.replace(`/play/${templateId}`);
    }

    // Jump back into the wizard at one blank, keeping every other answer.
    function handleEditBlank(blank) {
        const i = blankIndexForKey(template, blank.key);
        router.replace(`/play/${templateId}?resume=1&blank=${i}`);
    }

    // Built-in share sheet; no clipboard dependency. Dismissing the sheet or a
    // platform-level failure just leaves the screen as it was.
    async function handleShare() {
        try {
            await Share.share({ message: buildShareText(template, answers), title: template.title });
        } catch (e) {
            // ignore: nothing useful to show the player
        }
    }

    function handlePickAnother() {
        reset();
        router.replace('/');
    }

    return (
        <ScrollView contentContainerStyle={Styles.screen}>
            <Text style={Styles.title}>{template.title}</Text>
            <Text style={Styles.storyText}>
                {segments.map((segment, i) => (
                    <Text key={i} style={segment.isBlank ? Styles.storyBlank : undefined}>
                        {segment.text}
                    </Text>
                ))}
            </Text>
            <Text style={Styles.answersHeading}>Your words (tap to change one)</Text>
            <View style={Styles.chipRow}>
                {template.blanks.map((blank) => (
                    <Pressable key={blank.key} style={Styles.chip} onPress={() => handleEditBlank(blank)}>
                        <Text style={Styles.chipLabel}>{blank.label}</Text>
                        <Text style={Styles.chipValue}>{answers[blank.key] || '___'}</Text>
                    </Pressable>
                ))}
            </View>
            <Pressable style={Styles.shareButton} onPress={handleShare}>
                <Text style={Styles.buttonText}>Share story</Text>
            </Pressable>
            <View style={Styles.buttonRow}>
                <Pressable style={Styles.button} onPress={handlePlayAgain}>
                    <Text style={Styles.buttonText}>Play this one again</Text>
                </Pressable>
                <Pressable style={Styles.button} onPress={handlePickAnother}>
                    <Text style={Styles.buttonText}>Pick another story</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}

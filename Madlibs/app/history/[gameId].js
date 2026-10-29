// app/history/[gameId].js
// Detail view for a single "Recent stories" entry: full story text, Share,
// "play this template again" (only when the template still exists), and
// delete (now behind a confirm/cancel prompt). Reached from the home screen
// via historyHref().
import { Alert, Platform, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import Styles from '../../styles/page-styles';
import { findHistoryEntry, historyShareText, normalizeParam } from '../../lib/persistence';
import { getTemplate } from '../../lib/story';
import { useGame } from '../../lib/game-context';

export default function HistoryDetailScreen() {
    // historyHref() encodeURIComponent'd the id; undo that here. A bad
    // param (array-of-nothing, non-string, or an undecodable sequence)
    // just falls through to the "not found" state below rather than
    // throwing.
    const params = useLocalSearchParams();
    const rawParam = normalizeParam(params.gameId);
    let gameId = null;
    try {
        gameId = rawParam == null ? null : decodeURIComponent(rawParam);
    } catch (e) {
        gameId = null;
    }

    const router = useRouter();
    const { history, ready, removeHistoryEntry } = useGame();

    if (!ready) {
        return (
            <View style={Styles.screen}>
                <Text style={Styles.title}>Loading…</Text>
            </View>
        );
    }

    const entry = findHistoryEntry(history, gameId);

    if (!entry) {
        return (
            <View style={Styles.screen}>
                <Text style={Styles.title}>Story not found</Text>
                <Link href="/" style={Styles.link}>
                    <Text style={Styles.linkText}>Back to stories</Text>
                </Link>
            </View>
        );
    }

    const template = getTemplate(entry.templateId);

    // Built-in share sheet; dismissing it or a platform-level failure just
    // leaves the screen as it was (same pattern as app/page2.js).
    async function handleShare() {
        try {
            await Share.share({ message: historyShareText(entry), title: entry.title });
        } catch (e) {
            // ignore: nothing useful to show the player
        }
    }

    function handlePlayAgain() {
        router.replace('/play/' + entry.templateId);
    }

    // Removes the entry and returns to the home screen; only reachable through
    // the confirmation below, never directly from a tap.
    function confirmDelete() {
        removeHistoryEntry(entry.gameId);
        router.replace('/');
    }

    // Asks for confirmation before deleting: react-native-web's Alert.alert is a
    // no-op, so web falls back to window.confirm; native uses the real Alert.
    function handleDelete() {
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined' && window.confirm("Delete this story? This can't be undone.")) {
                confirmDelete();
            }
        } else {
            Alert.alert('Delete this story?', "This can't be undone.", [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: confirmDelete },
            ]);
        }
    }

    function handleBack() {
        router.replace('/');
    }

    return (
        <ScrollView contentContainerStyle={Styles.screen}>
            <Text style={Styles.title}>{entry.title}</Text>
            <Text style={Styles.historyDetailMeta}>{new Date(entry.completedAt).toLocaleDateString()}</Text>
            <Text style={Styles.storyText}>{entry.text}</Text>
            <Pressable style={Styles.shareButton} onPress={handleShare}>
                <Text style={Styles.buttonText}>Share</Text>
            </Pressable>
            <View style={Styles.buttonRow}>
                {template ? (
                    <Pressable style={Styles.button} onPress={handlePlayAgain}>
                        <Text style={Styles.buttonText}>Play this template again</Text>
                    </Pressable>
                ) : null}
                <Pressable style={Styles.button} onPress={handleDelete}>
                    <Text style={Styles.buttonText}>Delete this story</Text>
                </Pressable>
            </View>
            <Pressable style={Styles.secondaryButton} onPress={handleBack}>
                <Text style={Styles.secondaryButtonText}>Back to stories</Text>
            </Pressable>
        </ScrollView>
    );
}

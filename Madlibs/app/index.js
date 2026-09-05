// index.js
import { Pressable, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Styles from '../styles/page-styles';
import TEMPLATES from '../data/templates';
import { useGame } from '../lib/game-context';

export default function Page() {
    const router = useRouter();
    const { startGame } = useGame();

    function handlePick(id) {
        startGame(id);
        router.push(`/play/${id}`);
    }

    return (
        <ScrollView contentContainerStyle={Styles.screen}>
            <Text style={Styles.title}>Mad Libs</Text>
            <Text style={Styles.subtitle}>Pick a story to fill in</Text>
            {TEMPLATES.map((template) => (
                <Pressable
                    key={template.id}
                    style={Styles.card}
                    onPress={() => handlePick(template.id)}
                >
                    <Text style={Styles.cardTitle}>{template.title}</Text>
                    <Text style={Styles.cardMeta}>{template.blanks.length} blanks</Text>
                </Pressable>
            ))}
        </ScrollView>
    );
}

import { Stack } from 'expo-router';
import { GameProvider } from '../lib/game-context';

export default function RootLayout() {
    return (
        <GameProvider>
            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: '#fff' },
                    headerTintColor: '#000',
                }}
            >
                <Stack.Screen name="index" options={{ title: 'Mad Libs' }} />
                <Stack.Screen name="play/[id]" options={{ title: 'Fill in the Blanks' }} />
                <Stack.Screen name="page2" options={{ title: 'Your Story' }} />
            </Stack>
        </GameProvider>
    );
}

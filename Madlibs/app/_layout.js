import { Stack } from 'expo-router';

export default function RootLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: '#fff' },
                headerTintColor: '#000',
            }}
        >
            <Stack.Screen name="index" options={{ title: 'Mad Libs' }} />
            <Stack.Screen name="page2" options={{ title: 'Page 2' }} />
        </Stack>
    );
}

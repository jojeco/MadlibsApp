import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    // Same look as `page`, but for a ScrollView's contentContainerStyle:
    // flexGrow lets the content grow past the viewport so it can actually scroll.
    scrollContent: {
        flexGrow: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    label: {
        marginTop: 12,
        marginBottom: 4,
        fontSize: 14,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 8,
        width: 250,
    },
    story: {
        fontSize: 16,
        lineHeight: 24,
        marginVertical: 16,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#2196F3',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 6,
        marginVertical: 12,
        alignItems: 'center',
    },
});

export default styles;
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    screen: {
        flexGrow: 1,
        backgroundColor: '#fff',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        padding: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#222',
    },
    subtitle: {
        fontSize: 15,
        color: '#555',
        marginBottom: 20,
    },
    card: {
        backgroundColor: '#f2f2f7',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#222',
    },
    cardMeta: {
        fontSize: 13,
        color: '#777',
        marginTop: 4,
    },
    surpriseButton: {
        backgroundColor: '#ff9500',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 20,
    },
    surpriseButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginTop: 12,
        marginBottom: 4,
    },
    inputError: {
        borderColor: '#d33',
    },
    errorText: {
        color: '#d33',
        fontSize: 13,
        marginBottom: 8,
    },
    progress: {
        fontSize: 13,
        color: '#777',
        marginBottom: 12,
    },
    promptLabel: {
        fontSize: 20,
        fontWeight: '600',
        color: '#222',
    },
    promptExample: {
        fontSize: 13,
        color: '#999',
        fontStyle: 'italic',
        marginBottom: 8,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 12,
    },
    button: {
        flex: 1,
        backgroundColor: '#3366ee',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#aab8e6',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    storyText: {
        fontSize: 17,
        lineHeight: 26,
        color: '#222',
        marginBottom: 20,
    },
    storyBlank: {
        fontWeight: 'bold',
        color: '#3366ee',
    },
    link: {
        marginTop: 16,
    },
    linkText: {
        color: '#3366ee',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default styles;

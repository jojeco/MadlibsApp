// play.js
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import Styles from '../styles/page-styles';
import { getTemplateById, getBlanks, fillTemplate } from '../lib/madlib.js';

export default function Play() {
    const { id } = useLocalSearchParams();
    const template = getTemplateById(id);
    const blanks = getBlanks(template);

    const [answers, setAnswers] = useState({});
    const [story, setStory] = useState(null);

    if (!template) {
        return (
            <View style={Styles.page}>
                <Text style={Styles.title}>Story not found</Text>
                <Link href="/">Back home</Link>
            </View>
        );
    }

    function updateAnswer(key, value) {
        setAnswers((prev) => ({ ...prev, [key]: value }));
    }

    function handleSubmit() {
        setStory(fillTemplate(template, answers));
    }

    function handleReset() {
        setAnswers({});
        setStory(null);
    }

    if (story !== null) {
        return (
            <ScrollView contentContainerStyle={Styles.scrollContent}>
                <Text style={Styles.title}>{template.title}</Text>
                <Text style={Styles.story}>{story}</Text>
                <Pressable style={Styles.button} onPress={handleReset}>
                    <Text>Start over</Text>
                </Pressable>
                <Link href="/">Home</Link>
            </ScrollView>
        );
    }

    return (
        <ScrollView contentContainerStyle={Styles.scrollContent}>
            <Text style={Styles.title}>{template.title}</Text>
            {blanks.map((blank) => (
                <View key={blank.key}>
                    <Text style={Styles.label}>{blank.label}</Text>
                    <TextInput
                        style={Styles.input}
                        value={answers[blank.key] || ''}
                        onChangeText={(value) => updateAnswer(blank.key, value)}
                        placeholder={blank.label}
                    />
                </View>
            ))}
            <Pressable style={Styles.button} onPress={handleSubmit}>
                <Text>Make my story!</Text>
            </Pressable>
            <Link href="/">Home</Link>
        </ScrollView>
    );
}

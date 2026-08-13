// app/index.js — Word input page
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

const TEMPLATES = {
  adventure: {
    title: 'Epic Adventure',
    slots: [
      { key: 'noun1', label: 'A noun', placeholder: 'e.g. dragon' },
      { key: 'adjective1', label: 'An adjective', placeholder: 'e.g. fierce' },
      { key: 'place1', label: 'A place', placeholder: 'e.g. the forest' },
      { key: 'person', label: "A person's name", placeholder: 'e.g. Alex' },
      { key: 'verb1', label: 'A verb (present)', placeholder: 'e.g. fight' },
      { key: 'verb2', label: 'A verb (past tense)', placeholder: 'e.g. ran' },
      { key: 'adjective2', label: 'Another adjective', placeholder: 'e.g. glorious' },
      { key: 'noun2', label: 'Another noun', placeholder: 'e.g. treasure' },
    ],
  },
  school: {
    title: 'School Disaster',
    slots: [
      { key: 'person', label: "A classmate's name", placeholder: 'e.g. Riley' },
      { key: 'noun1', label: 'A school supply', placeholder: 'e.g. pencil case' },
      { key: 'adjective1', label: 'An adjective', placeholder: 'e.g. enormous' },
      { key: 'verb1', label: 'A verb (past tense)', placeholder: 'e.g. screamed' },
      { key: 'adverb', label: 'An adverb', placeholder: 'e.g. frantically' },
      { key: 'noun2', label: 'A food item', placeholder: 'e.g. sandwich' },
      { key: 'adjective2', label: 'Another adjective', placeholder: 'e.g. confused' },
      { key: 'verb2', label: 'Another verb (present)', placeholder: 'e.g. escape' },
    ],
  },
  space: {
    title: 'Space Mission',
    slots: [
      { key: 'noun1', label: 'A planet name', placeholder: 'e.g. Zorblon' },
      { key: 'adjective1', label: 'An adjective', placeholder: 'e.g. purple' },
      { key: 'person', label: "An astronaut's name", placeholder: 'e.g. Captain Jo' },
      { key: 'verb1', label: 'A verb (past tense)', placeholder: 'e.g. blasted' },
      { key: 'noun2', label: 'A body part', placeholder: 'e.g. elbow' },
      { key: 'adjective2', label: 'A size word', placeholder: 'e.g. massive' },
      { key: 'verb2', label: 'A verb (infinitive)', placeholder: 'e.g. dance' },
      { key: 'noun3', label: 'An object', placeholder: 'e.g. spatula' },
    ],
  },
};

const TEMPLATE_KEYS = Object.keys(TEMPLATES);

export default function Page() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState('adventure');
  const [words, setWords] = useState({});
  const [errors, setErrors] = useState({});

  const template = TEMPLATES[selectedTemplate];

  const setWord = (key, value) => {
    setWords(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: false }));
  };

  const submit = () => {
    const missing = {};
    template.slots.forEach(({ key }) => {
      if (!words[key]?.trim()) missing[key] = true;
    });
    if (Object.keys(missing).length > 0) {
      setErrors(missing);
      return;
    }
    router.push({
      pathname: '/page2',
      params: { template: selectedTemplate, words: JSON.stringify(words) },
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Mad Libs</Text>
        <Text style={styles.subtitle}>Fill in the blanks — then reveal the story!</Text>

        <Text style={styles.sectionLabel}>Choose a story:</Text>
        <View style={styles.templateRow}>
          {TEMPLATE_KEYS.map(key => (
            <Pressable
              key={key}
              style={[styles.templateBtn, selectedTemplate === key && styles.templateBtnActive]}
              onPress={() => { setSelectedTemplate(key); setWords({}); setErrors({}); }}
            >
              <Text style={[styles.templateBtnText, selectedTemplate === key && styles.templateBtnTextActive]}>
                {TEMPLATES[key].title}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.formCard}>
          {template.slots.map(({ key, label, placeholder }) => (
            <View key={key} style={styles.field}>
              <Text style={[styles.label, errors[key] && styles.labelError]}>
                {label}{errors[key] ? ' *' : ''}
              </Text>
              <TextInput
                style={[styles.input, errors[key] && styles.inputError]}
                placeholder={placeholder}
                placeholderTextColor="#aaa"
                value={words[key] || ''}
                onChangeText={v => setWord(key, v)}
                autoCapitalize="none"
              />
            </View>
          ))}
        </View>

        {Object.keys(errors).length > 0 && (
          <Text style={styles.errorMsg}>Please fill in all the blanks!</Text>
        )}

        <Pressable
          style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.8 }]}
          onPress={submit}
        >
          <Text style={styles.submitText}>Generate Story!</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f0f4ff',
    alignItems: 'stretch',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1a1a4e',
    textAlign: 'center',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  templateRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  templateBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e8eaf6',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  templateBtnActive: {
    borderColor: '#5c6bc0',
    backgroundColor: '#e8eaf6',
  },
  templateBtnText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  templateBtnTextActive: {
    color: '#5c6bc0',
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  field: { gap: 4 },
  label: { fontSize: 13, fontWeight: '600', color: '#333' },
  labelError: { color: '#e53935' },
  input: {
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: '#222',
    backgroundColor: '#fafafa',
  },
  inputError: { borderColor: '#e53935', backgroundColor: '#fff5f5' },
  errorMsg: { color: '#e53935', textAlign: 'center', fontSize: 13, marginBottom: 8 },
  submitBtn: {
    backgroundColor: '#5c6bc0',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#5c6bc0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});

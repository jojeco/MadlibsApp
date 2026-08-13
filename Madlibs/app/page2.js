// app/page2.js — Story result page
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const STORIES = {
  adventure: ({ noun1, adjective1, place1, person, verb1, verb2, adjective2, noun2 }) =>
    [
      { text: 'Once upon a time, a ' },
      { text: adjective1, highlight: true },
      { text: ' ' },
      { text: noun1, highlight: true },
      { text: ' set out on an adventure to ' },
      { text: place1, highlight: true },
      { text: '. Along the way, they met ' },
      { text: person, highlight: true },
      { text: ' who shouted, "You must ' },
      { text: verb1, highlight: true },
      { text: ' the beast or all is lost!" Without hesitation, the ' },
      { text: noun1, highlight: true },
      { text: ' ' },
      { text: verb2, highlight: true },
      { text: ' through the darkness and emerged victorious, clutching a ' },
      { text: adjective2, highlight: true },
      { text: ' ' },
      { text: noun2, highlight: true },
      { text: '. The crowd went absolutely wild.' },
    ],

  school: ({ person, noun1, adjective1, verb1, adverb, noun2, adjective2, verb2 }) =>
    [
      { text: 'It started as a normal day at school — until ' },
      { text: person, highlight: true },
      { text: "'s " },
      { text: noun1, highlight: true },
      { text: ' flew off the desk and hit the ' },
      { text: adjective1, highlight: true },
      { text: ' teacher right in the face. Everyone ' },
      { text: verb1, highlight: true },
      { text: ' ' },
      { text: adverb, highlight: true },
      { text: '. The principal rushed in and slipped on a ' },
      { text: noun2, highlight: true },
      { text: ', landing with a ' },
      { text: adjective2, highlight: true },
      { text: ' thud. Somehow, this made everyone decide to just ' },
      { text: verb2, highlight: true },
      { text: ' for the rest of the day. No one spoke of it again.' },
    ],

  space: ({ noun1, adjective1, person, verb1, noun2, adjective2, verb2, noun3 }) =>
    [
      { text: 'Captain ' },
      { text: person, highlight: true },
      { text: ' aimed the rocket at the ' },
      { text: adjective1, highlight: true },
      { text: ' planet of ' },
      { text: noun1, highlight: true },
      { text: '. Upon landing, the crew ' },
      { text: verb1, highlight: true },
      { text: ' out of the hatch and immediately tripped over a ' },
      { text: adjective2, highlight: true },
      { text: ' alien ' },
      { text: noun2, highlight: true },
      { text: '. The alien demanded they ' },
      { text: verb2, highlight: true },
      { text: ' using only a ' },
      { text: noun3, highlight: true },
      { text: '. Humanity somehow passed the test. Scientists are still confused.' },
    ],
};

const TEMPLATE_TITLES = {
  adventure: '⚔️ Epic Adventure',
  school: '🏫 School Disaster',
  space: '🚀 Space Mission',
};

export default function Page() {
  const router = useRouter();
  const { template, words: rawWords } = useLocalSearchParams();
  const words = JSON.parse(rawWords || '{}');

  const storyFn = STORIES[template];
  const segments = storyFn ? storyFn(words) : [{ text: 'Story not found.' }];

  const plainText = segments.map(s => s.text).join('');

  const handleShare = async () => {
    try {
      await Share.share({ message: `Mad Libs: ${TEMPLATE_TITLES[template]}\n\n${plainText}` });
    } catch (_) {}
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Your Story</Text>
      <Text style={styles.templateBadge}>{TEMPLATE_TITLES[template] ?? template}</Text>

      <View style={styles.storyCard}>
        <Text style={styles.storyText}>
          {segments.map((seg, i) =>
            seg.highlight ? (
              <Text key={i} style={styles.highlight}>{seg.text}</Text>
            ) : (
              <Text key={i}>{seg.text}</Text>
            )
          )}
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.btn, styles.shareBtn, pressed && { opacity: 0.8 }]}
          onPress={handleShare}
        >
          <Text style={styles.btnText}>Share Story</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.btn, styles.playAgainBtn, pressed && { opacity: 0.8 }]}
          onPress={() => router.replace('/')}
        >
          <Text style={[styles.btnText, { color: '#5c6bc0' }]}>Play Again</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f0f4ff',
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#1a1a4e',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  templateBadge: {
    fontSize: 15,
    color: '#5c6bc0',
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 20,
  },
  storyCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 24,
  },
  storyText: {
    fontSize: 17,
    lineHeight: 28,
    color: '#222',
  },
  highlight: {
    fontWeight: '800',
    color: '#5c6bc0',
    backgroundColor: '#e8eaf6',
    borderRadius: 3,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  btn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    width: '100%',
  },
  shareBtn: {
    backgroundColor: '#5c6bc0',
    shadowColor: '#5c6bc0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  playAgainBtn: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#5c6bc0',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

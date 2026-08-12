// page2.js
import { Text, View } from 'react-native';
import { Link } from 'expo-router';
import Styles from '../styles/page-styles';

export default function Page() {
    return (
        <View style={Styles.page}>
            <Text style={Styles.title}>How to play</Text>
            <Text>Pick a story from the home page.</Text>
            <Text>Fill in each blank with the kind of word it asks for (like an adjective or a noun).</Text>
            <Text>Tap "Make my story!" to see your finished Mad Lib.</Text>
            <Link href="/">Home</Link>
        </View>
    )
}

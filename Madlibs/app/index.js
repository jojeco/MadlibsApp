// index.js
import { Text, View } from 'react-native';
import { Link } from 'expo-router';
import Styles from '../styles/page-styles';
import templates from '../data/templates.js';

export default function Page() {
    return (
        <View style={Styles.page}>
            <Text style={Styles.title}>Madlibs</Text>
            {templates.map((template) => (
                <Link key={template.id} href={`/play?id=${template.id}`}>
                    {template.title}
                </Link>
            ))}
            <Link href="/page2">How to play</Link>
        </View>
    )
}

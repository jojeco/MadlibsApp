// index.js
import { Text, View } from 'react-native';
import { Link } from 'expo-router';
import Styles from '../styles/page-styles';

export default function Page() {
   return (
        <View style={Styles.page}>
            <Text>This is the index page </Text>
            <Link href="/page2">Go to Page 2</Link>
        </View>
    )
}

// page2.js
import { Text, View } from 'react-native';
import { Link } from 'expo-router';
import Styles from '../styles/page-styles';

export default function Page() {
    return (
        <View style={Styles.page}>
            <Text>This is page 2 </Text>
            <Link href="/">Home</Link>
        </View>
    )
}
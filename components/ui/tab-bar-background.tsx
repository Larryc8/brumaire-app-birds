import { StyleSheet, View } from 'react-native';

export default function TabBarBackground() {
    return (
        <View style={styles.tabBarBackground} />
    );
}

const styles = StyleSheet.create({
    tabBarBackground: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.95)', // Slightly translucent on non-blur platforms
    },
});

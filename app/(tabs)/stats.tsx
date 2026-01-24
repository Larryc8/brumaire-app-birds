import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function StatsScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <ThemedView style={styles.headerContainer}>
                    <ThemedText type="title">Estadísticas</ThemedText>
                </ThemedView>

                <ThemedView style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Estadísticas de Monitoreo</ThemedText>
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <ThemedText>Detecciones Hoy:</ThemedText>
                            <ThemedText type="defaultSemiBold">12</ThemedText>
                        </View>
                        <View style={styles.row}>
                            <ThemedText>Total Aves Detectadas:</ThemedText>
                            <ThemedText type="defaultSemiBold">1,245</ThemedText>
                        </View>

                        <View style={styles.divider} />

                        <ThemedText type="defaultSemiBold" style={styles.subHeader}>Especies más frecuentes</ThemedText>
                        <View style={styles.row}>
                            <ThemedText>1. Gorrión Común</ThemedText>
                            <ThemedText>450</ThemedText>
                        </View>
                        <View style={styles.row}>
                            <ThemedText>2. Paloma Bravía</ThemedText>
                            <ThemedText>320</ThemedText>
                        </View>
                        <View style={styles.row}>
                            <ThemedText>3. Mirlo</ThemedText>
                            <ThemedText>210</ThemedText>
                        </View>

                        <View style={styles.divider} />

                        <ThemedText type="defaultSemiBold" style={styles.subHeader}>Especies menos frecuentes</ThemedText>
                        <View style={styles.row}>
                            <ThemedText>1. Halcón Peregrino</ThemedText>
                            <ThemedText>2</ThemedText>
                        </View>
                        <View style={styles.row}>
                            <ThemedText>2. Martín Pescador</ThemedText>
                            <ThemedText>5</ThemedText>
                        </View>
                    </View>
                </ThemedView>

                <ThemedView style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Datos Meteorológicos</ThemedText>
                    <View style={styles.grid}>
                        <View style={styles.gridItem}>
                            <ThemedText type="defaultSemiBold">24°C</ThemedText>
                            <ThemedText style={styles.label}>Temperatura</ThemedText>
                        </View>
                        <View style={styles.gridItem}>
                            <ThemedText type="defaultSemiBold">60%</ThemedText>
                            <ThemedText style={styles.label}>Humedad</ThemedText>
                        </View>
                        <View style={styles.gridItem}>
                            <ThemedText type="defaultSemiBold">12 km/h</ThemedText>
                            <ThemedText style={styles.label}>Viento</ThemedText>
                        </View>
                        <View style={styles.gridItem}>
                            <ThemedText type="defaultSemiBold">0 mm</ThemedText>
                            <ThemedText style={styles.label}>Lluvia</ThemedText>
                        </View>
                    </View>
                </ThemedView>

                <ThemedView style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Rendimiento del Sistema</ThemedText>
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <ThemedText>Voltaje:</ThemedText>
                            <ThemedText type="defaultSemiBold">12.5 V</ThemedText>
                        </View>
                        <View style={styles.row}>
                            <ThemedText>Corriente:</ThemedText>
                            <ThemedText type="defaultSemiBold">1.2 A</ThemedText>
                        </View>
                        <View style={styles.row}>
                            <ThemedText>Potencia:</ThemedText>
                            <ThemedText type="defaultSemiBold">15 W</ThemedText>
                        </View>
                        <View style={styles.row}>
                            <ThemedText>Tasa de Fallos:</ThemedText>
                            <ThemedText type="defaultSemiBold" style={{ color: 'green' }}>0.01%</ThemedText>
                        </View>
                    </View>
                </ThemedView>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    headerContainer: {
        marginBottom: 24,
        alignItems: 'center',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#eee',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#ddd',
        marginVertical: 12,
    },
    subHeader: {
        marginBottom: 8,
        marginTop: 4,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    gridItem: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#f9f9f9',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eee',
    },
    label: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
});

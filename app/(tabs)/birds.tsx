import * as FileSystem from 'expo-file-system';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useConfig } from '@/components/ConfigContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BirdsScreen() {
    const [images, setImages] = useState<string[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const { downloadDirectory } = useConfig();
    const router = useRouter();

    const loadImages = useCallback(async () => {
        try {
            const dir = FileSystem.documentDirectory + (downloadDirectory || 'birds') + '/';
            const dirInfo = await FileSystem.getInfoAsync(dir);
            if (!dirInfo.exists) {
                // If directory doesn't exist, we just show empty list or create it if needed. 
                // Here we just set empty list as creation happens on download usually.
                setImages([]);
                return;
            }
            const files = await FileSystem.readDirectoryAsync(dir);
            setImages(files);
        } catch (error) {
            console.error('Error loading images:', error);
        }
    }, [downloadDirectory]);

    useFocusEffect(
        useCallback(() => {
            loadImages();
        }, [loadImages])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadImages();
        setRefreshing(false);
    };

    const renderItem = ({ item }: { item: string }) => {
        const uri = FileSystem.documentDirectory + (downloadDirectory || 'birds') + '/' + item;
        return (
            <TouchableOpacity onPress={() => router.push(`/bird-details/${item}`)}>
                <View style={styles.card}>
                    <Image source={{ uri }} style={styles.thumbnail} />
                    <ThemedText style={styles.imageName}>{item}</ThemedText>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ThemedView style={styles.content}>
                <ThemedText type="title" style={styles.header}>Bird Gallery</ThemedText>
                {images.length === 0 ? (
                    <ThemedText>No images found. Go to Home to download some!</ThemedText>
                ) : (
                    <FlatList
                        data={images}
                        keyExtractor={(item) => item}
                        renderItem={renderItem}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    />
                )}
            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    header: {
        marginBottom: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eee',
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 4,
        marginRight: 12,
        backgroundColor: '#ccc',
    },
    imageName: {
        fontSize: 16,
    },
});

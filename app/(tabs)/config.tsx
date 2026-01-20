import { useConfig } from '@/components/ConfigContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ConfigScreen() {
    const { downloadUrl, uploadUrl, downloadDirectory, setDownloadUrl, setUploadUrl, setDownloadDirectory, saveConfig, isLoading } = useConfig();
    const [localDownload, setLocalDownload] = useState(downloadUrl);
    const [localUpload, setLocalUpload] = useState(uploadUrl);
    const [localDirectory, setLocalDirectory] = useState(downloadDirectory);

    useEffect(() => {
        setLocalDownload(downloadUrl);
        setLocalUpload(uploadUrl);
        setLocalDirectory(downloadDirectory);
    }, [downloadUrl, uploadUrl, downloadDirectory]);

    const handleSave = async () => {
        setDownloadUrl(localDownload);
        setUploadUrl(localUpload);
        setDownloadDirectory(localDirectory || 'birds'); // Default fallback
        await saveConfig();
        alert('Configuration Saved!');
    };

    if (isLoading) {
        return (
            <ThemedView style={styles.container}>
                <ActivityIndicator size="large" />
            </ThemedView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ThemedView style={styles.content}>
                <ThemedText type="title" style={styles.header}>Configuration</ThemedText>

                <View style={styles.inputGroup}>
                    <ThemedText type="subtitle">Download Server URL</ThemedText>
                    <TextInput
                        style={styles.input}
                        value={localDownload}
                        onChangeText={setLocalDownload}
                        placeholder="https://example.com/api/birds"
                        placeholderTextColor="#888"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <ThemedText type="subtitle">Upload Server URL</ThemedText>
                    <TextInput
                        style={styles.input}
                        value={localUpload}
                        onChangeText={setLocalUpload}
                        placeholder="https://example.com/api/upload"
                        placeholderTextColor="#888"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <ThemedText type="subtitle">Download Directory Name</ThemedText>
                    <TextInput
                        style={styles.input}
                        value={localDirectory}
                        onChangeText={setLocalDirectory}
                        placeholder="birds"
                        placeholderTextColor="#888"
                        autoCapitalize="none"
                    />
                </View>

                <Button title="Save Configuration" onPress={handleSave} />
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
        padding: 20,
        flex: 1,
    },
    header: {
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        fontSize: 16,
        marginTop: 8,
        color: '#000',
    },
});

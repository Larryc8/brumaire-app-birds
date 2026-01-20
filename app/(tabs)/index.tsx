import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Button, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useConfig } from '@/components/ConfigContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  const { downloadUrl, uploadUrl, downloadDirectory } = useConfig();
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDownload = async () => {
    if (!downloadUrl) {
      Alert.alert('Configuration Missing', 'Please set a Download URL in the Config tab.');
      return;
    }

    setDownloading(true);
    try {
      const dir = FileSystem.documentDirectory + (downloadDirectory || 'birds') + '/';
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });

      const timestamp = new Date().getTime();
      const filename = `bird_${timestamp}.jpg`;
      const fileUri = dir + filename;

      // Note: In a real scenario, we might want to handle file extensions dynamically based on content-type
      const { uri } = await FileSystem.downloadAsync(downloadUrl, fileUri);

      Alert.alert('Success', `Image downloaded to ${uri}`);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to download image. Check URL or internet connection.');
    } finally {
      setDownloading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadUrl) {
      Alert.alert('Configuration Missing', 'Please set an Upload URL in the Config tab.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploading(true);
        const asset = result.assets[0];
        const base64Data = asset.base64;

        if (!base64Data) {
          throw new Error('No base64 data available');
        }

        const payload = {
          image: base64Data,
          fileName: asset.fileName || 'upload.jpg',
          type: asset.mimeType || 'image/jpeg',
        };

        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          Alert.alert('Success', 'Image uploaded successfully!');
        } else {
          Alert.alert('Error', `Upload failed with status: ${response.status}`);
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedView style={styles.headerContainer}>
          <ThemedText type="title">Bird Monitor</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.description}>
            Welcome to the Bird Monitoring Interface.
          </ThemedText>
          <ThemedText style={styles.description}>
            Use the buttons below to download bird images from the configured server or upload your own sightings.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.actions}>
          <View style={styles.buttonContainer}>
            <Button
              title="Download Image"
              onPress={handleDownload}
              disabled={downloading}
            />
            {downloading && <ActivityIndicator style={styles.loader} />}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Upload Image"
              onPress={handleUpload}
              disabled={uploading}
              color="#4CAF50"
            />
            {uploading && <ActivityIndicator style={styles.loader} />}
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
  description: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  actions: {
    gap: 20,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  loader: {
    marginTop: 10,
  },
});

import * as FileSystem from "expo-file-system/legacy";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useConfig } from "@/components/ConfigContext";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function BirdDetailScreen() {
  const { id } = useLocalSearchParams();
  const { downloadDirectory } = useConfig();
  const filename = Array.isArray(id) ? id[0] : id;
  const [fileInfo, setFileInfo] = useState<FileSystem.FileInfo | null>(null);

  useEffect(() => {
    if (!filename) return;
    const loadInfo = async () => {
      const uri =
        FileSystem.documentDirectory +
        (downloadDirectory || "birds") +
        "/" +
        filename;
      const info = await FileSystem.getInfoAsync(uri);
      setFileInfo(info);
    };
    loadInfo();
  }, [filename, downloadDirectory]);

  if (!filename) {
    return <ThemedText>Error: No se proporcionó nombre de archivo</ThemedText>;
  }

  const uri =
    FileSystem.documentDirectory +
    (downloadDirectory || "birds") +
    "/" +
    filename;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>
          {filename}
        </ThemedText>

        <View style={styles.imageContainer}>
          <Image source={{ uri }} style={styles.image} resizeMode="contain" />
        </View>

        <ThemedView style={styles.infoContainer}>
          <ThemedText type="subtitle">Metadatos</ThemedText>
          <ThemedText>Ruta: {uri}</ThemedText>
          {fileInfo && fileInfo.exists && (
            <>
              <ThemedText>Tamaño: {fileInfo.size} bytes</ThemedText>
              <ThemedText>
                Modificado:{" "}
                {new Date(fileInfo.modificationTime * 1000).toLocaleString()}
              </ThemedText>
            </>
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: "center",
  },
  imageContainer: {
    width: "100%",
    height: 400,
    backgroundColor: "#f0f0f0",
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  infoContainer: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
});

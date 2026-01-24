import { useConfig } from "@/components/ConfigContext";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import * as FileSystem from "expo-file-system/legacy";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ConfigScreen() {
  const {
    downloadUrl,
    uploadUrl,
    downloadDirectory,
    useExternalDirectory,
    setDownloadUrl,
    setUploadUrl,
    setDownloadDirectory,
    setUseExternalDirectory,
    saveConfig,
    isLoading,
  } = useConfig();
  const [localDownload, setLocalDownload] = useState(downloadUrl);
  const [localUpload, setLocalUpload] = useState(uploadUrl);
  const [localDirectory, setLocalDirectory] = useState(downloadDirectory);
  const [localUseExternal, setLocalUseExternal] =
    useState(useExternalDirectory);

  useEffect(() => {
    setLocalDownload(downloadUrl);
    setLocalUpload(uploadUrl);
    setLocalDirectory(downloadDirectory);
    setLocalUseExternal(useExternalDirectory);
  }, [downloadUrl, uploadUrl, downloadDirectory, useExternalDirectory]);

  const handleSave = async () => {
    setDownloadUrl(localDownload);
    setUploadUrl(localUpload);
    setDownloadDirectory(localDirectory || "birds"); // Default fallback
    setUseExternalDirectory(localUseExternal);
    await saveConfig();
    alert("¡Configuración Guardada!");
  };

  const handleSelectDirectory = async () => {
    try {
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (permissions.granted) {
        setLocalDirectory(permissions.directoryUri);
      }
    } catch (error) {
      console.error(error);
      alert("Error al seleccionar el directorio");
    }
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
        <ThemedText type="title" style={styles.header}>
          Configuración
        </ThemedText>

        <View style={styles.inputGroup}>
          <ThemedText type="subtitle">URL del Servidor de Descarga</ThemedText>
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
          <ThemedText type="subtitle">URL del Servidor de Carga</ThemedText>
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
          <View style={styles.switchContainer}>
            <ThemedText type="subtitle">Usar Directorio Externo</ThemedText>
            <Switch
              value={localUseExternal}
              onValueChange={setLocalUseExternal}
            />
          </View>

          <ThemedText type="subtitle">
            {localUseExternal
              ? "URI del Directorio de Almacenamiento"
              : "Nombre del Directorio de Descarga"}
          </ThemedText>

          {localUseExternal ? (
            <View>
              <TextInput
                style={[styles.input, styles.readOnlyInput]}
                value={localDirectory}
                editable={false}
                multiline
              />
              <Button
                title="Seleccionar Directorio"
                onPress={handleSelectDirectory}
              />
            </View>
          ) : (
            <TextInput
              style={styles.input}
              value={localDirectory}
              onChangeText={setLocalDirectory}
              placeholder="birds"
              placeholderTextColor="#888"
              autoCapitalize="none"
            />
          )}
        </View>

        <Button title="Guardar Configuración" onPress={handleSave} />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
    marginTop: 8,
    color: "#000",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  readOnlyInput: {
    backgroundColor: "#f0f0f0",
    color: "#666",
    marginBottom: 10,
  },
});

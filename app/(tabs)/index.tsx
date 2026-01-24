import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useConfig } from "@/components/ConfigContext";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function HomeScreen() {
  const { downloadUrl, uploadUrl, downloadDirectory, useExternalDirectory } =
    useConfig();
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDownload = async (file) => {
    if (!downloadUrl) {
      Alert.alert(
        "Configuración Faltante",
        "Por favor configure una URL de descarga en la pestaña de Configuración.",
      );
      return;
    }

    setDownloading(true);
    try {
      let uri = "";
      const timestamp = new Date().getTime();
      const filename = `bird_${timestamp}.jpg`;
      const serverUrl = `${downloadUrl}/download?file=${file}`;

      if (useExternalDirectory) {
        // External Directory (SAF) Logic
        try {
          // 1. Download to temporary cache file first
          const tempUri = FileSystem.cacheDirectory + filename;
          await FileSystem.downloadAsync(serverUrl, tempUri);

          // 2. Read file as base64
          const fileData = await FileSystem.readAsStringAsync(tempUri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // 3. Create file in external directory
          const createdUri =
            await FileSystem.StorageAccessFramework.createFileAsync(
              downloadDirectory,
              filename,
              "image/jpeg",
            );

          // 4. Write data
          await FileSystem.StorageAccessFramework.writeAsStringAsync(
            createdUri,
            fileData,
            { encoding: FileSystem.EncodingType.Base64 },
          );

          // 5. Cleanup temp file
          await FileSystem.deleteAsync(tempUri, { idempotent: true });

          uri = createdUri;
        } catch (e) {
          console.error("SAF Error:", e);
          throw e;
        }
      } else {
        // Internal Directory Logic
        const dir =
          FileSystem.documentDirectory + (downloadDirectory || "birds") + "/";
        console.log("dir for download", dir);
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });

        const fileUri = dir + filename;

        // Note: In a real scenario, we might want to handle file extensions dynamically based on content-type
        const result = await FileSystem.downloadAsync(serverUrl, fileUri);
        uri = result.uri;
      }

      Alert.alert("Éxito", `Imagen descargada en ${uri}`);
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Error",
        "Error al descargar la imagen. Verifique la URL o su conexión a internet.",
      );
    } finally {
      setDownloading(false);
    }
  };

  const getFiles = async () => {
    // 1. Connect to the server
    const response = await fetch(`${downloadUrl}/files`);
    console.log(downloadUrl);
    // 2. Parse the JSON response
    const json = await response.json();
    const fileNames = json.map((item) => item.file);
    return fileNames;
  };

  const processFiles = async () => {
    console.log("Starting sequential processing...");
    const fileList = await getFiles();

    for (const item of fileList) {
      try {
        // The code pauses here until 'uploadFile' finishes
        const result = await handleDownload(item);
        console.log(`Finished: ${item.file}`, result);
      } catch (error) {
        console.error(`Error processing ${item.file}:`, error);
        // Optional: use 'break' to stop the whole sequence on error
      }
    }

    console.log("All files processed in order.");
  };

  const handleUpload = async () => {
    if (!uploadUrl) {
      Alert.alert(
        "Configuración Faltante",
        "Por favor configure una URL de carga en la pestaña de Configuración.",
      );
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
          throw new Error("No base64 data available");
        }

        const payload = {
          imageData: base64Data,
          imageName: "prueba.jpg",
          fileName: asset.fileName || "upload.jpg",
          type: asset.mimeType || "image/jpeg",
        };

        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          Alert.alert("Éxito", "¡Imagen cargada exitosamente!");
        } else {
          Alert.alert("Error", `La carga falló con estado: ${response.status}`);
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Error al cargar la imagen.");
    } finally {
      setUploading(false);
    }
  };

  const processImageToText = async () => {
    if (!uploadUrl) {
      Alert.alert(
        "Configuración Faltante",
        "Por favor configure una URL de carga en la pestaña de Configuración.",
      );
      return;
    }
    setUploading(true);
    const birdsDir = `${FileSystem.documentDirectory}birds/`;
    try {
      const fileNames = await FileSystem.readDirectoryAsync(birdsDir);

      // 2. Filter to ensure we only get image files (jpg/png)
      // and map them to their full 'file://' URIs
      const imageUris = fileNames.filter((name) =>
        /\.(jpg|jpeg|png)$/i.test(name),
      );
      // .map((name) => `${birdsDir}${name}`);

      console.log("Found images:", imageUris);
      for (const item of imageUris) {
        let imageUri = `${FileSystem.documentDirectory}${downloadDirectory}/${item}`;
        let fileInfo = await FileSystem.getInfoAsync(imageUri);
        if (!fileInfo.exists) {
          alert("¡No se encontró la imagen en la ruta!");
          return;
        }
        let base64Image = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const payload = {
          imageData: base64Image,
          imageName: "prueba.jpg",
          fileName: "upload.jpg",
          type: "jpg",
        };
        let response = await fetch(uploadUrl, {
          method: "POST",
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();
        console.log(result);
      }
      // 1. Define the path (using the birds folder we discussed)

      // 2. Check if file exists

      // 3. Read the image and convert to Base64

      // 4. Send to an OCR API (Example using a placeholder URL)
      // In a real app, you would use Google Cloud Vision or a similar service
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAll = async () => {
    const dir =
      FileSystem.documentDirectory + (downloadDirectory || "birds") + "/";

    Alert.alert(
      "Eliminar todas las imágenes",
      "¿Está seguro de que desea eliminar todas las imágenes? Esta acción no se puede deshacer.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              if (useExternalDirectory) {
                // External Directory (SAF) Logic
                const files =
                  await FileSystem.StorageAccessFramework.readDirectoryAsync(
                    downloadDirectory,
                  );
                for (const fileUri of files) {
                  await FileSystem.StorageAccessFramework.deleteAsync(fileUri);
                }
                Alert.alert(
                  "Éxito",
                  "Todas las imágenes han sido eliminadas del directorio externo.",
                );
              } else {
                // Internal Directory Logic
                // Check if directory exists first to avoid errors
                const dirInfo = await FileSystem.getInfoAsync(dir);
                if (dirInfo.exists) {
                  await FileSystem.deleteAsync(dir);
                  // Recreate the directory so it's ready for new downloads
                  await FileSystem.makeDirectoryAsync(dir, {
                    intermediates: true,
                  });
                  Alert.alert("Éxito", "Todas las imágenes han sido eliminadas.");
                } else {
                  Alert.alert(
                    "Info",
                    "El directorio ya está vacío o no existe.",
                  );
                }
              }
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "Error al eliminar las imágenes.");
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedView style={styles.headerContainer}>
          <ThemedText type="title">Monitor de Aves</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.description}>
            Bienvenido a la Interfaz de Monitoreo de Aves.
          </ThemedText>
          <ThemedText style={styles.description}>
            Use los botones a continuación para descargar imágenes de aves desde el servidor configurado o cargar sus propios avistamientos.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.actions}>
          <View style={styles.buttonContainer}>
            <Button
              title="Descargar Imagen"
              onPress={processFiles}
              disabled={downloading}
            />
            {downloading && <ActivityIndicator style={styles.loader} />}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Cargar Imagen"
              onPress={processImageToText}
              disabled={uploading}
              color="#4CAF50"
            />
            {uploading && <ActivityIndicator style={styles.loader} />}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Eliminar todas las imágenes"
              onPress={handleDeleteAll}
              color="#F44336"
            />
          </View>
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
    padding: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  section: {
    marginBottom: 32,
  },
  description: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
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

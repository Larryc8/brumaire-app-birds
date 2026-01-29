import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Dimensions,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";

import * as FileSystem from "expo-file-system/legacy";

import { useConfig } from "@/components/ConfigContext";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

const screenWidth = Dimensions.get("window").width;

export default function StatsScreen() {
  const { downloadUrl, downloadDirectory } = useConfig();
  const [loading, setLoading] = useState(false);
  const [fileExists, setFileExists] = useState<boolean | null>(null);

  // Download progress tracking
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [bytesDownloaded, setBytesDownloaded] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);

  // State for all chart data - initialized with mock data
  const [tempData, setTempData] = useState([]);
  // [
  //   { value: 20, label: "6am" },
  //   { value: 22, label: "9am" },
  //   { value: 25, label: "12pm" },
  //   { value: 24, label: "3pm" },
  //   { value: 21, label: "6pm" },
  //   { value: 18, label: "9pm" },
  // ]

  const [humidityData, setHumidityData] = useState([]);
  // [
  //   { value: 65, label: "6am" },
  //   { value: 60, label: "9am" },
  //   { value: 55, label: "12pm" },
  //   { value: 58, label: "3pm" },
  //   { value: 70, label: "6pm" },
  //   { value: 75, label: "9pm" },
  // ]

  const [voltageData, setVoltageData] = useState([]);
  // [
  //   { value: 12.8, label: "1h" },
  //   { value: 12.7, label: "2h" },
  //   { value: 12.5, label: "3h" },
  //   { value: 12.4, label: "4h" },
  //   { value: 12.6, label: "5h" },
  //   { value: 12.5, label: "6h" },
  // ])

  const [powerData, setPowerData] = useState([]);
  // [
  //   { value: 10, label: "1h" },
  //   { value: 12, label: "2h" },
  //   { value: 15, label: "3h" },
  //   { value: 14, label: "4h" },
  //   { value: 11, label: "5h" },
  //   { value: 13, label: "6h" },
  // ]

  const [speciesData, setSpeciesData] = useState([]);
  // [
  //   { value: 450, label: "Gorrión", frontColor: "#4ABFF4" },
  //   { value: 320, label: "Paloma", frontColor: "#79C3DB" },
  //   { value: 210, label: "Mirlo", frontColor: "#28B2B3" },
  //   { value: 150, label: "Zorzal", frontColor: "#4ADDBA" },
  //   { value: 80, label: "Jilguero", frontColor: "#91E3E3" },
  // ]

  // Helper function to transform server data format to chart format
  const transformData = (
    serverData: Array<{ t: string; v: number | null }>,
    maxPoints = 10,
  ) => {
    if (!serverData || serverData.length === 0) return [];

    // Filter out null values and take last N points
    const validData = serverData.filter((item) => item.v !== null);
    const recentData = validData.slice(-maxPoints);

    return recentData.map((item) => {
      // Extract time label (e.g., "22:13" from "2025-11-17T22-13-28")
      const timeMatch = item.t.match(/T(\d{2})-(\d{2})/);
      const label = timeMatch ? `${timeMatch[1]}:${timeMatch[2]}` : item.t;

      return {
        value: item.v as number,
        label: label,
      };
    });
  };

  // Check if log.txt exists on component mount
  useEffect(() => {
    const checkFileExists = async () => {
      try {
        const fileUri = `${FileSystem.documentDirectory}${downloadDirectory}/events.json`;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        setFileExists(fileInfo.exists);
        console.log("events.json info: ", fileInfo);
      } catch (error) {
        console.error("Error checking file:", error);
        setFileExists(false);
      }
    };

    checkFileExists();
  }, [downloadDirectory]);

  const downloadFile = async (fileName: string) => {
    const fileUrl = `${downloadUrl}/download?file=log.txt`;
    const fileUri = `${FileSystem.documentDirectory}${downloadDirectory}/${fileName}`;

    // Reset download metrics
    setDownloadProgress(0);
    setDownloadSpeed(0);
    setElapsedTime(0);
    setBytesDownloaded(0);
    setTotalBytes(0);

    const startTime = Date.now();
    let lastUpdateTime = startTime;
    let lastBytesWritten = 0;

    try {
      // 1. Initiate the download
      const downloadResumable = FileSystem.createDownloadResumable(
        fileUrl,
        fileUri,
        {},
        (downloadProgress) => {
          const currentTime = Date.now();
          const elapsed = (currentTime - startTime) / 1000; // in seconds
          const progress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;

          // Calculate throughput (speed)
          const timeSinceLastUpdate = (currentTime - lastUpdateTime) / 1000;
          const bytesSinceLastUpdate =
            downloadProgress.totalBytesWritten - lastBytesWritten;
          const currentSpeed =
            timeSinceLastUpdate > 0
              ? bytesSinceLastUpdate / timeSinceLastUpdate
              : 0;

          // Update state
          setDownloadProgress(progress * 100);
          setDownloadSpeed(currentSpeed);
          setElapsedTime(elapsed);
          setBytesDownloaded(downloadProgress.totalBytesWritten);
          setTotalBytes(downloadProgress.totalBytesExpectedToWrite);

          // Update tracking variables
          lastUpdateTime = currentTime;
          lastBytesWritten = downloadProgress.totalBytesWritten;

          console.log(`Progress: ${(progress * 100).toFixed(2)}%`);
        },
      );

      const result = await downloadResumable.downloadAsync();

      if (result) {
        Alert.alert("Success!", `File saved to: ${result.uri}`);
        console.log("Finished downloading to:", result.uri);
      }
    } catch (error) {
      // console.error(error);
      Alert.alert("Error", "Failed to download file.");
    } finally {
      console.log("Download finished");
      // Update file existence status after download
      const fileUri = `${FileSystem.documentDirectory}${downloadDirectory}/${fileName}`;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      setFileExists(fileInfo.exists);
      console.log("Downloaded File: ", fileUri, fileInfo.exists);

      // Reset progress after a delay
      setTimeout(() => {
        setDownloadProgress(0);
        setDownloadSpeed(0);
      }, 10000);
    }
  };

  const convertTxtToEventIndexedJson = async (data: string) => {
    try {
      // const data = fs.readFileSync(filePath, "utf8");
      const lines = data.split("\n");

      const result: Record<string, Array<{ t: string; v: number | null }>> = {};

      lines.forEach((line: string) => {
        if (!line.trim()) return;

        const [timestamp, type, key, value] = line.split(",");

        // We skip the header lines (BIRD/PERIODIC) because they don't have sensor keys
        if (type !== "BIRD" && type !== "PERIODIC" && key) {
          const eventName = key.trim();
          const parsedValue = value.trim() === "nan" ? null : parseFloat(value);

          // If this event doesn't exist in our object yet, create an empty array
          if (!result[eventName]) {
            result[eventName] = [];
          }

          // Push the data point to the event's history
          result[eventName].push({
            t: timestamp,
            v: parsedValue,
          });
        }
      });

      // 1. Define the file path (DocumentDirectory is standard for user data)
      const fileUri = `${FileSystem.documentDirectory}${downloadDirectory}/events.json`;

      // 2. Convert your data to a string
      const jsonString = JSON.stringify(result, null, 2);
      console.log("Success! JSON indexed by event name created at:", fileUri);

      console.log("Json FIle: \n", jsonString);

      await FileSystem.writeAsStringAsync(fileUri, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      console.log("Success! JSON indexed by event name created at:", fileUri);
    } catch (err) {
      const error = err as Error;
      console.error("Error:", error.message);
    }
  };

  const readFile = async (fileName: string) => {
    const fileUri = `${FileSystem.documentDirectory}${downloadDirectory}/${fileName}`;
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);

      if (!fileInfo.exists) {
        Alert.alert("Error", "File does not exist. Download it first!");
        return;
      }

      const content = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      convertTxtToEventIndexedJson(content);

      console.log("File Content Read successfully");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not read file");
    } finally {
      return "events.json";
    }
  };

  const refreshStatsData = async () => {
    if (!downloadDirectory) {
      Alert.alert(
        "Error",
        "Por favor configure el directorio de descarga en la pestaña Configuración",
      );

      return;
    }

    setLoading(true);
    try {
      // Read data from local events.json file
      const fileUri = `${FileSystem.documentDirectory}${downloadDirectory}/events.json`;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);

      if (!fileInfo.exists) {
        Alert.alert(
          "Error",
          "El archivo events.json no existe. Se comenzara la descarga",
        );
        const f = "data.txt";
        await downloadFile(f);
        await readFile(f);
        // return;
      }

      // Read and parse the JSON file
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const data = JSON.parse(fileContent);
      console.log("Loaded data from events.json:", data);

      // Transform and update chart data based on Spanish field names
      if (data["Temperatura ambiente"]) {
        setTempData(transformData(data["Temperatura ambiente"], 6));
      }

      if (data["Humedad interna"]) {
        setHumidityData(transformData(data["Humedad interna"], 6));
      }

      if (data["Error acumulado"]) {
        setVoltageData(transformData(data["Error acumulado"], 6));
      }

      if (data["Corriente de Bateria"]) {
        setPowerData(transformData(data["Corriente de Bateria"], 6));
      }

      // Species data might have different format - keep mock data for now
      // You can update this if the server provides species data

      Alert.alert(
        "Éxito",
        "Datos actualizados correctamente desde events.json",
      );
    } catch (error) {
      console.error("Error loading stats:", error);
      Alert.alert(
        "Error",
        `No se pudieron cargar los datos: ${error instanceof Error ? error.message : "Error desconocido"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedView style={styles.headerContainer}>
          <ThemedText type="title">Estadísticas</ThemedText>
          <View style={styles.refreshButtonContainer}>
            {loading ? (
              <ActivityIndicator size="small" color="#0000ff" />
            ) : (
              <Button title="Actualizar Datos" onPress={refreshStatsData} />
            )}
          </View>

          {/* Download Progress Display */}
          {downloadProgress > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${downloadProgress}%` },
                  ]}
                />
              </View>
              <ThemedText style={styles.progressText}>
                {downloadProgress.toFixed(1)}%
              </ThemedText>

              <View style={styles.downloadMetrics}>
                <ThemedText style={styles.metricText}>
                  Velocidad: {(downloadSpeed / 1024).toFixed(2)} KB/s
                </ThemedText>
                <ThemedText style={styles.metricText}>
                  Tiempo: {elapsedTime.toFixed(1)}s
                </ThemedText>
                <ThemedText style={styles.metricText}>
                  Descargado: {(bytesDownloaded / 1024).toFixed(2)} KB /{" "}
                  {(totalBytes / 1024).toFixed(2)} KB
                </ThemedText>
              </View>
            </View>
          )}
        </ThemedView>

        {/* Show loading while checking file existence */}
        {fileExists === null ? (
          <ThemedView style={styles.section}>
            <View style={styles.card}>
              <ActivityIndicator size="large" color="#0000ff" />
              <ThemedText style={{ textAlign: "center", marginTop: 16 }}>
                Verificando datos...
              </ThemedText>
            </View>
          </ThemedView>
        ) : !fileExists ? (
          // Show message if file doesn't exist
          <ThemedView style={styles.section}>
            <View style={styles.card}>
              <ThemedText
                type="subtitle"
                style={{ textAlign: "center", marginBottom: 12 }}
              >
                No hay datos disponibles
              </ThemedText>
              <ThemedText style={{ textAlign: "center", color: "#666" }}>
                Por favor, presione el botón "Actualizar Datos" para obtener
                información del servidor.
              </ThemedText>
            </View>
          </ThemedView>
        ) : (
          // Show charts if file exists
          <>
            <ThemedView style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Estadísticas de Monitoreo
              </ThemedText>
              <View style={styles.card}>
                <View style={styles.row}>
                  <ThemedText>Detecciones Hoy:</ThemedText>
                  <ThemedText type="defaultSemiBold">0</ThemedText>
                </View>
                <View style={styles.row}>
                  <ThemedText>Total Aves Detectadas:</ThemedText>
                  <ThemedText type="defaultSemiBold">0</ThemedText>
                </View>

                <View style={styles.divider} />

                {/*<ThemedText type="defaultSemiBold" style={styles.subHeader}>
                  Especies más frecuentes
                </ThemedText>
                <BarChart
                  data={speciesData}
                  barWidth={22}
                  noOfSections={3}
                  barBorderRadius={4}
                  frontColor="lightgray"
                  yAxisThickness={0}
                  xAxisThickness={0}
                />*/}
              </View>
            </ThemedView>

            <ThemedView style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Datos Meteorológicos (Temp)
              </ThemedText>
              <View style={styles.card}>
                {tempData.length === 0 ? (
                  <View style={styles.noDataContainer}>
                    <ThemedText style={styles.noDataText}>
                      No hay datos disponibles
                    </ThemedText>
                  </View>
                ) : (
                  <LineChart
                    data={tempData}
                    color={"#f44336"}
                    thickness={3}
                    dataPointsColor={"#f44336"}
                    startFillColor={"rgba(244, 67, 54, 0.3)"}
                    endFillColor={"rgba(244, 67, 54, 0.01)"}
                    startOpacity={0.9}
                    endOpacity={0.2}
                    initialSpacing={0}
                    noOfSections={4}
                    yAxisColor="white"
                    yAxisThickness={0}
                    rulesType="solid"
                    rulesColor="gray"
                    yAxisTextStyle={{ color: "gray" }}
                    xAxisColor="lightgray"
                    pointerConfig={{
                      pointerStripUptoDataPoint: true,
                      pointerStripColor: "lightgray",
                      pointerStripWidth: 2,
                      strokeDashArray: [2, 5],
                      pointerColor: "lightgray",
                      radius: 4,
                      pointerLabelWidth: 100,
                      pointerLabelHeight: 120,
                      activatePointersOnLongPress: true,
                      autoAdjustPointerLabelPosition: false,
                    }}
                  />
                )}
              </View>
              <ThemedText
                type="subtitle"
                style={[styles.sectionTitle, { marginTop: 20 }]}
              >
                Datos Meteorológicos (Humedad)
              </ThemedText>
              <View style={styles.card}>
                {humidityData.length === 0 ? (
                  <View style={styles.noDataContainer}>
                    <ThemedText style={styles.noDataText}>
                      No hay datos disponibles
                    </ThemedText>
                  </View>
                ) : (
                  <LineChart
                    data={humidityData}
                    color={"#2196f3"}
                    thickness={3}
                    dataPointsColor={"#2196f3"}
                    startFillColor={"rgba(33, 150, 243, 0.3)"}
                    endFillColor={"rgba(33, 150, 243, 0.01)"}
                    startOpacity={0.9}
                    endOpacity={0.2}
                    initialSpacing={0}
                    noOfSections={4}
                    yAxisColor="white"
                    yAxisThickness={0}
                    rulesType="solid"
                    rulesColor="gray"
                    yAxisTextStyle={{ color: "gray" }}
                    xAxisColor="lightgray"
                  />
                )}
              </View>

              {/*<View style={styles.grid}>
                <View style={styles.gridItem}>
                  <ThemedText type="defaultSemiBold">24°C</ThemedText>
                  <ThemedText style={styles.label}>
                    Temperatura Actual
                  </ThemedText>
                </View>
                <View style={styles.gridItem}>
                  <ThemedText type="defaultSemiBold">60%</ThemedText>
                  <ThemedText style={styles.label}>Humedad Actual</ThemedText>
                </View>
              </View>*/}
            </ThemedView>

            <ThemedView style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Rendimiento del Sistema
              </ThemedText>
              <View style={styles.card}>
                <ThemedText style={{ marginBottom: 10 }}>Fallos </ThemedText>
                {voltageData.length === 0 ? (
                  <View style={styles.noDataContainer}>
                    <ThemedText style={styles.noDataText}>
                      No hay datos disponibles
                    </ThemedText>
                  </View>
                ) : (
                  <LineChart
                    data={voltageData}
                    areaChart
                    curved
                    color={"#4caf50"}
                    thickness={3}
                    startFillColor={"rgba(76, 175, 80, 0.3)"}
                    endFillColor={"rgba(76, 175, 80, 0.01)"}
                    startOpacity={0.9}
                    endOpacity={0.2}
                    initialSpacing={0}
                    noOfSections={4}
                    yAxisColor="white"
                    yAxisThickness={0}
                    rulesType="solid"
                    rulesColor="gray"
                    yAxisTextStyle={{ color: "gray" }}
                    xAxisColor="lightgray"
                  />
                )}
                <View style={{ height: 20 }} />
                <ThemedText style={{ marginBottom: 10 }}>
                  Corriente de bateria (A)
                </ThemedText>
                {powerData.length === 0 ? (
                  <View style={styles.noDataContainer}>
                    <ThemedText style={styles.noDataText}>
                      No hay datos disponibles
                    </ThemedText>
                  </View>
                ) : (
                  <LineChart
                    data={powerData}
                    areaChart
                    curved
                    color={"#ff9800"}
                    thickness={3}
                    startFillColor={"rgba(255, 152, 0, 0.3)"}
                    endFillColor={"rgba(255, 152, 0, 0.01)"}
                    startOpacity={0.9}
                    endOpacity={0.2}
                    initialSpacing={0}
                    noOfSections={4}
                    yAxisColor="white"
                    yAxisThickness={0}
                    rulesType="solid"
                    rulesColor="gray"
                    yAxisTextStyle={{ color: "gray" }}
                    xAxisColor="lightgray"
                  />
                )}
              </View>
              <View style={[styles.card, { marginTop: 16 }]}>
                <View style={styles.row}>
                  <ThemedText>Tasa de Fallos:</ThemedText>
                  <ThemedText type="defaultSemiBold" style={{ color: "green" }}>
                    0.01%
                  </ThemedText>
                </View>
              </View>
            </ThemedView>
          </>
        )}
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
  refreshButtonContainer: {
    marginTop: 12,
    width: "100%",
    maxWidth: 200,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 12,
  },
  subHeader: {
    marginBottom: 8,
    marginTop: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  label: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 16,
    width: "100%",
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4caf50",
    borderRadius: 4,
  },
  progressText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  downloadMetrics: {
    gap: 4,
  },
  metricText: {
    fontSize: 12,
    color: "#666",
  },
  noDataContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    color: "#666",
    fontSize: 14,
  },
});

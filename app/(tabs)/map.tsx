import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import MapboxGL from "@rnmapbox/maps";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getCourses } from "../../src/services/api";
import { Course } from "../../src/types";

MapboxGL.setAccessToken("MAPBOX_TOKEN_REMOVED");

export default function MapScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (error) {
      console.error("Failed to load courses:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1B5E20" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapboxGL.MapView style={styles.map} styleURL={MapboxGL.StyleURL.Outdoors}>
        <MapboxGL.Camera
          zoomLevel={5}
          centerCoordinate={[2.3522, 46.6034]}
        />
        {courses.map((course) => (
          <MapboxGL.PointAnnotation
            key={course.id}
            id={course.id}
            coordinate={[course.longitude, course.latitude]}
            onSelected={() => setSelectedCourse(course)}
          >
            <View style={styles.marker}>
              <Ionicons name="golf" size={20} color="#fff" />
            </View>
          </MapboxGL.PointAnnotation>
        ))}
      </MapboxGL.MapView>

      {selectedCourse && (
        <View style={styles.popup}>
          <TouchableOpacity
            style={styles.popupClose}
            onPress={() => setSelectedCourse(null)}
          >
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
          <Text style={styles.popupName}>{selectedCourse.name}</Text>
          <Text style={styles.popupCity}>
            {selectedCourse.city}, {selectedCourse.country}
          </Text>
          <View style={styles.popupInfo}>
            <Text style={styles.popupDetail}>{selectedCourse.holes} trous</Text>
            <Text style={styles.popupDetail}>Par {selectedCourse.par}</Text>
          </View>
          <View style={styles.popupActions}>
            <TouchableOpacity
              style={styles.detailButton}
              onPress={() => {
                setSelectedCourse(null);
                router.push(`/course/${selectedCourse.id}`);
              }}
            >
              <Text style={styles.detailButtonText}>Voir les détails</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.playBtn}
              onPress={() => {
                setSelectedCourse(null);
                router.push(`/round/new?courseId=${selectedCourse.id}`);
              }}
            >
              <Ionicons name="golf" size={18} color="#fff" />
              <Text style={styles.playBtnText}>Jouer</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  marker: {
    backgroundColor: "#1B5E20",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  popup: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  popupClose: { position: "absolute", top: 12, right: 12 },
  popupName: { fontSize: 20, fontWeight: "bold", color: "#333", marginBottom: 4 },
  popupCity: { fontSize: 14, color: "#999" },
  popupInfo: { flexDirection: "row", gap: 16, marginTop: 12 },
  popupDetail: { fontSize: 14, color: "#666", fontWeight: "600" },
  popupActions: { flexDirection: "row", gap: 12, marginTop: 16 },
  detailButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#1B5E20",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  detailButtonText: { color: "#1B5E20", fontWeight: "bold" },
  playBtn: {
    flex: 1,
    backgroundColor: "#1B5E20",
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  playBtnText: { color: "#fff", fontWeight: "bold" },
});

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { getCourse } from "../../src/services/api";
import { Course } from "../../src/types";

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      const data = await getCourse(id!);
      setCourse(data);
    } catch {
      console.error("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !course) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1B5E20" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: course.name }} />
      <ScrollView style={styles.container}>
        <View style={styles.infoCard}>
          <Text style={styles.courseName}>{course.name}</Text>
          <Text style={styles.courseLocation}>
            <Ionicons name="location-outline" size={14} /> {course.city}, {course.country}
          </Text>
          <View style={styles.infoRow}>
            <View style={styles.infoBadge}>
              <Text style={styles.infoBadgeValue}>{course.holes}</Text>
              <Text style={styles.infoBadgeLabel}>Trous</Text>
            </View>
            <View style={styles.infoBadge}>
              <Text style={styles.infoBadgeValue}>{course.par}</Text>
              <Text style={styles.infoBadgeLabel}>Par</Text>
            </View>
            <View style={styles.infoBadge}>
              <Text style={styles.infoBadgeValue}>
                {course.courseHoles?.reduce((sum, h) => sum + h.distance, 0) ?? 0}m
              </Text>
              <Text style={styles.infoBadgeLabel}>Distance</Text>
            </View>
          </View>
        </View>

        <View style={styles.holesCard}>
          <Text style={styles.sectionTitle}>Trous</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 0.5 }]}>N</Text>
            <Text style={[styles.tableCell, styles.tableHeaderText]}>Par</Text>
            <Text style={[styles.tableCell, styles.tableHeaderText]}>Distance</Text>
          </View>
          {course.courseHoles?.map((hole) => (
            <View key={hole.number} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.holeNumber, { flex: 0.5 }]}>{hole.number}</Text>
              <Text style={[styles.tableCell, styles.holePar]}>{hole.par}</Text>
              <Text style={[styles.tableCell, styles.holeDistance]}>{hole.distance}m</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.playButton}
          onPress={() => router.push(`/round/new?courseId=${course.id}`)}
        >
          <Ionicons name="golf" size={22} color="#fff" />
          <Text style={styles.playButtonText}>Jouer ce parcours</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  infoCard: {
    backgroundColor: "#fff", margin: 16, borderRadius: 16, padding: 20,
    elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3,
  },
  courseName: { fontSize: 24, fontWeight: "bold", color: "#333" },
  courseLocation: { fontSize: 14, color: "#999", marginTop: 4 },
  infoRow: { flexDirection: "row", gap: 12, marginTop: 16 },
  infoBadge: { flex: 1, backgroundColor: "#E8F5E9", borderRadius: 10, padding: 12, alignItems: "center" },
  infoBadgeValue: { fontSize: 20, fontWeight: "bold", color: "#1B5E20" },
  infoBadgeLabel: { fontSize: 12, color: "#666", marginTop: 2 },
  holesCard: {
    backgroundColor: "#fff", marginHorizontal: 16, borderRadius: 16, padding: 20,
    elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 12 },
  tableHeader: {
    flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#E0E0E0", paddingBottom: 8, marginBottom: 4,
  },
  tableHeaderText: { fontWeight: "bold", color: "#666", fontSize: 13 },
  tableRow: { flexDirection: "row", paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: "#F0F0F0" },
  tableCell: { flex: 1, textAlign: "center" },
  holeNumber: { fontWeight: "bold", color: "#1B5E20" },
  holePar: { color: "#333", fontWeight: "600" },
  holeDistance: { color: "#666" },
  playButton: {
    backgroundColor: "#1B5E20", margin: 16, borderRadius: 12, padding: 16,
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8,
  },
  playButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

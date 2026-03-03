import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getCourses, getCourse, createRound } from "../../src/services/api";
import { useAuthStore } from "../../src/store/useAuthStore";
import { useRoundStore } from "../../src/store/useRoundStore";
import { Course, CourseHole } from "../../src/types";
import { getScoreColor, getScoreLabel } from "../../src/utils/handicap";

interface HoleScoreEntry {
  hole: number;
  par: number;
  score: number;
  putts: number;
  fairway?: boolean;
  gir?: boolean;
}

export default function PlayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ courseId?: string }>();
  const user = useAuthStore((s) => s.user);
  const { fetchRounds, fetchStats } = useRoundStore();

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseHoles, setCourseHoles] = useState<CourseHole[]>([]);
  const [scores, setScores] = useState<HoleScoreEntry[]>([]);
  const [currentHole, setCurrentHole] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"select" | "play">("select");

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (params.courseId) {
      selectCourse(params.courseId);
    }
  }, [params.courseId]);

  const loadCourses = async () => {
    try {
      const data = await getCourses();
      setCourses(data);
    } catch {
      console.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const selectCourse = async (courseId: string) => {
    try {
      setLoading(true);
      const course = await getCourse(courseId);
      setSelectedCourse(course);
      setCourseHoles(course.courseHoles ?? []);
      const holes = (course.courseHoles ?? []).map((h) => ({
        hole: h.number,
        par: h.par,
        score: h.par,
        putts: 2,
        fairway: undefined,
        gir: undefined,
      }));
      setScores(holes);
      setStep("play");
    } catch {
      Alert.alert("Erreur", "Impossible de charger le parcours.");
    } finally {
      setLoading(false);
    }
  };

  const updateScore = (field: keyof HoleScoreEntry, value: number | boolean | undefined) => {
    const updated = [...scores];
    (updated[currentHole] as any)[field] = value;
    setScores(updated);
  };

  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  const totalPar = scores.reduce((sum, s) => sum + s.par, 0);

  const submitRound = async () => {
    if (!user || !selectedCourse) return;
    setSubmitting(true);
    try {
      await createRound({
        userId: user.id,
        courseId: selectedCourse.id,
        totalScore,
        totalPar,
        scores: scores.map((s) => ({
          hole: s.hole,
          score: s.score,
          putts: s.putts,
          fairway: s.fairway,
          gir: s.gir,
        })),
      });
      fetchRounds(user.id);
      fetchStats(user.id);
      Alert.alert(
        "Partie enregistrée !",
        `Score: ${totalScore} (${totalScore - totalPar >= 0 ? "+" : ""}${totalScore - totalPar})`,
        [{ text: "OK", onPress: () => router.replace("/(tabs)") }]
      );
    } catch {
      Alert.alert("Erreur", "Impossible d'enregistrer la partie.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#82FFB4" />
      </View>
    );
  }

  if (step === "select") {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.stepTitle}>Choisir un parcours</Text>
        {courses.map((course) => (
          <TouchableOpacity
            key={course.id}
            style={styles.courseItem}
            onPress={() => selectCourse(course.id)}
          >
            <View>
              <Text style={styles.courseItemName}>{course.name}</Text>
              <Text style={styles.courseItemCity}>{course.city}, {course.country}</Text>
            </View>
            <Text style={styles.courseItemPar}>Par {course.par}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  const hole = scores[currentHole];
  if (!hole) return null;

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.holeTabs}>
        {scores.map((s, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.holeTab, i === currentHole && styles.holeTabActive]}
            onPress={() => setCurrentHole(i)}
          >
            <Text style={[styles.holeTabText, i === currentHole && styles.holeTabTextActive]}>
              {s.hole}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.scoreEntry}>
        <View style={styles.holeInfo}>
          <Text style={styles.holeTitle}>Trou {hole.hole}</Text>
          <Text style={styles.holePar}>Par {hole.par}</Text>
          {courseHoles[currentHole] && (
            <Text style={styles.holeDistance}>{courseHoles[currentHole].distance}m</Text>
          )}
        </View>

        {/* Score */}
        <View style={styles.scoreSection}>
          <Text style={styles.scoreLabel}>Score</Text>
          <View style={styles.counter}>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() => hole.score > 1 && updateScore("score", hole.score - 1)}
            >
              <Ionicons name="remove" size={24} color="#1E232D" />
            </TouchableOpacity>
            <View style={[styles.scoreDisplay, { backgroundColor: getScoreColor(hole.score, hole.par) + "20" }]}>
              <Text style={[styles.scoreValue, { color: getScoreColor(hole.score, hole.par) }]}>
                {hole.score}
              </Text>
              <Text style={[styles.scoreTag, { color: getScoreColor(hole.score, hole.par) }]}>
                {getScoreLabel(hole.score, hole.par)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() => updateScore("score", hole.score + 1)}
            >
              <Ionicons name="add" size={24} color="#1E232D" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Putts */}
        <View style={styles.scoreSection}>
          <Text style={styles.scoreLabel}>Putts</Text>
          <View style={styles.counter}>
            <TouchableOpacity
              style={styles.counterBtnSmall}
              onPress={() => hole.putts > 0 && updateScore("putts", hole.putts - 1)}
            >
              <Ionicons name="remove" size={20} color="#1E232D" />
            </TouchableOpacity>
            <Text style={styles.puttsValue}>{hole.putts}</Text>
            <TouchableOpacity
              style={styles.counterBtnSmall}
              onPress={() => updateScore("putts", hole.putts + 1)}
            >
              <Ionicons name="add" size={20} color="#1E232D" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Fairway */}
        {hole.par >= 4 && (
          <View style={styles.toggleSection}>
            <Text style={styles.scoreLabel}>Fairway</Text>
            <View style={styles.toggleRow}>
              {[true, false].map((val) => (
                <TouchableOpacity
                  key={String(val)}
                  style={[
                    styles.toggleBtn,
                    hole.fairway === val && (val ? styles.toggleActive : styles.toggleInactive),
                  ]}
                  onPress={() => updateScore("fairway", hole.fairway === val ? undefined : val)}
                >
                  <Ionicons
                    name={val ? "checkmark-circle" : "close-circle"}
                    size={20}
                    color={hole.fairway === val ? (val ? "#1E232D" : "#fff") : "#666"}
                  />
                  <Text style={[styles.toggleText, hole.fairway === val && styles.toggleTextActive]}>
                    {val ? "Oui" : "Non"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* GIR */}
        <View style={styles.toggleSection}>
          <Text style={styles.scoreLabel}>Green in Regulation</Text>
          <View style={styles.toggleRow}>
            {[true, false].map((val) => (
              <TouchableOpacity
                key={String(val)}
                style={[
                  styles.toggleBtn,
                  hole.gir === val && (val ? styles.toggleActive : styles.toggleInactive),
                ]}
                onPress={() => updateScore("gir", hole.gir === val ? undefined : val)}
              >
                <Ionicons
                  name={val ? "checkmark-circle" : "close-circle"}
                  size={20}
                  color={hole.gir === val ? (val ? "#1E232D" : "#fff") : "#666"}
                />
                <Text style={[styles.toggleText, hole.gir === val && styles.toggleTextActive]}>
                  {val ? "Oui" : "Non"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.navBtn, currentHole === 0 && styles.navBtnDisabled]}
          onPress={() => currentHole > 0 && setCurrentHole(currentHole - 1)}
          disabled={currentHole === 0}
        >
          <Ionicons name="arrow-back" size={20} color={currentHole === 0 ? "#ccc" : "#1E232D"} />
          <Text style={[styles.navBtnText, currentHole === 0 && { color: "#ccc" }]}>Précédent</Text>
        </TouchableOpacity>

        <View style={styles.navScore}>
          <Text style={styles.navScoreText}>Total: {totalScore}</Text>
          <Text style={styles.navParText}>
            {totalScore - totalPar >= 0 ? "+" : ""}{totalScore - totalPar}
          </Text>
        </View>

        {currentHole < scores.length - 1 ? (
          <TouchableOpacity style={styles.navBtn} onPress={() => setCurrentHole(currentHole + 1)}>
            <Text style={styles.navBtnText}>Suivant</Text>
            <Ionicons name="arrow-forward" size={20} color="#1E232D" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.finishBtn} onPress={submitRound} disabled={submitting}>
            <Text style={styles.finishBtnText}>{submitting ? "..." : "Terminer"}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  stepTitle: { fontSize: 22, fontWeight: "bold", color: "#1E232D", margin: 16 },
  courseItem: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  courseItemName: { fontSize: 16, fontWeight: "bold", color: "#1E232D" },
  courseItemCity: { fontSize: 13, color: "#999", marginTop: 2 },
  courseItemPar: { fontSize: 16, fontWeight: "bold", color: "#82FFB4" },
  holeTabs: { backgroundColor: "#fff", paddingVertical: 8, paddingHorizontal: 8, maxHeight: 56 },
  holeTab: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: "center", alignItems: "center",
    marginHorizontal: 2, backgroundColor: "#F0F0F0",
  },
  holeTabActive: { backgroundColor: "#1E232D" },
  holeTabText: { fontSize: 14, fontWeight: "bold", color: "#666" },
  holeTabTextActive: { color: "#82FFB4" },
  scoreEntry: { flex: 1, padding: 16 },
  holeInfo: { flexDirection: "row", alignItems: "baseline", gap: 12, marginBottom: 24 },
  holeTitle: { fontSize: 28, fontWeight: "bold", color: "#1E232D" },
  holePar: { fontSize: 18, color: "#82FFB4", fontWeight: "600" },
  holeDistance: { fontSize: 16, color: "#999" },
  scoreSection: { marginBottom: 24 },
  scoreLabel: { fontSize: 16, fontWeight: "600", color: "#666", marginBottom: 12 },
  counter: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16 },
  counterBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: "#82FFB4", justifyContent: "center", alignItems: "center",
  },
  counterBtnSmall: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 2, borderColor: "#1E232D", justifyContent: "center", alignItems: "center",
  },
  scoreDisplay: { width: 100, height: 80, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  scoreValue: { fontSize: 36, fontWeight: "bold" },
  scoreTag: { fontSize: 12, fontWeight: "600" },
  puttsValue: { fontSize: 28, fontWeight: "bold", color: "#1E232D", minWidth: 50, textAlign: "center" },
  toggleSection: { marginBottom: 20 },
  toggleRow: { flexDirection: "row", gap: 12 },
  toggleBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, padding: 12, borderRadius: 10, backgroundColor: "#F0F0F0",
  },
  toggleActive: { backgroundColor: "#82FFB4" },
  toggleInactive: { backgroundColor: "#E74C3C" },
  toggleText: { fontWeight: "600", color: "#666" },
  toggleTextActive: { color: "#1E232D" },
  navRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 16, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#E0E0E0",
  },
  navBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { fontSize: 16, color: "#1E232D", fontWeight: "600" },
  navScore: { alignItems: "center" },
  navScoreText: { fontSize: 16, fontWeight: "bold", color: "#1E232D" },
  navParText: { fontSize: 14, color: "#E74C3C", fontWeight: "600" },
  finishBtn: { backgroundColor: "#82FFB4", borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  finishBtnText: { color: "#1E232D", fontSize: 16, fontWeight: "bold" },
});

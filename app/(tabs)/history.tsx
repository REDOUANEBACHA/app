import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../src/store/useAuthStore";
import { useRoundStore } from "../../src/store/useRoundStore";
import { scoreToPar } from "../../src/utils/handicap";

export default function HistoryScreen() {
  const user = useAuthStore((s) => s.user);
  const { rounds, loading, fetchRounds } = useRoundStore();

  useEffect(() => {
    if (user) fetchRounds(user.id);
  }, [user]);

  const onRefresh = () => {
    if (user) fetchRounds(user.id);
  };

  if (rounds.length === 0 && !loading) {
    return (
      <View style={styles.empty}>
        <Ionicons name="time-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Aucune partie enregistrée</Text>
        <Text style={styles.emptySubtext}>Jouez une partie pour voir votre historique</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={rounds}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
      renderItem={({ item }) => {
        const diff = item.totalScore - item.totalPar;
        return (
          <TouchableOpacity style={styles.roundCard}>
            <View style={styles.dateColumn}>
              <Text style={styles.dateDay}>{new Date(item.date).getDate()}</Text>
              <Text style={styles.dateMonth}>
                {new Date(item.date).toLocaleDateString("fr-FR", { month: "short" })}
              </Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.courseName}>{item.course?.name ?? "Parcours"}</Text>
              <Text style={styles.courseCity}>{item.course?.city}, {item.course?.country}</Text>
            </View>
            <View style={styles.scoreColumn}>
              <Text style={styles.score}>{item.totalScore}</Text>
              <View style={[styles.parBadge, { backgroundColor: diff <= 0 ? "#E8F5E9" : "#FFEBEE" }]}>
                <Text style={[styles.parText, { color: diff <= 0 ? "#2E7D32" : "#C62828" }]}>
                  {scoreToPar(item.totalScore, item.totalPar)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 18, color: "#999", marginTop: 16 },
  emptySubtext: { fontSize: 14, color: "#ccc", marginTop: 4 },
  roundCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  dateColumn: { width: 50, alignItems: "center", justifyContent: "center", marginRight: 12 },
  dateDay: { fontSize: 24, fontWeight: "bold", color: "#1B5E20" },
  dateMonth: { fontSize: 12, color: "#999", textTransform: "uppercase" },
  infoColumn: { flex: 1, justifyContent: "center" },
  courseName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  courseCity: { fontSize: 13, color: "#999", marginTop: 2 },
  scoreColumn: { alignItems: "center", justifyContent: "center" },
  score: { fontSize: 28, fontWeight: "bold", color: "#333" },
  parBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  parText: { fontSize: 14, fontWeight: "bold" },
});

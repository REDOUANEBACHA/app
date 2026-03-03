import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../src/store/useAuthStore";
import { useRoundStore } from "../../src/store/useRoundStore";
import { scoreToPar, formatDate } from "../../src/utils/handicap";

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const { rounds, stats, loading, fetchRounds, fetchStats } = useRoundStore();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchRounds(user.id);
      fetchStats(user.id);
    }
  }, [user]);

  const onRefresh = () => {
    if (user) {
      fetchRounds(user.id);
      fetchStats(user.id);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
    >
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>Bonjour, {user?.name} !</Text>
        <View style={styles.handicapBadge}>
          <Text style={styles.handicapLabel}>Handicap</Text>
          <Text style={styles.handicapValue}>{user?.handicap?.toFixed(1) ?? "—"}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <StatCard icon="golf-outline" label="Parties" value={stats?.totalRounds?.toString() ?? "0"} />
        <StatCard icon="trending-down-outline" label="Meilleur" value={stats?.bestScore?.toString() ?? "—"} />
        <StatCard icon="analytics-outline" label="Moyenne" value={stats?.averageScore?.toString() ?? "—"} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dernières parties</Text>
        {rounds.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="golf-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Aucune partie enregistrée</Text>
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => router.push("/(tabs)/play")}
            >
              <Text style={styles.playButtonText}>Jouer une partie</Text>
            </TouchableOpacity>
          </View>
        ) : (
          rounds.slice(0, 5).map((round) => (
            <TouchableOpacity key={round.id} style={styles.roundItem}>
              <View style={styles.roundLeft}>
                <Text style={styles.roundCourse}>{round.course?.name ?? "Parcours"}</Text>
                <Text style={styles.roundDate}>{formatDate(round.date)}</Text>
              </View>
              <View style={styles.roundRight}>
                <Text style={styles.roundScore}>{round.totalScore}</Text>
                <Text
                  style={[
                    styles.roundPar,
                    { color: round.totalScore <= round.totalPar ? "#2ECC71" : "#E74C3C" },
                  ]}
                >
                  {scoreToPar(round.totalScore, round.totalPar)}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function StatCard({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={24} color="#1B5E20" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  welcomeCard: {
    backgroundColor: "#1B5E20",
    margin: 16,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  handicapBadge: { alignItems: "center" },
  handicapLabel: { fontSize: 12, color: "#A5D6A7" },
  handicapValue: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  statsRow: { flexDirection: "row", marginHorizontal: 16, gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statValue: { fontSize: 24, fontWeight: "bold", color: "#333", marginTop: 4 },
  statLabel: { fontSize: 12, color: "#999", marginTop: 2 },
  section: { margin: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 12 },
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: 16, color: "#999", marginTop: 12 },
  playButton: {
    backgroundColor: "#1B5E20",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 16,
  },
  playButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  roundItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  roundLeft: { flex: 1 },
  roundCourse: { fontSize: 16, fontWeight: "600", color: "#333" },
  roundDate: { fontSize: 13, color: "#999", marginTop: 2 },
  roundRight: { alignItems: "flex-end" },
  roundScore: { fontSize: 24, fontWeight: "bold", color: "#333" },
  roundPar: { fontSize: 14, fontWeight: "600" },
});

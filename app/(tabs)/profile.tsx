import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { useAuthStore } from "../../src/store/useAuthStore";
import { useRoundStore } from "../../src/store/useRoundStore";

const screenWidth = Dimensions.get("window").width;

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { stats, fetchStats } = useRoundStore();

  useEffect(() => {
    if (user) fetchStats(user.id);
  }, [user]);

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Déconnexion", style: "destructive", onPress: logout },
    ]);
  };

  const chartConfig = {
    backgroundColor: "#fff",
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalCount: 0,
    color: (opacity = 1) => `rgba(27, 94, 32, ${opacity})`,
    labelColor: () => "#999",
    propsForDots: { r: "4", strokeWidth: "2", stroke: "#1B5E20" },
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={48} color="#fff" />
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.handicapCard}>
        <Text style={styles.handicapLabel}>Votre Handicap</Text>
        <Text style={styles.handicapValue}>{user?.handicap?.toFixed(1) ?? "54.0"}</Text>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.sectionTitle}>Résumé</Text>
        <InfoRow label="Parties jouées" value={stats?.totalRounds?.toString() ?? "0"} />
        <InfoRow label="Meilleur score" value={stats?.bestScore?.toString() ?? "—"} />
        <InfoRow label="Score moyen" value={stats?.averageScore?.toString() ?? "—"} />
        <InfoRow label="% Fairways" value={stats ? `${stats.fairwayPercentage}%` : "—"} />
        <InfoRow label="% GIR" value={stats ? `${stats.girPercentage}%` : "—"} />
        <InfoRow label="Putts/trou" value={stats?.averagePutts?.toFixed(1) ?? "—"} />
      </View>

      {/* Score progression chart */}
      {stats && stats.recentScores.length > 1 && (
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Evolution des scores</Text>
          <LineChart
            data={{
              labels: stats.recentScores.map((_, i) => `${i + 1}`),
              datasets: [{ data: stats.recentScores }],
            }}
            width={screenWidth - 64}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={{ borderRadius: 12 }}
          />
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#E74C3C" />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: { backgroundColor: "#1B5E20", alignItems: "center", paddingVertical: 30, paddingTop: 20 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center",
  },
  name: { fontSize: 24, fontWeight: "bold", color: "#fff", marginTop: 12 },
  email: { fontSize: 14, color: "#A5D6A7", marginTop: 4 },
  handicapCard: {
    backgroundColor: "#fff", margin: 16, borderRadius: 16, padding: 24, alignItems: "center",
    elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3,
  },
  handicapLabel: { fontSize: 14, color: "#999" },
  handicapValue: { fontSize: 48, fontWeight: "bold", color: "#1B5E20", marginTop: 4 },
  statsCard: {
    backgroundColor: "#fff", marginHorizontal: 16, borderRadius: 16, padding: 20,
    elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 12 },
  infoRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: "#F0F0F0",
  },
  infoLabel: { fontSize: 15, color: "#666" },
  infoValue: { fontSize: 15, fontWeight: "bold", color: "#333" },
  chartCard: {
    backgroundColor: "#fff", margin: 16, borderRadius: 16, padding: 16,
    elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2,
  },
  logoutButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    margin: 16, padding: 16, backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#FFCDD2",
  },
  logoutText: { fontSize: 16, fontWeight: "600", color: "#E74C3C" },
});

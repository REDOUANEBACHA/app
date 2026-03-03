import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const THEME_GREEN = "#1B5E20";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";
          if (route.name === "index") iconName = focused ? "home" : "home-outline";
          else if (route.name === "map") iconName = focused ? "map" : "map-outline";
          else if (route.name === "play") iconName = focused ? "golf" : "golf-outline";
          else if (route.name === "history") iconName = focused ? "time" : "time-outline";
          else if (route.name === "profile") iconName = focused ? "person" : "person-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: THEME_GREEN,
        tabBarInactiveTintColor: "#999",
        headerStyle: { backgroundColor: THEME_GREEN },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Accueil" }} />
      <Tabs.Screen name="map" options={{ title: "Parcours" }} />
      <Tabs.Screen name="play" options={{ title: "Jouer" }} />
      <Tabs.Screen name="history" options={{ title: "Historique" }} />
      <Tabs.Screen name="profile" options={{ title: "Profil" }} />
    </Tabs>
  );
}

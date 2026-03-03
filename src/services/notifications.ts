import { Platform } from "react-native";
import { updateUser } from "./api";

let Notifications: typeof import("expo-notifications") | null = null;
let Device: typeof import("expo-device") | null = null;
let Constants: typeof import("expo-constants").default | null = null;

// Lazy load native modules to avoid crash in Expo Go
try {
  Notifications = require("expo-notifications");
  Device = require("expo-device");
  Constants = require("expo-constants").default;
} catch {
  console.log("expo-notifications not available (Expo Go?)");
}

// Configure how notifications appear when the app is in foreground
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

async function registerForPushNotifications(): Promise<string | null> {
  if (!Notifications || !Device || !Constants) return null;
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "GolfTracker",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
  return tokenData.data;
}

async function schedulePracticeReminder() {
  if (!Notifications) return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Envie d'un parcours ? ⛳",
      body: "Tu n'as pas joué depuis un moment. C'est le moment de reprendre !",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 7 * 24 * 60 * 60,
      repeats: true,
    },
  });
}

export function setupNotifications(userId: string, router: any): () => void {
  if (!Notifications) return () => {};

  const NotifModule = Notifications;

  registerForPushNotifications().then((token) => {
    if (token) {
      updateUser(userId, { pushToken: token } as any).catch(() => {});
    }
  });

  schedulePracticeReminder();

  const notifSub = NotifModule.addNotificationReceivedListener((notification) => {
    console.log("Notification received:", notification);
  });

  const responseSub = NotifModule.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    if (data?.screen) {
      router.push(data.screen as string);
    }
  });

  return () => {
    notifSub.remove();
    responseSub.remove();
  };
}

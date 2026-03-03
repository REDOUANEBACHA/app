import { Redirect, useLocalSearchParams } from "expo-router";

export default function NewRoundRedirect() {
  const { courseId } = useLocalSearchParams<{ courseId?: string }>();
  // Redirect to the play tab with courseId param
  return <Redirect href={`/(tabs)/play?courseId=${courseId ?? ""}`} />;
}

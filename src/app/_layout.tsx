import { Stack, Tabs } from "expo-router";
import { FirebaseProvider } from "./contexts/FirebaseContext";


export default function RootLayout() {
  return (
    <FirebaseProvider>
      <Stack>
        <Stack.Screen name="(screens)" options={{ headerShown: false, statusBarStyle: 'dark' }} />
      </Stack>
    </FirebaseProvider>
    
  );
}

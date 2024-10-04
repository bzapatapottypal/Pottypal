import { Pressable, Text, View } from "react-native";
import { Link, router } from 'expo-router';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Link href="./screens/login-form">Sign In/Sign Up</Link>
      <Link href="./screens/main-map">Main Map/Results</Link>
    </View>
  );
}
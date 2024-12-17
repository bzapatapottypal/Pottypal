import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, Tabs } from "expo-router";


export default function RootLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="main-map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="map-marker" color={color} />,
          headerShown: false
        }}
      />
    </Tabs>
  );
}

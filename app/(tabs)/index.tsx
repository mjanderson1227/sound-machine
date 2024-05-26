import { Image, StyleSheet, Platform, View, Text } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";

import { HelloWave } from "@/components/HelloWave";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth, SignedIn, SignedOut } from "@clerk/clerk-expo";
import SignUpScreen from "@/components/SignUpScreen";
import { useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import { Redirect } from "expo-router";

export default function HomeScreen() {
  const { userId, isSignedIn } = useAuth();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <SignedIn></SignedIn>
      <SignedOut>
        <Redirect href="/signup" />
      </SignedOut>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});

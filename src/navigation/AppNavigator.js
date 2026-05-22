import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import CategoryListScreen from "../screens/CategoryListScreen";
import DeviceListScreen from "../screens/DeviceListScreen";
import LoginScreen from "../screens/LoginScreen";
import MainMenuScreen from "../screens/MainMenuScreen";
import UserListScreen from "../screens/UserListScreen";
import { colors, headerOptions, spacing, typography } from "../theme";

const Stack = createNativeStackNavigator();

function LoadingScreen() {
  return (
    <View style={loadingStyles.wrap}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={loadingStyles.text}>加载中…</Text>
    </View>
  );
}

export default function AppNavigator() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={headerOptions}>
        {!isLoggedIn ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="MainMenu"
              component={MainMenuScreen}
              options={{ title: "办公管理" }}
            />
            <Stack.Screen
              name="UserList"
              component={UserListScreen}
              options={{ title: "员工管理" }}
            />
            <Stack.Screen
              name="CategoryList"
              component={CategoryListScreen}
              options={{ title: "设备分类" }}
            />
            <Stack.Screen
              name="DeviceList"
              component={DeviceListScreen}
              options={{ title: "设备管理" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const loadingStyles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  text: {
    ...typography.caption,
  },
});

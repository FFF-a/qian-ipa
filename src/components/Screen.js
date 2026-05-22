import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "../theme";

/** 页面容器：统一背景与安全区内边距 */
export default function Screen({
  children,
  scroll = false,
  padded = true,
  center = false,
  style,
  contentStyle,
}) {
  const insets = useSafeAreaInsets();
  const padding = padded
    ? {
        paddingTop: spacing.lg,
        paddingHorizontal: spacing.lg,
        paddingBottom: Math.max(insets.bottom, spacing.lg),
      }
    : {};

  const inner = (
    <View
      style={[
        styles.inner,
        padding,
        center && styles.center,
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  if (scroll) {
    return (
      <View style={[styles.root, style]}>
        <ScrollView
          contentContainerStyle={[center && styles.center, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[padding, { flexGrow: 1 }]}>{children}</View>
        </ScrollView>
      </View>
    );
  }

  return <View style={[styles.root, style]}>{inner}</View>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
  },
  center: {
    justifyContent: "center",
  },
});

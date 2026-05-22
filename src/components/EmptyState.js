import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../theme";

export default function EmptyState({ title = "暂无数据", hint }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>—</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingVertical: spacing.xxxl * 2,
    paddingHorizontal: spacing.xl,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  iconText: {
    fontSize: 24,
    color: colors.textMuted,
    fontWeight: "300",
  },
  title: {
    ...typography.subtitle,
    color: colors.textSecondary,
  },
  hint: {
    ...typography.caption,
    marginTop: spacing.sm,
    textAlign: "center",
  },
});

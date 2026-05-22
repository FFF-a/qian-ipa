import React from "react";
import { StyleSheet, Text, View } from "react-native";
import AppButton, { ActionRow } from "./AppButton";
import { colors, radius, shadow, spacing, typography } from "../theme";

export default function ListCard({
  title,
  subtitle,
  lines = [],
  badge,
  badgeTone = "default",
  onEdit,
  onDelete,
}) {
  const badgeStyle =
    badgeTone === "success"
      ? styles.badgeSuccess
      : badgeTone === "warning"
        ? styles.badgeWarning
        : styles.badgeDefault;

  return (
    <View style={[styles.card, shadow.card]}>
      <View style={styles.top}>
        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {badge ? (
          <View style={[styles.badge, badgeStyle]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      {lines.map((line, i) => (
        <Text key={i} style={styles.line}>
          {line}
        </Text>
      ))}
      <ActionRow>
        <AppButton title="编辑" variant="secondary" size="sm" fullWidth onPress={onEdit} />
        <AppButton title="删除" variant="danger" size="sm" fullWidth onPress={onDelete} />
      </ActionRow>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  top: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    ...typography.subtitle,
    fontSize: 17,
  },
  subtitle: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  line: {
    ...typography.caption,
    marginTop: spacing.xs,
    color: colors.textSecondary,
  },
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  badgeDefault: {
    backgroundColor: "#E0E7FF",
  },
  badgeSuccess: {
    backgroundColor: colors.successBg,
  },
  badgeWarning: {
    backgroundColor: colors.warningBg,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },
});

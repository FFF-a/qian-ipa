import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, radius, spacing, typography } from "../theme";

const variants = {
  primary: {
    bg: colors.primary,
    text: "#FFFFFF",
    border: colors.primary,
  },
  secondary: {
    bg: colors.surface,
    text: colors.primary,
    border: colors.border,
  },
  danger: {
    bg: colors.dangerBg,
    text: colors.danger,
    border: "#FECACA",
  },
  ghost: {
    bg: "transparent",
    text: colors.textSecondary,
    border: "transparent",
  },
};

export default function AppButton({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  fullWidth = true,
  size = "md",
  style,
}) {
  const v = variants[variant] || variants.primary;
  const isSmall = size === "sm";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.full,
        isSmall && styles.small,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          opacity: pressed ? 0.88 : disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <Text
          style={[
            styles.label,
            isSmall && styles.labelSmall,
            { color: v.text },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

/** 列表行内的小按钮组 */
export function ActionRow({ children }) {
  return (
    <View style={styles.actionRow}>
      {React.Children.map(children, (child, index) =>
        child ? (
          <View
            key={index}
            style={[styles.actionFlex, index > 0 && styles.actionGap]}
          >
            {child}
          </View>
        ) : null
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  full: {
    width: "100%",
  },
  small: {
    minHeight: 36,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
  label: {
    ...typography.subtitle,
    fontSize: 16,
  },
  labelSmall: {
    fontSize: 14,
  },
  actionRow: {
    flexDirection: "row",
    marginTop: spacing.md,
  },
  actionFlex: {
    flex: 1,
  },
  actionGap: {
    marginLeft: spacing.sm,
  },
});

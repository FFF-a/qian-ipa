import React from "react";
import { StyleSheet, Text, View } from "react-native";
import AppButton from "../components/AppButton";
import MenuTile from "../components/MenuTile";
import Screen from "../components/Screen";
import { useAuth } from "../context/AuthContext";
import { colors, spacing, typography } from "../theme";

const MODULES = [
  {
    title: "员工管理",
    description: "维护员工档案、年龄与邮箱信息",
    accent: "#3B82F6",
    route: "UserList",
  },
  {
    title: "设备分类",
    description: "配置电脑、网络、外设等分类",
    accent: "#0EA5E9",
    route: "CategoryList",
  },
  {
    title: "设备管理",
    description: "登记设备型号、状态与所属分类",
    accent: "#6366F1",
    route: "DeviceList",
  },
];

export default function MainMenuScreen({ navigation }) {
  const { logout } = useAuth();

  return (
    <Screen scroll>
      <Text style={styles.greeting}>工作台</Text>
      <Text style={styles.hint}>选择模块开始管理办公资源</Text>

      <View style={styles.tiles}>
        {MODULES.map((m) => (
          <MenuTile
            key={m.route}
            title={m.title}
            description={m.description}
            accent={m.accent}
            onPress={() => navigation.navigate(m.route)}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <AppButton title="退出登录" variant="ghost" onPress={logout} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  greeting: {
    ...typography.hero,
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  hint: {
    ...typography.caption,
    marginBottom: spacing.xl,
  },
  tiles: {
    marginTop: spacing.sm,
  },
  footer: {
    marginTop: spacing.xxxl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fetchCategories } from "../api/categories";
import {
  createDevice,
  deleteDevice,
  fetchDevices,
  updateDevice,
} from "../api/devices";
import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import EmptyState from "../components/EmptyState";
import FormModal from "../components/FormModal";
import ListCard from "../components/ListCard";
import { useProtectedRefresh } from "../hooks/useProtectedRefresh";
import { showMessage } from "../utils/alert";
import { validateDeviceForm } from "../utils/validation";
import { colors, radius, spacing, typography } from "../theme";

const emptyForm = {
  name: "",
  model: "",
  serial_number: "",
  status: "available",
  category_id: null,
};

const STATUS_LABEL = {
  available: "可用",
  in_use: "使用中",
  maintenance: "维护中",
  retired: "已报废",
};

function statusTone(status) {
  if (status === "available") return "success";
  if (status === "maintenance") return "warning";
  return "default";
}

export default function DeviceListScreen() {
  const [list, setList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    const [deviceData, categoryData] = await Promise.all([
      fetchDevices(1, 50),
      fetchCategories(),
    ]);
    setList(deviceData.items || []);
    setCategories(Array.isArray(categoryData) ? categoryData : []);
    return deviceData;
  }, []);

  const { refreshing, onRefresh } = useProtectedRefresh(loadData);

  const openCreate = () => {
    if (categories.length === 0) {
      Alert.alert("提示", "请先在「设备分类」中创建至少一个分类");
      return;
    }
    setEditingId(null);
    setForm({
      ...emptyForm,
      category_id: categories[0]?.id ?? null,
    });
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      model: item.model || "",
      serial_number: item.serial_number || "",
      status: item.status || "available",
      category_id: item.category_id,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    const errors = validateDeviceForm(form);
    if (Object.keys(errors).length > 0) {
      showMessage("请检查表单", Object.values(errors).join("\n"));
      return;
    }
    const payload = {
      name: form.name.trim(),
      model: form.model.trim() || null,
      serial_number: form.serial_number.trim() || null,
      status: form.status.trim() || "available",
      category_id: form.category_id,
    };
    setSaving(true);
    try {
      if (editingId) {
        await updateDevice(editingId, payload);
      } else {
        await createDevice(payload);
      }
      setModalVisible(false);
      await loadData();
    } catch (err) {
      showMessage("保存失败", err.message || "请稍后重试");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item) => {
    Alert.alert("确认删除", `删除设备「${item.name}」？`, [
      { text: "取消", style: "cancel" },
      {
        text: "删除",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDevice(item.id);
            await loadData();
          } catch (err) {
            Alert.alert("删除失败", err.message);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <ListCard
      title={item.name}
      subtitle={item.category?.name || `分类 #${item.category_id}`}
      lines={[
        `型号：${item.model || "—"}`,
        `序列号：${item.serial_number || "—"}`,
      ]}
      badge={STATUS_LABEL[item.status] || item.status}
      badgeTone={statusTone(item.status)}
      onEdit={() => openEdit(item)}
      onDelete={() => handleDelete(item)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.count}>共 {list.length} 台设备</Text>
        <View style={styles.addWrap}>
          <AppButton title="+ 新增设备" onPress={openCreate} size="sm" fullWidth={false} />
        </View>
      </View>
      <FlatList
        data={list}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          !refreshing ? (
            <EmptyState title="暂无设备" hint="请先确保已有设备分类" />
          ) : null
        }
      />

      <FormModal
        visible={modalVisible}
        title={editingId ? "编辑设备" : "新增设备"}
        onClose={() => setModalVisible(false)}
      >
        <AppInput
          label="设备名称"
          value={form.name}
          onChangeText={(v) => setForm({ ...form, name: v })}
          placeholder="请输入设备名称"
        />
        <AppInput
          label="型号"
          hint="可选"
          value={form.model}
          onChangeText={(v) => setForm({ ...form, model: v })}
          placeholder="如 MacBook Pro 14"
        />
        <AppInput
          label="序列号"
          hint="可选"
          value={form.serial_number}
          onChangeText={(v) => setForm({ ...form, serial_number: v })}
          placeholder="设备唯一编号"
        />
        <AppInput
          label="状态"
          hint="available / in_use / maintenance / retired"
          value={form.status}
          onChangeText={(v) => setForm({ ...form, status: v })}
          placeholder="available"
        />

        <Text style={styles.chipLabel}>所属分类</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.catRow}
          contentContainerStyle={styles.catRowContent}
        >
          {categories.map((c) => {
            const active = form.category_id === c.id;
            return (
              <Pressable
                key={c.id}
                style={[styles.catChip, active && styles.catChipActive]}
                onPress={() => setForm({ ...form, category_id: c.id })}
              >
                <Text style={[styles.catChipText, active && styles.catChipTextActive]}>
                  {c.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        {categories.length === 0 && (
          <Text style={styles.warn}>请先在「设备分类」中创建分类</Text>
        )}

        <AppButton title="保存" onPress={handleSave} loading={saving} />
      </FormModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  count: { ...typography.caption, fontWeight: "600" },
  addWrap: { minWidth: 120 },
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
  chipLabel: typography.label,
  catRow: { marginBottom: spacing.lg, maxHeight: 48 },
  catRowContent: { paddingRight: spacing.lg },
  catChip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
    marginRight: spacing.sm,
  },
  catChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  catChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  catChipTextActive: {
    color: "#FFFFFF",
  },
  warn: {
    fontSize: 13,
    color: colors.danger,
    marginBottom: spacing.lg,
  },
});

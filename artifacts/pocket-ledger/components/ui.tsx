import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { formatMoney } from '@/components/LedgerProvider';

export function Screen({
  children,
  scroll = true,
}: {
  children: ReactNode;
  scroll?: boolean;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const content = (
    <View
      style={[
        styles.screenInner,
        {
          paddingTop: insets.top + 18,
          paddingBottom: Math.max(insets.bottom, 18) + 78,
        },
      ]}
    >
      {children}
    </View>
  );

  return scroll ? (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {content}
      </ScrollView>
    </View>
  ) : (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {content}
    </View>
  );
}

export function BrandMark({ compact = false }: { compact?: boolean }) {
  const colors = useColors();
  return (
    <View style={styles.brandRow}>
      <LinearGradient
        colors={[colors.primary, '#f39b74']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.brandMark, compact && styles.brandMarkCompact]}
      >
        <Feather name="book-open" size={compact ? 15 : 18} color="#ffffff" />
      </LinearGradient>
      {!compact && <Text style={[styles.brandName, { color: colors.foreground }]}>Pocket Ledger</Text>}
    </View>
  );
}

export function TopBar({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={styles.topBar}>
      <View style={styles.topBarText}>
        <Text style={[styles.screenTitle, { color: colors.foreground }]}>{title}</Text>
        {subtitle && <Text style={[styles.screenSubtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>}
      </View>
      {action}
    </View>
  );
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: object;
}) {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
}

export function Money({
  amount,
  large = false,
  color,
}: {
  amount: number;
  large?: boolean;
  color?: string;
}) {
  const colors = useColors();
  return (
    <Text style={[large ? styles.moneyLarge : styles.money, { color: color ?? colors.foreground }]}>
      {formatMoney(amount)}
    </Text>
  );
}

export function PrimaryButton({
  label,
  onPress,
  icon,
  disabled = false,
  loading = false,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Feather.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
}) {
  const colors = useColors();
  const backgroundColor = variant === 'primary' ? colors.primary : colors.secondary;
  const textColor = variant === 'primary' ? colors.primaryForeground : colors.secondaryForeground;
  return (
    <Pressable
      testID={`button-${label.toLowerCase().replace(/\s+/g, '-')}`}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        { backgroundColor },
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? <ActivityIndicator color={textColor} /> : icon && <Feather name={icon} size={17} color={textColor} />}
      {!loading && <Text style={[styles.primaryButtonText, { color: textColor }]}>{label}</Text>}
    </Pressable>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
  tone = 'plain',
}: {
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  label: string;
  tone?: 'plain' | 'tinted';
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityLabel={label}
      testID={`icon-${label.toLowerCase().replace(/\s+/g, '-')}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        tone === 'tinted' && { backgroundColor: colors.secondary },
        pressed && styles.pressed,
      ]}
    >
      <Feather name={icon} size={20} color={colors.foreground} />
    </Pressable>
  );
}

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
        <Feather name={icon} size={22} color={colors.inkSoft} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.emptyMessage, { color: colors.mutedForeground }]}>{message}</Text>
      {action}
    </View>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  const colors = useColors();
  return <Text style={[styles.sectionLabel, { color: colors.inkSoft }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  screenInner: { paddingHorizontal: 20 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  brandMarkCompact: { width: 30, height: 30, borderRadius: 10 },
  brandName: { fontSize: 15, fontFamily: 'Inter_700Bold', letterSpacing: -0.2 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  topBarText: { flex: 1, gap: 3 },
  screenTitle: { fontSize: 28, fontFamily: 'Inter_700Bold', letterSpacing: -0.8 },
  screenSubtitle: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  card: { borderRadius: 20, borderWidth: 1, padding: 18 },
  money: { fontSize: 16, fontFamily: 'Inter_700Bold', letterSpacing: -0.2 },
  moneyLarge: { fontSize: 34, fontFamily: 'Inter_700Bold', letterSpacing: -1.4 },
  primaryButton: { minHeight: 50, borderRadius: 16, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  primaryButtonText: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  iconButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  emptyState: { borderRadius: 20, borderWidth: 1, alignItems: 'center', padding: 26, gap: 8 },
  emptyIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  emptyMessage: { fontSize: 14, lineHeight: 21, fontFamily: 'Inter_400Regular', textAlign: 'center', maxWidth: 290 },
  sectionLabel: { fontSize: 12, fontFamily: 'Inter_700Bold', letterSpacing: 1.1, textTransform: 'uppercase' },
});
import { Feather } from '@expo/vector-icons';
import { useClerk, useUser } from '@clerk/expo';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';
import { formatDate, useLedger } from '@/components/LedgerProvider';
import { Card, EmptyState, IconButton, Money, Screen, SectionLabel } from '@/components/ui';

export default function OverviewScreen() {
  const colors = useColors();
  const { user } = useUser();
  const { signOut } = useClerk();
  const {
    ready,
    receipts,
    people,
    totalOwedToMe,
    totalIOwe,
    outstandingPeople,
  } = useLedger();
  const firstName = user?.firstName || 'there';

  if (!ready) {
    return <Screen><Text style={{ color: colors.mutedForeground }}>Loading your ledger…</Text></Screen>;
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>SATURDAY, 15 AUGUST</Text>
          <Text style={[styles.greeting, { color: colors.foreground }]}>Good morning, {firstName}</Text>
        </View>
        <Pressable
          testID="button-account"
          onPress={() => void signOut()}
          style={({ pressed }) => [styles.accountButton, { backgroundColor: colors.secondary }, pressed && styles.pressed]}
        >
          <Text style={[styles.accountInitial, { color: colors.secondaryForeground }]}>
            {(user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0] || 'P').toUpperCase()}
          </Text>
        </Pressable>
      </View>

      <LinearGradient
        colors={[colors.foreground, '#2a5951']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroTop}>
          <View style={styles.heroIcon}><Feather name="trending-up" size={18} color="#ffffff" /></View>
          <Text style={styles.heroLabel}>TOTAL OWED TO YOU</Text>
        </View>
        <Money amount={totalOwedToMe} large color="#ffffff" />
        <View style={styles.heroFooter}>
          <Text style={styles.heroHint}>{outstandingPeople} {outstandingPeople === 1 ? 'person' : 'people'} to follow up</Text>
          <View style={styles.heroChip}><Text style={styles.heroChipText}>Live total</Text></View>
        </View>
      </LinearGradient>

      <View style={styles.miniRow}>
        <Card style={styles.miniCard}>
          <View style={[styles.miniIcon, { backgroundColor: colors.lavender }]}><Feather name="arrow-down-left" size={17} color={colors.inkSoft} /></View>
          <Text style={[styles.miniLabel, { color: colors.mutedForeground }]}>I owe</Text>
          <Money amount={totalIOwe} />
        </Card>
        <Card style={styles.miniCard}>
          <View style={[styles.miniIcon, { backgroundColor: '#fff0dc' }]}><Feather name="users" size={17} color={colors.accentForeground} /></View>
          <Text style={[styles.miniLabel, { color: colors.mutedForeground }]}>People</Text>
          <Text style={[styles.miniValue, { color: colors.foreground }]}>{people.length}</Text>
        </Card>
      </View>

      <View style={styles.actionsHeader}>
        <SectionLabel>Quick add</SectionLabel>
        <Text style={[styles.actionHint, { color: colors.mutedForeground }]}>Takes less than a minute</Text>
      </View>
      <View style={styles.actionRow}>
        <Pressable
          testID="button-scan-receipt"
          onPress={() => router.push('/add-receipt')}
          style={({ pressed }) => [styles.actionButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}
        >
          <Feather name="camera" size={20} color={colors.primaryForeground} />
          <Text style={[styles.actionText, { color: colors.primaryForeground }]}>Scan receipt</Text>
        </Pressable>
        <Pressable
          testID="button-add-debt"
          onPress={() => router.push('/add-debt')}
          style={({ pressed }) => [styles.actionButton, { backgroundColor: colors.secondary }, pressed && styles.pressed]}
        >
          <Feather name="corner-up-right" size={20} color={colors.secondaryForeground} />
          <Text style={[styles.actionText, { color: colors.secondaryForeground }]}>Add a debt</Text>
        </Pressable>
      </View>

      <View style={styles.sectionHeader}>
        <SectionLabel>Recent receipts</SectionLabel>
        {receipts.length > 0 && <Text style={[styles.countText, { color: colors.mutedForeground }]}>{receipts.length} saved</Text>}
      </View>
      {receipts.length === 0 ? (
        <EmptyState
          icon="file-text"
          title="Your ledger starts here"
          message="Scan a food, grocery, or any other receipt to start splitting expenses."
          action={<Pressable onPress={() => router.push('/add-receipt')}><Text style={[styles.emptyLink, { color: colors.primary }]}>Capture your first receipt</Text></Pressable>}
        />
      ) : (
        <View style={styles.receiptList}>
          {receipts.slice(0, 4).map((receipt) => (
            <Pressable key={receipt.id} onPress={() => router.push(`/receipt/${receipt.id}`)} testID={`receipt-${receipt.id}`}>
              <Card style={styles.receiptCard}>
                <View style={[styles.receiptIcon, { backgroundColor: colors.secondary }]}><Feather name="shopping-bag" size={18} color={colors.inkSoft} /></View>
                <View style={styles.receiptInfo}>
                  <Text style={[styles.receiptMerchant, { color: colors.foreground }]}>{receipt.merchant}</Text>
                  <Text style={[styles.receiptDate, { color: colors.mutedForeground }]}>{formatDate(receipt.date)} · {receipt.items.length} {receipt.items.length === 1 ? 'item' : 'items'}</Text>
                </View>
                <Money amount={receipt.total} />
              </Card>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  eyebrow: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 1.2, marginBottom: 6 },
  greeting: { fontSize: 22, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  accountButton: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  accountInitial: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  hero: { borderRadius: 24, padding: 22, minHeight: 170, justifyContent: 'space-between', marginBottom: 14 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  heroIcon: { width: 30, height: 30, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.17)', alignItems: 'center', justifyContent: 'center' },
  heroLabel: { color: 'rgba(255,255,255,0.72)', fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  heroFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroHint: { color: 'rgba(255,255,255,0.72)', fontSize: 13, fontFamily: 'Inter_400Regular' },
  heroChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.13)' },
  heroChipText: { color: '#ffffff', fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  miniRow: { flexDirection: 'row', gap: 12, marginBottom: 25 },
  miniCard: { flex: 1, padding: 14, gap: 7 },
  miniIcon: { width: 31, height: 31, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  miniLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  miniValue: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  actionsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  actionHint: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  actionButton: { flex: 1, minHeight: 58, borderRadius: 17, paddingHorizontal: 12, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  actionText: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 },
  countText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  receiptList: { gap: 9 },
  receiptCard: { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  receiptIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  receiptInfo: { flex: 1, gap: 4 },
  receiptMerchant: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  receiptDate: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  emptyLink: { fontSize: 14, fontFamily: 'Inter_700Bold', marginTop: 7 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
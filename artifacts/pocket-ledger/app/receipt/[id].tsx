import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { formatDate, useLedger } from '@/components/LedgerProvider';
import { Card, EmptyState, Money, Screen, SectionLabel } from '@/components/ui';

export default function ReceiptDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { receipts, people } = useLedger();
  const receipt = receipts.find((item) => item.id === id);
  if (!receipt) return <Screen><EmptyState icon="file" title="Receipt not found" message="This receipt is no longer in your ledger." action={<Pressable onPress={() => router.back()}><Text style={[styles.link, { color: colors.primary }]}>Go back</Text></Pressable>} /></Screen>;
  const personName = (personId: string) => people.find((person) => person.id === personId)?.name ?? 'Someone';
  return (
    <Screen>
      {receipt.imageUri && <Image source={{ uri: receipt.imageUri }} style={styles.receiptImage} />}
      <View style={styles.heading}><View style={[styles.receiptIcon, { backgroundColor: colors.secondary }]}><Feather name="shopping-bag" size={20} color={colors.inkSoft} /></View><View style={styles.headingCopy}><Text style={[styles.merchant, { color: colors.foreground }]}>{receipt.merchant}</Text><Text style={[styles.date, { color: colors.mutedForeground }]}>{formatDate(receipt.date)}</Text></View><Money amount={receipt.total} /></View>
      <Card style={styles.totalCard}><Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>RECEIPT TOTAL</Text><Money amount={receipt.total} large /><Text style={[styles.totalHint, { color: colors.mutedForeground }]}>{receipt.splits.length ? `${receipt.splits.length} assigned share${receipt.splits.length === 1 ? '' : 's'}` : 'No shares assigned yet'}</Text></Card>
      <SectionLabel>Items & shares</SectionLabel>
      <View style={styles.list}>
        {receipt.items.map((item) => {
          const shares = receipt.splits.filter((split) => split.itemId === item.id);
          return <Card key={item.id} style={styles.itemCard}><View style={styles.itemTop}><Text style={[styles.itemName, { color: colors.foreground }]}>{item.name}</Text><Money amount={item.price} /></View>{shares.length === 0 ? <Text style={[styles.unassigned, { color: colors.mutedForeground }]}>Kept by you</Text> : <View style={styles.shares}>{shares.map((share) => <View key={share.id} style={styles.shareRow}><View style={[styles.dot, { backgroundColor: share.paid ? colors.success : colors.primary }]} /><Text style={[styles.shareName, { color: colors.mutedForeground }]}>{personName(share.personId)} {share.paid ? '· paid' : ''}</Text><Money amount={share.amount} color={share.paid ? colors.success : colors.foreground} /></View>)}</View>}</Card>;
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  receiptImage: { width: '100%', height: 160, borderRadius: 22, marginBottom: 18 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 22 },
  receiptIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  headingCopy: { flex: 1, gap: 4 },
  merchant: { fontSize: 20, fontFamily: 'Inter_700Bold', letterSpacing: -0.4 },
  date: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  totalCard: { padding: 20, gap: 8, marginBottom: 26 },
  totalLabel: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 1.1 },
  totalHint: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  list: { gap: 9, marginTop: 11 },
  itemCard: { padding: 15, gap: 10 },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  shares: { gap: 7 },
  shareRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  shareName: { flex: 1, fontSize: 12, fontFamily: 'Inter_400Regular' },
  unassigned: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  link: { fontSize: 14, fontFamily: 'Inter_700Bold', marginTop: 5 },
});
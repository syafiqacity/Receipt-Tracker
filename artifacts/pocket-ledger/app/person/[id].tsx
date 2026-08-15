import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { formatDate, formatMoney, useLedger } from '@/components/LedgerProvider';
import { Card, EmptyState, Money, Screen, SectionLabel } from '@/components/ui';

export default function PersonDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { people, getPersonSummary, toggleSplitPaid } = useLedger();
  const person = people.find((item) => item.id === id);
  if (!person) return <Screen><EmptyState icon="user-x" title="Person not found" message="This person may have been removed from your ledger." action={<Pressable onPress={() => router.back()}><Text style={[styles.link, { color: colors.primary }]}>Go back</Text></Pressable>} /></Screen>;
  const summary = getPersonSummary(person.id);
  return (
    <Screen>
      <View style={styles.profile}>
        <View style={[styles.avatar, { backgroundColor: colors.secondary }]}><Text style={[styles.avatarText, { color: colors.secondaryForeground }]}>{person.name.slice(0, 1).toUpperCase()}</Text></View>
        <Text style={[styles.name, { color: colors.foreground }]}>{person.name}</Text>
        <Text style={[styles.profileMeta, { color: colors.mutedForeground }]}>Shared expense history</Text>
      </View>
      <Card style={[styles.totalCard, { backgroundColor: colors.foreground, borderColor: colors.foreground }]}>
        <Text style={styles.totalLabel}>TOTAL OWED TO YOU</Text>
        <Money amount={summary.outstanding} large color="#ffffff" />
        <View style={styles.totalFooter}><Text style={styles.totalHint}>{summary.splits.filter((split) => !split.paid).length} open {summary.splits.filter((split) => !split.paid).length === 1 ? 'item' : 'items'}</Text><Text style={styles.totalSettled}>{formatMoney(summary.settled)} settled</Text></View>
      </Card>
      <SectionLabel>What they owe</SectionLabel>
      <View style={styles.list}>
        {summary.splits.length === 0 ? <EmptyState icon="file-text" title="No shared items yet" message="Assign this person an item while adding your next receipt." /> : summary.splits.map((split) => (
          <Card key={split.id} style={[styles.itemRow, split.paid && styles.paidRow]}>
            <Pressable onPress={() => void toggleSplitPaid(split.receipt.id, split.id)} testID={`toggle-split-${split.id}`} style={({ pressed }) => [styles.check, { borderColor: split.paid ? colors.success : colors.border, backgroundColor: split.paid ? colors.success : 'transparent' }, pressed && styles.pressed]}>{split.paid && <Feather name="check" size={15} color="#ffffff" />}</Pressable>
            <View style={styles.itemInfo}><Text style={[styles.itemName, { color: split.paid ? colors.mutedForeground : colors.foreground }]}>{split.item.name}</Text><Text style={[styles.itemMeta, { color: colors.mutedForeground }]}>{split.receipt.merchant} · {formatDate(split.receipt.date)}</Text></View>
            <Money amount={split.amount} color={split.paid ? colors.mutedForeground : colors.foreground} />
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profile: { alignItems: 'center', gap: 6, marginBottom: 24 },
  avatar: { width: 66, height: 66, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  avatarText: { fontSize: 25, fontFamily: 'Inter_700Bold' },
  name: { fontSize: 25, fontFamily: 'Inter_700Bold', letterSpacing: -0.6 },
  profileMeta: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  totalCard: { padding: 21, gap: 8, marginBottom: 28 },
  totalLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 1.1 },
  totalFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  totalHint: { color: 'rgba(255,255,255,0.68)', fontSize: 12, fontFamily: 'Inter_400Regular' },
  totalSettled: { color: 'rgba(255,255,255,0.68)', fontSize: 12, fontFamily: 'Inter_500Medium' },
  list: { gap: 9, marginTop: 11 },
  itemRow: { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 11 },
  paidRow: { opacity: 0.75 },
  check: { width: 26, height: 26, borderRadius: 9, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1, gap: 4 },
  itemName: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  itemMeta: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  link: { fontSize: 14, fontFamily: 'Inter_700Bold', marginTop: 5 },
  pressed: { opacity: 0.65 },
});
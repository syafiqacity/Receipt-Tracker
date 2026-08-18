import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { formatDate, useLedger } from '@/components/LedgerProvider';
import { Card, EmptyState, IconButton, Money, Screen, SectionLabel, TopBar } from '@/components/ui';

export default function OweScreen() {
  const colors = useColors();
  const { debts, totalIOwe, toggleDebtPaid } = useLedger();
  const owedByMe = debts.filter((debt) => debt.direction !== 'owed_to_me');
  return (
    <Screen>
      <TopBar title="I owe" subtitle="Your side of the ledger." action={<IconButton icon="plus" label="Add a debt" onPress={() => router.push('/add-debt')} tone="tinted" />} />
      <Card style={[styles.totalCard, { backgroundColor: colors.lavender }]}>
        <Text style={[styles.totalLabel, { color: colors.inkSoft }]}>TOTAL YOU OWE</Text>
        <Money amount={totalIOwe} large color={colors.foreground} />
        <Text style={[styles.totalHint, { color: colors.mutedForeground }]}>Tap a line when it’s been settled.</Text>
      </Card>
      <View style={styles.section}>
        <SectionLabel>Open balances</SectionLabel>
        <View style={styles.list}>
          {owedByMe.filter((debt) => !debt.paid).length === 0 ? (
            <EmptyState icon="corner-up-right" title="Nothing outstanding" message="Add something you owe a friend, family member, or business." action={<Pressable onPress={() => router.push('/add-debt')}><Text style={[styles.link, { color: colors.primary }]}>Add your first debt</Text></Pressable>} />
          ) : owedByMe.filter((debt) => !debt.paid).map((debt) => (
            <DebtRow key={debt.id} debt={debt} onToggle={() => void toggleDebtPaid(debt.id)} />
          ))}
        </View>
      </View>
      {owedByMe.some((debt) => debt.paid) && (
        <View style={styles.section}>
          <SectionLabel>Settled</SectionLabel>
          <View style={styles.list}>
            {owedByMe.filter((debt) => debt.paid).map((debt) => <DebtRow key={debt.id} debt={debt} onToggle={() => void toggleDebtPaid(debt.id)} />)}
          </View>
        </View>
      )}
    </Screen>
  );
}

function DebtRow({ debt, onToggle }: { debt: { id: string; personName: string; description: string; amount: number; date: string; paid: boolean }; onToggle: () => void }) {
  const colors = useColors();
  return (
    <Card style={[styles.debtRow, debt.paid && styles.paidRow]}>
      <Pressable onPress={onToggle} testID={`toggle-debt-${debt.id}`} style={({ pressed }) => [styles.check, { borderColor: debt.paid ? colors.success : colors.border, backgroundColor: debt.paid ? colors.success : 'transparent' }, pressed && styles.pressed]}>
        {debt.paid && <Feather name="check" size={15} color="#ffffff" />}
      </Pressable>
      <View style={styles.debtInfo}><Text style={[styles.debtPerson, { color: debt.paid ? colors.mutedForeground : colors.foreground }]}>{debt.personName}</Text><Text style={[styles.debtDescription, { color: colors.mutedForeground }]}>{debt.description} · {formatDate(debt.date)}</Text></View>
      <Money amount={debt.amount} color={debt.paid ? colors.mutedForeground : colors.foreground} />
    </Card>
  );
}

const styles = StyleSheet.create({
  totalCard: { padding: 22, gap: 8, marginBottom: 28, borderWidth: 0 },
  totalLabel: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 1.1 },
  totalHint: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  section: { marginBottom: 26 },
  list: { gap: 9, marginTop: 11 },
  link: { fontSize: 14, fontFamily: 'Inter_700Bold', marginTop: 5 },
  debtRow: { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 11 },
  paidRow: { opacity: 0.75 },
  check: { width: 26, height: 26, borderRadius: 9, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  debtInfo: { flex: 1, gap: 4 },
  debtPerson: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  debtDescription: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  pressed: { opacity: 0.65 },
});
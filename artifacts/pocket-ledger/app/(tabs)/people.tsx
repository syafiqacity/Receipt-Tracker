import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { formatDate, formatMoney, useLedger } from '@/components/LedgerProvider';
import { Card, EmptyState, IconButton, Money, PrimaryButton, Screen, SectionLabel, TopBar } from '@/components/ui';

export default function PeopleScreen() {
  const colors = useColors();
  const { people, debts, addPerson, getPersonSummary, toggleDebtPaid } = useLedger();
  const directOwed = debts.filter((debt) => debt.direction === 'owed_to_me');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    if (!name.trim()) {
      setError('Add a name so you can find them later.');
      return;
    }
    await addPerson(name);
    setName('');
    setError('');
    setShowForm(false);
  };

  return (
    <Screen>
      <TopBar
        title="People"
        subtitle="Keep every shared expense clear."
        action={<IconButton icon={showForm ? 'x' : 'plus'} label={showForm ? 'Close add person' : 'Add person'} onPress={() => setShowForm((value) => !value)} tone="tinted" />}
      />
      {showForm && (
        <Card style={styles.formCard}>
          <SectionLabel>New person</SectionLabel>
          <TextInput
            testID="input-person-name"
            value={name}
            onChangeText={(value) => { setName(value); setError(''); }}
            placeholder="e.g. Aina, Daniel, Mum"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
            autoFocus
          />
          {!!error && <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>}
          <PrimaryButton label="Save person" onPress={() => void submit()} icon="check" />
        </Card>
      )}
      <Pressable
        testID="button-add-owed"
        onPress={() => router.push('/add-owed')}
        style={({ pressed }) => [styles.addOwedCard, { backgroundColor: colors.secondary, borderColor: colors.border }, pressed && styles.pressed]}
      >
        <View style={[styles.addOwedIcon, { backgroundColor: colors.primary }]}>
          <Feather name="arrow-up-right" size={18} color={colors.primaryForeground} />
        </View>
        <View style={styles.addOwedCopy}>
          <Text style={[styles.addOwedTitle, { color: colors.foreground }]}>Add money owed to you</Text>
          <Text style={[styles.addOwedText, { color: colors.mutedForeground }]}>Record a balance without a receipt.</Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
      </Pressable>

      <View style={styles.summaryRow}>
        <View><Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>People tracked</Text><Text style={[styles.summaryValue, { color: colors.foreground }]}>{people.length}</Text></View>
        <View style={styles.summaryRight}><Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Outstanding</Text><Text style={[styles.summaryValue, { color: colors.primary }]}>{people.filter((person) => getPersonSummary(person.id).outstanding > 0).length}</Text></View>
      </View>

      <SectionLabel>Everyone</SectionLabel>
      <View style={styles.list}>
        {people.length === 0 ? (
          <EmptyState icon="users" title="No people yet" message="Add friends, family, or roommates to start assigning receipt items." />
        ) : (
          people.map((person) => {
            const summary = getPersonSummary(person.id);
            return (
              <Pressable key={person.id} onPress={() => router.push(`/person/${person.id}`)} testID={`person-${person.id}`}>
                <Card style={styles.personCard}>
                  <View style={[styles.avatar, { backgroundColor: colors.secondary }]}><Text style={[styles.avatarText, { color: colors.secondaryForeground }]}>{person.name.slice(0, 1).toUpperCase()}</Text></View>
                  <View style={styles.personInfo}><Text style={[styles.personName, { color: colors.foreground }]}>{person.name}</Text><Text style={[styles.personMeta, { color: colors.mutedForeground }]}>{summary.splits.length} shared {summary.splits.length === 1 ? 'item' : 'items'}</Text></View>
                  <View style={styles.personAmount}>{summary.outstanding > 0 ? <Money amount={summary.outstanding} color={colors.primary} /> : <Text style={[styles.settled, { color: colors.success }]}>Settled</Text>}<Feather name="chevron-right" size={18} color={colors.mutedForeground} /></View>
                </Card>
              </Pressable>
            );
          })
        )}
      </View>
      {directOwed.length > 0 && (
        <View style={styles.directSection}>
          <SectionLabel>Direct balances</SectionLabel>
          <View style={styles.list}>
            {directOwed.map((debt) => (
              <Card key={debt.id} style={[styles.directRow, debt.paid && styles.paidRow]}>
                <Pressable
                  onPress={() => void toggleDebtPaid(debt.id)}
                  testID={`toggle-owed-${debt.id}`}
                  style={({ pressed }) => [styles.check, { borderColor: debt.paid ? colors.success : colors.border, backgroundColor: debt.paid ? colors.success : 'transparent' }, pressed && styles.pressed]}
                >
                  {debt.paid && <Feather name="check" size={15} color="#ffffff" />}
                </Pressable>
                <View style={styles.directInfo}>
                  <Text style={[styles.directPerson, { color: debt.paid ? colors.mutedForeground : colors.foreground }]}>{debt.personName}</Text>
                  <Text style={[styles.directMeta, { color: colors.mutedForeground }]}>{debt.description} · {formatDate(debt.date)}</Text>
                </View>
                <Money amount={debt.amount} color={debt.paid ? colors.mutedForeground : colors.primary} />
              </Card>
            ))}
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  formCard: { gap: 12, marginBottom: 20 },
  addOwedCard: { borderRadius: 18, borderWidth: 1, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 6 },
  addOwedIcon: { width: 39, height: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  addOwedCopy: { flex: 1, gap: 3 },
  addOwedTitle: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  addOwedText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  input: { height: 50, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, fontSize: 15, fontFamily: 'Inter_400Regular' },
  error: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 18, marginBottom: 18 },
  summaryRight: { alignItems: 'flex-end' },
  summaryLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', marginBottom: 4 },
  summaryValue: { fontSize: 26, fontFamily: 'Inter_700Bold' },
  list: { gap: 9, marginTop: 11 },
  personCard: { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  personInfo: { flex: 1, gap: 4 },
  personName: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  personMeta: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  personAmount: { alignItems: 'flex-end', gap: 5 },
  settled: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  directSection: { marginTop: 26 },
  directRow: { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 11 },
  paidRow: { opacity: 0.75 },
  check: { width: 26, height: 26, borderRadius: 9, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  directInfo: { flex: 1, gap: 4 },
  directPerson: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  directMeta: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
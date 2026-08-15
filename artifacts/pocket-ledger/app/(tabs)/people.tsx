import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { formatMoney, useLedger } from '@/components/LedgerProvider';
import { Card, EmptyState, IconButton, Money, PrimaryButton, Screen, SectionLabel, TopBar } from '@/components/ui';

export default function PeopleScreen() {
  const colors = useColors();
  const { people, addPerson, getPersonSummary } = useLedger();
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  formCard: { gap: 12, marginBottom: 20 },
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
});
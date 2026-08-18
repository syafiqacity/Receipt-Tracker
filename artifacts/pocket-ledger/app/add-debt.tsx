import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useLedger } from '@/components/LedgerProvider';
import { IconButton, PrimaryButton, Screen, SectionLabel } from '@/components/ui';

function sanitizeAmount(value: string): string {
  const normalized = value.replace(/,/g, '.').replace(/[^\d.]/g, '');
  const [whole = '', ...decimals] = normalized.split('.');
  if (decimals.length === 0) return whole;
  return `${whole || '0'}.${decimals.join('').slice(0, 2)}`;
}

export default function AddDebtScreen() {
  const colors = useColors();
  const { addDebt } = useLedger();
  const [personName, setPersonName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const save = async () => {
    const numeric = Number(amount);
    if (!personName.trim() || !description.trim() || !Number.isFinite(numeric) || numeric <= 0) {
      setError('Add who, what for, and an amount.');
      return;
    }
    await addDebt({ personName: personName.trim(), description: description.trim(), amount: Math.round(numeric * 100) / 100 });
    router.back();
  };

  return (
    <Screen>
      <View style={styles.top}><View><Text style={[styles.kicker, { color: colors.primary }]}>I OWE</Text><Text style={[styles.title, { color: colors.foreground }]}>Keep your side clear.</Text></View><IconButton icon="x" label="Close debt" onPress={() => router.back()} /></View>
      <View style={styles.form}>
        <View style={styles.field}><SectionLabel>Who do you owe?</SectionLabel><TextInput testID="input-debt-person" value={personName} onChangeText={setPersonName} placeholder="Aina, Daniel, or a business" placeholderTextColor={colors.mutedForeground} style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]} /></View>
        <View style={styles.field}><SectionLabel>What was it for?</SectionLabel><TextInput testID="input-debt-description" value={description} onChangeText={setDescription} placeholder="Dinner, ticket, rent…" placeholderTextColor={colors.mutedForeground} style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]} /></View>
        <View style={styles.field}><SectionLabel>How much?</SectionLabel><View style={[styles.amountBox, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={[styles.currency, { color: colors.mutedForeground }]}>RM</Text><TextInput testID="input-debt-amount" value={amount} onChangeText={(value) => { setAmount(sanitizeAmount(value)); setError(''); }} placeholder="0.00" keyboardType="decimal-pad" inputMode="decimal" placeholderTextColor={colors.mutedForeground} style={[styles.amountInput, { color: colors.foreground }]} /></View></View>
        {!!error && <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>}
        <PrimaryButton label="Save debt" onPress={() => void save()} icon="check" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 38 },
  kicker: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 1.2, marginBottom: 6 },
  title: { fontSize: 28, fontFamily: 'Inter_700Bold', letterSpacing: -0.8 },
  form: { gap: 19 },
  field: { gap: 10 },
  input: { height: 54, borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, fontSize: 15, fontFamily: 'Inter_400Regular' },
  amountBox: { height: 64, borderWidth: 1, borderRadius: 17, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', gap: 10 },
  currency: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  amountInput: { flex: 1, fontSize: 24, fontFamily: 'Inter_700Bold' },
  error: { fontSize: 12, lineHeight: 18, fontFamily: 'Inter_500Medium' },
});
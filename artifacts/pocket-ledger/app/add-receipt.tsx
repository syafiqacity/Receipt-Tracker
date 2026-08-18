import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { ReceiptItem, useLedger } from '@/components/LedgerProvider';
import { Card, IconButton, PrimaryButton, Screen, SectionLabel } from '@/components/ui';

type DraftItem = ReceiptItem & { personIds: string[]; priceText: string };

function makeDraftItem(): DraftItem {
  return { id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: '', price: 0, personIds: [], priceText: '' };
}

function sanitizeAmount(value: string): string {
  const normalized = value.replace(/,/g, '.').replace(/[^\d.]/g, '');
  const [whole = '', ...decimals] = normalized.split('.');
  if (decimals.length === 0) return whole;
  return `${whole || '0'}.${decimals.join('').slice(0, 2)}`;
}

export default function AddReceiptScreen() {
  const colors = useColors();
  const { people, addReceipt } = useLedger();
  const [merchant, setMerchant] = useState('');
  const [imageUri, setImageUri] = useState<string>();
  const [items, setItems] = useState<DraftItem[]>([makeDraftItem()]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + (Number.isNaN(item.price) ? 0 : item.price), 0), [items]);

  const capture = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera access needed', 'Allow camera access in Settings to capture a receipt, or continue by entering items manually.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.9, allowsEditing: false });
    if (!result.canceled) setImageUri(result.assets[0]?.uri);
  };

  const updateItemName = (id: string, value: string) => {
    setItems((current) => current.map((item) => item.id !== id ? item : { ...item, name: value }));
  };

  const updateItemPrice = (id: string, value: string) => {
    const priceText = sanitizeAmount(value);
    const numeric = Number(priceText);
    setItems((current) => current.map((item) => item.id !== id ? item : {
      ...item,
      price: Number.isFinite(numeric) ? numeric : 0,
      priceText,
    }));
  };

  const togglePerson = (itemId: string, personId: string) => {
    setItems((current) => current.map((item) => item.id !== itemId ? item : { ...item, personIds: item.personIds.includes(personId) ? item.personIds.filter((id) => id !== personId) : [...item.personIds, personId] }));
  };

  const save = async () => {
    const validItems = items.filter((item) => item.name.trim() && item.price > 0);
    if (!merchant.trim() || validItems.length === 0) {
      setError('Add a place and at least one item with a price.');
      return;
    }
    setSaving(true);
    const splits = validItems.flatMap((item) => {
      const recipients = item.personIds;
      if (recipients.length === 0) return [];
      const share = Math.round((item.price / recipients.length) * 100) / 100;
      return recipients.map((personId) => ({ id: `split-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, itemId: item.id, personId, amount: share, paid: false }));
    });
    const receipt = await addReceipt({ merchant, items: validItems.map(({ personIds: _personIds, priceText: _priceText, ...item }) => item), splits, imageUri });
    setSaving(false);
    router.replace(`/receipt/${receipt.id}`);
  };

  return (
    <Screen>
      <View style={styles.top}><View><Text style={[styles.kicker, { color: colors.primary }]}>NEW RECEIPT</Text><Text style={[styles.title, { color: colors.foreground }]}>Split it as you go.</Text></View><IconButton icon="x" label="Close receipt" onPress={() => router.back()} /></View>
      <Card style={styles.captureCard}>
        <View style={[styles.captureIcon, { backgroundColor: imageUri ? colors.success : colors.secondary }]}><Text style={{ color: '#ffffff', fontSize: 20 }}>{imageUri ? '✓' : ' '}</Text></View>
        <View style={styles.captureCopy}><Text style={[styles.captureTitle, { color: colors.foreground }]}>{imageUri ? 'Receipt captured' : 'Scan your receipt'}</Text><Text style={[styles.captureText, { color: colors.mutedForeground }]}>{imageUri ? 'Photo attached. Add the items below.' : 'Use your camera, then add who shared each item.'}</Text></View>
        <Pressable testID="button-capture" onPress={() => void capture()} style={({ pressed }) => [styles.captureButton, { borderColor: colors.primary }, pressed && styles.pressed]}><Text style={[styles.captureButtonText, { color: colors.primary }]}>{imageUri ? 'Retake' : 'Open camera'}</Text></Pressable>
      </Card>
      <View style={styles.form}>
        <View style={styles.field}><SectionLabel>Where was it?</SectionLabel><TextInput testID="input-merchant" value={merchant} onChangeText={setMerchant} placeholder="e.g. Jaya Grocer, Nando’s" placeholderTextColor={colors.mutedForeground} style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]} /></View>
        <View style={styles.itemsHeader}><SectionLabel>Items</SectionLabel><Pressable onPress={() => setItems((current) => [...current, makeDraftItem()])}><Text style={[styles.addText, { color: colors.primary }]}>+ Add item</Text></Pressable></View>
        <View style={styles.itemsList}>
          {items.map((item, index) => (
            <Card key={item.id} style={styles.itemCard}>
              <View style={styles.itemTitleRow}><Text style={[styles.itemNumber, { color: colors.mutedForeground }]}>0{index + 1}</Text><TextInput testID={`input-item-name-${index}`} value={item.name} onChangeText={(value) => updateItemName(item.id, value)} placeholder="Item name" placeholderTextColor={colors.mutedForeground} style={[styles.itemNameInput, { color: colors.foreground }]} /><TextInput testID={`input-item-price-${index}`} value={item.priceText} onChangeText={(value) => updateItemPrice(item.id, value)} placeholder="0.00" placeholderTextColor={colors.mutedForeground} keyboardType="decimal-pad" inputMode="decimal" style={[styles.priceInput, { color: colors.foreground }]} /></View>
              <Text style={[styles.splitLabel, { color: colors.mutedForeground }]}>Who shared this?</Text>
              <View style={styles.chips}>{people.length === 0 ? <Text style={[styles.noPeople, { color: colors.mutedForeground }]}>Add people first from the People tab.</Text> : people.map((person) => <Pressable key={person.id} onPress={() => togglePerson(item.id, person.id)} style={[styles.chip, { backgroundColor: item.personIds.includes(person.id) ? colors.primary : colors.secondary }]}><Text style={[styles.chipText, { color: item.personIds.includes(person.id) ? colors.primaryForeground : colors.secondaryForeground }]}>{person.name}</Text></Pressable>)}</View>
            </Card>
          ))}
        </View>
        <View style={styles.totalRow}><Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Receipt total</Text><Text style={[styles.total, { color: colors.foreground }]}>RM {subtotal.toFixed(2)}</Text></View>
        {!!error && <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>}
        <PrimaryButton label="Save receipt" onPress={() => void save()} icon="check" loading={saving} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 },
  kicker: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 1.2, marginBottom: 6 },
  title: { fontSize: 28, fontFamily: 'Inter_700Bold', letterSpacing: -0.8 },
  captureCard: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 13, marginBottom: 24 },
  captureIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  captureCopy: { flex: 1, gap: 3 },
  captureTitle: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  captureText: { fontSize: 11, lineHeight: 16, fontFamily: 'Inter_400Regular' },
  captureButton: { paddingHorizontal: 11, paddingVertical: 9, borderRadius: 11, borderWidth: 1 },
  captureButtonText: { fontSize: 11, fontFamily: 'Inter_700Bold' },
  form: { gap: 15 },
  field: { gap: 9 },
  input: { height: 52, borderWidth: 1, borderRadius: 15, paddingHorizontal: 15, fontSize: 15, fontFamily: 'Inter_400Regular' },
  itemsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  addText: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  itemsList: { gap: 10 },
  itemCard: { padding: 14, gap: 12 },
  itemTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemNumber: { fontSize: 12, fontFamily: 'Inter_700Bold', width: 22 },
  itemNameInput: { flex: 1, fontSize: 15, fontFamily: 'Inter_600SemiBold', paddingVertical: 3 },
  priceInput: { width: 64, textAlign: 'right', fontSize: 15, fontFamily: 'Inter_700Bold', paddingVertical: 3 },
  splitLabel: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 },
  chipText: { fontSize: 11, fontFamily: 'Inter_700Bold' },
  noPeople: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  totalLabel: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  total: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  error: { fontSize: 12, lineHeight: 18, fontFamily: 'Inter_500Medium' },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
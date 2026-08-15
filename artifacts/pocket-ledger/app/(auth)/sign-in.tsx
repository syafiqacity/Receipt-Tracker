import { useSignIn } from '@clerk/expo';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { BrandMark, PrimaryButton } from '@/components/ui';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';

export default function SignInScreen() {
  const colors = useColors();
  const { signIn, errors, fetchStatus } = useSignIn();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const submit = async () => {
    setMessage('');
    const { error } = await signIn.password({ emailAddress, password });
    if (error) {
      setMessage(error.message || 'We could not sign you in. Check your details and try again.');
      return;
    }
    if (signIn.status === 'complete') {
      await signIn.finalize({ navigate: ({ decorateUrl }) => router.replace(decorateUrl('/') as never) });
    } else {
      setMessage('This account needs another verification step before it can open.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollViewCompat contentContainerStyle={styles.content} bottomOffset={20}>
        <BrandMark />
        <View style={styles.heading}>
          <Text style={[styles.kicker, { color: colors.primary }]}>YOUR MONEY, CLEARER</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Welcome back.</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Sign in to keep your shared expenses safe and close at hand.</Text>
        </View>
        <View style={styles.form}>
          <View style={styles.field}><Text style={[styles.label, { color: colors.inkSoft }]}>Email address</Text><TextInput testID="input-email" value={emailAddress} onChangeText={setEmailAddress} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" placeholderTextColor={colors.mutedForeground} style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]} /></View>
          <View style={styles.field}><Text style={[styles.label, { color: colors.inkSoft }]}>Password</Text><TextInput testID="input-password" value={password} onChangeText={setPassword} secureTextEntry placeholder="Your password" placeholderTextColor={colors.mutedForeground} style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]} /></View>
          {!!errors?.fields?.identifier?.message && <Text style={[styles.error, { color: colors.destructive }]}>{errors.fields.identifier.message}</Text>}
          {!!errors?.fields?.password?.message && <Text style={[styles.error, { color: colors.destructive }]}>{errors.fields.password.message}</Text>}
          {!!message && <Text style={[styles.error, { color: colors.destructive }]}>{message}</Text>}
          <PrimaryButton label="Sign in" onPress={() => void submit()} icon="arrow-right" loading={fetchStatus === 'fetching'} disabled={!emailAddress || !password} />
        </View>
        <View style={styles.footer}><Text style={[styles.footerText, { color: colors.mutedForeground }]}>New to Pocket Ledger?</Text><Link href="/sign-up" asChild><Pressable><Text style={[styles.link, { color: colors.primary }]}>Create an account</Text></Pressable></Link></View>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 62, paddingBottom: 35 },
  heading: { marginTop: 62, marginBottom: 32, gap: 8 },
  kicker: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 1.3 },
  title: { fontSize: 38, fontFamily: 'Inter_700Bold', letterSpacing: -1.4 },
  subtitle: { fontSize: 15, lineHeight: 23, fontFamily: 'Inter_400Regular', maxWidth: 310 },
  form: { gap: 17 },
  field: { gap: 8 },
  label: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  input: { height: 54, borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, fontSize: 15, fontFamily: 'Inter_400Regular' },
  error: { fontSize: 12, lineHeight: 18, fontFamily: 'Inter_500Medium' },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 28 },
  footerText: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  link: { fontSize: 13, fontFamily: 'Inter_700Bold' },
});
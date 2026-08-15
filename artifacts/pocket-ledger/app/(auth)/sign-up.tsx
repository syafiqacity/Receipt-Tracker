import { useSignUp } from '@clerk/expo';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { BrandMark, PrimaryButton } from '@/components/ui';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';

export default function SignUpScreen() {
  const colors = useColors();
  const { signUp, errors, fetchStatus } = useSignUp();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  const submit = async () => {
    setMessage('');
    const { error } = await signUp.password({ emailAddress, password });
    if (error) {
      setMessage(error.message || 'We could not create your account yet.');
      return;
    }
    await signUp.verifications.sendEmailCode();
  };

  const verify = async () => {
    setMessage('');
    await signUp.verifications.verifyEmailCode({ code });
    if (signUp.status === 'complete') {
      await signUp.finalize({ navigate: ({ decorateUrl }) => router.replace(decorateUrl('/') as never) });
    } else {
      setMessage('That code did not finish setup. Please try again.');
    }
  };

  const verifying = signUp.status === 'missing_requirements' && signUp.unverifiedFields.includes('email_address');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollViewCompat contentContainerStyle={styles.content} bottomOffset={20}>
        <BrandMark />
        <View style={styles.heading}>
          <Text style={[styles.kicker, { color: colors.primary }]}>A BETTER WAY TO SPLIT</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>{verifying ? 'Check your inbox.' : 'Start your ledger.'}</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{verifying ? 'Enter the verification code we sent you to finish creating your account.' : 'Create an account so your receipts and balances stay with you.'}</Text>
        </View>
        {verifying ? (
          <View style={styles.form}>
            <View style={styles.field}><Text style={[styles.label, { color: colors.inkSoft }]}>Verification code</Text><TextInput testID="input-verification-code" value={code} onChangeText={setCode} keyboardType="number-pad" placeholder="123456" placeholderTextColor={colors.mutedForeground} style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]} /></View>
            {!!message && <Text style={[styles.error, { color: colors.destructive }]}>{message}</Text>}
            <PrimaryButton label="Verify email" onPress={() => void verify()} icon="check" loading={fetchStatus === 'fetching'} disabled={!code} />
            <Pressable onPress={() => void signUp.verifications.sendEmailCode()}><Text style={[styles.resend, { color: colors.primary }]}>Send me a new code</Text></Pressable>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.field}><Text style={[styles.label, { color: colors.inkSoft }]}>Email address</Text><TextInput testID="input-signup-email" value={emailAddress} onChangeText={setEmailAddress} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" placeholderTextColor={colors.mutedForeground} style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]} /></View>
            <View style={styles.field}><Text style={[styles.label, { color: colors.inkSoft }]}>Password</Text><TextInput testID="input-signup-password" value={password} onChangeText={setPassword} secureTextEntry placeholder="At least 8 characters" placeholderTextColor={colors.mutedForeground} style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]} /></View>
            {!!errors?.fields?.emailAddress?.message && <Text style={[styles.error, { color: colors.destructive }]}>{errors.fields.emailAddress.message}</Text>}
            {!!errors?.fields?.password?.message && <Text style={[styles.error, { color: colors.destructive }]}>{errors.fields.password.message}</Text>}
            {!!message && <Text style={[styles.error, { color: colors.destructive }]}>{message}</Text>}
            <PrimaryButton label="Create account" onPress={() => void submit()} icon="arrow-right" loading={fetchStatus === 'fetching'} disabled={!emailAddress || !password} />
            <View nativeID="clerk-captcha" />
          </View>
        )}
        <View style={styles.footer}><Text style={[styles.footerText, { color: colors.mutedForeground }]}>Already have an account?</Text><Link href="/sign-in" asChild><Pressable><Text style={[styles.link, { color: colors.primary }]}>Sign in</Text></Pressable></Link></View>
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
  resend: { fontSize: 13, textAlign: 'center', fontFamily: 'Inter_700Bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 28 },
  footerText: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  link: { fontSize: 13, fontFamily: 'Inter_700Bold' },
});
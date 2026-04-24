import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { COLOR_PROFILES } from '../../theme/colors';
import { SealLogo } from '../seal/SealLogo';

interface LoginScreenProps {
  onSkipAuth?: () => void;
}

type AuthMode = 'login' | 'signup';

/**
 * Custom email/password auth screen.
 * Users can sign up (with referral code) or log in.
 * No Microsoft SSO — fully self-hosted auth via Azure Functions.
 */
export function LoginScreen({ onSkipAuth }: LoginScreenProps) {
  const { colorProfile } = useSettingsStore();
  const colors = COLOR_PROFILES[colorProfile];
  const { isLoading } = useAuthStore();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }

    if (mode === 'signup' && !referralCode.trim()) {
      setError('Referral code is required to sign up');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // In production, these call the Azure Functions API.
      // For dev, simulate successful auth.
      await new Promise(r => setTimeout(r, 800));

      useAuthStore.getState().setAuth({
        userId: `user-${Date.now()}`,
        email: email.toLowerCase(),
        displayName: displayName || email.split('@')[0],
        accessToken: `session-${Date.now()}`,
      });
      useAuthStore.getState().setReferralVerified(true);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: colors.secondary,
    color: colors.text,
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
      }}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <View style={{ maxWidth: 380, width: '100%', gap: 28, alignItems: 'center' }}>
        {/* Logo & branding */}
        <SealLogo size={72} color={colors.accent} accentColor={colors.text} />
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Text style={{ color: colors.text, fontSize: 32, fontWeight: '800' }}>
            SealTools
          </Text>
          <Text style={{ color: colors.text, fontSize: 14, opacity: 0.5, textAlign: 'center' }}>
            An accessible RSVP reader{'\n'}for neurodivergent folks 🦭
          </Text>
        </View>

        {/* Mode toggle */}
        <View style={{
          flexDirection: 'row',
          backgroundColor: colors.card,
          borderRadius: 14,
          padding: 4,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          {(['login', 'signup'] as AuthMode[]).map((m) => (
            <Pressable
              key={m}
              onPress={() => { setMode(m); setError(''); }}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                alignItems: 'center',
                backgroundColor: mode === m ? colors.accent : 'transparent',
              }}
            >
              <Text style={{
                color: mode === m ? colors.bg : colors.text,
                fontSize: 14,
                fontWeight: '600',
              }}>
                {m === 'login' ? 'Log In' : 'Sign Up'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Form */}
        <View style={{ width: '100%', gap: 14 }}>
          {mode === 'signup' && (
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Display name"
              placeholderTextColor={colors.text + '44'}
              style={inputStyle}
            />
          )}

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.text + '44'}
            keyboardType="email-address"
            autoCapitalize="none"
            style={inputStyle}
          />

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={colors.text + '44'}
            secureTextEntry
            style={inputStyle}
          />

          {mode === 'signup' && (
            <TextInput
              value={referralCode}
              onChangeText={setReferralCode}
              placeholder="Referral code (e.g. SEAL-2026)"
              placeholderTextColor={colors.text + '44'}
              autoCapitalize="characters"
              style={{
                ...inputStyle,
                letterSpacing: 1.5,
                textAlign: 'center',
                fontWeight: '600',
              }}
            />
          )}

          {error ? (
            <Text style={{ color: '#FF6B6B', fontSize: 13, textAlign: 'center' }}>
              {error}
            </Text>
          ) : null}

          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: colors.accent,
              paddingVertical: 16,
              borderRadius: 16,
              alignItems: 'center',
              opacity: loading ? 0.6 : 1,
              marginTop: 4,
            }}
          >
            {loading ? (
              <ActivityIndicator color={colors.bg} />
            ) : (
              <Text style={{ color: colors.bg, fontSize: 16, fontWeight: '700' }}>
                {mode === 'login' ? '🦭 Log In' : '🦭 Create Account'}
              </Text>
            )}
          </Pressable>

          {mode === 'signup' && (
            <Text style={{ color: colors.text, fontSize: 12, opacity: 0.4, textAlign: 'center' }}>
              SealTools is free & open source. A referral code{'\n'}is needed to limit server costs on our free tier.
            </Text>
          )}
        </View>

        {onSkipAuth && (
          <Pressable onPress={onSkipAuth}>
            <Text style={{ color: colors.text, fontSize: 13, opacity: 0.25, textAlign: 'center' }}>
              Skip (dev mode)
            </Text>
          </Pressable>
        )}

        <Text style={{ color: colors.text, fontSize: 11, opacity: 0.15 }}>
          autisticseal.tech · open source
        </Text>
      </View>
    </ScrollView>
  );
}

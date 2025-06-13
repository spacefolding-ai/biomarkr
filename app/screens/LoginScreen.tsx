import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { supabase } from '../services/supabaseClient';
import { LogIn, Eye, EyeOff } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { control, handleSubmit, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const email = data.email.toLowerCase().trim();
      const password = data.password.trim();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      Toast.show({ type: 'success', text1: 'Login successful!' });
      navigation.navigate('Main');
    } catch (error) {
      if (error?.code === 'email_not_confirmed') {
        Toast.show({
          type: 'error',
          text1: 'Email not confirmed',
          text2: 'Please check your email for a confirmation link before logging in.'
        });
      } else {
        Toast.show({ type: 'error', text1: 'Login failed', text2: error.message || 'Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <LogIn size={48} color="#007AFF" />
      </View>
      <Controller
        control={control}
        name="email"
        defaultValue=""
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
            <Text style={styles.inlineError}>{errors.email ? errors.email.message : ' '}</Text>
          </>
        )}
      />
      <Controller
        control={control}
        name="password"
        defaultValue=""
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <View style={{ position: 'relative' }}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry={!showPassword}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
              <View style={{ position: 'absolute', right: 8, top: 8 }}>
                {showPassword ? (
                  <EyeOff size={20} color="#888" onPress={() => setShowPassword(false)} />
                ) : (
                  <Eye size={20} color="#888" onPress={() => setShowPassword(true)} />
                )}
              </View>
            </View>
            <Text style={styles.inlineError}>{errors.password ? errors.password.message : ' '}</Text>
          </>
        )}
      />
      {loading ? (
        <ActivityIndicator size={64} color="#007AFF" style={{ marginVertical: 16 }} />
      ) : (
        <Button title="Login" onPress={handleSubmit(onSubmit)} disabled={!isValid || loading} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 6,
    paddingHorizontal: 8,
  },
  inlineError: {
    fontSize: 10,
    color: 'red',
    marginBottom: 4,
  },
});

export default LoginScreen; 
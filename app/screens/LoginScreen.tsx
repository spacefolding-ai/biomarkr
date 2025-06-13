import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { supabase } from '../services/supabaseClient';
import { LogIn } from 'lucide-react-native';

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
      navigation.navigate('Main');
    } catch (error) {
      // Optionally handle error (e.g., show error message)
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
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
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
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  inlineError: {
    fontSize: 10,
    color: 'red',
    marginBottom: 8,
  },
});

export default LoginScreen; 
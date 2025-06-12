import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../services/supabaseClient';

const signupSchema = z.object({
  fullName: z.string().min(1, 'Full Name is required'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/\d/, 'Password must contain a digit')
    .regex(/[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?]/, 'Password must contain a special character'),
});

const SignupScreen = () => {
  const { control, handleSubmit, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;

      const { error: insertError } = await supabase
        .from('users')
        .insert([{ full_name: data.fullName }]);
      if (insertError) throw insertError;

      alert('Account created. Please check your email to verify.');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name="fullName"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
            <Text style={styles.inlineError}>{errors.fullName ? errors.fullName.message : ' '}</Text>
          </>
        )}
      />
      <Controller
        control={control}
        name="email"
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
            <View style={styles.validationContainer}>
              <View style={styles.validationRow}>
                <Text style={styles.validationText}>{value.length >= 8 ? '🟢' : '⚪'} 8+ characters</Text>
                <Text style={styles.validationText}>{/[A-Z]/.test(value) ? '🟢' : '⚪'} Uppercase letter</Text>
                <Text style={styles.validationText}>{/[a-z]/.test(value) ? '🟢' : '⚪'} Lowercase letter</Text>
                <Text style={styles.validationText}>{/\d/.test(value) ? '🟢' : '⚪'} Number</Text>
                <Text style={styles.validationText}>{/[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?]/.test(value) ? '🟢' : '⚪'} Special character</Text>
              </View>
            </View>
          </>
        )}
      />
      <Button title="Sign Up" onPress={handleSubmit(onSubmit)} disabled={!isValid} />
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
  validationContainer: {
    marginTop: 8,
  },
  validationText: {
    fontSize: 12,
    color: 'gray',
    marginRight: 10,
  },
  validationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default SignupScreen; 
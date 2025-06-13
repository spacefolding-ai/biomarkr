import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { handleSignUp } from '../services/auth';
import { UserPlus } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

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
  const navigation = useNavigation<NavigationProp<any>>();
  const { control, handleSubmit, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const email = data.email.toLowerCase().trim();
      const password = data.password.trim();
      const fullName = data.fullName;
      await handleSignUp(email, password, fullName);
      Toast.show({ type: 'success', text1: 'Signup successful! Please log in.' });
      navigation.navigate('Login');
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Signup failed', text2: error.message || 'Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <UserPlus size={48} color="#007AFF" />
      </View>
      <Controller
        control={control}
        name="fullName"
        defaultValue=""
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
      {loading ? (
        <ActivityIndicator size={64} color="#007AFF" style={{ marginVertical: 16 }} />
      ) : (
        <Button title="Sign Up" onPress={handleSubmit(onSubmit)} disabled={!isValid || loading} />
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
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

interface ResetPasswordFormProps {
  onResetPassword: (email: string) => void;
  isLoading: boolean;
  error: string | null;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onResetPassword, isLoading, error }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    onResetPassword(email);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Your Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="name@company.com"
        style={styles.input}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button
        title={isLoading ? "Sending email..." : "Send Reset Email"}
        onPress={handleSubmit}
        disabled={isLoading}
        color="#D3D3D3" // Light grey for the button background
      />
      <Text style={styles.hintText}>
        Please check your junk/spam folder if you don't receive an email
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#F5F5F5',
  },
  error: {
    color: 'red',
    fontSize: 14,
    fontWeight: '300',
    marginVertical: 5,
  },
  hintText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '300',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default ResetPasswordForm;
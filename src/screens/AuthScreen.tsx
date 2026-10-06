import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useApp } from '../context/AppContext';
import { APP_CONFIG } from '../config';

interface AuthScreenProps {
  onClose?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onClose }) => {
  const { login, register, loginWithGoogle } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Por favor ingresa tu correo y contraseña.');
      return;
    }

    if (mode === 'register') {
      if (!name) {
        setErrorMsg('Ingresa tu nombre completo.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Las contraseñas no coinciden.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        const res = await register(name, email, password, phone);
        if (!res.success) {
          setErrorMsg(res.message);
        } else if (onClose) {
          onClose();
        }
      } else {
        const res = await login(email, password);
        if (!res.success) {
          setErrorMsg(res.message);
        } else if (onClose) {
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMsg('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    const clientId = APP_CONFIG.GOOGLE_OAUTH.CLIENT_ID_EXPO;

    if (!clientId) {
      Alert.alert(
        'BLOQUEADO POR CONFIGURACIÓN: Google OAuth',
        'Falta configurar la variable de entorno EXPO_PUBLIC_GOOGLE_CLIENT_ID en el entorno para iniciar el flujo de Google OAuth real.\n\nPuedes ingresar mediante correo y contraseña.'
      );
      return;
    }

    setLoading(true);
    try {
      const res = await loginWithGoogle('google-oauth-token-placeholder');
      if (!res.success) {
        setErrorMsg(res.message);
      } else if (onClose) {
        onClose();
      }
    } catch (err: any) {
      setErrorMsg('Error en autenticación con Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Brand Header */}
      <View style={styles.header}>
        <Text style={styles.badge}>VALPAR 0.3.0 B2C</Text>
        <Text style={styles.title}>
          {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </Text>
        <Text style={styles.subtitle}>
          {mode === 'login'
            ? 'Accede a tus visitas verificadas, pasaporte digital y beneficios.'
            : 'Únete a la comunidad de exploración regional de Valparaíso.'}
        </Text>
      </View>

      {/* Error Alert Box */}
      {errorMsg && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
        </View>
      )}

      {/* Google OAuth Button */}
      <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleAuth} disabled={loading}>
        <Text style={styles.googleBtnText}>🌐 Continuar con Google</Text>
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>o ingresa con correo</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Form Fields */}
      {mode === 'register' && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre Completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Valentina Silva"
            placeholderTextColor="#64748b"
            value={name}
            onChangeText={setName}
          />
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Correo Electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="tu.email@ejemplo.cl"
          placeholderTextColor="#64748b"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {mode === 'register' && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Teléfono (Opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="+56912345678"
            placeholderTextColor="#64748b"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#64748b"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      {mode === 'register' && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirmar Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#64748b"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>
      )}

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#020617" />
        ) : (
          <Text style={styles.submitBtnText}>
            {mode === 'login' ? 'Ingresar a Valpar' : 'Crear Cuenta B2C'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Switch Mode Toggle */}
      <TouchableOpacity
        style={styles.toggleRow}
        onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
      >
        <Text style={styles.toggleText}>
          {mode === 'login'
            ? '¿No tienes cuenta? Regístrate aquí'
            : '¿Ya tienes cuenta? Inicia sesión'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  content: { padding: 24, justifyContent: 'center', minHeight: '100%' },
  header: { marginBottom: 24 },
  badge: { color: '#10b981', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', marginBottom: 4 },
  title: { color: '#ffffff', fontSize: 28, fontWeight: '900', marginBottom: 6 },
  subtitle: { color: '#94a3b8', fontSize: 13, lineHeight: 18 },
  errorCard: { backgroundColor: 'rgba(244, 63, 94, 0.15)', borderWidth: 1, borderColor: '#f43f5e', borderRadius: 14, padding: 12, marginBottom: 16 },
  errorText: { color: '#f43f5e', fontSize: 12, fontWeight: '700' },
  googleBtn: { backgroundColor: '#1e293b', paddingVertical: 14, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#334155', marginBottom: 20 },
  googleBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#1e293b' },
  dividerText: { color: '#64748b', fontSize: 11, paddingHorizontal: 12 },
  inputGroup: { marginBottom: 16 },
  label: { color: '#cbd5e1', fontSize: 12, fontWeight: '700', marginBottom: 6 },
  input: { backgroundColor: '#0f172a', color: '#ffffff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, borderWidth: 1, borderColor: '#1e293b' },
  submitBtn: { backgroundColor: '#10b981', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 8, marginBottom: 16 },
  submitBtnText: { color: '#020617', fontSize: 15, fontWeight: '900' },
  toggleRow: { alignItems: 'center', paddingVertical: 8 },
  toggleText: { color: '#38bdf8', fontSize: 13, fontWeight: '700' }
});

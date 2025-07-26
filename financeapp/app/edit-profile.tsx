import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { Eye, EyeOff, ArrowLeft, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import * as ImagePicker from 'expo-image-picker';
import { theme } from '@/theme';
import { useAuth } from '@/context/AuthContext';

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Função de selecionar imagem desabilitada temporariamente
  const handlePickImage = async () => {
    alert('Seleção de imagem desabilitada. Instale o expo-image-picker para ativar.');
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (typeof updateProfile === 'function') {
        await updateProfile({ name, avatar: avatar ?? undefined });
      }
      router.back();
    } catch (error) {
      alert('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <ScrollView
      style={[styles.content, { paddingTop: insets.top + theme.spacing.lg }]}
      showsVerticalScrollIndicator={false}
    >
      <View >
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Editar</Text>
          <Text style={styles.headerSubtitle}>Perfil</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.avatarContainer} onPress={handlePickImage}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <User size={48} color={theme.colors.primary} />
          </View>
        )}
        <Text style={styles.changePhotoText}>Alterar foto</Text>
      </TouchableOpacity>
      <View style={styles.form}>
        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Seu nome"
        />
        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          value={email}
          editable={false}
          placeholder="Seu e-mail"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={styles.label}>Nova senha</Text>
        <View style={{ position: 'relative' }}>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Digite uma nova senha"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(v => !v)}
            activeOpacity={0.7}
          >
            {showPassword ? <EyeOff size={22} color={theme.colors.textSecondary} /> : <Eye size={22} color={theme.colors.textSecondary} />}
          </TouchableOpacity>
        </View>
        <Text style={styles.label}>Confirmar nova senha</Text>
        <View style={{ position: 'relative' }}>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirme a nova senha"
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(v => !v)}
            activeOpacity={0.7}
          >
            {showConfirmPassword ? <EyeOff size={22} color={theme.colors.textSecondary} /> : <Eye size={22} color={theme.colors.textSecondary} />}
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color={theme.colors.surface} /> : <Text style={styles.saveButtonText}>Salvar</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
 
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: theme.spacing.sm,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 0,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginTop: -2,
    letterSpacing: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 18,
    top: 18,
    zIndex: 2,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primarySoft,
    marginBottom: 8,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  changePhotoText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  label: {
    fontSize: 15,
    color: theme.colors.text,
    marginBottom: 6,
    fontWeight: '500',
    marginLeft: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 12,
    padding: 14,
    backgroundColor: theme.colors.surface,
    fontSize: 16,
    marginBottom: 18,
    color: theme.colors.text,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonText: {
    color: theme.colors.surface,
    fontWeight: 'bold',
    fontSize: 18,
  },
});

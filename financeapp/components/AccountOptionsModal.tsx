import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { theme } from '@/theme';

export type AccountOptionsModalRef = {
  open: () => void;
  close: () => void;
};

type Props = {
  selectedAccount: any;
  includeInTotal: boolean;
  setIncludeInTotal: (v: boolean) => void;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export const AccountOptionsModal = React.forwardRef<AccountOptionsModalRef, Props>(
  ({ selectedAccount, includeInTotal, setIncludeInTotal, onClose, onEdit, onDelete }, ref) => {
    const modalRef = React.useRef<Modalize>(null);

    React.useImperativeHandle(ref, () => ({
      open: () => modalRef.current?.open(),
      close: () => modalRef.current?.close(),
    }));

    return (
      <Modalize
        ref={modalRef}
        modalHeight={340}
        handleStyle={{ backgroundColor: theme.colors.border }}
        modalStyle={{ backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}
        onClose={onClose}
      >
        {selectedAccount && (
          <View>
            <Text style={styles.title}>Mais opções</Text>
            <Text style={styles.label}>Saldo atual</Text>
            <Text style={[styles.input, { marginBottom: 12, borderWidth: 0, backgroundColor: 'transparent', color: theme.colors.text, paddingVertical: 0 }]}>
              R$ {Number(selectedAccount.balance || 0).toFixed(2)}
            </Text>
            <TouchableOpacity
              style={[
                styles.selectInput,
                {
                  marginBottom: 16,
                  borderStyle: 'solid',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: 8,
                },
              ]}
              onPress={() => setIncludeInTotal(!includeInTotal)}
              activeOpacity={0.7}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: theme.colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                  backgroundColor: includeInTotal ? theme.colors.primary : 'transparent',
                }}
              >
                {includeInTotal && <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: theme.colors.title }} />}
              </View>
              <Text style={{ color: theme.colors.text, fontSize: 16 }}>Incluir no saldo total</Text>
            </TouchableOpacity>
            <View style={{ gap: 10, marginTop: 8, paddingHorizontal: 0, paddingBottom: 0 }}>
              <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.colors.border, width: '100%' }]} onPress={onClose}>
                <Text style={[styles.saveButtonText, { color: theme.colors.text }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveButton, { width: '100%' }]} onPress={onEdit}>
                <Text style={styles.saveButtonText}>Editar conta</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.colors.error, width: '100%' }]} onPress={onDelete}>
                <Text style={styles.saveButtonText}>Excluir conta</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modalize>
    );
  }
);

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'left',
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
    color: theme.colors.text,
    marginBottom: 16,
    fontSize: 16,
  },
  selectInput: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 12,
    padding: 14,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    marginBottom: 16,
    fontSize: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: theme.colors.surface,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { AccountIconSelectorModal, AccountIconSelectorModalRef, AccountIconOption } from './AccountIconSelectorModal';

export const AddAccountForm = () => {
  const modalRef = useRef<AccountIconSelectorModalRef>(null);
  const [selectedIcon, setSelectedIcon] = useState<AccountIconOption | null>(null);

  // Log para depuração
  console.log('selectedIcon:', selectedIcon);

  return (
    <View>
      <TouchableOpacity
        onPress={() => modalRef.current?.open()}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          backgroundColor: '#fff',
        }}
      >
        {selectedIcon?.image ? (
          <Image
            source={selectedIcon.key === 'c6' ? { uri: 'https://via.placeholder.com/32.png' } : { ...selectedIcon.image }}
            style={{ width: 32, height: 32, marginRight: 12 }}
          />
        ) : (
          <Text style={{ fontSize: 32, marginRight: 12 }}>{selectedIcon?.emoji}</Text>
        )}
        <Text style={{ fontSize: 16, color: '#333' }}>{selectedIcon?.label || 'Selecionar banco'}</Text>
      </TouchableOpacity>
      <AccountIconSelectorModal
        ref={modalRef}
        onSelect={icon => setSelectedIcon({ ...icon, image: icon.image ? { ...icon.image } : undefined })}
        title="Selecionar ícone"
      />
    </View>
  );
};

export default AddAccountForm;

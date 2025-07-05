import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps, ViewStyle, StyleProp, TextStyle } from 'react-native';

interface InputLoginProps extends Omit<TextInputProps, 'style'> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

const InputLogin: React.FC<InputLoginProps> = ({
  leftIcon,
  rightIcon,
  style,
  containerStyle,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {leftIcon && (
        <View style={styles.iconLeft}>{leftIcon}</View>
      )}
      <TextInput
        style={[
          styles.input,
          leftIcon ? { paddingLeft: 40 } : {},
          rightIcon ? { paddingRight: 40 } : {},
          style,
        ]}
        placeholderTextColor="#A0A0A0"
        {...props}
      />
      {rightIcon && (
        <View style={styles.iconRight}>{rightIcon}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BDBDBD', // cinza
    paddingHorizontal: 0,
    marginBottom: 12,
    minHeight: 56, // altura maior
    height: 56, // altura fixa para padronizar
  },
  input: {
    flex: 1,
    fontSize: 17, // fonte maior
    color: '#444', // texto cinza escuro
    paddingVertical: 16, // padding maior
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
    height: 56, // altura fixa igual ao container
  },
  iconLeft: {
    position: 'absolute',
    left: 8,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    height: '100%',
    zIndex: 2,
  },
  iconRight: {
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    height: '100%',
    zIndex: 2,
  },
});

export default InputLogin;

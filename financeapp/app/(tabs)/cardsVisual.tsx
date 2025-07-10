// import React from 'react';
// import { View, Text, StyleSheet, ScrollView } from 'react-native';
// import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading';
// import { Header } from '@/components/Header';
// import { theme } from '@/theme';

// // Importe os ícones das bandeiras (adicione os arquivos na pasta assets)
// // import VisaLogo from '@/assets/visa.png';
// // import MastercardLogo from '@/assets/mastercard.png';

// export function CardVisual({
//   name = 'Sunny Aveiro',
//   number = '**** **** **** 1690',
//   exp = '01/22',
//   variant = 'visa', // 'visa' ou 'mastercard'
//   backgroundColor = '#232323', // preto padrão, roxo para mastercard
// }) {
//   return (
//     <View style={[styles.card, { backgroundColor }]}>
//       <Text style={styles.bankName}>Dutch Bangla Bank</Text>
//       <View style={styles.chipRow}>
//         <Text style={styles.cardNumber}>{number}</Text>
//       </View>
//       <Text style={styles.tier}>Platinum Plus</Text>
//       <View style={styles.bottomRow}>
//         <Text style={styles.exp}>Exp {exp}</Text>
//         {/* <Image
//           source={variant === 'visa' ? VisaLogo : MastercardLogo}
//           style={styles.logo}
//           resizeMode="contain"
//         /> */}
//       </View>
//       <Text style={styles.name}>{name}</Text>
//     </View>
//   );
// }

// export default function CardsVisualScreen() {
//   const { navigateBack } = useNavigationWithLoading();

//   const handleBackPress = () => {
//     navigateBack();
//   };

//   return (
//     <View style={styles.container}>
//       <Header 
//         title="Visualização do Cartão" 
//         onBackPress={handleBackPress}
//         showBackButton={true}
//         showNotification={false}
//       />
      
//       <ScrollView contentContainerStyle={styles.content}>
//         <CardVisual />
//         <CardVisual 
//           backgroundColor="#6A5ACD" 
//           variant="mastercard"
//           name="João Silva"
//           number="**** **** **** 2847"
//           exp="12/25"
//         />
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: theme.colors.background,
//   },
//   content: {
//     padding: theme.spacing.lg,
//     alignItems: 'center',
//   },
//   card: {
//     width: 320,
//     height: 200,
//     borderRadius: 18,
//     padding: 24,
//     marginVertical: 16,
//     justifyContent: 'space-between',
//     shadowColor: '#000',
//     shadowOpacity: 0.18,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   bankName: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold',
//     letterSpacing: 0.5,
//     marginBottom: 8,
//   },
//   chipRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   cardNumber: {
//     color: '#fff',
//     fontSize: 18,
//     letterSpacing: 2,
//     fontWeight: '600',
//   },
//   tier: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '500',
//     marginBottom: 12,
//   },
//   bottomRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   exp: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '400',
//   },
//   logo: {
//     width: 48,
//     height: 28,
//   },
//   name: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//     letterSpacing: 1,
//     marginTop: 8,
//   },
// });

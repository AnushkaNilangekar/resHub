import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AccountScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Placeholder for Account Screen</Text>
    </View>
  );
};

export default AccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

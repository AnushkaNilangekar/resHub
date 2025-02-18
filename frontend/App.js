import React from 'react';
import { StyleSheet, AppRegistry } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from "./navigation/StackNavigator";

export default function App() {

  return (
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
  );
}

AppRegistry.registerComponent('main', () => App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    width: '80%',
    paddingLeft: 10,
  },
  result: {
    fontSize: 18,
    marginTop: 20,
  },
});

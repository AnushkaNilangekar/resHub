import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Keyboard, TouchableWithoutFeedback, AppRegistry } from 'react-native';
import config from './config';
import UploadProfilePic from './UploadProfilePic';

export default function App() {
  const [num1, setNum1] = useState("");
  const [num2, setNum2] = useState("");
  const [result, setResult] = useState(null);

  const calculateSum = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/sum?a=${num1}&b=${num2}`);
      const data = await response.json();
      setResult(data.sum);
    } catch (error) {
      console.error("Error fetching sum: " + error);
    }
  };

  return (
    
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.text}>Sum Calculator</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter first number"
          keyboardType="numeric"
          value={num1}
          onChangeText={setNum1}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter second number"
          keyboardType="numeric"
          value={num2}
          onChangeText={setNum2}
        />
        <Button title="Get Sum" onPress={calculateSum} />
        {result !== null && <Text style={styles.result}>Sum: {result}</Text>}

        {/* Image Upload Component */}
        <UploadProfilePic />
      </View>
    </TouchableWithoutFeedback>
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

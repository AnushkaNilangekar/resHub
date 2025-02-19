import React, { useState, useContext } from "react";
import { View, Text, TextInput, Button, StyleSheet, Keyboard } from "react-native";
import config from '../config'; // Assuming you have a config file for API
import { AuthContext } from '../context/AuthContext'; // Import AuthContext
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import axios from 'axios';

const HomeScreen = () => {
  const [num1, setNum1] = useState("");
  const [num2, setNum2] = useState("");
  const [result, setResult] = useState(null);
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);

  const calculateSum = async () => {
    Keyboard.dismiss();
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`${config.API_BASE_URL}/api/sum`, {
        params: {
          a: num1,
          b: num2,
        },
        headers: {
          'Authorization': `Bearer ${token}`, // if using JWT
        }
      });
      const data = await response;
      setResult(data.data.sum);
    } catch (error) {
      console.error("Error fetching sum: " + error);
    }
  };

  return (
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

      {result !== null ? <Text style={styles.result}>Sum: {result}</Text> : null}

      <Button title="Logout" onPress={() => logout()}  />
      <Button title="Go to Details" onPress={() => navigation.navigate("Details")} />
      <Button title="Go to Profile set up" onPress={() => navigation.navigate("Profile")} />
      <Button title="Upload Profile Picture" onPress={() => navigate("UploadProfilePic")} />
        
    </View>
  );
};

export default HomeScreen;

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

import React from 'react';
import { View, Text, StyleSheet, AppRegistry } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello, World!</Text>
    </View>
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
  },
});

// export default function App()
// {
//     const [num1, setNum1] = useState("");
//     const [num2, setNum2] = useState("");
//     const [result, setResult] = useState(null);

//     const calculateSum = async () => {
//         try
//         {
//             const response = await fetch('http://localhost:8080/api/sum?num1=5&num2=10');
//             const data = await response.json();
//             setSum = data.sum;
//         }
//         catch (error)
//         {
//             console.error("Error fetching sum: " + error);
//         }
//     };

//     return (
//         <View style={styles.container}>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter first number"
//             keyboardType="numeric"
//             value={num1}
//             onChangeText={setNum1}
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Enter second number"
//             keyboardType="numeric"
//             value={num2}
//             onChangeText={setNum2}
//           />
//           <Button title="Get Sum" onPress={calculateSum} />
//           {result !== null && <Text style={styles.result}>Sum: {result}</Text>}
//         </View>
//     );
// }
    
// const styles = StyleSheet.create({
//     container: { flex: 1, justifyContent: "center", padding: 20 },
//     input: {
//     height: 40,
//     borderColor: "gray",
//     borderWidth: 1,
//     marginBottom: 10,
//     paddingHorizontal: 10,
//     },
//     result: { fontSize: 20, marginTop: 10 },
// });
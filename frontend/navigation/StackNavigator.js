import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import DetailsScreen from "../screens/DetailsScreen";
import MatchesTabNavigator from "../screens/MatchesScreen";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
      <Stack.Screen
        name="MatchesAndConversations"
        component={MatchesTabNavigator}
        options={{
          headerTitle: "Matches",
        }}
      />
    </Stack.Navigator>
  );
};

export default StackNavigator;

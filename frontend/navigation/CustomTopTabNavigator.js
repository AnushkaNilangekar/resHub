import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const CustomTopTabNavigator = ({ tabs }) => {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.tabContainer}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.tabButton,
              selectedTab === index && styles.selectedTabButton,
            ]}
            onPress={() => setSelectedTab(index)}
          >
            <Text style={styles.tabText}>{tab.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ flex: 1 }}>
        {tabs[selectedTab] && tabs[selectedTab].component}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#ddd',
  },
  tabButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  selectedTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#007bff',
  },
  tabText: {
    fontSize: 16,
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomTopTabNavigator;

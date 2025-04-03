// NotificationBanner.js

import React, { useState, useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

const NotificationBanner = ({ message, visible, onClose }) => {
    const slideAnim = useState(new Animated.Value(-100))[0];
    const fadeAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setTimeout(() => {
                    Animated.parallel([
                        Animated.timing(slideAnim, {
                            toValue: -100,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                        Animated.timing(fadeAnim, {
                            toValue: 0,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                    ]).start(onClose);
                }, 3000); // Display for 3 seconds
            });
        }
    }, [visible]);

    return (
        <Animated.View
            style={[
                styles.banner,
                {
                    transform: [{ translateY: slideAnim }],
                    opacity: fadeAnim,
                },
            ]}
        >
            <Text style={styles.text}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    banner: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 15,
        borderRadius: 8,
        zIndex: 1000,
    },
    text: {
        color: 'white',
        textAlign: 'center',
    },
});

export default NotificationBanner;

/*import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const NotificationBanner = ({ notification, onDismiss }) => {
  const navigation = useNavigation();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const timeout = useRef(null);

  useEffect(() => {
    // Slide in animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto dismiss after 4 seconds
    timeout.current = setTimeout(() => {
      dismiss();
    }, 4000);

    return () => {
      clearTimeout(timeout.current);
    };
  }, []);

  const dismiss = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (onDismiss) onDismiss();
    });
  };

  const handlePress = () => {
    clearTimeout(timeout.current);
    dismiss();
    
    // Navigate based on notification type
    if (notification.type === 'MESSAGE') {
      navigation.navigate('MessageScreen', { 
        userId: notification.senderId,
        userName: notification.senderName
      });
    } else if (notification.type === 'MATCH') {
      navigation.navigate('ChatScreen', { 
        userId: notification.senderId 
      });
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'MESSAGE':
        return 'chat';
      case 'MATCH':
        return 'favorite';
      default:
        return 'notifications';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity style={styles.content} onPress={handlePress}>
        <View style={styles.iconContainer}>
          <Icon name={getIcon()} size={24} color="#fff" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {notification.type === 'MESSAGE' ? 'New Message' : 'New Match'}
          </Text>
          <Text style={styles.message} numberOfLines={1}>
            {notification.content}
          </Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={dismiss}>
          <Icon name="close" size={20} color="#999" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  message: {
    fontSize: 13,
    color: '#666',
  },
  closeButton: {
    padding: 5,
  },
});

export default NotificationBanner;*/
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config';

const AccountService = {
  /**
   * Delete a user's account by first deleting profile then authentication data
   * 
   * @returns {Promise} with result of the operation
   */
  deleteAccount: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      
      if (!token || !userId) {
        throw new Error('No authentication token or user ID found');
      }
      
      // Step 1: Delete profile data
      const profileResponse = await axios.delete(`${config.API_BASE_URL}/api/deleteProfile`, {
        params: { userId },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (profileResponse.status !== 200) {
        throw new Error('Failed to delete profile data');
      }
      
      // Step 2: Delete authentication account
      // Note: The backend now handles deleting swipes, chats, and matches as part of this endpoint
      const authResponse = await axios.delete(`${config.API_BASE_URL}/api/deleteAccount`, {
        params: { userId },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (authResponse.status !== 200) {
        throw new Error('Failed to delete authentication account');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error in account deletion:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  },

  /**
   * Manually delete a user's swipe history if needed
   * Note: This is usually handled by the backend deleteAccount endpoint
   * 
   * @returns {Promise} with result of the operation
   */
  deleteSwipeData: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      
      if (!token || !userId) {
        throw new Error('No authentication token or user ID found');
      }
      
      // This endpoint would need to be implemented on backend if needed separately
      const response = await axios.delete(`${config.API_BASE_URL}/api/swipes/deleteUserSwipes`, {
        params: { userId },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.status !== 200) {
        throw new Error('Failed to delete swipe data');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting swipe data:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  },
  
  /**
   * Manually delete a user's chat history if needed
   * Note: This is usually handled by the backend deleteAccount endpoint
   * 
   * @returns {Promise} with result of the operation
   */
  deleteChatData: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      
      if (!token || !userId) {
        throw new Error('No authentication token or user ID found');
      }
      
      // This endpoint would need to be implemented on backend if needed separately
      const response = await axios.delete(`${config.API_BASE_URL}/api/users/deleteUserChats`, {
        params: { userId },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.status !== 200) {
        throw new Error('Failed to delete chat data');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting chat data:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  }
};

export default AccountService;
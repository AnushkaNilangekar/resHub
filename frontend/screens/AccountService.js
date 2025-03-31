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
  }
};

export default AccountService;
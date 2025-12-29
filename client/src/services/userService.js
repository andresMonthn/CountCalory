import axios from 'axios';
import { getUserFromDB, saveUserToDB } from './db';
import { API_URL } from '../config/api';

export const userProfileService = {
  // Fetch user profile with caching strategy
  getProfile: async (userId) => {
    try {
      // 1. Try to get from IndexedDB (Cache First)
      const cachedUser = await getUserFromDB(userId);
      
      if (cachedUser) {
        console.log('📦 Loaded profile from IndexedDB cache');
        // Trigger background sync if needed, or just return cached
        // For now, we return cached, but we could also fetch fresh in background
        // returning both allows the UI to show cached immediately and update later
      }

      // 2. Network request (Stale-while-revalidate pattern could be implemented in the component)
      // For this service, we'll expose the fetch method separate or combined.
      // Let's return the cached version if exists, but we also want to ensure freshness.
      
      return cachedUser;
    } catch (error) {
      console.error('Error fetching from DB:', error);
      return null;
    }
  },

  fetchFromNetwork: async () => {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) throw new Error('No auth data');

        // Use GET /profile with Bearer token
        const { data } = await axios.get(`${API_URL}/auth/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        // Update Cache
        await saveUserToDB(data);
        return data;
    } catch (error) {
        console.error('Network fetch failed:', error);
        throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      // 1. Update Server
      const { data } = await axios.put(`${API_URL}/auth/profile`, profileData);
      
      // 2. Update IndexedDB (Cache Invalidation/Update)
      await saveUserToDB(data);
      
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  
  syncProfile: async (userId) => {
      // Helper to force sync
      try {
          const freshData = await userProfileService.fetchFromNetwork();
          return freshData;
      } catch (e) {
          return null;
      }
  }
};

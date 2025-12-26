import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userProfileService } from './userService';
import * as db from './db';
import axios from 'axios';
import 'fake-indexeddb/auto';

// Mock axios
vi.mock('axios');

describe('UserService Persistence', () => {
  const mockUser = {
    _id: 'user123',
    weight: 75,
    height: 180,
    age: 30,
    activityLevel: 'moderate'
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    // Clear DB
    const database = await db.openDB();
    const transaction = database.transaction(['user_profile'], 'readwrite');
    transaction.objectStore('user_profile').clear();
  });

  it('should fetch profile from IndexedDB if available (Cache Hit)', async () => {
    // Seed DB
    await db.saveUserToDB(mockUser);

    const profile = await userProfileService.getProfile('user123');
    
    expect(profile).toEqual(expect.objectContaining({
      _id: 'user123',
      weight: 75
    }));
  });

  it('should return null if IndexedDB is empty (Cache Miss)', async () => {
    const profile = await userProfileService.getProfile('nonexistent');
    expect(profile).toBeUndefined();
  });

  it('should update both API and IndexedDB on updateProfile', async () => {
    // Mock API response
    const updatedUser = { ...mockUser, weight: 80 };
    axios.put.mockResolvedValue({ data: updatedUser });

    // Perform update
    const result = await userProfileService.updateProfile({ weight: 80 });

    // Check API call
    expect(axios.put).toHaveBeenCalledWith(expect.stringContaining('/auth/profile'), { weight: 80 });
    expect(result.weight).toBe(80);

    // Check IndexedDB
    const cached = await db.getUserFromDB('user123');
    expect(cached).toEqual(expect.objectContaining({ weight: 80 }));
  });

  it('should fetch from network and update cache', async () => {
    // Mock API response for GET /profile
    axios.get.mockResolvedValue({ data: mockUser });
    
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn((key) => {
        if (key === 'token') return 'fake-token';
        return null;
      })
    };
    global.localStorage = localStorageMock;

    const fresh = await userProfileService.fetchFromNetwork();
    
    expect(fresh).toEqual(mockUser);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/auth/profile'), expect.any(Object));
    
    // Check if it was saved to DB
    const cached = await db.getUserFromDB('user123');
    expect(cached).toEqual(expect.objectContaining({ _id: 'user123' }));
  });
});

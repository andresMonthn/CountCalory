import axios from 'axios';
import { API_URL } from '../config/api';

const API_SUMMARY = API_URL + '/summary';

export async function getSummaryHistory() {
  try {
    const token = localStorage.getItem('token');
    const headers = { 'Accept': 'application/json' };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await axios.get(API_SUMMARY, { headers });
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error("Error fetching summary history:", error);
    // Return empty array instead of throwing to prevent UI crash
    return [];
  }
}

export async function saveSummaryData(payload) {
  try {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await axios.post(API_SUMMARY, payload, { headers });
    return res.data;
  } catch (error) {
    const errorData = error.response ? JSON.stringify(error.response.data) : error.message;
    throw new Error(`HTTP Error: ${errorData}`);
  }
}

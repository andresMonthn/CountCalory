import axios from 'axios';
import { API_URL } from '../config/api';

const API_SUMMARY = API_URL + '/summary';

export async function getSummaryHistory() {
  try {
    const res = await axios.get(API_SUMMARY, { headers: { 'Accept': 'application/json' } });
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error("Error fetching summary history:", error);
    return [];
  }
}

export async function saveSummaryData(payload) {
  try {
    const res = await axios.post(API_SUMMARY, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    return res.data;
  } catch (error) {
    const errorData = error.response ? JSON.stringify(error.response.data) : error.message;
    throw new Error(`HTTP Error: ${errorData}`);
  }
}

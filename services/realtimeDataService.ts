import type { RealtimeStationData } from '../types';

const TARGET_API_URL = 'https://api.citybik.es/v2/networks/belfast-bikes';
// Switched to a more reliable CORS proxy to bypass the browser's same-origin policy.
const API_URL = `https://cors.eu.org/${TARGET_API_URL}`;

export const fetchRealtimeData = async (): Promise<Map<string, RealtimeStationData>> => {
  let response: Response;
  try {
    response = await fetch(API_URL);
  } catch (error) {
    console.error("Failed to fetch real-time bike data (Network Error):", error);
    throw new Error("Network connection failed. Please check your internet connection.");
  }
  
  if (!response.ok) {
     console.error("Failed to fetch real-time bike data (Bad Response):", response.status, response.statusText);
    throw new Error(`Live data service returned an error: ${response.status} ${response.statusText}`);
  }

  try {
    const data = await response.json();
    const stationDataMap = new Map<string, RealtimeStationData>();

    if (data.network && data.network.stations) {
      for (const station of data.network.stations) {
        if (station.id && typeof station.free_bikes !== 'undefined' && typeof station.empty_slots !== 'undefined') {
            stationDataMap.set(station.id, {
              free_bikes: station.free_bikes,
              empty_slots: station.empty_slots,
            });
        }
      }
    }
    return stationDataMap;
  } catch (error) {
     console.error("Failed to parse real-time bike data:", error);
    throw new Error("Failed to parse live station data. The format might be incorrect.");
  }
};

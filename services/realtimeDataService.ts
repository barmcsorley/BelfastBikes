import type { RealtimeStationData } from '../types';

const TARGET_API_URL = 'https://api.citybik.es/v2/networks/belfast-bikes';
// Using a CORS proxy to bypass the browser's same-origin policy for local development.
const API_URL = `https://api.allorigins.win/raw?url=${encodeURIComponent(TARGET_API_URL)}`;

export const fetchRealtimeData = async (): Promise<Map<string, RealtimeStationData>> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
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
    console.error("Failed to fetch real-time bike data:", error);
    throw new Error("Could not load live station data.");
  }
};

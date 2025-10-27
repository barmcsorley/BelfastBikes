export type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type WeatherCondition = 'Clear' | 'Rainy' | 'Windy';

export interface HistoricalData {
  weekday: { [hour: string]: number };
  weekend: { [hour: string]: number };
}

export interface Station {
  id: number;
  apiId: string;
  name: string;
  totalDocks: number;
  historicalData: HistoricalData;
}

export interface RealtimeStationData {
  free_bikes: number;
  empty_slots: number;
}

import type { Station, Day } from '../types';

const generateHourlyData = (pattern: 'commuter_am_out' | 'commuter_pm_in' | 'city_centre' | 'residential' | 'stable') => {
  const data: { [hour: string]: number } = {};
  for (let i = 0; i < 24; i++) {
    const hour = String(i);
    let baseBikes: number;
    switch (pattern) {
      case 'commuter_am_out': // e.g., residential area, people take bikes in morning
        if (i >= 7 && i <= 9) baseBikes = 2;
        else if (i >= 17 && i <= 19) baseBikes = 15;
        else baseBikes = 10;
        break;
      case 'commuter_pm_in': // e.g., business district, people arrive in morning
        if (i >= 7 && i <= 9) baseBikes = 18;
        else if (i >= 17 && i <= 19) baseBikes = 5;
        else baseBikes = 10;
        break;
      case 'city_centre': // Busy during day, lower at night
        if (i >= 9 && i <= 17) baseBikes = 6;
        else baseBikes = 12;
        break;
      case 'residential':
         if (i >= 8 && i <= 18) baseBikes = 8;
         else baseBikes = 16;
         break;
      case 'stable':
      default:
        baseBikes = 10;
        break;
    }
    data[hour] = baseBikes + Math.floor(Math.random() * 5) - 2; // Add some noise
    data[hour] = Math.max(0, Math.min(20, data[hour])); // Clamp between 0 and 20
  }
  return data;
};


export const STATIONS: Station[] = [
  {
    id: 1,
    apiId: "a9853a4e2353e62e49c5e7b458d3434d",
    name: "City Hall",
    totalDocks: 25,
    historicalData: {
      weekday: generateHourlyData('commuter_pm_in'),
      weekend: generateHourlyData('city_centre'),
    },
  },
  {
    id: 2,
    apiId: "d2b5134707f71b489a117b4478175d26",
    name: "Botanic Gardens",
    totalDocks: 20,
    historicalData: {
      weekday: generateHourlyData('residential'),
      weekend: generateHourlyData('city_centre'),
    },
  },
  {
    id: 3,
    apiId: "23c10a4025d507a2a16d8e2e2c07659b",
    name: "Lanyon Place Station",
    totalDocks: 30,
    historicalData: {
      weekday: generateHourlyData('commuter_am_out'),
      weekend: generateHourlyData('stable'),
    },
  },
  {
    id: 4,
    apiId: "18501da8695f2e91244e83f733804369",
    name: "Titanic Quarter",
    totalDocks: 22,
    historicalData: {
      weekday: generateHourlyData('commuter_pm_in'),
      weekend: generateHourlyData('city_centre'),
    },
  },
   {
    id: 5,
    apiId: "e63450a80e649514742a77f2452c66d8",
    name: "Queen's University",
    totalDocks: 28,
    historicalData: {
      weekday: generateHourlyData('commuter_pm_in'),
      weekend: generateHourlyData('residential'),
    },
  },
];


export type { Day } from '../types';
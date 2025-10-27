import { GoogleGenAI, Type } from "@google/genai";
import type { Station, Day, WeatherCondition, RealtimeStationData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const schema = {
  type: Type.OBJECT,
  properties: {
    predictedBikes: {
      type: Type.INTEGER,
      description: 'The predicted number of available bikes as a whole number.',
    },
  },
  required: ['predictedBikes'],
};

export const predictBikeAvailability = async (
  station: Station, 
  day: Day, 
  time: number,
  weather: WeatherCondition,
  realtimeData: RealtimeStationData | null
): Promise<number> => {
  const dataKey = ['Saturday', 'Sunday'].includes(day) ? 'weekend' : 'weekday';
  const historicalData = station.historicalData[dataKey];
  
  const prompt = `
    You are a predictive model for the Belfast Bikes sharing scheme. Your task is to predict the number of available bikes at a specific station based on historical patterns and current conditions.

    Station Details:
    - Name: ${station.name}
    - Total Docks: ${station.totalDocks}

    Contextual Information:
    - Requested Day: ${day}
    - Requested Time: ${time}:00
    - Weather Forecast: ${weather}
    ${realtimeData ? `- Current Real-time Availability: ${realtimeData.free_bikes} bikes available right now.` : ''}

    Task:
    Analyze the provided historical data in conjunction with the weather and real-time context. Heavy rain or strong wind typically reduces bike usage. Good weather increases it. The current availability provides a very recent baseline.

    Historical average availability for a typical ${dataKey}:
    ${JSON.stringify(historicalData, null, 2)}

    Based on all available information, predict the number of available bikes for the requested day and time. The prediction must be a whole number between 0 and the total number of docks (${station.totalDocks}).

    Provide your answer ONLY in the specified JSON format. Do not include any other text, explanation, or markdown formatting.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonString = response.text.trim();
    const parsedResponse = JSON.parse(jsonString);
    
    if (typeof parsedResponse.predictedBikes === 'number') {
      // Ensure prediction is within valid range
      return Math.max(0, Math.min(station.totalDocks, Math.round(parsedResponse.predictedBikes)));
    } else {
      throw new Error("Invalid prediction format received from AI.");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get a valid prediction from the AI model.");
  }
};

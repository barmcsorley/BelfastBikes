import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { STATIONS } from './data/mockBikeData';
import { predictBikeAvailability } from './services/bikePredictionService';
import { fetchRealtimeData } from './services/realtimeDataService';
import { BikeIcon, GithubIcon, LoaderIcon, ServerIcon, SparklesIcon, SunIcon, CloudRainIcon, WindIcon, InfoIcon } from './components/Icons';
import type { Day, WeatherCondition, RealtimeStationData } from './types';

const daysOfWeek: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const weatherConditions: WeatherCondition[] = ['Clear', 'Rainy', 'Windy'];

export default function App() {
  const [selectedStationId, setSelectedStationId] = useState<number>(STATIONS[0].id);
  const [selectedDay, setSelectedDay] = useState<Day>('Monday');
  const [selectedWeather, setSelectedWeather] = useState<WeatherCondition>('Clear');
  const [selectedTime, setSelectedTime] = useState<number>(12);
  
  const [prediction, setPrediction] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [realtimeDataMap, setRealtimeDataMap] = useState<Map<string, RealtimeStationData> | null>(null);
  const [isRealtimeLoading, setIsRealtimeLoading] = useState<boolean>(true);
  const [realtimeError, setRealtimeError] = useState<string | null>(null);

  const selectedStation = useMemo(() => STATIONS.find(s => s.id === selectedStationId) || STATIONS[0], [selectedStationId]);
  
  const currentRealtimeData = useMemo(() => {
    return realtimeDataMap?.get(selectedStation.apiId) ?? null;
  }, [realtimeDataMap, selectedStation]);


  useEffect(() => {
    async function loadRealtimeData() {
      try {
        setIsRealtimeLoading(true);
        setRealtimeError(null);
        const data = await fetchRealtimeData();
        setRealtimeDataMap(data);
      } catch (e) {
        setRealtimeError('Could not load live station data.');
        console.error(e);
      } finally {
        setIsRealtimeLoading(false);
      }
    }
    loadRealtimeData();
  }, []);

  const chartData = useMemo(() => {
    const dataKey = ['Saturday', 'Sunday'].includes(selectedDay) ? 'weekend' : 'weekday';
    const historicalData = selectedStation.historicalData[dataKey];
    return Object.entries(historicalData).map(([hour, bikes]) => ({
      hour: `${hour.padStart(2, '0')}:00`,
      'Avg. Bikes': bikes,
    }));
  }, [selectedStation, selectedDay]);

  const handlePredict = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setPrediction(null);
    try {
      const result = await predictBikeAvailability(selectedStation, selectedDay, selectedTime, selectedWeather, currentRealtimeData);
      setPrediction(result);
    } catch (e) {
      setError('Failed to get a prediction. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStation, selectedDay, selectedTime, selectedWeather, currentRealtimeData]);
  
  const WeatherIcon = ({ weather, ...props }: { weather: WeatherCondition } & React.SVGProps<SVGSVGElement>) => {
    switch (weather) {
      case 'Clear': return <SunIcon {...props} />;
      case 'Rainy': return <CloudRainIcon {...props} />;
      case 'Windy': return <WindIcon {...props} />;
      default: return null;
    }
  };


  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <BikeIcon className="h-8 w-8 text-cyan-400" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Belfast Bikes Predictor
            </h1>
          </div>
          <a
            href="https://github.com/google/generative-ai-docs/tree/main/site/en/gemini-api/docs/applications/prompt_gallery"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-cyan-400 transition-colors"
            aria-label="GitHub Repository"
          >
            <GithubIcon className="h-6 w-6" />
          </a>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 bg-slate-800/50 rounded-xl p-6 border border-slate-700 shadow-lg">
            <h2 className="text-xl font-semibold mb-6 text-cyan-400 flex items-center"><ServerIcon className="w-5 h-5 mr-2" />Controls</h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="station-select" className="block text-sm font-medium text-slate-300 mb-2">
                  1. Select Station
                </label>
                <select
                  id="station-select"
                  value={selectedStationId}
                  onChange={(e) => setSelectedStationId(Number(e.target.value))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                >
                  {STATIONS.map(station => (
                    <option key={station.id} value={station.id}>{station.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <span className="block text-sm font-medium text-slate-300 mb-2">
                  2. Select Weather
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {weatherConditions.map(weather => (
                    <button
                      key={weather}
                      onClick={() => setSelectedWeather(weather)}
                      className={`px-3 py-2 text-sm rounded-md transition-colors font-semibold flex items-center justify-center gap-2 ${selectedWeather === weather ? 'bg-cyan-500 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
                    >
                      <WeatherIcon weather={weather} className="w-4 h-4" />
                      {weather}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-sm font-medium text-slate-300 mb-2">
                  3. Select Day
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {daysOfWeek.map(day => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-3 py-2 text-sm rounded-md transition-colors font-semibold ${selectedDay === day ? 'bg-cyan-500 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="time-slider" className="block text-sm font-medium text-slate-300 mb-2">
                  4. Select Time: <span className="font-bold text-cyan-400">{String(selectedTime).padStart(2, '0')}:00</span>
                </label>
                <input
                  id="time-slider"
                  type="range"
                  min="0"
                  max="23"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                 <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>00:00</span>
                    <span>12:00</span>
                    <span>23:00</span>
                </div>
              </div>

              <button
                onClick={handlePredict}
                disabled={isLoading}
                className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? (
                  <>
                    <LoaderIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Predicting...
                  </>
                ) : (
                  <>
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Predict Availability
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-8">
             <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-cyan-400 flex items-center">
                    <InfoIcon className="w-5 h-5 mr-2"/>
                    Live Station Status: {selectedStation.name}
                </h2>
                {isRealtimeLoading && (
                     <div className="flex items-center justify-center h-24 bg-slate-800 rounded-lg">
                        <LoaderIcon className="h-8 w-8 text-cyan-400 animate-spin"/>
                     </div>
                )}
                {realtimeError && !isRealtimeLoading && (
                    <div className="flex items-center justify-center h-24 bg-red-900/20 border border-red-500 rounded-lg text-red-300 p-4">
                        <p>{realtimeError}</p>
                    </div>
                )}
                {currentRealtimeData && !isRealtimeLoading && (
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="text-4xl font-bold text-white">{currentRealtimeData.free_bikes}</p>
                            <p className="text-sm text-slate-400">Bikes Available</p>
                        </div>
                         <div>
                            <p className="text-4xl font-bold text-white">{currentRealtimeData.empty_slots}</p>
                            <p className="text-sm text-slate-400">Empty Docks</p>
                        </div>
                    </div>
                )}
                 {!currentRealtimeData && !isRealtimeLoading && !realtimeError && (
                    <div className="flex items-center justify-center h-24 bg-slate-800 rounded-lg">
                        <p className="text-slate-400">Live data not available for this station.</p>
                    </div>
                 )}
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-cyan-400">Prediction Result</h2>
                {isLoading && (
                   <div className="flex flex-col items-center justify-center h-48 bg-slate-800 rounded-lg">
                        <LoaderIcon className="h-12 w-12 text-cyan-400 animate-spin mb-4"/>
                        <p className="text-slate-300">Training the model and making a prediction...</p>
                   </div>
                )}
                 {error && (
                    <div className="flex flex-col items-center justify-center h-48 bg-red-900/20 border border-red-500 rounded-lg text-red-300 p-4">
                        <p className="font-semibold">Error</p>
                        <p>{error}</p>
                    </div>
                 )}
                 {prediction !== null && !isLoading && (
                    <div className="flex flex-col items-center justify-center h-48 bg-gradient-to-br from-cyan-900/50 to-slate-800 rounded-lg">
                        <p className="text-slate-300 text-lg">Predicted available bikes at {String(selectedTime).padStart(2, '0')}:00</p>
                        <p className="text-7xl font-bold text-white my-2">{prediction}</p>
                        <p className="text-slate-400">out of {selectedStation.totalDocks} total docks</p>
                    </div>
                 )}
                 {prediction === null && !isLoading && !error && (
                    <div className="flex flex-col items-center justify-center h-48 bg-slate-800 rounded-lg">
                        <p className="text-slate-400">Set your parameters and click predict to see the result.</p>
                    </div>
                 )}
            </div>
            
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 shadow-lg h-96">
                <h2 className="text-xl font-semibold mb-4 text-cyan-400">Historical Data: {selectedDay}</h2>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} domain={[0, selectedStation.totalDocks]} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #334155',
                                color: '#e2e8f0'
                            }}
                            cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}
                        />
                        <Legend wrapperStyle={{fontSize: "14px"}} />
                        <Bar dataKey="Avg. Bikes" fill="#22d3ee" barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
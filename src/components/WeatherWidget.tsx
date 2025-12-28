import { useState } from 'react';
import { fetchWeather } from '../services/api';
import type { WeatherData } from '../types/api';

/**
 * 天気情報ウィジェット
 * APIモックのデモ用コンポーネント
 */
export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState('Tokyo');

  // 天気情報を取得
  const handleFetchWeather = async () => {
    setLoading(true);
    setError(null);

    const result = await fetchWeather(city);

    if (result.success && result.data) {
      setWeather(result.data);
    } else {
      setError(result.error || '天気情報の取得に失敗しました');
      setWeather(null);
    }

    setLoading(false);
  };

  return (
    <div className="weather-widget" data-testid="weather-widget">
      <h3>天気情報</h3>

      <div className="weather-form">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="都市名を入力"
          aria-label="都市名"
          disabled={loading}
        />
        <button
          onClick={handleFetchWeather}
          disabled={loading || !city.trim()}
          aria-label="天気を取得"
        >
          {loading ? '取得中...' : '取得'}
        </button>
      </div>

      {error && (
        <div className="weather-error" role="alert">
          {error}
        </div>
      )}

      {weather && (
        <div className="weather-info" data-testid="weather-info">
          <div className="weather-city">{weather.city}</div>
          <div className="weather-temp">{weather.temperature}°C</div>
          <div className="weather-condition">{weather.condition}</div>
          <div className="weather-humidity">湿度: {weather.humidity}%</div>
        </div>
      )}
    </div>
  );
}

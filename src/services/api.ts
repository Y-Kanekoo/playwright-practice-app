import type { WeatherData, UserStats, ApiResponse } from '../types/api';

// APIのベースURL
const API_BASE_URL = '/api';

/**
 * 天気情報を取得する
 */
export async function fetchWeather(city: string): Promise<ApiResponse<WeatherData>> {
  try {
    const response = await fetch(`${API_BASE_URL}/weather?city=${encodeURIComponent(city)}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '天気情報の取得に失敗しました',
    };
  }
}

/**
 * ユーザー統計を取得する
 */
export async function fetchUserStats(userId: string): Promise<ApiResponse<UserStats>> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/stats`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '統計情報の取得に失敗しました',
    };
  }
}

/**
 * TODOをサーバーに保存する（シミュレーション）
 */
export async function saveTodos(todos: unknown[]): Promise<ApiResponse<{ saved: number }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ todos }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'TODOの保存に失敗しました',
    };
  }
}

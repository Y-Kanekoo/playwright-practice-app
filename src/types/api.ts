// API関連の型定義

// 天気情報の型
export interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  icon: string;
}

// APIレスポンスの型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ユーザー統計の型
export interface UserStats {
  totalTodos: number;
  completedTodos: number;
  streak: number;
}

// TODOアイテムの型定義
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

// ユーザーの型定義
export interface User {
  email: string;
  name: string;
}

// ログインフォームの型定義
export interface LoginFormData {
  email: string;
  password: string;
}

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User } from '../types';

// 認証コンテキストの型定義
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

// コンテキスト作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// テスト用のモックユーザー
const MOCK_USERS = [
  { email: 'test@example.com', password: 'password123', name: 'テストユーザー' },
  { email: 'admin@example.com', password: 'admin123', name: '管理者' },
];

// 認証プロバイダーコンポーネント
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // ログイン処理（モック）
  const login = async (email: string, password: string): Promise<boolean> => {
    // 実際のAPIコールをシミュレート
    await new Promise((resolve) => setTimeout(resolve, 500));

    const foundUser = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      setUser({ email: foundUser.email, name: foundUser.name });
      return true;
    }
    return false;
  };

  // ログアウト処理
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: user !== null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// カスタムフック
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

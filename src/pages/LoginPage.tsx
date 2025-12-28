import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

// ログインページ
export function LoginPage() {
  const { isAuthenticated } = useAuth();

  // すでにログイン済みの場合はTODOページへリダイレクト
  if (isAuthenticated) {
    return <Navigate to="/todos" replace />;
  }

  return (
    <div className="page login-page">
      <h1>ログイン</h1>
      <LoginForm />
    </div>
  );
}

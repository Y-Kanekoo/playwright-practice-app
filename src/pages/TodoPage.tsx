import { TodoList } from '../components/TodoList';
import { WeatherWidget } from '../components/WeatherWidget';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';

// TODOページ
export function TodoPage() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // 未ログインの場合はログインページへリダイレクト
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // ログアウト処理
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="page todo-page">
      <header className="page-header">
        <h1>TODOリスト</h1>
        <div className="user-info">
          <span>ようこそ、{user?.name}さん</span>
          <button onClick={handleLogout} className="logout-button">
            ログアウト
          </button>
        </div>
      </header>
      <TodoList />
      <WeatherWidget />
    </div>
  );
}

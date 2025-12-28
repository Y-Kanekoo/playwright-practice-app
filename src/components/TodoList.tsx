import { useState } from 'react';
import type { Todo } from '../types';
import { TodoItem } from './TodoItem';

// TODOリストコンポーネント
export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // 新しいTODOを追加
  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoText.trim() === '') return;

    const newTodo: Todo = {
      id: Date.now().toString(),
      text: newTodoText.trim(),
      completed: false,
      createdAt: new Date(),
    };

    setTodos([...todos, newTodo]);
    setNewTodoText('');
  };

  // TODOの完了状態を切り替え
  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // TODOを削除
  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // TODOを編集
  const editTodo = (id: string, newText: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, text: newText } : todo
      )
    );
  };

  // 完了済みをすべて削除
  const clearCompleted = () => {
    setTodos(todos.filter((todo) => !todo.completed));
  };

  // フィルタリング
  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  // 統計情報
  const activeTodoCount = todos.filter((todo) => !todo.completed).length;
  const completedTodoCount = todos.filter((todo) => todo.completed).length;

  return (
    <div className="todo-list-container">
      {/* 新規TODO入力フォーム */}
      <form onSubmit={addTodo} className="add-todo-form">
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="新しいタスクを入力..."
          aria-label="新しいタスク"
        />
        <button type="submit">追加</button>
      </form>

      {/* フィルターボタン */}
      <div className="filter-buttons" role="group" aria-label="タスクフィルター">
        <button
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'active' : ''}
          aria-pressed={filter === 'all'}
        >
          すべて ({todos.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={filter === 'active' ? 'active' : ''}
          aria-pressed={filter === 'active'}
        >
          未完了 ({activeTodoCount})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={filter === 'completed' ? 'active' : ''}
          aria-pressed={filter === 'completed'}
        >
          完了済み ({completedTodoCount})
        </button>
      </div>

      {/* TODOリスト */}
      {filteredTodos.length === 0 ? (
        <p className="empty-message">
          {filter === 'all'
            ? 'タスクがありません。新しいタスクを追加してください。'
            : filter === 'active'
            ? '未完了のタスクはありません。'
            : '完了済みのタスクはありません。'}
        </p>
      ) : (
        <ul className="todo-list" aria-label="タスク一覧">
          {filteredTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onEdit={editTodo}
            />
          ))}
        </ul>
      )}

      {/* フッター（完了済みを削除） */}
      {completedTodoCount > 0 && (
        <div className="todo-footer">
          <button onClick={clearCompleted} className="clear-completed">
            完了済みを削除 ({completedTodoCount})
          </button>
        </div>
      )}
    </div>
  );
}

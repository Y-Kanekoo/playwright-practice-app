import type { Todo } from '../types';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
}

// TODOアイテムコンポーネント
export function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  // 編集モードの処理
  const handleEdit = () => {
    const newText = prompt('タスクを編集', todo.text);
    if (newText !== null && newText.trim() !== '') {
      onEdit(todo.id, newText.trim());
    }
  };

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        aria-label={`${todo.text}を${todo.completed ? '未完了' : '完了'}にする`}
      />
      <span className="todo-text">{todo.text}</span>
      <div className="todo-actions">
        <button
          onClick={handleEdit}
          className="edit-button"
          aria-label={`${todo.text}を編集`}
        >
          編集
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="delete-button"
          aria-label={`${todo.text}を削除`}
        >
          削除
        </button>
      </div>
    </li>
  );
}

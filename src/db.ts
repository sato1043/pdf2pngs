export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

type TodoUpdate = Partial<Pick<Todo, 'title' | 'completed'>>;

let todos: Todo[] = [];

export function initDb(): void {
  todos = [];
}

export function createTodo(title: string): Todo {
  const todo: Todo = {
    id: crypto.randomUUID(),
    title,
    completed: false,
    createdAt: new Date(),
  };
  todos.push(todo);
  return todo;
}

export function getAllTodos(): Todo[] {
  return [...todos];
}

export function getTodoById(id: string): Todo | undefined {
  return todos.find((todo) => todo.id === id);
}

export function updateTodo(id: string, update: TodoUpdate): Todo | undefined {
  const index = todos.findIndex((todo) => todo.id === id);
  if (index === -1) {
    return undefined;
  }
  todos[index] = { ...todos[index], ...update };
  return todos[index];
}

export function deleteTodo(id: string): boolean {
  const index = todos.findIndex((todo) => todo.id === id);
  if (index === -1) {
    return false;
  }
  todos.splice(index, 1);
  return true;
}

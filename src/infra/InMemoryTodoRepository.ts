import { Todo } from "../domain/Todo";
import { ITodoRepository } from "../core/ITodoRepository";

export class InMemoryTodoRepository implements ITodoRepository {
  private todos: Todo[] = [];
  private idCounter = 0;
  private lastTimestamp = new Date(0);

  private getNextTimestamp(): Date {
    const now = new Date();
    if (now <= this.lastTimestamp) {
      this.lastTimestamp = new Date(this.lastTimestamp.getTime() + 1);
    } else {
      this.lastTimestamp = now;
    }
    return this.lastTimestamp;
  }

  async create(
    todoData: Omit<Todo, "id" | "createdAt" | "updatedAt">
  ): Promise<Todo> {
    this.idCounter++;
    
    const id = `todo-${this.idCounter}`;
    const now = this.getNextTimestamp();

    const todo: Todo = {
      ...todoData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    this.todos.push(todo);
    return {...todo};
  }

  async update(
    id: string,
    updates: Partial<Omit<Todo, "id" | "userId" | "createdAt">>
  ): Promise<Todo | null> {
    const index = this.todos.findIndex((t) => t.id === id);

    if (index === -1) {
      return null;
    }

    this.todos[index] = {
      ...this.todos[index],
      ...updates,
      updatedAt: this.getNextTimestamp(),
    };

    return {...this.todos[index]};
  }

  async findById(id: string): Promise<Todo | null> {
    const todo = this.todos.find((t) => t.id === id);
    return todo ? {...todo} : null;
  }

  async findByUserId(userId: string): Promise<Todo[]> {
    return this.todos.filter((t) => t.userId === userId).map(t => ({ ...t }));
  }

  async findDueReminders(currentTime: Date): Promise<Todo[]> {
    return this.todos.filter((t) => t.remindAt && t.remindAt <= currentTime && t.status === "PENDING").map(t => ({...t}));
  }
}

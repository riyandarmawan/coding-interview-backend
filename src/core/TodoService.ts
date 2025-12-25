import { Todo } from "../domain/Todo";
import { ITodoRepository } from "./ITodoRepository";
import { IUserRepository } from "./IUserRepository";

export class TodoService {
  constructor(
    private todoRepo: ITodoRepository,
    private userRepo: IUserRepository
  ) {}

  async createTodo(data: any): Promise<Todo> {
    const trimmedTitle = data.title.trim();

    if (!trimmedTitle) {
      throw new Error("Title is required");
    }

    const existingUser = await this.userRepo.findById(data.userId);

    if (!existingUser) {
      throw new Error("User not found");
    }

    const todo = await this.todoRepo.create({
      userId: data.userId,
      title: trimmedTitle,
      description: data.description,
      status: "PENDING",
      remindAt: data.remindAt ? new Date(data.remindAt) : undefined,
    });

    return todo;
  }

  async completeTodo(todoId: string): Promise<Todo> {
    const todo = await this.todoRepo.findById(todoId);

    if (!todo) {
      throw new Error("Todo not found");
    }

    if (todo.status === "DONE") {
      return todo;
    }

    const updated = await this.todoRepo.update(todoId, {
      status: "DONE",
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new Error("Todo not found");
    }

    return updated;
  }

  async getTodosByUser(userId: string): Promise<Todo[]> {
    return this.todoRepo.findByUserId(userId);
  }

  async processReminders(): Promise<void> {
    const now = new Date();
    const dueTodos = await this.todoRepo.findDueReminders(now);

    for (const todo of dueTodos) {
      // This should only process PENDING todos, but doesn't check
      await this.todoRepo.update(todo.id, {
        status: "REMINDER_DUE",
        updatedAt: new Date(),
      });
    }
  }
}

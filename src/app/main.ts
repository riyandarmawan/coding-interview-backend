import express from "express";
import { InMemoryUserRepository } from "../infra/InMemoryUserRepository";
import { InMemoryTodoRepository } from "../infra/InMemoryTodoRepository";
import { SimpleScheduler } from "../infra/SimpleScheduler";
import { TodoService } from "../core/TodoService";
import { Todo } from "../domain/Todo";

async function bootstrap() {
  const app = express();
  app.use(express.json());

  // Wire up dependencies
  const userRepo = new InMemoryUserRepository();
  const todoRepo = new InMemoryTodoRepository();
  const scheduler = new SimpleScheduler();
  const todoService = new TodoService(todoRepo, userRepo);

  console.log("Todo Reminder Service - Bootstrap Complete");
  console.log("Repositories and services initialized.");

  // POST /users - Create a new user
  app.post("/users", async (req, res) => {
    try {
      const { email, name } = req.body;
      const user = await userRepo.create({ email, name });
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // GET /users/:id - Get user by ID
  app.get('/users/:id', async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await userRepo.findById(userId);
      if (!user) {
        throw new Error('User ID not found');
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // POST /todos - Create a new todo
  app.post('/todos', async (req, res) => {
    try {
      const { userId, title, description, status, remindAt } = req.body;
      const todo = await todoService.createTodo({ userId, title, description, status, remindAt });
      res.status(201).json(todo);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }); 

  // GET /todos/:id - Get todo by ID
  app.get('/todos/:id', async (req, res) => {
    try {
      const todoId = req.params.id;
      const todo = await todoRepo.findById(todoId);
      if (!todo) throw new Error("Todo ID not found");
      res.json(todo);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }); 

  // PUT /todos/:id - Update a todo
  app.put('/todos/:id', async (req, res) => {
    try {
      const todoId = req.params.id;
      const newTodo: Partial<Omit<Todo, "id" | "userId" | "createdAt">> = req.body;

      const todo = await todoRepo.update(todoId, newTodo);

      res.json(todo);
    } catch (error) {
      res.status(400).json({message: (error as Error).message});
    }
  });

  // DELETE /todos/:id - Delete a todo
  app.delete('/todos/:id', async (req, res) => {
    try {
      const todoId = req.params.id;

      await todoRepo.delete(todoId);

      res.status(200).end(); 
    } catch (error) {
      res.status(400).json({message: (error as Error).message});
    }
  });


  // Candidate should implement HTTP server here
  // Example: scheduler.scheduleRecurring('reminder-check', 60000, () => todoService.processReminders());

  // TODO: Implement HTTP server with the following routes:
  // GET /users/:userId/todos - Get all todos for a user
  // POST /todos/:id/share - Share a todo with another user

  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
}

bootstrap().catch(console.error);

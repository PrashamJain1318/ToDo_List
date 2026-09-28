const mongoose = require('mongoose');
const Todo = require('../models/Todo');

// In-memory fallback dataset for serverless environments when MongoDB is not connected
let inMemoryTodos = [
  {
    id: 'seed-1',
    title: 'Learn Node.js runtime & Event Loop',
    description: 'Understand how V8 executes JavaScript outside the browser with libuv.',
    completed: false,
    priority: 'high',
    category: 'Study',
    dueDate: new Date().toISOString(),
    completedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'seed-2',
    title: 'Build RESTful API with Express & Mongoose',
    description: 'Implement Controllers, Services, and Validation Middlewares.',
    completed: false,
    priority: 'high',
    category: 'Work',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    completedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'seed-3',
    title: 'Complete Web Dev Assignment 1',
    description: 'Finish backend architecture diagram and submit via portal.',
    completed: true,
    priority: 'medium',
    category: 'Study',
    dueDate: null,
    completedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'seed-4',
    title: 'Gym & 5km cardio workout',
    description: 'Upper body strength training followed by stretching.',
    completed: false,
    priority: 'medium',
    category: 'Fitness',
    dueDate: null,
    completedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'seed-5',
    title: 'Plan monthly budget & review expenses',
    description: 'Review subscriptions, utility bills, and savings target.',
    completed: false,
    priority: 'low',
    category: 'Finance',
    dueDate: null,
    completedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

class TodoService {
  isDbConnected() {
    return mongoose.connection && mongoose.connection.readyState === 1;
  }

  /**
   * Get all todos with dynamic filters, search, and sorting
   */
  async getAllTodos(query = {}) {
    if (this.isDbConnected()) {
      const {
        status,
        priority,
        category,
        search,
        sortBy = 'createdAt',
        order = 'desc',
      } = query;

      const filter = {};
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      if (status === 'completed') {
        filter.completed = true;
      } else if (status === 'pending') {
        filter.completed = false;
      } else if (status === 'today') {
        filter.dueDate = { $gte: startOfToday, $lte: endOfToday };
      } else if (status === 'upcoming') {
        filter.dueDate = { $gt: endOfToday };
        filter.completed = false;
      }

      if (priority && priority !== 'all') {
        filter.priority = priority.toLowerCase();
      }

      if (category && category !== 'all') {
        filter.category = new RegExp(`^${category}$`, 'i');
      }

      if (search && search.trim()) {
        const searchRegex = new RegExp(search.trim(), 'i');
        filter.$or = [
          { title: searchRegex },
          { description: searchRegex },
        ];
      }

      const sortOptions = {};
      const sortDirection = order === 'asc' ? 1 : -1;
      sortOptions[sortBy] = sortDirection;

      return await Todo.find(filter).sort(sortOptions);
    }

    // Fallback: In-memory filtering
    let results = [...inMemoryTodos];
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (query.status === 'completed') {
      results = results.filter((t) => t.completed);
    } else if (query.status === 'pending') {
      results = results.filter((t) => !t.completed);
    } else if (query.status === 'today') {
      results = results.filter((t) => {
        if (!t.dueDate) return false;
        const d = new Date(t.dueDate);
        return d >= startOfToday && d <= endOfToday;
      });
    } else if (query.status === 'upcoming') {
      results = results.filter((t) => {
        if (!t.dueDate || t.completed) return false;
        return new Date(t.dueDate) > endOfToday;
      });
    }

    if (query.priority && query.priority !== 'all') {
      results = results.filter((t) => t.priority.toLowerCase() === query.priority.toLowerCase());
    }

    if (query.category && query.category !== 'all') {
      results = results.filter((t) => t.category.toLowerCase() === query.category.toLowerCase());
    }

    if (query.search && query.search.trim()) {
      const q = query.search.trim().toLowerCase();
      results = results.filter((t) =>
        t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q))
      );
    }

    return results;
  }

  /**
   * Get a single todo by ID
   */
  async getTodoById(id) {
    if (this.isDbConnected()) {
      return await Todo.findById(id);
    }
    return inMemoryTodos.find((t) => t.id === id) || null;
  }

  /**
   * Create a new todo
   */
  async createTodo(data) {
    const todoData = {
      title: data.title.trim(),
      description: data.description ? data.description.trim() : '',
      completed: Boolean(data.completed),
      priority: data.priority ? data.priority.toLowerCase() : 'medium',
      category: data.category || 'General',
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      completedAt: data.completed ? new Date() : null,
    };

    if (this.isDbConnected()) {
      const todo = new Todo(todoData);
      return await todo.save();
    }

    const newTodo = {
      ...todoData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryTodos.unshift(newTodo);
    return newTodo;
  }

  /**
   * Update an existing todo
   */
  async updateTodo(id, updates) {
    if (this.isDbConnected()) {
      const todo = await Todo.findById(id);
      if (!todo) return null;

      if (updates.title !== undefined) todo.title = updates.title.trim();
      if (updates.description !== undefined) todo.description = updates.description.trim();
      if (updates.priority !== undefined) todo.priority = updates.priority.toLowerCase();
      if (updates.category !== undefined) todo.category = updates.category;
      if (updates.dueDate !== undefined) {
        todo.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
      }

      if (updates.completed !== undefined) {
        const wasCompleted = todo.completed;
        todo.completed = Boolean(updates.completed);
        if (todo.completed && !wasCompleted) {
          todo.completedAt = new Date();
        } else if (!todo.completed) {
          todo.completedAt = null;
        }
      }

      return await todo.save();
    }

    const index = inMemoryTodos.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const current = inMemoryTodos[index];
    const isCompleted = updates.completed !== undefined ? Boolean(updates.completed) : current.completed;
    const completedAt = isCompleted && !current.completed ? new Date().toISOString() : (!isCompleted ? null : current.completedAt);

    inMemoryTodos[index] = {
      ...current,
      title: updates.title !== undefined ? updates.title.trim() : current.title,
      description: updates.description !== undefined ? updates.description.trim() : current.description,
      priority: updates.priority !== undefined ? updates.priority.toLowerCase() : current.priority,
      category: updates.category !== undefined ? updates.category : current.category,
      dueDate: updates.dueDate !== undefined ? (updates.dueDate ? new Date(updates.dueDate).toISOString() : null) : current.dueDate,
      completed: isCompleted,
      completedAt,
      updatedAt: new Date().toISOString(),
    };

    return inMemoryTodos[index];
  }

  /**
   * Delete a todo by ID
   */
  async deleteTodo(id) {
    if (this.isDbConnected()) {
      return await Todo.findByIdAndDelete(id);
    }
    const index = inMemoryTodos.findIndex((t) => t.id === id);
    if (index === -1) return null;
    const [deleted] = inMemoryTodos.splice(index, 1);
    return deleted;
  }

  /**
   * Get comprehensive task statistics
   */
  async getStats() {
    let allTodos = [];
    if (this.isDbConnected()) {
      allTodos = await Todo.find({});
    } else {
      allTodos = inMemoryTodos;
    }

    const total = allTodos.length;
    const completed = allTodos.filter((t) => t.completed).length;
    const pending = total - completed;

    const now = new Date();
    const overdue = allTodos.filter(
      (t) => !t.completed && t.dueDate && new Date(t.dueDate) < now
    ).length;

    const highPriority = allTodos.filter((t) => !t.completed && t.priority === 'high').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const categories = {};
    allTodos.forEach((t) => {
      const cat = t.category || 'General';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    const priorities = { low: 0, medium: 0, high: 0 };
    allTodos.forEach((t) => {
      if (priorities[t.priority] !== undefined) {
        priorities[t.priority]++;
      }
    });

    return {
      total,
      completed,
      pending,
      overdue,
      highPriority,
      completionRate,
      categories,
      priorities,
    };
  }

  /**
   * Delete all completed tasks (utility cleanup)
   */
  async clearCompleted() {
    if (this.isDbConnected()) {
      const result = await Todo.deleteMany({ completed: true });
      return result.deletedCount;
    }
    const initialLen = inMemoryTodos.length;
    inMemoryTodos = inMemoryTodos.filter((t) => !t.completed);
    return initialLen - inMemoryTodos.length;
  }
}

module.exports = new TodoService();

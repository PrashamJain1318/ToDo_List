const Todo = require('../models/Todo');

class TodoService {
  /**
   * Get all todos with dynamic filters, search, and sorting
   */
  async getAllTodos(query = {}) {
    const {
      status,
      priority,
      category,
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;

    const filter = {};

    // Filter by completion / timeframe
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

    // Filter by priority
    if (priority && priority !== 'all') {
      filter.priority = priority.toLowerCase();
    }

    // Filter by category
    if (category && category !== 'all') {
      filter.category = new RegExp(`^${category}$`, 'i');
    }

    // Search query in title or description
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
      ];
    }

    // Sorting
    const sortOptions = {};
    const sortDirection = order === 'asc' ? 1 : -1;
    sortOptions[sortBy] = sortDirection;

    return await Todo.find(filter).sort(sortOptions);
  }

  /**
   * Get a single todo by ID
   */
  async getTodoById(id) {
    return await Todo.findById(id);
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
    };

    if (todoData.completed) {
      todoData.completedAt = new Date();
    }

    const todo = new Todo(todoData);
    return await todo.save();
  }

  /**
   * Update an existing todo
   */
  async updateTodo(id, updates) {
    const todo = await Todo.findById(id);
    if (!todo) {
      return null;
    }

    // Apply allowed updates
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

  /**
   * Delete a todo by ID
   */
  async deleteTodo(id) {
    return await Todo.findByIdAndDelete(id);
  }

  /**
   * Get comprehensive task statistics
   */
  async getStats() {
    const allTodos = await Todo.find({});
    const total = allTodos.length;
    const completed = allTodos.filter((t) => t.completed).length;
    const pending = total - completed;

    const now = new Date();
    const overdue = allTodos.filter(
      (t) => !t.completed && t.dueDate && new Date(t.dueDate) < now
    ).length;

    const highPriority = allTodos.filter((t) => !t.completed && t.priority === 'high').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Category breakdown
    const categories = {};
    allTodos.forEach((t) => {
      const cat = t.category || 'General';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    // Priority breakdown
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
    const result = await Todo.deleteMany({ completed: true });
    return result.deletedCount;
  }
}

module.exports = new TodoService();

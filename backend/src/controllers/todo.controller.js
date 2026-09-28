const todoService = require('../services/todo.service');

/**
 * Controller for Todo endpoints
 */
class TodoController {
  // GET /api/todos
  async getTodos(req, res, next) {
    try {
      const todos = await todoService.getAllTodos(req.query);
      res.status(200).json({
        success: true,
        count: todos.length,
        data: todos,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/todos/stats
  async getStats(req, res, next) {
    try {
      const stats = await todoService.getStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/todos/:id
  async getTodoById(req, res, next) {
    try {
      const todo = await todoService.getTodoById(req.params.id);
      if (!todo) {
        return res.status(404).json({
          success: false,
          message: `Todo with ID ${req.params.id} not found`,
        });
      }
      res.status(200).json({
        success: true,
        data: todo,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/todos
  async createTodo(req, res, next) {
    try {
      const created = await todoService.createTodo(req.body);
      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: created,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/todos/:id
  async updateTodo(req, res, next) {
    try {
      const updated = await todoService.updateTodo(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: `Todo with ID ${req.params.id} not found`,
        });
      }
      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/todos/:id
  async deleteTodo(req, res, next) {
    try {
      const deleted = await todoService.deleteTodo(req.params.id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: `Todo with ID ${req.params.id} not found`,
        });
      }
      res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
        data: deleted,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/todos/actions/clear-completed
  async clearCompleted(req, res, next) {
    try {
      const count = await todoService.clearCompleted();
      res.status(200).json({
        success: true,
        message: `Cleared ${count} completed task(s)`,
        data: { deletedCount: count },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TodoController();

const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todo.controller');
const { validateTodo } = require('../middleware/validation.middleware');

// Statistics & Aggregate routes (defined before :id parameter)
router.get('/stats', todoController.getStats);
router.delete('/actions/clear-completed', todoController.clearCompleted);

// CRUD routes
router
  .route('/')
  .get(todoController.getTodos)
  .post(validateTodo, todoController.createTodo);

router
  .route('/:id')
  .get(todoController.getTodoById)
  .patch(validateTodo, todoController.updateTodo)
  .delete(todoController.deleteTodo);

module.exports = router;

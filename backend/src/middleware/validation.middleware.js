const validateTodo = (req, res, next) => {
  const { title, priority, category, dueDate } = req.body;

  // On POST / create, title is strictly required
  if (req.method === 'POST') {
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required and cannot be empty',
      });
    }
    if (title.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Task title must be at least 3 characters long',
      });
    }
  }

  // On PATCH/PUT, if title is provided, check length
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Task title cannot be blank',
      });
    }
    if (title.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Task title must be at least 3 characters long',
      });
    }
  }

  // Validate priority if supplied
  if (priority !== undefined) {
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(priority.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Priority must be one of: ${validPriorities.join(', ')}`,
      });
    }
  }

  // Validate dueDate if supplied
  if (dueDate) {
    const parsedDate = new Date(dueDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid due date format',
      });
    }
  }

  next();
};

module.exports = { validateTodo };

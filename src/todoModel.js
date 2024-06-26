const mongoose = require('mongoose');

// Define Todo schema
const todoSchema = new mongoose.Schema({
  title: String,
  description: String,
  dueDate: Date,
  tag: String
});

// Create Todo model
const TodoM = mongoose.model('Todo', todoSchema);

module.exports = TodoM;

// Update the Username
function updateUserText() {
  const userNameElement = document.getElementById('userName');
  const user = JSON.parse(sessionStorage.getItem('user')); // Parse JSON string to object
  if (userNameElement && user) {
    userNameElement.innerText = user.username; // Update displayed username
  }
}

// Function to open the add task modal
function openAddTaskModal() {
  const modal = document.getElementById('addTaskModal');
  const modalInstance = new bootstrap.Modal(modal);
  modalInstance.show();
}

// Clear the Form
function clearForm() {
  // Clear form fields
  document.getElementById('title').value = '';
  document.getElementById('description').value = '';
  document.getElementById('dueDate').value = '';
  document.getElementById('tag').value = 'Low';
}

// Function to format due date
function formatDate(dateString) {
  const date = new Date(dateString);
  const month = date.toLocaleString('default', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
}

// Function to create a todo list item
function createTodoListItem(todo) {
  // Create list item element
  const listItem = document.createElement('li');
  // Add classes to list item
  listItem.classList.add('list-group-item', 'dark-mode-text', 'd-flex', 'justify-content-between', 'align-items-start');

  // Populate list item with todo data
  listItem.innerHTML = `
    <div class="row">
      <div class="col">
        <div class="tag ${todo.tag.toLowerCase()}">${todo.tag}</div>
        <div class="title">${todo.title}</div>
        <div class="description">${todo.description}</div>
        <div class="due-date">
          <i class="bi bi-clock"></i> ${formatDate(todo.dueDate)}
        </div>
      </div>
    </div>
    <div>
      <button type="button" class="btn btn-outline-warning btn-sm edit-btn align-self-start" data-id="${todo._id}">
        <i class="bi bi-pencil-fill"></i>
      </button>
      <button type="button" class="btn btn-outline-danger btn-sm delete-btn align-self-start" data-id="${todo._id}">
        <i class="bi bi-trash2-fill"></i>
      </button>
    </div>
  `;

  return listItem;
}

// Function to add a todo item
async function addTodo() {
  // Get form data
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const dueDate = document.getElementById('dueDate').value;
  const tag = document.getElementById('tag').value;

  const data = { title, description, dueDate, tag };

  try {
    // Send request to add todo item
    const response = await fetch('/addTodo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });

    if (response.ok) {
      // If successful, display the new todo item
      const newTodo = await response.json();
      displayTodoItem(newTodo);
      clearForm();
    } else {
      console.error('Failed to add todo:', response.statusText);
    }
  } catch (error) {
    console.error('Error adding todo:', error);
  }
}

// Function to load the todo list
async function loadTodoList() {
  try {
    // Fetch todo list from server
    const response = await fetch('/todo');
    if (!response.ok) {
      throw new Error('Failed to fetch todo list');
    }
    const todoList = await response.json();
    const todoListElement = document.getElementById('todo-list');
    todoListElement.innerHTML = ''; // Clear existing list
    // Display each todo item
    todoList.forEach(todo => {
      const listItem = createTodoListItem(todo);
      todoListElement.appendChild(listItem);
    });
  } catch (error) {
    console.error('Error loading todo list:', error);
  }
}

// Function to display a todo item
function displayTodoItem(todoItem) {
  const { title, description, dueDate, tag } = todoItem;

  let tagClass;
  switch(tag) {
      case 'Low':  tagClass = 'low'; break;
      case 'Mid':  tagClass = 'mid'; break;
      case 'High': tagClass = 'high'; break;
  }

  const listItem = document.createElement('li');
  listItem.classList.add('list-group-item', 'dark-mode-text', 'd-flex', 'justify-content-between', 'align-items-start');

  listItem.innerHTML = `
    <div class="row">
      <div class="col">
        <div class="tag ${tagClass}">${tag}</div>
        <div class="title">${title}</div>
        <div class="description">${description}</div>
        <div class="due-date">
          <i class="bi bi-clock"></i> ${formatDate(dueDate)}
        </div>
      </div>
    </div>
    <div>
      <button type="button" class="btn btn-outline-warning btn-sm edit-btn align-self-start" data-id="${todoItem._id}">
        <i class="bi bi-pencil-fill"></i>
      </button>
      <button type="button" class="btn btn-outline-danger btn-sm delete-btn align-self-start" data-id="${todoItem._id}">
        <i class="bi bi-trash2-fill"></i>
      </button>
    </div>
  `;

  document.getElementById('todo-list').appendChild(listItem);
}

// Function to handle the deletion of a todo item
async function deleteTodoItem(event) {
  const deleteButton = event.target.closest('.delete-btn');
  if (deleteButton) {
    const todoId = deleteButton.dataset.id;
    try {
      const response = await fetch(`/deleteTodo/${todoId}`, { method: 'DELETE' });
      if (response.ok) {
        deleteButton.parentElement.parentElement.remove(); // Remove the todo item from the DOM
        showToast("Task deleted");
      } else {
        console.error('Failed to delete todo:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  }
}

// Function to open the edit task modal
function openEditTaskModal(todo) {
  const modal = document.getElementById('editTaskModal');
  const modalInstance = new bootstrap.Modal(modal);
  document.getElementById('editTodoId').value = todo._id;
  document.getElementById('editTitle').value = todo.title;
  document.getElementById('editDescription').value = todo.description;
  document.getElementById('editDueDate').value = todo.dueDate.split('T')[0]; // Format date to YYYY-MM-DD
  document.getElementById('editTag').value = todo.tag;
  modalInstance.show();
}
async function editTodo() {
  // Get form data
  const id = document.getElementById('editTodoId').value;
  const title = document.getElementById('editTitle').value;
  const description = document.getElementById('editDescription').value;
  const dueDate = document.getElementById('editDueDate').value;
  const tag = document.getElementById('editTag').value;

  const data = { title, description, dueDate, tag };
  

  try {
    // Send request to update todo item
    const response = await fetch(`/edittodo/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });

    if (response.ok) {
      // If successful, refresh the todo list
      loadTodoList();
      showToast("Task updated");
    } else {
      console.error('Failed to update todo:', response.statusText);
    }
  } catch (error) {
    console.error('Error updating todo:', error);
  }
}


// Function to logout the user
function logout() {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (user && user.username) {
    console.log(`${user.username} session is destroyed`);
    console.log(`${user.username} is logged out`);
  } else {
    console.log('User session is destroyed');
    console.log('User is logged out');
  }
  sessionStorage.removeItem('user'); // Remove user data from session storage

  // Show loading screen
  const loadingScreen = document.createElement('div');
  loadingScreen.classList.add('loading-screen');
  loadingScreen.innerHTML = '<div class="spinner-grow text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';
  document.body.appendChild(loadingScreen);

  setTimeout(() => {
    window.location.href = '/login';
  }, 1000);

  // Remove the dashboard page from the browser history
  window.history.replaceState({}, document.title, '/login');
}

// Function to display toast message
const showToast = (message) => {
  const toastElement = document.getElementById('toast');
  const toast = new bootstrap.Toast(toastElement);
  toastElement.querySelector('.toast-body').innerText = message; // Set the toast message
  toast.show();

  // Hide the toast after 3 seconds
  setTimeout(() => {
    toast.hide();
  }, 2000);
};

// Event listener for page load
document.addEventListener('DOMContentLoaded', function() {
  updateUserText();
  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', logout);
  }

  document.getElementById('addTaskBtn').addEventListener('click', openAddTaskModal);
  loadTodoList(); // Load the todo list when the page is loaded
});

// Event listener for form submission
document.getElementById('addTodoForm').addEventListener('submit', function(event) {
  event.preventDefault();
  addTodo();
});

// Event listener for edit form submission
document.getElementById('editTodoForm').addEventListener('submit', function(event) {
  event.preventDefault();
  editTodo();
});

// Event listener for delete and edit button clicks

document.getElementById('todo-list').addEventListener('click', function(event) {
  const editButton = event.target.closest('.edit-btn');
  if (editButton) {
    const todoId = editButton.dataset.id; // Assuming data-id attribute holds the todoId
    
    fetch(`/edittodo/${todoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ /* updated todo object */ })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(todo => {
      // Assuming openEditTaskModal handles showing the updated todo
      openEditTaskModal(todo);
    })
    .catch(error => {
      console.error('Error updating todo:', error);
      // Additional error handling or logging can go here
    });
  }
});

document.getElementById('todo-list').addEventListener('click', function(event) {
  const deleteButton = event.target.closest('.delete-btn');
  if (deleteButton) {
    deleteTodoItem(event);
  }
});



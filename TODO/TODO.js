document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const todoInput = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const itemCount = document.getElementById('item-count');
    const clearCompletedBtn = document.getElementById('clear-completed');
    
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    
    // Initialize the app
    function init() {
        renderTodos();
        updateItemCount();
        addBtn.addEventListener('click', addTodo);
        todoInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addTodo();
        });
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', filterTodos);
        });
        
        clearCompletedBtn.addEventListener('click', clearCompleted);
    }
    
    // Add a new todo
    function addTodo() {
        const text = todoInput.value.trim();
        if (text !== '') {
            const newTodo = {
                id: Date.now(),
                text,
                completed: false
            };
            
            todos.push(newTodo);
            saveTodos();
            renderTodos();
            todoInput.value = '';
            updateItemCount();
        }
    }
    
    // Render todos based on current filter
    function renderTodos(filter = 'all') {
        todoList.innerHTML = '';
        
        let filteredTodos = [];
        
        switch(filter) {
            case 'active':
                filteredTodos = todos.filter(todo => !todo.completed);
                break;
            case 'completed':
                filteredTodos = todos.filter(todo => todo.completed);
                break;
            default:
                filteredTodos = todos;
        }
        
        if (filteredTodos.length === 0) {
            todoList.innerHTML = '<p class="empty-message">No tasks found</p>';
            return;
        }
        
        filteredTodos.forEach(todo => {
            const todoItem = document.createElement('li');
            todoItem.className = 'todo-item';
            todoItem.dataset.id = todo.id;
            
            todoItem.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
                <button class="delete-btn"><i class="fas fa-trash"></i></button>
            `;
            
            todoList.appendChild(todoItem);
            
            // Add event listeners to the new elements
            const checkbox = todoItem.querySelector('.todo-checkbox');
            const deleteBtn = todoItem.querySelector('.delete-btn');
            const todoText = todoItem.querySelector('.todo-text');
            
            checkbox.addEventListener('change', function() {
                toggleTodoComplete(todo.id);
            });
            
            deleteBtn.addEventListener('click', function() {
                deleteTodo(todo.id);
            });
            
            todoText.addEventListener('dblclick', function() {
                editTodo(todo.id, todoText);
            });
        });
    }
    
    // Toggle todo completion status
    function toggleTodoComplete(id) {
        todos = todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, completed: !todo.completed };
            }
            return todo;
        });
        
        saveTodos();
        updateItemCount();
    }
    
    // Delete a todo
    function deleteTodo(id) {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos(getCurrentFilter());
        updateItemCount();
    }
    
    // Edit a todo
    function editTodo(id, element) {
        const todo = todos.find(todo => todo.id === id);
        if (!todo) return;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = todo.text;
        input.className = 'edit-input';
        
        element.parentNode.replaceChild(input, element);
        input.focus();
        
        function saveEdit() {
            const newText = input.value.trim();
            if (newText && newText !== todo.text) {
                todos = todos.map(t => {
                    if (t.id === id) {
                        return { ...t, text: newText };
                    }
                    return t;
                });
                saveTodos();
            }
            
            renderTodos(getCurrentFilter());
        }
        
        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                saveEdit();
            }
        });
    }
    
    // Filter todos
    function filterTodos(e) {
        const filter = e.target.dataset.filter;
        
        filterBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        
        e.target.classList.add('active');
        renderTodos(filter);
    }
    
    // Get current active filter
    function getCurrentFilter() {
        const activeFilter = document.querySelector('.filter-btn.active');
        return activeFilter ? activeFilter.dataset.filter : 'all';
    }
    
    // Clear completed todos
    function clearCompleted() {
        todos = todos.filter(todo => !todo.completed);
        saveTodos();
        renderTodos(getCurrentFilter());
        updateItemCount();
    }
    
    // Update the item count
    function updateItemCount() {
        const activeCount = todos.filter(todo => !todo.completed).length;
        itemCount.textContent = `${activeCount} ${activeCount === 1 ? 'item' : 'items'} left`;
    }
    
    // Save todos to localStorage
    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }
    
    // Initialize the app
    init();
});
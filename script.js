class Todo {
    constructor() {
        this.tasks = [];
        this.term = '';

        this.loadTasks();
        this.bindEvents();
        this.draw();
    }

    bindEvents() {
        document.getElementById('addTaskButton').addEventListener('click', () => {
            this.addTask();
        });

        document.getElementById('searchField').addEventListener('input', (e) => {
            this.term = e.target.value;
            this.draw();
        });
    }

    addTask() {
        const text = document.getElementById('newTaskText').value.trim();
        const date = document.getElementById('newTaskDate').value;

        if (text.length < 3 || text.length > 255) {
            alert('Podaj więcej niż 3 i mniej niż 255 znakow');
            return;
        }

        const now = new Date();
        const taskDate = date ? new Date(date) : null;

        if (taskDate && taskDate < now) {
            alert('Data musi być pusta albo w przyszłości.');
            return;
        }

        this.tasks.push({ text, date: date || null, completed: false });

        document.getElementById('newTaskText').value = '';
        document.getElementById('newTaskDate').value = '';

        this.saveTasks();
        this.draw();
    }

    deleteTask(index) {
        this.tasks.splice(index, 1);
        this.saveTasks();
        this.draw();
    }

    editTask(index, newText, newDate) {
        this.tasks[index].text = newText;
        this.tasks[index].date = newDate || null;
        this.saveTasks();
        this.draw();
    }

    toggleComplete(index) {
        this.tasks[index].completed = !this.tasks[index].completed;
        this.saveTasks();
        this.draw();
    }

    getFilteredTasks() {
        if (this.term.length >= 2) {
            const termLower = this.term.toLowerCase();
            return this.tasks.filter(task => task.text.toLowerCase().includes(termLower));
        } else {
            return this.tasks;
        }
    }

    highlightTerm(text) {
        if (this.term.length >= 2) {
            const regex = new RegExp(`(${this.term})`, 'gi');
            return text.replace(regex, '<span class="highlight">$1</span>');
        } else {
            return text;
        }
    }

    draw() {
        const taskListDiv = document.getElementById('taskList');
        taskListDiv.innerHTML = '';

        const filteredTasks = this.getFilteredTasks();

        filteredTasks.forEach((task, index) => {
            const taskItemDiv = document.createElement('div');
            taskItemDiv.className = 'taskItem';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => {
                this.toggleComplete(index);
            });

            const taskSpan = document.createElement('span');
            taskSpan.className = 'task';
            taskSpan.innerHTML = this.highlightTerm(task.text);
            taskSpan.style.textDecoration = task.completed ? 'line-through' : 'none';
            taskSpan.addEventListener('click', (e) => {
                this.editTaskInline(e.target, index);
            });

            const taskDateSpan = document.createElement('span');
            taskDateSpan.className = 'taskDate';
            if (task.date) {
                const dateObj = new Date(task.date);
                taskDateSpan.textContent = `(${dateObj.toLocaleString()})`;
            }

            const deleteButton = document.createElement('button');
            deleteButton.className = 'deleteButton';
            deleteButton.textContent = 'Usuń';
            deleteButton.addEventListener('click', () => {
                this.deleteTask(index);
            });

            taskItemDiv.appendChild(checkbox);
            taskItemDiv.appendChild(taskSpan);
            taskItemDiv.appendChild(taskDateSpan);
            taskItemDiv.appendChild(deleteButton);

            taskListDiv.appendChild(taskItemDiv);
        });
    }

    editTaskInline(taskElement, index) {
        const task = this.tasks[index];

        const editContainer = document.createElement('div');
        editContainer.className = 'editContainer';

        const inputText = document.createElement('input');
        inputText.type = 'text';
        inputText.value = task.text;

        const inputDate = document.createElement('input');
        inputDate.type = 'datetime-local';
        inputDate.value = task.date ? new Date(task.date).toISOString().slice(0, 16) : '';

        taskElement.parentNode.replaceChild(editContainer, taskElement);

        editContainer.appendChild(inputText);
        editContainer.appendChild(inputDate);

        const saveEdit = () => {
            const newText = inputText.value.trim();
            const newDateValue = inputDate.value;
            const newDate = newDateValue ? new Date(newDateValue) : null;

            if (newText.length < 3 || newText.length > 255) {
                alert('Podaj więcej niż 3 i mniej niż 255 znakow');
                inputText.focus();
                return;
            }

            const now = new Date();
            if (newDate && newDate < now) {
                alert('Data musi być pusta albo w przyszłości.');
                inputDate.focus();
                return;
            }

            this.editTask(index, newText, newDateValue);
        };

        inputText.addEventListener('blur', () => {
            setTimeout(() => {
                if (!document.activeElement.closest('.editContainer')) {
                    saveEdit();
                }
            }, 100);
        });

        inputDate.addEventListener('blur', () => {
            setTimeout(() => {
                if (!document.activeElement.closest('.editContainer')) {
                    saveEdit();
                }
            }, 100);
        });
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const tasksJSON = localStorage.getItem('tasks');
        if (tasksJSON) {
            this.tasks = JSON.parse(tasksJSON);
        } else {
            this.tasks = [
                { text: 'Task 1', date: null, completed: false },
                { text: 'Task 2', date: null, completed: false }
            ];
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const todoApp = new Todo();
});

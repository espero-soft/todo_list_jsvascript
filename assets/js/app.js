import { initTasks, saveTasks } from "./storage.js";


window.onload = () => {
    tasks = initTasks()
    var tab = document.querySelector('tbody#tableBody');

    const form = document.querySelector('form#taskForm');
    let currentTask = undefined;
    const taskModal = new bootstrap.Modal(document.getElementById('taskModal'));
    const viewModal = new bootstrap.Modal(document.getElementById('viewModal'));



    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Les mois commencent à 0, donc on ajoute 1
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
      
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      }

    const handleAdd = (event) => {
        form.reset()
        currentTask = undefined
        taskModal.show()
    }
    const handleEdit = (event) => {
        const id = event.target.dataset.id;
        currentTask = tasks.find(t => t._id == id);
      
        // Loop through all form elements and set values based on the task
        Object.keys(currentTask).forEach(key => {
          const formElement = form.elements[key];
          if (formElement) {
            formElement.value = currentTask[key];
          }
        });
      
        taskModal.show();
      };

      const handleView = (event) => {
        const id = event.target.dataset.id;
        const taskToView = tasks.find(t => t._id == id);
      
        const viewContent = `
          <table class="table table-bordered">
            <tbody>
              <tr>
                <th>Name</th>
                <td>${taskToView.name}</td>
              </tr>
              <tr>
                <th>Description</th>
                <td>${taskToView.description}</td>
              </tr>
              <tr>
                <th>Status</th>
                <td>${taskToView.status}</td>
              </tr>
              <tr>
                <th>Created At</th>
                <td>${taskToView.created_at}</td>
              </tr>
              <tr>
                <th>Updated At</th>
                <td>${taskToView.updated_at || 'Not updated'}</td>
              </tr>
            </tbody>
          </table>
        `;
      
        document.getElementById('viewTaskDetails').innerHTML = viewContent;
        viewModal.show();
      };
      

    const handleDelete = (event) => {
        const id = event.target.dataset.id;
        const taskToDelete = tasks.find(t => t._id == id);
        if (confirm(`Are you sure you want to delete the task: ${taskToDelete.name}?`)) {
            deleteTodo(taskToDelete);
        }
    };

    const afficher_list = (newTasks = tasks) => {
        tab.innerHTML = '';
        newTasks.forEach((task, index) => {
            tab.innerHTML += `
        <tr>
          <th scope="row">${index + 1}</th>
          <td>${task.name}</td>
          <td>${task.description}</td>
          <td>${task.status}</td>
          <td>${task.created_at}</td>
          <td>${task.updated_at}</td>
          <td>
            <div class='d-flex gap-1'>
              <button class='btn btn-success m-1 view' data-id='${task._id}'> View </button>
              <button class='btn btn-warning m-1 edit' data-id='${task._id}'> Edit </button>
              <button class='btn btn-danger m-1 delete' data-id='${task._id}'> Delete </button>
            </div>
          </td>
        </tr>`;
        });

        const addButton = document.querySelector('button.add');
        const editButtons = document.querySelectorAll('button.edit');
        const viewButtons = document.querySelectorAll('button.view');
        const deleteButtons = document.querySelectorAll('button.delete');

        editButtons.forEach(editButton => {
            editButton.onclick = handleEdit;
        });

        viewButtons.forEach(viewButton => {
            viewButton.onclick = handleView;
        });

        deleteButtons.forEach(deleteButton => {
            deleteButton.onclick = handleDelete;
        });
        addButton.onclick = handleAdd;
        tasks =  saveTasks(newTasks)
    };

    afficher_list();

    const validateTodo = (todo) => {
        let errors = {};

        if (!todo.name || todo.name.trim().length === 0) {
            errors.name = 'Name is required!';
        } else if (todo.name.trim().length > 255) {
            errors.name = 'Name should not exceed 255 characters!';
        }

        if (!todo.description || todo.description.trim().length === 0) {
            errors.description = 'Description is required!';
        } else if (todo.description.trim().length > 1000) {
            errors.description = 'Description should not exceed 1000 characters!';
        }

        if (!todo.status) {
            errors.status = 'Status is required!';
        } else if (!['Pending', 'Completed'].includes(todo.status)) {
            errors.status = 'Invalid status!';
        }

        return errors;
    };

    const displayErrors = (errors) => {
        const errorNames = Object.keys(errors);
        errorNames.forEach(name => {
            const errorDiv = document.querySelector('.error-' + name);
            errorDiv.innerHTML = errors[name];
            setTimeout(() => {
                errorDiv.innerHTML = '';
            }, 2000);
        });
    };

    const addTodo = (todo) => {
        tasks.unshift(todo);
        afficher_list(tasks);
    };

    const updateTodo = (id, todo) => {
        const index = tasks.findIndex(t => t._id == id);
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...todo, updated_at: formatDate(new Date()) };
            afficher_list(tasks);
        }
    };

    const deleteTodo = ({ _id }) => {
        const newTasks = tasks.filter(todo => todo._id !== _id);
        console.log({
            _id,
            newTasks
        });
        afficher_list(newTasks);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("=================== Submit ===============");
        const newTask = {
            name: form.elements['name'].value,
            description: form.elements['description'].value,
            status: Array.from(form.elements['status']).find((radio) => radio.checked)?.value,
            created_at: currentTask ? currentTask.created_at : formatDate(new Date()),
            updated_at: null,
        };
        let errors = validateTodo(newTask);
        if (Object.keys(errors).length) {
            displayErrors(errors);
            return;
        }

        if (currentTask) {
            updateTodo(currentTask._id, newTask);
        } else {
            newTask._id = Math.round(Math.random() * 9999);
            addTodo(newTask);
        }
        taskModal.hide();
    };

    form.onsubmit = handleSubmit;
};

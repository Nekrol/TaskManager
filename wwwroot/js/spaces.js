document.addEventListener('DOMContentLoaded', function () {
    // Элементы для досок (пространств)
    const spaceContainer = document.getElementById('create-task-space');
    const createSpaceButton = document.getElementById('createSpaceButton');
    const spaceInput = document.getElementById('spaceInput');

    // Контейнер для задач. Если его нет отдельного, используем элемент с классом "task"
    const taskBlock = document.querySelector('.task');

    // Инициализация контейнера для задач
    if (!taskBlock.getAttribute('data-tasks-created')) {
        taskBlock.innerHTML = ''; // очищаем его
        taskBlock.setAttribute('data-tasks-created', 'true');
    }
    taskBlock.style.display = 'block';

    // Функция для создания (и отрисовки) пространства (доски) и его контейнера для задач
    function createSpace(data) {
        const spaceContainer = document.getElementById('create-task-space');
        const taskBlock = document.querySelector('.task');
        const spaceInput = document.getElementById('spaceInput');

        if (data && Array.isArray(data)) {
            // если данные пришли из базы – очищаем контейнеры
            spaceContainer.innerHTML = '';
            taskBlock.innerHTML = '';

            data.forEach(board => {
                const boardId = board.id;
                const spaceName = board.name;

                // создаем элемент пространства (доски)
                const spaceRow = document.createElement('div');
                spaceRow.className = 'task-row';
                spaceRow.textContent = spaceName;
                spaceRow.setAttribute('data-board-id', boardId);
                spaceRow.style.backgroundColor = "#E1ECFF";
                spaceRow.style.color = "#1A355D";
                spaceRow.style.padding = '10px';
                spaceRow.style.width = 'calc(100% - 20px)';
                spaceRow.style.height = '35px';
                spaceRow.style.margin = '5px 10px';
                spaceRow.style.borderRadius = '5px';
                spaceRow.style.cursor = 'pointer';

                // создаем контейнер для задач этого пространства
                const newTaskContainer = document.createElement('div');
                newTaskContainer.id = 'task-container-' + boardId;
                newTaskContainer.className = 'task-container';
                newTaskContainer.style.display = 'none';
                newTaskContainer.style.margin = '10px 0';
                // сохраняем boardId в data-атрибуте
                newTaskContainer.setAttribute('data-board-id', boardId);

                // кнопка "добавить задачу"
                const addTaskButton = document.createElement('button');
                addTaskButton.textContent = 'добавить задачу';
                addTaskButton.style.marginTop = '99%';
                addTaskButton.style.position = 'absolute';
                addTaskButton.style.marginLeft = '40%';
                addTaskButton.style.border = 'none';
                addTaskButton.style.padding = '5px 10px';
                addTaskButton.style.cursor = 'pointer';
                addTaskButton.addEventListener('click', function () {
                    showTaskDiv();
                });

                newTaskContainer.appendChild(addTaskButton);

                spaceRow.addEventListener('click', function () {
                    document.querySelectorAll('.task-container').forEach(container => {
                        container.style.display = 'none';
                        container.removeAttribute('data-active');
                    });
                    newTaskContainer.style.display = 'block';
                    newTaskContainer.setAttribute('data-active', 'true');
                    newTaskContainer.setAttribute('data-board-id', boardId);
                    taskBlock.setAttribute('data-board-id', boardId);
                });

                spaceContainer.appendChild(spaceRow);
                taskBlock.appendChild(newTaskContainer);
            });
            spaceInput.value = '';
        } else {
            const spaceName = spaceInput.value.trim();
            if (spaceName === '') {
                alert('введи название пространства!');
                return;
            }

            fetch("/api/boards/create-board", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ Name: spaceName }),
            })
                .then(response => {
                    if (!response.ok) throw new Error("не удалось создать доску");
                    return response.json();
                })
                .then(data => {
                    loadDB();
                })
                .catch(error => console.error("ошибка при создании пространства:", error));
        }
    }

    createSpaceButton.addEventListener('click', function () {
        createSpace();
    });
    spaceInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') createSpace();
        if (event.key === 'Escape') {
            spaceInput.value = '';
            hideDiv();
        }
    });

    spaceContainer.style.display = 'flex';
    spaceContainer.style.flexDirection = 'column';
    spaceContainer.style.overflowY = 'auto';
    spaceContainer.style.maxHeight = '250px';
    spaceContainer.style.border = '1px solid #ccc';
    spaceContainer.style.padding = '5px';

    loadDB();
    window.createSpace = createSpace;
});


document.addEventListener('DOMContentLoaded', function () {
    const taskContainer = document.getElementById('create-task-tasks');
    const createTaskButton = document.getElementById('createTaskButton');
    const taskInput = document.getElementById('taskInput');
    const taskSetting = document.querySelector('.task-setting');

    const taskBlock = document.querySelector('.task');

    if (!taskBlock.getAttribute('data-tasks-created')) {
        taskBlock.innerHTML = '';
        taskBlock.setAttribute('data-tasks-created', 'true');
    }
    taskBlock.style.display = 'block';

    function createTask(taskData) {
        if (taskData && Array.isArray(taskData)) {
            let activeContainer = document.querySelector('.task-container[data-active="true"]');
            if (!activeContainer) {
                const firstContainer = document.querySelector('.task-container');
                if (firstContainer) {
                    firstContainer.style.display = 'block';
                    firstContainer.setAttribute('data-active', 'true');
                    taskBlock.setAttribute('data-board-id', firstContainer.getAttribute('data-board-id'));
                }
            }

            const containers = document.querySelectorAll('.task-container');
            containers.forEach(container => {
                const boardId = container.getAttribute('data-board-id');

                const filteredTasks = taskData.filter(task => Number(task.boardId || task.BoardId) === Number(boardId));

                const addTaskButton = container.querySelector('button');
                container.innerHTML = '';
                if (addTaskButton) {
                    container.appendChild(addTaskButton);
                }

                filteredTasks.forEach(task => {
                    const taskRow = document.createElement('div');
                    taskRow.className = 'task-row';
                    taskRow.textContent = task.title || task.Title || 'без названия';
                    taskRow.dataset.taskId = task.id || task.Id;

                    taskRow.style.backgroundColor = "#E1ECFF";
                    taskRow.style.color = "#1A355D";
                    taskRow.style.padding = '10px';
                    taskRow.style.width = 'calc(100% - 20px)';
                    taskRow.style.height = '35px';
                    taskRow.style.margin = '5px 10px';
                    taskRow.style.borderRadius = '5px';
                    taskRow.style.cursor = 'pointer';

                    // Кнопка корзины для удаления задачи
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = '🗑️';
                    deleteButton.style.marginLeft = '10px';
                    deleteButton.style.border = 'none';
                    deleteButton.style.backgroundColor = 'transparent';
                    deleteButton.style.cursor = 'pointer';
                    deleteButton.addEventListener('click', function (event) {
                        event.stopPropagation(); // Останавливаем событие клика на задаче
                        const taskId = taskRow.dataset.taskId;
                        if (confirm('вы точно хотите удалить задачу?')) {
                            deleteTask(taskId); // Запрос на удаление задачи
                        }
                    });

                    taskRow.appendChild(deleteButton); // Добавляем кнопку удаления

                    taskRow.addEventListener('click', function () {
                        openTaskSettings(taskRow);
                    });

                    container.appendChild(taskRow);
                });
            });

            taskInput.value = '';
        } else {
            let activeTaskContainer = document.querySelector('.task-container[data-active="true"]');
            if (!activeTaskContainer) {
                activeTaskContainer = document.querySelector('.task-container');
                if (activeTaskContainer) {
                    activeTaskContainer.style.display = 'block';
                    activeTaskContainer.setAttribute('data-active', 'true');
                } else {
                    return;
                }
            }

            const taskName = taskInput.value.trim();
            if (taskName === '') {
                alert('введи название задачи!');
                return;
            }

            let boardId = activeTaskContainer.getAttribute('data-board-id');
            if (!boardId) {
                const parts = activeTaskContainer.id.split('-');
                boardId = parts[parts.length - 1];
            }

            const addTaskBtn = activeTaskContainer.querySelector('button');
            activeTaskContainer.innerHTML = '';
            if (addTaskBtn) {
                activeTaskContainer.appendChild(addTaskBtn);
            }

            fetch("/api/tasks/create-task", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    Title: taskName,
                    Description: "",
                    BoardId: Number(boardId)
                })

            })
                .then(res => {
                    return res.text().then(text => {                  
                        throw new Error('ошибка от сервера');
                    });
                })
        }
    }

    // Функция для удаления задачи
    function deleteTask(taskId) {
        fetch(`/api/tasks/delete-task/${taskId}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (response.ok) {
                    alert('задача удалена');
                    loadDB(); // Обновляем список задач
                } else {
                    alert('не удалось удалить задачу');
                }
            })
            .catch(error => {
                console.error('ошибка при удалении задачи:', error);
                alert('не удалось удалить задачу');
            });
    }


    window.createTask = createTask;

    createTaskButton.addEventListener('click', function () {
        createTask();
    });

    taskInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') createTask();
        if (event.key === 'Escape') {
            taskInput.value = '';
            hideTaskDiv();
        }
    });

    async function taskLoad() {
        try {
            let response = await fetch("/api/tasks/task-load");
            let taskData = await response.json();
            createTask(taskData);
        } catch (error) {
            console.log("ошибка загрузки задач:", error);
        }
    }

    taskLoad();
    setInterval(() => {
        taskLoad();
    }, 10000);

    window.createTask = createTask;

    function openTaskSettings(taskRow) {
        const taskId = taskRow.dataset.taskId;
        const taskTitle = taskRow.textContent.trim();

        taskSetting.innerHTML = '';

        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.value = taskTitle;
        titleInput.style.fontSize = '18px';
        titleInput.style.margin = '10px';
        titleInput.style.padding = '5px';
        titleInput.style.width = '90%';
        titleInput.style.border = '1px solid #ccc';
        titleInput.style.borderRadius = '4px';

        titleInput.addEventListener('blur', () => {
            const newTitle = titleInput.value.trim();
            console.log('[title blur] старое:', taskTitle, '| новое:', newTitle);

            if (!newTitle || newTitle === taskTitle) {
                return;
            }
            console.log('[title blur] JSON:', JSON.stringify({ title: newTitle }));


            fetch(`/api/tasks/update-title/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: newTitle })
            })
                .then(response => {
                    console.log('[title blur] статус ответа:', response.status);
                    if (!response.ok) throw new Error(`ошибка обновления названия: ${response.status}`);
                    return response.text();
                })
                .then(data => {
                    console.log('[title blur] сервер ответил:', data);
                    taskRow.textContent = newTitle;
                })
                .catch(error => console.error('[title blur] ошибка:', error));
        });

        taskSetting.appendChild(titleInput);

        const description = document.createElement('textarea');
        description.style.border = 'none';
        description.style.width = '410px';
        description.style.height = '500px';
        description.style.margin = '10px';
        description.style.textAlign = 'start';
        description.style.verticalAlign = 'top';
        description.style.padding = '5px';
        description.style.resize = 'none';
        description.style.overflow = 'auto';
        description.style.fontFamily = 'inherit';

        description.textContent = 'загрузка описания...';

        taskSetting.appendChild(description);
        taskSetting.style.display = 'block';

        fetch(`/api/tasks/get-description/${taskId}`)
            .then(response => {
                if (!response.ok) throw new Error(`ошибка загрузки: ${response.status}`);
                return response.json();
            })
            .then(descriptionData => {
                description.textContent = descriptionData.description || 'описание отсутствует';
            })
            .catch(error => {
                console.error("[desc load] ошибка загрузки задачи:", error);
                description.textContent = 'описание отсутствует';
            });

        description.addEventListener('blur', () => {
            const updatedDescription = description.value.trim();
            console.log('[desc blur] новое описание:', updatedDescription);

            console.log('отправляю:', JSON.stringify({ Description: updatedDescription }));
            fetch(`/api/tasks/update-description/${taskId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    Description: updatedDescription
                })
            })

                .then(response => {
                    console.log('[desc blur] статус ответа:', response.status);
                    if (!response.ok) throw new Error(`ошибка сохранения: ${response.status}`);
                    return response.text();
                })
                .then(data => {
                    console.log('[desc blur] сервер ответил:', data);
                })
                .catch(error => console.error('[desc blur] ошибка сохранения:', error));
        });
    }
});

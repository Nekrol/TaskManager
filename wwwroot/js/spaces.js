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
                    console.log("открываю окно создания задачи в пространстве id:", boardId);
                });

                newTaskContainer.appendChild(addTaskButton);

                // обработчик клика по пространству – устанавливаем активный контейнер
                spaceRow.addEventListener('click', function () {
                    document.querySelectorAll('.task-container').forEach(container => {
                        container.style.display = 'none';
                        container.removeAttribute('data-active');
                    });
                    newTaskContainer.style.display = 'block';
                    newTaskContainer.setAttribute('data-active', 'true');
                    // дополнительно сохраняем boardId в контейнере
                    newTaskContainer.setAttribute('data-board-id', boardId);
                    taskBlock.setAttribute('data-board-id', boardId);
                    console.log("активное пространство с id:", boardId);
                });

                spaceContainer.appendChild(spaceRow);
                taskBlock.appendChild(newTaskContainer);
            });
            spaceInput.value = '';
        } else {
            // режим создания нового пространства через ввод
            const spaceName = spaceInput.value.trim();
            if (spaceName === '') {
                alert('введи название пространства!');
                return;
            }
            console.log("создаю пространство:", spaceName);

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
                    console.log("доска создана:", data);
                    // обновляем список пространств после создания
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

    // стили для контейнера пространств
    spaceContainer.style.display = 'flex';
    spaceContainer.style.flexDirection = 'column';
    spaceContainer.style.overflowY = 'auto';
    spaceContainer.style.maxHeight = '250px';
    spaceContainer.style.border = '1px solid #ccc';
    spaceContainer.style.padding = '5px';

    loadDB();
    window.createSpace = createSpace;
});


// Код для создания задач
// Код для создания задач
document.addEventListener('DOMContentLoaded', function () {
    // элементы для задач
    const taskContainer = document.getElementById('create-task-tasks'); // если есть отдельный контейнер для списка задач
    const createTaskButton = document.getElementById('createTaskButton');
    const taskInput = document.getElementById('taskInput');

    // общий контейнер для задач (используем тот же, что и для пространств)
    const taskBlock = document.querySelector('.task');

    // инициализация контейнера для задач
    if (!taskBlock.getAttribute('data-tasks-created')) {
        taskBlock.innerHTML = '';
        taskBlock.setAttribute('data-tasks-created', 'true');
    }
    taskBlock.style.display = 'block';

    // функция для создания (и отрисовки) задач
    function createTask(taskData) {
        // если переданы данные из базы, отрисовываем задачи во всех контейнерах
        if (taskData && Array.isArray(taskData)) {
            // если ни один контейнер не активен, делаем первый активным
            let activeContainer = document.querySelector('.task-container[data-active="true"]');
            if (!activeContainer) {
                const firstContainer = document.querySelector('.task-container');
                if (firstContainer) {
                    firstContainer.style.display = 'block';
                    firstContainer.setAttribute('data-active', 'true');
                    taskBlock.setAttribute('data-board-id', firstContainer.getAttribute('data-board-id'));
                    console.log("по умолчанию активное пространство с id:", firstContainer.getAttribute('data-board-id'));
                }
            }
            // перебираем все контейнеры (каждый соответствует своему пространству)
            const containers = document.querySelectorAll('.task-container');
            containers.forEach(container => {
                const boardId = container.getAttribute('data-board-id');
                // фильтруем задачи, принадлежащие данному пространству (приводим к числу для корректного сравнения)
                const filteredTasks = taskData.filter(task => Number(task.boardId || task.BoardId) === Number(boardId));


                // сохраняем кнопку "добавить задачу"
                const addTaskButton = container.querySelector('button');
                // очищаем контейнер, но сохраняем кнопку
                container.innerHTML = '';
                if (addTaskButton) {
                    container.appendChild(addTaskButton);
                }
                // отрисовываем задачи
                filteredTasks.forEach(task => {
                    console.log("отрисовываю задачу:", task.title || task.Title);
                    const taskRow = document.createElement('div');
                    taskRow.className = 'task-row';
                    taskRow.textContent = task.title || task.Title || 'без названия';
                    taskRow.style.backgroundColor = "#E1ECFF";
                    taskRow.style.color = "#1A355D";
                    taskRow.style.padding = '10px';
                    taskRow.style.width = 'calc(100% - 20px)';
                    taskRow.style.height = '35px';
                    taskRow.style.margin = '5px 10px';
                    taskRow.style.borderRadius = '5px';
                    taskRow.style.cursor = 'pointer';
                    container.appendChild(taskRow);
                });
            });
            taskInput.value = '';
        } else {
            // режим создания новой задачи – если данных нет, создаем новую задачу
            let activeTaskContainer = document.querySelector('.task-container[data-active="true"]');
            if (!activeTaskContainer) {
                activeTaskContainer = document.querySelector('.task-container');
                if (activeTaskContainer) {
                    activeTaskContainer.style.display = 'block';
                    activeTaskContainer.setAttribute('data-active', 'true');
                } else {
                    console.log('контейнер для задач не найден!');
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
            console.log("создаю задачу для пространства с boardId:", boardId);

            const addTaskBtn = activeTaskContainer.querySelector('button');
            activeTaskContainer.innerHTML = '';
            if (addTaskBtn) {
                activeTaskContainer.appendChild(addTaskBtn);
            }

            fetch("/api/tasks/create-task", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ Title: taskName, BoardId: boardId })
            })
                .then(response => {
                    if (!response.ok) throw new Error("не удалось создать задачу");
                    return response.json();
                })
                .then(createdTask => {
                    console.log("задача создана:", createdTask);
                    taskLoad(); // обновляем задачи после создания
                })
                .catch(error => console.error("ошибка при создании задачи:", error));
        }
    }

    // обработчики для создания задачи
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

    // стили для контейнера задач (если есть отдельный контейнер)
    if (taskContainer) {
        taskContainer.style.display = 'flex';
        taskContainer.style.flexDirection = 'column';
        taskContainer.style.overflowY = 'auto';
        taskContainer.style.maxHeight = '250px';
        taskContainer.style.border = '1px solid #ccc';
        taskContainer.style.padding = '5px';
    }

    // функция для загрузки задач из базы
    async function taskLoad() {
        try {
            let response = await fetch("/api/tasks/task-load");
            let taskData = await response.json();
            console.log('задачи получены из базы:', taskData);
            createTask(taskData);
        } catch (error) {
            console.log("ошибка загрузки задач:", error);
        }
    }

    // вызываем taskLoad при загрузке страницы
    taskLoad();

    // обновляем задачи каждые 10 секунд
    setInterval(() => {
        console.log("обновляю задачи...");
        taskLoad();
    }, 10000);

    window.createTask = createTask;
});

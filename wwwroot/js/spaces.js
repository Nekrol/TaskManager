console.log('JavaScript файл подключен!');

// Функции показа/скрытия
function showDiv() {
    var div = document.getElementById('hiddenDiv');
    if (div) {
        div.style.display = 'block'; // Показываем окно создания доски
        console.log('Окно создания доски показано!');
    } else {
        console.error('Элемент с id "hiddenDiv" не найден!');
    }
}

function hideDiv() {
    var div = document.getElementById('hiddenDiv');
    if (div) {
        div.style.display = 'none'; // Скрываем окно создания доски
        console.log('Окно создания доски скрыто!');
    } else {
        console.error('Элемент с id "hiddenDiv" не найден!');
    }
}

function showTaskDiv() {
    var div = document.getElementById('hiddenTaskDiv');
    if (div) {
        div.style.display = 'block'; // Показываем блок создания задачи
        console.log('Блок создания задачи показан!');
    } else {
        console.error('Элемент с id "hiddenTaskDiv" не найден!');
    }
}

function hideTaskDiv() {
    var div = document.getElementById('hiddenTaskDiv');
    if (div) {
        div.style.display = 'none'; // Скрываем блок создания задачи
        console.log('Блок создания задачи скрыт!');
    } else {
        console.error('Элемент с id "hiddenTaskDiv" не найден!');
    }
}

// Привязываем функции к глобальному объекту, чтобы inline-обработчики в HTML работали
window.showDiv = showDiv;
window.hideDiv = hideDiv;
window.showTaskDiv = showTaskDiv;
window.hideTaskDiv = hideTaskDiv;

// После загрузки DOM запускаем основной код для досок и задач
document.addEventListener('DOMContentLoaded', function () {
    // Элементы для досок (пространств)
    const spaceContainer = document.getElementById('create-task-space');
    const createSpaceButton = document.getElementById('createSpaceButton');
    const spaceInput = document.getElementById('spaceInput');

    // Контейнер для задач. Если у тебя нет отдельного контейнера, используем элемент с классом "task" как общий родитель
    const taskBlock = document.querySelector('.task');

    // Если общего контейнера для задач нет, создадим его один раз:
    if (!taskBlock.getAttribute('data-tasks-created')) {
        taskBlock.innerHTML = ''; // очистим его
        taskBlock.setAttribute('data-tasks-created', 'true');
    }

    // важное изменение: делаем taskBlock видимым
    taskBlock.style.display = 'block';

    // Функция для создания нового пространства (доски) и его контейнера для задач
    function createSpace() {
        const spaceName = spaceInput.value.trim();
        if (spaceName === '') {
            alert('Введите название пространства!');
            return;
        }
        console.log("Создаю пространство: " + spaceName);

        fetch("/api/boards/create-board", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Name: spaceName }),
        })
            .then((response) => {
                if (!response.ok) throw new Error("Failed to save the board");
                return response.json();
            })
            .then((data) => {
                console.log("Board saved:", data);
                const boardId = data.id; // получаем id

                // создаём элемент для пространства в списке пространств
                const spaceRow = document.createElement('div');
                spaceRow.className = 'task-row';
                spaceRow.textContent = spaceName;
                spaceRow.setAttribute('data-board-id', boardId);
                spaceRow.style.backgroundColor = "#E1ECFF";
                spaceRow.style.color = "#1A355D";
                spaceRow.style.padding = '10px';
                spaceRow.style.width = 'calc(100% - 20px)';
                spaceRow.style.margin = '5px 10px';
                spaceRow.style.borderRadius = '5px';
                spaceRow.style.cursor = 'pointer';

                // создаём контейнер для задач этого пространства
                const newTaskContainer = document.createElement('div');
                newTaskContainer.id = 'task-container-' + boardId;
                newTaskContainer.className = 'task-container';
                newTaskContainer.style.display = 'none';
                newTaskContainer.style.margin = '10px 0';

                // кнопка "добавить задачу"
                const addTaskButton = document.createElement('button');
                addTaskButton.textContent = 'Добавить задачу';
                addTaskButton.style.marginTop = '99%';
                addTaskButton.style.position = 'absolute';
                addTaskButton.style.marginLeft = '40%';
                addTaskButton.style.border = 'none';
                addTaskButton.style.padding = '5px 10px';
                addTaskButton.style.cursor = 'pointer';
                addTaskButton.addEventListener('click', function () {
                    showTaskDiv();
                    console.log("Открываю окно создания задачи в пространстве id: " + boardId);
                });

                // добавляем кнопку внутрь контейнера задач
                newTaskContainer.appendChild(addTaskButton);

                // обработчик клика по пространству
                spaceRow.addEventListener('click', function () {
                    document.querySelectorAll('.task-container').forEach(container => {
                        container.style.display = 'none';
                        container.removeAttribute('data-active');
                    });

                    newTaskContainer.style.display = 'block';
                    newTaskContainer.setAttribute('data-active', 'true');
                    taskBlock.setAttribute('data-board-id', boardId);
                    console.log("Активное пространство с id: " + boardId);
                });

                spaceContainer.appendChild(spaceRow);
                taskBlock.appendChild(newTaskContainer);
            })
            .catch((error) => console.error("Ошибка при создании пространства:", error));

        // очищаем поле ввода
        spaceInput.value = '';
    }


    createSpaceButton.addEventListener('click', createSpace);
    spaceInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') createSpace();
        if (event.key === 'Escape') {
            spaceInput.value = '';
            hideDiv();
        }
    });

    // стили для контейнера пространства
    spaceContainer.style.display = 'flex';
    spaceContainer.style.flexDirection = 'column';
    spaceContainer.style.overflowY = 'auto';
    spaceContainer.style.maxHeight = '250px';
    spaceContainer.style.border = '1px solid #ccc';
    spaceContainer.style.padding = '5px';
});


// Код для создания задач
document.addEventListener('DOMContentLoaded', function () {
    function createTask() {
        const taskInput = document.getElementById('taskInput');
        const taskName = taskInput.value.trim();
        if (taskName === '') {
            alert('Введите название задачи!');
            return;
        }
        // Определяем активный контейнер задач по атрибуту data-active
        const activeTaskContainer = document.querySelector('.task-container[data-active="true"]');
        if (!activeTaskContainer) {
            alert('Активное пространство не выбрано!');
            return;
        }
        // предполагаем, что id имеет формат "task-container-{boardId}"
        const boardId = activeTaskContainer.id.split('-')[2];
        console.log("Создаю задачу для пространства id: " + boardId);

        // Отправляем запрос на создание задачи (если есть API)
        fetch("/api/tasks/create-task", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Title: taskName, BoardId: boardId })
        })
            .then((response) => {
                if (!response.ok) throw new Error("Не удалось создать задачу");
                return response.json();
            })
            .then((data) => {
                console.log("Задача создана:", data);
                // создаём элемент задачи для UI
                const taskRow = document.createElement('div');
                taskRow.className = 'task-row';
                taskRow.textContent = taskName;
                taskRow.style.backgroundColor = "#E1ECFF";
                taskRow.style.color = "#1A355D";
                taskRow.style.padding = '10px';
                taskRow.style.margin = '5px 0';
                taskRow.style.borderRadius = '5px';
                taskRow.style.cursor = 'pointer';

                activeTaskContainer.appendChild(taskRow);
            })
            .catch((error) => console.error("Ошибка создания задачи:", error));

        taskInput.value = '';
    }

    const createTaskButton = document.getElementById('createTaskButton');
    createTaskButton.addEventListener('click', createTask);

    const taskInput = document.getElementById('taskInput');
    taskInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') createTask();
        if (event.key === 'Escape') {
            taskInput.value = '';
            hideTaskDiv();
        }
    });
});

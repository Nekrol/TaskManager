window.loadDB = loadDB;
window.taskLoad = taskLoad;
window.showDiv = showDiv;
window.hideDiv = hideDiv;
window.showTaskDiv = showTaskDiv;
window.hideTaskDiv = hideTaskDiv;

async function loadDB() {
    try {
        let response = await fetch("/api/boards/board-load");
        let data = await response.json();
        console.log('данные получены:', data);

        if (typeof window.createSpace === 'function') {
            window.createSpace(data);
        } else {
            console.error('createSpace не найден!');
        }
    } catch (error) {
        console.log("Ошибка, данные не найдены:", error);
    }
}

async function taskLoad() {
    try {
        let response = await fetch("/api/tasks/task-load");
        let taskData = await response.json();
        console.log('данные получены:', taskData);

        if (typeof window.createTask === 'function') {
            window.createTask(taskData);
        } else {
            console.error('createTask не найден!');
        }
    } catch (error) {
        console.log("Ошибка, данные не найдены:", error);
    }
}

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
class Calendar {
            constructor(containerId, tasks = {}) {
                this.container = document.getElementById(containerId);
                this.tasks = tasks; // {'2025-03-14': true, '2025-03-20': true}
                this.date = new Date();
                this.monthNames = [
                    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
                    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
                ];
                this.render();
            }

            render() {
                const year = this.date.getFullYear();
                const month = this.date.getMonth();
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();

                document.getElementById("currentMonth").textContent = `${this.monthNames[month]} ${year}`;

                this.container.innerHTML = "";
                const calendarGrid = document.createElement("div");
                calendarGrid.className = "calendar";

                const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
                dayNames.forEach(day => {
                    let dayElem = document.createElement("div");
                    dayElem.textContent = day;
                    dayElem.classList.add("day-header");
                    calendarGrid.appendChild(dayElem);
                });

                let offset = (firstDay === 0 ? 6 : firstDay - 1);
                for (let i = 0; i < offset; i++) {
                    let emptyDiv = document.createElement("div");
                    emptyDiv.classList.add("hidden");
                    calendarGrid.appendChild(emptyDiv);
                }

                for (let day = 1; day <= daysInMonth; day++) {
                    let dayElem = document.createElement("div");
                    let fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                    dayElem.textContent = day;
                    if (this.tasks[fullDate]) {
                        dayElem.classList.add("task-day");
                    }

                    calendarGrid.appendChild(dayElem);
                }

                this.container.appendChild(calendarGrid);
            }

            changeMonth(direction) {
                this.date.setMonth(this.date.getMonth() + direction);
                this.render();
            }
        }

        const tasks = { '2025-03-14': true, '2025-03-20': true };

        const calendarContainer = document.getElementById("calendarContainer");
        const openCalendarBtn = document.getElementById("openCalendar");
        const prevMonthBtn = document.getElementById("prevMonth");
        const nextMonthBtn = document.getElementById("nextMonth");

        openCalendarBtn.addEventListener("click", () => {
            calendarContainer.style.display = calendarContainer.style.display === "block" ? "none" : "block";
        });

        const calendar = new Calendar("calendar", tasks);
        prevMonthBtn.addEventListener("click", () => calendar.changeMonth(-1));
        nextMonthBtn.addEventListener("click", () => calendar.changeMonth(1));
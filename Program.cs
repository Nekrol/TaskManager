using TaskManager;
using TaskManager.Data;
using TaskManager.Services;

var builder = WebApplication.CreateBuilder(args);

// Получаем строку подключения из appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Регистрируем сервисы
builder.Services.AddSingleton(new DatabaseContext(connectionString)); // Используем Singleton для контекста базы данных
builder.Services.AddScoped<BoardService>(); // Используем Scoped для сервисов
builder.Services.AddScoped<TaskService>(); // Используем Scoped для сервисов

// Добавляем Razor Pages (если нужны)
builder.Services.AddRazorPages();

var app = builder.Build();

// Конфигурация HTTP-пайплайна
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage(); // Для отладки в разработке
}
else
{
    app.UseExceptionHandler("/Error"); // Для продакшн-режима
    app.UseHsts(); // Применение политики безопасности
}

app.UseHttpsRedirection();
app.UseStaticFiles(); // Для работы с статическими файлами (если нужно)

app.UseRouting();

// Настройка маршрутов
app.MapRazorPages();
app.MapControllers(); // Добавляем маршруты для API

// Проверяем соединение с базой данных при запуске приложения
var dbContext = app.Services.GetRequiredService<DatabaseContext>();
dbContext.TestConnection(); // Проверка соединения с базой данных

// Запуск приложения
app.Run();

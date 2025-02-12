using TaskManager;
using TaskManager.Data;
using TaskManager.Services;

var builder = WebApplication.CreateBuilder(args);

// �������� ������ ����������� �� appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// ������������ �������
builder.Services.AddSingleton(new DatabaseContext(connectionString)); // ���������� Singleton ��� ��������� ���� ������
builder.Services.AddScoped<BoardService>(); // ���������� Scoped ��� ��������
builder.Services.AddScoped<TaskService>(); // ���������� Scoped ��� ��������

// ��������� Razor Pages (���� �����)
builder.Services.AddRazorPages();

var app = builder.Build();

// ������������ HTTP-���������
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage(); // ��� ������� � ����������
}
else
{
    app.UseExceptionHandler("/Error"); // ��� ��������-������
    app.UseHsts(); // ���������� �������� ������������
}

app.UseHttpsRedirection();
app.UseStaticFiles(); // ��� ������ � ������������ ������� (���� �����)

app.UseRouting();

// ��������� ���������
app.MapRazorPages();
app.MapControllers(); // ��������� �������� ��� API

// ��������� ���������� � ����� ������ ��� ������� ����������
var dbContext = app.Services.GetRequiredService<DatabaseContext>();
dbContext.TestConnection(); // �������� ���������� � ����� ������

// ������ ����������
app.Run();

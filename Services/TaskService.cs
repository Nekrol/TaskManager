using Dapper;
using System.Collections.Generic;
using System.Data.SQLite;
using System.Threading.Tasks;
using TaskManager.Data;
using TaskManager.Models;

namespace TaskManager.Services
{
    public class TaskService
    {
        private readonly DatabaseContext _dbContext;

        public TaskService(DatabaseContext dbContext) => _dbContext = dbContext;

        public async Task<IEnumerable<TaskModel>> GetTasksAsync()
        {
            const string query = "SELECT * FROM Tasks";
            using var connection = _dbContext.CreateConnection();
            return await connection.QueryAsync<TaskModel>(query);
        }

        public async Task<int> AddTaskAsync(TaskModel task)
        {
            if (task == null || string.IsNullOrWhiteSpace(task.Title))
                throw new ArgumentException("Task cannot be null and must have a title.");

            try
            {
                const string query = "INSERT INTO Tasks (Title, BoardId) VALUES (@Title, @BoardId); SELECT last_insert_rowid();";
                using var connection = _dbContext.CreateConnection();
                return await connection.QuerySingleAsync<int>(query, task);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка в AddTaskAsync: {ex.Message}");
                throw;
            }
        }


        public async Task<bool> DeleteTaskAsync(int id)
        {
            const string query = "DELETE FROM Tasks WHERE Id = @Id";
            using var connection = _dbContext.CreateConnection();
            int rowsAffected = await connection.ExecuteAsync(query, new { Id = id });
            return rowsAffected > 0;
        }
        public List<TaskModel> GetTasksByDate(DateTime date)
        {
            using var connection = _dbContext.CreateConnection();
            var sql = "SELECT Id, Title, DueDate FROM Tasks WHERE DueDate = @Date";
            return connection.Query<TaskModel>(sql, new { Date = date }).ToList();
        }
    }
}

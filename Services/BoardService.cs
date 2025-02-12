using Dapper;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskManager.Data;
using TaskManager.Models;

namespace TaskManager.Services
{
    public class BoardService
    {
        private readonly DatabaseContext _dbContext;

        public BoardService(DatabaseContext dbContext)
        {
            _dbContext = dbContext;
        }

        // Получение всех досок
        public async Task<IEnumerable<BoardModel>> GetBoardsAsync()
        {
            var query = "SELECT * FROM Boards";
            using (var connection = _dbContext.CreateConnection())
            {
                return await connection.QueryAsync<BoardModel>(query);
            }
        }

        // Добавление новой доски
        public async Task<int> AddBoardAsync(string name)
        {
            try
            {
                using var connection = _dbContext.CreateConnection();
                connection.Open();

                var query = "INSERT INTO Boards (Name) VALUES (@Name); SELECT last_insert_rowid();";
                var id = await connection.QuerySingleAsync<int>(query, new { Name = name });

                Console.WriteLine($"Успешно добавлено: {name} с ID {id}");
                return id;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка в AddBoardAsync: {ex.Message}");
                throw;
            }
        }




        // Удаление доски
        public async Task DeleteBoardAsync(int id)
        {
            var query = "DELETE FROM Boards WHERE Id = @Id";
            using (var connection = _dbContext.CreateConnection())
            {
                await connection.ExecuteAsync(query, new { Id = id });
            }
        }
    }
}

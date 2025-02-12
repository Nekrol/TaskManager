using System;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Data.SQLite;
using TaskManager.Pages;

namespace TaskManager.Data
{
    public class DatabaseContext
    {
        private readonly string _connectionString;

        
        public DatabaseContext(string connectionString)
        {
            _connectionString = connectionString;
        }
        public void TestConnection()
        {
            using (var connection = CreateConnection())
            {
                try
                {
                    connection.Open();
                    Console.WriteLine("Connection to SQLite opened successfully.");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error connecting to database: {ex.Message}");
                }
            }
        }
        public IDbConnection CreateConnection() => new SQLiteConnection(_connectionString);
    }
}

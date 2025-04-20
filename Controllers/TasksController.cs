using Microsoft.AspNetCore.Mvc;
using TaskManager.Services;
using TaskManager.Models;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Data.Entity.Core.Common.CommandTrees.ExpressionBuilder;
using System.Text.Json;

namespace TaskManager.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly TaskService _taskService;

        public TasksController(TaskService taskService)
        {
            _taskService = taskService;
        }

        [HttpGet("task-load")]
        public async Task<IActionResult> GetTasks()
        {
            var tasks = await _taskService.GetTasksAsync();
            return Ok(tasks);
        }

        [HttpPost("add-task")]
        public async Task<IActionResult> AddTask([FromBody] TaskDto taskDto)
        {
            if (taskDto == null || string.IsNullOrWhiteSpace(taskDto.Title))
                return BadRequest("TaskDto is required and must have a title.");

            var task = new TaskModel { Title = taskDto.Title };
            var taskId = await _taskService.AddTaskAsync(task);
            return Ok(new { Id = taskId, Title = taskDto.Title });
        }

        [HttpPost("create-task")]
        public async Task<IActionResult> CreateTask([FromBody] TaskDto taskDto)
        {
            if (string.IsNullOrWhiteSpace(taskDto.Title) || taskDto.BoardId <= 0)
                return BadRequest("BoardId и Title обязательны.");

            var task = new TaskModel { Title = taskDto.Title, BoardId = taskDto.BoardId };
            var taskId = await _taskService.AddTaskAsync(task);

            return Ok(new { Id = taskId });
        }
        [HttpPost("update-description/{taskId}")]
        public async Task<IActionResult> UpdateTaskDescription(int taskId, [FromBody] RawDto dto)
        {
            Console.WriteLine($"[сервер] пришло: {dto?.Description}");

            if (dto == null)
            {
                Console.WriteLine("[сервер] dto null");
                return BadRequest("Описание не может быть пустым.");
            }

            if (string.IsNullOrWhiteSpace(dto.Description))
            {
                Console.WriteLine("[сервер] пустая строка");
                return BadRequest("Описание не может быть пустым.");
            }

            try
            {
                Console.WriteLine("[сервер] всё ок, отправляю на сервис");
                await _taskService.UpdateTaskDescription(taskId, dto.Description);
                return Ok("Описание обновлено.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[сервер] ошибка: {ex.Message}");
                return StatusCode(500, $"Ошибка при обновлении описания: {ex.Message}");
            }
        }




        [HttpGet("get-description/{taskId}")]
        public async Task<IActionResult> GetTaskDescription(int taskId)
        {
            try
            {
                var description = await _taskService.GetTaskDescription(taskId);
                if (description == null)
                    return NotFound("Задача не найдена или описание отсутствует.");

                return Ok(new { Description = description });
            }
            catch (Exception ex)
            {   
                return StatusCode(500, $"Ошибка при получении описания: {ex.Message}");
            }
        }

        [HttpDelete("delete-task/{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            if (id <= 0)
                return BadRequest("неправильный ID");

            var success = await _taskService.DeleteTaskAsync(id);
            return success ? Ok("удалено") : NotFound("задача не найдена");
        }

        [HttpPut("update-title/{taskId}")]
        public async Task<IActionResult> UpdateTitle(int taskId)
        {
            using var reader = new StreamReader(Request.Body);
            var body = await reader.ReadToEndAsync();
            Console.WriteLine($"[контроллер] Сырое тело запроса: {body}");

            var dto = JsonSerializer.Deserialize<TaskDto>(body);
            Console.WriteLine($"[контроллер] dto.Title: {dto?.Title}");

            if (dto == null || string.IsNullOrWhiteSpace(dto.Title))
            {
                Console.WriteLine("[controller] ошибка: пустой DTO или title");
                return BadRequest("Новое название не может быть пустым.");
            }

            await _taskService.UpdateTaskTitleAsync(taskId, dto.Title);
            return Ok("Название обновлено.");
        }



        [HttpGet("by-date")]
        public IActionResult GetByDate([FromQuery] DateTime date)
        {
            return Ok(_taskService.GetTasksByDate(date));
        }
    }
}

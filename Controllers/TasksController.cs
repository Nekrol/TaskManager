using Microsoft.AspNetCore.Mvc;
using TaskManager.Services;
using TaskManager.Models;

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

        [HttpGet]
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
            if (string.IsNullOrWhiteSpace(taskDto.Title))
                return BadRequest("Board name is required.");

            Console.WriteLine($"Добавляем в базу данных: {taskDto.Title}");

            var task = new TaskModel { Title = taskDto.Title };
            var taskId = await _taskService.AddTaskAsync(task);

            return Ok(new { Id = taskId });
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            if (id <= 0)
                return BadRequest("Invalid task ID.");

            await _taskService.DeleteTaskAsync(id);
            return Ok();
        }
    }
}

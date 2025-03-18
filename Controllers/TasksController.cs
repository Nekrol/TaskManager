using Microsoft.AspNetCore.Mvc;
using TaskManager.Services;
using TaskManager.Models;
using System.Data.Entity;

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


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            if (id <= 0)
                return BadRequest("Invalid task ID.");

            await _taskService.DeleteTaskAsync(id);
            return Ok();
        }

        [HttpGet("by-date")]
        public IActionResult GetByDate([FromQuery] DateTime date)
        {
            return Ok(_taskService.GetTasksByDate(date));
        }
    }
}

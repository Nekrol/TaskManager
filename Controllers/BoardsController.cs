using Microsoft.AspNetCore.Mvc;
using TaskManager.Services;
using TaskManager.Models;
using System.Xml.Linq;

namespace TaskManager.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BoardsController : ControllerBase
    {
        private readonly BoardService _boardService;

        public BoardsController(BoardService boardService)
        {
            _boardService = boardService;
        }

        [HttpGet("board-load")]
        public async Task<IActionResult> GetBoards()
        {
            var boards = await _boardService.GetBoardsAsync();
            return Ok(boards);
        }

        // Изменен маршрут для метода AddBoard
        [HttpPost("add-board")]  
        public async Task<IActionResult> AddBoard([FromBody] string name)
        {
            await _boardService.AddBoardAsync(name);
            return Ok();
        }

        // Изменен маршрут для метода CreateBoard
        [HttpPost("create-board")] 
        public async Task<IActionResult> CreateBoard([FromBody] BoardDto boardDto)
        {
            if (string.IsNullOrWhiteSpace(boardDto.Name))
                return BadRequest("Board name is required.");

            Console.WriteLine($"Добавляем в базу данных: {boardDto.Name}");
            var boardId = await _boardService.AddBoardAsync(boardDto.Name);


            return Ok(new { Id = boardId });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBoard(int id)
        {
            await _boardService.DeleteBoardAsync(id);
            return Ok();
        }
    }
}

using System.Text.Json.Serialization;

namespace TaskManager.Models
{
    public class TaskDto
    {
        [JsonPropertyName("title")]
        public string Title { get; set; }
        public int BoardId { get; set; }
        public string Description { get; set; }
    }
}

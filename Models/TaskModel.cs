﻿namespace TaskManager.Models
{
    public class TaskModel
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public int BoardId { get; set; }
        public DateTime? DueDate { get; set; }
        public string Description { get; set; }
    }
}

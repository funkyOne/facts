using System.Collections.Generic;

namespace Facts.Models
{
    public class TopicDto
    {
        public int Id { get; set; }
        public string Title { get; set; }

        public IEnumerable<Fact> Facts { get; set; }
    }
}
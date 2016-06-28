using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace Facts
{
    public class FactsContext : DbContext
    {
        public DbSet<Topic> Topics { get; set; }
        public DbSet<Fact> Facts { get; set; }
        public DbSet<Issue> Issues { get; set; }
        public DbSet<FactIssue> FactIssues { get; set; }

        public FactsContext(DbContextOptions<FactsContext> options)
            : base(options)
        {

        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<FactTopic>()
                .HasKey(t => new { t.FactId, t.TopicId });

            modelBuilder.Entity<FactTopic>()
                .HasOne(pt => pt.Fact)
                .WithMany(p => p.FactTopics)
                .HasForeignKey(pt => pt.FactId);

            modelBuilder.Entity<FactTopic>()
                .HasOne(pt => pt.Topic)
                .WithMany(t => t.FactTopics)
                .HasForeignKey(pt => pt.TopicId);

            modelBuilder.Entity<FactIssue>()
                .HasKey(t => new { t.FactId, t.IssueId });

            modelBuilder.Entity<FactIssue>()
                .HasOne(pt => pt.Fact)
                .WithMany(p => p.FactIssues)
                .HasForeignKey(pt => pt.FactId);

            modelBuilder.Entity<FactIssue>()
                .HasOne(pt => pt.Issue)
                .WithMany(t => t.FactIssues)
                .HasForeignKey(pt => pt.IssueId);
        }
    }

    public class Topic
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string EpicKey { get; set; }

        public List<FactTopic> FactTopics { get; set; }

        public void AddFact(int factId)
        {
            this.FactTopics.Add(new FactTopic { FactId = factId });
        }

        public void AddFact(Fact fact)
        {
            this.AddFact(fact.Id);
        }
    }

    public class Fact
    {
        public Fact()
        {
            FactTopics = new List<FactTopic>();
            FactIssues = new List<FactIssue>();
        }
        public int Id { get; set; }
        public string Text { get; set; }
        public string Html { get; set; }

        [JsonIgnore]
        public List<FactTopic> FactTopics { get; set; }
        [JsonIgnore]
        public List<FactIssue> FactIssues { get; set; }

        public void AddToTopic(Topic topic)
        {
            this.FactTopics.Add(new FactTopic { TopicId = topic.Id });
        }
    }

    public class FactTopic
    {
        public int FactId { get; set; }
        public Fact Fact { get; set; }
        public int TopicId { get; set; }
        public Topic Topic { get; set; }
    }

    public class Issue
    {
        public int Id { get; set; }
        public string Text { get; set; }
        public string Title { get; set; }

        public string Key { get; set; }
        public string EpicKey { get; set; }

        public bool Processed { get; set; }
        public int JiraId { get; set; }
        public int IssueType { get; set; }

        public List<FactIssue> FactIssues { get; set; }
    }

    public class FactIssue
    {
        public int FactId { get; set; }
        public Fact Fact { get; set; }
        public int IssueId { get; set; }
        public Issue Issue { get; set; }
    }
}
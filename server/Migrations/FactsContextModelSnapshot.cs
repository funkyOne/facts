using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Facts;

namespace facts.server.Migrations
{
    [DbContext(typeof(FactsContext))]
    partial class FactsContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
            modelBuilder
                .HasAnnotation("ProductVersion", "1.0.0-rtm-21431");

            modelBuilder.Entity("Facts.Fact", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Html");

                    b.Property<string>("Text");

                    b.HasKey("Id");

                    b.ToTable("Facts");
                });

            modelBuilder.Entity("Facts.FactIssue", b =>
                {
                    b.Property<int>("FactId");

                    b.Property<int>("IssueId");

                    b.HasKey("FactId", "IssueId");

                    b.HasIndex("FactId");

                    b.HasIndex("IssueId");

                    b.ToTable("FactIssues");
                });

            modelBuilder.Entity("Facts.FactTopic", b =>
                {
                    b.Property<int>("FactId");

                    b.Property<int>("TopicId");

                    b.HasKey("FactId", "TopicId");

                    b.HasIndex("FactId");

                    b.HasIndex("TopicId");

                    b.ToTable("FactTopic");
                });

            modelBuilder.Entity("Facts.Issue", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("EpicKey");

                    b.Property<int>("IssueType");

                    b.Property<int>("JiraId");

                    b.Property<string>("Key");

                    b.Property<bool>("Processed");

                    b.Property<string>("Text");

                    b.Property<string>("Title");

                    b.HasKey("Id");

                    b.ToTable("Issues");
                });

            modelBuilder.Entity("Facts.Topic", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("EpicKey");

                    b.Property<string>("Title");

                    b.HasKey("Id");

                    b.ToTable("Topics");
                });

            modelBuilder.Entity("Facts.FactIssue", b =>
                {
                    b.HasOne("Facts.Fact", "Fact")
                        .WithMany("FactIssues")
                        .HasForeignKey("FactId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("Facts.Issue", "Issue")
                        .WithMany("FactIssues")
                        .HasForeignKey("IssueId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("Facts.FactTopic", b =>
                {
                    b.HasOne("Facts.Fact", "Fact")
                        .WithMany("FactTopics")
                        .HasForeignKey("FactId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("Facts.Topic", "Topic")
                        .WithMany("FactTopics")
                        .HasForeignKey("TopicId")
                        .OnDelete(DeleteBehavior.Cascade);
                });
        }
    }
}

using Facts.Intergation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Facts
{
    public class IssueImport
    {
        const int MinAvailableIssueId = 10204;
        const int EpicIssueType = 6;
        private FactsContext db;

        private JiraAdapter adapter;
        private ILogger<IssueImport> logger;

        public IssueImport(FactsContext db, JiraAdapter adapter, ILogger<IssueImport> logger)
        {
            this.db = db;
            this.adapter = adapter;
            this.logger = logger;
        }

        /// <summary>
        /// Converts issue to fact or topic and saves.
        /// </summary>
        /// <param name="issue"> issue to process</param>
        public async Task ConvertIssue(Issue issue)
        {
            if (issue.IssueType == EpicIssueType)
            {
                var cat = await this.db.Topics.CountAsync(t => t.EpicKey == issue.Key);
                if (cat > 0)
                {
                    return;
                }

                this.db.Topics.Add(new Topic { Title = issue.Title, EpicKey = issue.Key });
            }
            else
            {
                var factIssue = await this.db.FactIssues.FirstOrDefaultAsync(fi => fi.IssueId == issue.Id);

                if (factIssue != null)
                {
                    this.AddFactToTopic(factIssue.FactId, issue.EpicKey);
                }
                else
                {                    
                    var topic = await this.db.Topics.FirstOrDefaultAsync(t => t.EpicKey == issue.EpicKey);
                    // topic might not exist yet
                    if (topic == null)
                    {
                        return;
                    }

                    var fact = new Fact { Text = issue.Text, Html = CommonMark.CommonMarkConverter.Convert(issue.Text)};

                    fact.AddToTopic(topic);

                    db.Facts.Add(fact);
                }
            }

            issue.Processed = true;
            await db.SaveChangesAsync();
        }

        public void AddFactToTopic(int factId, string epicKey)
        {
            var topic = this.db.Topics.FirstOrDefault(t => t.EpicKey == epicKey);

            if (topic == null)
            {
                throw new Exception($"couldn't find topic associated with epic_key {epicKey}");
            }

            topic.AddFact(factId);
        }

        public async Task ImportAll()
        {
            var maxJiraId = this.db.Issues.Max(i => i.JiraId);
            var startId = maxJiraId == 0 ? MinAvailableIssueId : maxJiraId + 1;
            int lastBatchCount;

            do
            {
                var issues = await this.adapter.ProcessIssues("PPAB", startId);
                lastBatchCount = issues.Count();
                logger.LogTrace($"got {lastBatchCount} issues. converting");

                if (lastBatchCount > 0)
                {
                    this.db.Issues.AddRange(issues);
                    await db.SaveChangesAsync();

                    startId = issues.Max(i => i.JiraId);
                }
            }
            while (lastBatchCount > 0);
            logger.LogTrace("got to end of issues");
        }

        public async Task ProcessAll()
        {
            var issues =  await db.Issues.Where(i => !i.Processed).ToArrayAsync();

            foreach (var issue in issues)
            {
                await ConvertIssue(issue);
            }
        }
    }
}

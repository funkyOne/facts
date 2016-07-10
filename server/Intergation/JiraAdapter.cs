using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace Facts.Intergation
{
    public class JiraAdapter
    {
        const string apiBaseUrl = "/rest/api/2/search";
        const string apiHost = "ppab.mplogic.co.uk";
        const int port = 8089;

        const string session = "bGVnYTpxYXp4c3c=";
        const string epicField = "customfield_10006";

        public string GetJql(string project, int issueStartKey)
        {
          var filters = new List<string> {$"project={project}", $"id>{issueStartKey}"};
          var orderClause = "order by id";

            var jql = $"{ string.Join(" AND ", filters)} {orderClause}";

            return jql;
        }

        public async Task<IEnumerable<Issue>> ProcessIssues(string project, int issueStartKey)
        {
            var jql = this.GetJql(project, issueStartKey);

            return await BatchedSearch(jql);
        }


        public async Task<IEnumerable<Issue>> BatchedSearch(string jql, int batchSize = 50)
        {
            var resourcePath = $"maxResults={batchSize}&jql={Uri.EscapeDataString(jql)}"; //&startAt={startAt}
            var client = new HttpClient();
            var uriBuilder = new UriBuilder() { Host = apiHost, Port = port, Path = apiBaseUrl, Query = resourcePath };
            client.DefaultRequestHeaders.Add("Authorization", $"Basic {session}");
            var response = await client.GetAsync(uriBuilder.Uri);
            var jsonString = await response.Content.ReadAsStringAsync();

            dynamic data = JsonConvert.DeserializeObject(jsonString);
            return (data.issues as IEnumerable<dynamic>).Select(o => new Issue
            {
                JiraId = o.id,
                EpicKey = o.fields?[epicField],
                Text = o.fields?.description,
                Title = o.fields.summary,
                Key = o.key,
                IssueType = o.fields.issuetype.id
            });
        }
    }
}

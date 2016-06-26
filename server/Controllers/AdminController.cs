using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Facts.Controllers
{
    public class AdminController
    {
        private IssueImport import;

        public AdminController(IssueImport import)
        {
            this.import = import;
        }

        public async Task<IActionResult> Import()
        {
            await import.ImportAll();

            return new NoContentResult();
        }

        public async Task<IActionResult> Process()
        {            
            await import.ProcessAll();

            return new NoContentResult();
        }
    }
}

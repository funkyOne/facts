using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Facts.Models;
using System.Linq;

namespace Facts.Controllers
{
    [Route("api/[controller]")]
    public class FactsController : Controller
    {
        private FactsContext _context;

        public FactsController(FactsContext context)
        {
            _context = context;
        }

        public async Task<List<TopicDto>> GetAll()
        {
            var categories = await _context.Topics.Include(t => t.FactTopics).ThenInclude(t=>t.Fact).ToArrayAsync();
            var dtos = Mapper.Map<List<TopicDto>>(categories);

            return dtos;
        }

        [HttpGet("{id}/issues", Name = "GetFactIssues")]
        public async Task<List<Issue>> GetIssue(int id)
        {
            return await _context.FactIssues.Where(f => f.FactId == id).Select(fi => fi.Issue).ToListAsync();
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Fact fact)
        {
            if (fact == null)
            {
                return BadRequest();
            }

            _context.Add(fact);
            await _context.SaveChangesAsync();

            return new CreatedResult("", fact);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Fact fact)
        {
            if (fact == null || id == default(int))
            {
                return BadRequest();
            }

            _context.Entry(fact).State = EntityState.Modified;
            
            await _context.SaveChangesAsync();

            return new NoContentResult();
        }
    }
}
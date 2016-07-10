using AutoMapper;
using Facts.Intergation;
using Facts.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
//using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.Linq;

namespace Facts
{
    public class Startup
    {
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole();

            app.UseCors(builder => builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            app.UseMvcWithDefaultRoute();
            
            Mapper.Initialize(cfg =>
            {
                cfg.CreateMap<Topic, TopicDto>().ForMember(x => x.Facts, c => c.MapFrom(x => x.FactTopics.Select(ft => ft.Fact)));
            });            
        }

        public void ConfigureServices(IServiceCollection services)
        {            
            var connection = "Host=localhost;Username=facts_app;Password=JuB8bNwFyyTePvhd;Database=facts";
            ///var connection = @"postgres://:JuB8bNwFyyTePvhd@localhost:5432/facts";

//            services.AddDbContext<FactsContext>(options => options.UseSqlServer(@"Data Source=(localdb)\MSSQLLocalDB;Initial Catalog=Facts; Integrated Security=SSPI"));
            services.AddDbContext<FactsContext>(options => options.UseNpgsql(connection));
            services.AddTransient<JiraAdapter>();
            services.AddTransient<IssueImport>();
            services.AddMvc();
            services.AddCors();
        }
    }
}
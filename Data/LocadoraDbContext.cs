
using ApiLocadoraVeiculos.Models;
using Microsoft.EntityFrameworkCore;

namespace ApiLocadoraVeiculos.Data;

public class LocadoraDbContext : DbContext
{
    public LocadoraDbContext(DbContextOptions<LocadoraDbContext> options)
        : base(options)
    {
    }

    public DbSet<Veiculo> Veiculos => Set<Veiculo>();
}

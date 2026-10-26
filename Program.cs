
using ApiLocadoraVeiculos.Data;
using ApiLocadoraVeiculos.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configuração do banco SQLite com Entity Framework Core
builder.Services.AddDbContext<LocadoraDbContext>(options =>
    options.UseSqlite(
        builder.Configuration.GetConnectionString("Locadora")
    )
);

var app = builder.Build();

// Permite abrir o frontend da pasta wwwroot
app.UseDefaultFiles();
app.UseStaticFiles();


// ROTA RAIZ - INFORMAÇÕES DA API
app.MapGet("/api", () =>
{
    return Results.Ok(new
    {
        mensagem = "API da Locadora de Veículos está no ar!"
    });
});


// GET - LISTAR TODOS OS VEÍCULOS
app.MapGet("/api/veiculos", async (LocadoraDbContext db) =>
{
    var veiculos = await db.Veiculos.ToListAsync();

    return Results.Ok(veiculos);
});


// GET - BUSCAR VEÍCULO POR ID
app.MapGet("/api/veiculos/{id:int}",
    async (int id, LocadoraDbContext db) =>
{
    var veiculoEncontrado = await db.Veiculos.FindAsync(id);

    if (veiculoEncontrado is null)
    {
        return Results.NotFound();
    }

    return Results.Ok(veiculoEncontrado);
});


// POST - CADASTRAR NOVO VEÍCULO
app.MapPost("/api/veiculos",
    async (VeiculoInput dados, LocadoraDbContext db) =>
{
    var novoVeiculo = new Veiculo
    {
        Marca = dados.Marca,
        Modelo = dados.Modelo,
        Ano = dados.Ano,
        Placa = dados.Placa,
        ValorDiaria = dados.ValorDiaria,
        Disponivel = dados.Disponivel
    };

    db.Veiculos.Add(novoVeiculo);

    await db.SaveChangesAsync();

    return Results.Created(
        $"/api/veiculos/{novoVeiculo.Id}",
        novoVeiculo
    );
});


// PUT - ATUALIZAR VEÍCULO
app.MapPut("/api/veiculos/{id:int}",
    async (int id, VeiculoInput dados, LocadoraDbContext db) =>
{
    var veiculoEncontrado = await db.Veiculos.FindAsync(id);

    if (veiculoEncontrado is null)
    {
        return Results.NotFound();
    }

    veiculoEncontrado.Marca = dados.Marca;
    veiculoEncontrado.Modelo = dados.Modelo;
    veiculoEncontrado.Ano = dados.Ano;
    veiculoEncontrado.Placa = dados.Placa;
    veiculoEncontrado.ValorDiaria = dados.ValorDiaria;
    veiculoEncontrado.Disponivel = dados.Disponivel;

    await db.SaveChangesAsync();

    return Results.Ok(veiculoEncontrado);
});


// DELETE - REMOVER VEÍCULO
app.MapDelete("/api/veiculos/{id:int}",
    async (int id, LocadoraDbContext db) =>
{
    var veiculoEncontrado = await db.Veiculos.FindAsync(id);

    if (veiculoEncontrado is null)
    {
        return Results.NotFound();
    }

    db.Veiculos.Remove(veiculoEncontrado);

    await db.SaveChangesAsync();

    return Results.NoContent();
});


app.Run();


// DTO DE ENTRADA - SEM ID
public record VeiculoInput(
    string Marca,
    string Modelo,
    int Ano,
    string Placa,
    decimal ValorDiaria,
    bool Disponivel
);

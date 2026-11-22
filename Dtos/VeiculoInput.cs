
namespace ApiLocadoraVeiculos.Dtos;

public record VeiculoInput(
    string Marca,
    string Modelo,
    int Ano,
    string Placa,
    decimal ValorDiaria,
    bool Disponivel
);

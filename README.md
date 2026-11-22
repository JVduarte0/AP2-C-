# API Locadora de Veículos — AP1, AP2 e AS

## Sobre o projeto

Este projeto consiste em uma API REST desenvolvida em C# utilizando ASP.NET Core, .NET 10 e Minimal API.

O tema escolhido é uma **Locadora de Veículos**, cujo objetivo é permitir o gerenciamento dos veículos cadastrados.

O projeto foi desenvolvido em três etapas:

- **AP1:** implementação inicial da API com armazenamento em memória.
- **AP2:** integração com Entity Framework Core e SQLite, permitindo persistência dos dados e comunicação com a interface web.
- **AS:** organização do código em arquivos e pastas por responsabilidade, preservando o funcionamento da aplicação e demonstrando as operações HTTP no Bruno.

O sistema permite cadastrar, listar, consultar, atualizar e excluir veículos, mantendo os registros não excluídos após reiniciar a aplicação.

## Tecnologias utilizadas

- C#
- .NET 10
- ASP.NET Core — Minimal API
- Entity Framework Core
- SQLite
- HTML, CSS e JavaScript
- Bruno
- Git e GitHub

## Organização do projeto

Na AS, o código foi organizado em arquivos e pastas separados por responsabilidade, facilitando a manutenção e a compreensão da aplicação.

```text
ApiLocadoraVeiculos/
├── Data/
│   └── LocadoraDbContext.cs
├── Dtos/
│   └── VeiculoInput.cs
├── Models/
│   └── Veiculo.cs
├── Migrations/
├── Properties/
│   └── launchSettings.json
├── wwwroot/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── bruno/
├── Program.cs
├── ApiLocadoraVeiculos.csproj
├── appsettings.json
├── .gitignore
└── README.md
```

**Responsabilidade dos arquivos:**

- `Models/Veiculo.cs`: define a entidade Veiculo e suas propriedades.
- `Dtos/VeiculoInput.cs`: define os dados recebidos nas requisições de cadastro e atualização, sem incluir o identificador.
- `Data/LocadoraDbContext.cs`: gerencia a comunicação entre a aplicação e o banco SQLite por meio do Entity Framework Core.
- `Program.cs`: configura a aplicação, registra o contexto do banco, configura os middlewares e define os endpoints HTTP.
- `Migrations/`: contém as migrações utilizadas para preparar a estrutura do banco.
- `wwwroot/`: contém os arquivos da interface web.
- `bruno/`: contém a Collection de testes HTTP.

Os namespaces `ApiLocadoraVeiculos.Models`, `ApiLocadoraVeiculos.Dtos` e `ApiLocadoraVeiculos.Data` permitem que os tipos sejam utilizados no `Program.cs` por meio das diretivas `using`.

## Requisitos

Para executar o projeto, são necessários:

- SDK do .NET 10.
- Ferramenta `dotnet-ef` compatível com o Entity Framework Core 10 para aplicar as migrações.
- Bruno para executar os testes HTTP.

Para verificar a versão do .NET:

```bash
dotnet --version
```

Para instalar o `dotnet-ef`, caso necessário:

```bash
dotnet tool install --global dotnet-ef --version 10.0.12
```

## Como executar

Abra o terminal na pasta que contém o arquivo `ApiLocadoraVeiculos.csproj`.

**1. Restaurar dependências**

```bash
dotnet restore
```

**2. Preparar o banco SQLite**

```bash
dotnet ef database update
```

**3. Compilar o projeto**

```bash
dotnet build
```

**4. Executar a aplicação**

```bash
dotnet run --urls http://localhost:5050
```

A aplicação estará disponível em:

http://localhost:5050

A API poderá ser consultada em:

http://localhost:5050/api/veiculos

## Banco de dados e persistência

A aplicação utiliza Entity Framework Core com SQLite.

A conexão está configurada no `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "Locadora": "Data Source=locadora.db"
  }
}
```

O banco é preparado por meio das migrações existentes na pasta `Migrations/`, utilizando o comando:

```bash
dotnet ef database update
```

As operações de cadastro, atualização e exclusão utilizam `SaveChangesAsync()` para persistir as alterações.

Foi realizado um teste de persistência no qual um veículo foi cadastrado, a API foi encerrada e iniciada novamente e o mesmo registro foi consultado com sucesso.

O arquivo local `locadora.db` não precisa ser enviado ao GitHub, pois o banco pode ser preparado novamente pelas migrações.

## Endpoints da API

| Método | Rota | Descrição | Resposta |
|---
# API Locadora de Veículos — AP2

## Sobre o projeto

Este projeto consiste em uma API REST desenvolvida em C# com ASP.NET Core, .NET 10 e Minimal API.

O tema escolhido foi uma **Locadora de Veículos**, tendo como recurso principal o gerenciamento dos veículos cadastrados na locadora.

O projeto foi desenvolvido inicialmente na AP1, utilizando uma lista em memória. Na AP2, a aplicação foi evoluída para utilizar **Entity Framework Core com banco de dados SQLite**, permitindo a persistência dos dados.

Também foi realizada a integração do frontend existente com os endpoints reais da API.

O sistema permite:

- Listar todos os veículos cadastrados.
- Buscar um veículo pelo ID.
- Cadastrar novos veículos.
- Atualizar informações de veículos.
- Excluir veículos.
- Visualizar e gerenciar os veículos através da interface web.
- Manter os dados armazenados mesmo após reiniciar a aplicação.

## Tecnologias utilizadas

- C#
- .NET 10
- ASP.NET Core
- Minimal API
- Entity Framework Core
- SQLite
- HTML, CSS e JavaScript
- Bruno para testes das requisições HTTP
- Git e GitHub para versionamento

## Requisitos

Para executar o projeto, é necessário possuir o SDK do .NET 10 instalado.

Para verificar a versão instalada:

```bash
dotnet --version
```

Também é possível visualizar todos os SDKs instalados:

```bash
dotnet --list-sdks
```

Para trabalhar com as migrations, é necessário possuir a ferramenta `dotnet-ef`, compatível com o Entity Framework Core 10.

## Como executar o projeto

Abra o terminal na pasta que contém o arquivo `ApiLocadoraVeiculos.csproj`.

Restaure as dependências:

```bash
dotnet restore
```

Prepare o banco de dados SQLite utilizando as migrations:

```bash
dotnet ef database update
```

Execute a aplicação:

```bash
dotnet run --urls http://localhost:5050
```

A aplicação estará disponível em:

http://localhost:5050

Para verificar se o projeto compila corretamente:

```bash
dotnet build
```

## Banco de dados e persistência

Na AP2, os dados passaram a ser armazenados em um banco SQLite, utilizando Entity Framework Core.

O projeto possui:

- `Models/Veiculo.cs`: representa a entidade Veiculo.
- `Data/LocadoraDbContext.cs`: contexto responsável pela comunicação com o banco.
- `Migrations/`: arquivos responsáveis pela criação e atualização da estrutura do banco.
- `appsettings.json`: contém a configuração de conexão com o SQLite.
- `Program.cs`: contém as rotas HTTP da API.

O banco é gerenciado pelo Entity Framework Core através do `DbContext` e das operações `SaveChangesAsync()`.

Dessa forma, os veículos cadastrados e não excluídos permanecem armazenados após o encerramento e reinício da aplicação.

O arquivo local `locadora.db` não é enviado ao GitHub. O banco pode ser preparado novamente utilizando as migrations.

## Endpoints da API

| Método | Rota | Descrição | Sucesso |
|---|---|---|---|
| GET | `/api/veiculos` | Lista todos os veículos | 200 |
| GET | `/api/veiculos/{id}` | Busca veículo pelo ID | 200 |
| POST | `/api/veiculos` | Cadastra novo veículo | 201 |
| PUT | `/api/veiculos/{id}` | Atualiza veículo existente | 200 |
| DELETE | `/api/veiculos/{id}` | Exclui veículo | 204 |

Quando um veículo solicitado não existe, a API retorna `404 Not Found`.

## Exemplo de cadastro — POST

Rota:

`POST /api/veiculos`

Exemplo de JSON:

```json
{
  "marca": "Volkswagen",
  "modelo": "Polo",
  "ano": 2023,
  "placa": "GHI7J89",
  "valorDiaria": 220.00,
  "disponivel": true
}
```

Quando o veículo é cadastrado corretamente, a API retorna `201 Created`, incluindo os dados do veículo e seu ID.

## Exemplo de atualização — PUT

Rota:

`PUT /api/veiculos/{id}`

Exemplo de JSON:

```json
{
  "marca": "Volkswagen",
  "modelo": "Polo",
  "ano": 2023,
  "placa": "GHI7J89",
  "valorDiaria": 250.00,
  "disponivel": false
}
```

Quando a atualização é realizada corretamente, a API retorna `200 OK`.

Caso o ID informado não exista, retorna `404 Not Found`.

## Exclusão de veículo — DELETE

Rota:

`DELETE /api/veiculos/{id}`

Quando a exclusão é realizada corretamente, a API retorna `204 No Content`.

Caso o veículo não exista, retorna `404 Not Found`.

## Frontend integrado

Na AP2, a interface web desenvolvida anteriormente foi integrada à API real.

Os arquivos estão localizados na pasta `wwwroot/`:

- `index.html`: estrutura da interface.
- `style.css`: estilização da aplicação.
- `app.js`: comunicação com os endpoints da API.

A interface permite cadastrar, listar, visualizar, editar e excluir veículos diretamente pelo navegador.

As operações utilizam requisições HTTP para a API, e os dados são armazenados no banco SQLite.

Para acessar a interface, inicie a aplicação e abra:

http://localhost:5050

A interface utiliza a mesma origem da API.

## Testes da API com Bruno

Os testes das requisições HTTP foram realizados utilizando o Bruno.

A Collection está armazenada na pasta `Locadora de Veiculos/` do repositório.

Ela contém as seguintes requisições:

1. 00 - API no ar
2. 01 - Listar
3. 02 - Buscar por id
4. 03 - Cadastrar
5. 04 - Atualizar
6. 05 - Remover
7. 06 - Confirmação de remoção

Os testes permitem verificar os códigos HTTP:

- `200 OK`
- `201 Created`
- `204 No Content`
- `404 Not Found`

Também foi verificada a persistência dos registros após reiniciar a aplicação.

## Testes da interface

A interface web foi utilizada para testar o funcionamento integrado entre frontend, API e banco de dados.

Foram realizados testes de cadastro, listagem, atualização e exclusão de veículos.

As alterações realizadas pela interface são enviadas aos endpoints da API e refletidas nos dados armazenados no SQLite.

## Vídeo de demonstração — AP2

O vídeo apresenta o funcionamento completo da aplicação, demonstrando:

- A organização do projeto e sua evolução da AP1 para a AP2.
- A execução da API com Entity Framework Core e SQLite.
- Os testes das rotas GET, POST, PUT e DELETE no Bruno.
- Os códigos de resposta HTTP.
- A integração do frontend com a API real.
- O cadastro, a edição e a exclusão de veículos pelo navegador.
- A persistência dos dados após reiniciar a aplicação.

**Link do vídeo da AP2:**

[A inserir após a gravação]

## Vídeo de demonstração — AP1

Vídeo da primeira etapa do projeto:

https://youtu.be/IabnmqN-gFA


## Autor

João Vitor Duarte

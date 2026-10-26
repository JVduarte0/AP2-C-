# API Locadora de Veículos

## Sobre o projeto

Este projeto consiste em uma API REST desenvolvida em ASP.NET Core utilizando .NET 10 e Minimal API.

O tema escolhido foi uma **Locadora de Veículos**, tendo como recurso principal os veículos disponíveis na locadora.

A API permite listar, buscar, cadastrar, atualizar e remover veículos.

Os dados são armazenados em uma `List<Veiculo>` na memória da aplicação. Portanto, os dados cadastrados, alterados ou removidos durante a execução são perdidos quando a API é reiniciada.

---

## Tecnologias utilizadas

- .NET 10
- ASP.NET Core
- Minimal API
- C#
- Bruno para testes das requisições HTTP

---

## Requisitos

Para executar o projeto é necessário possuir o SDK do **.NET 10** instalado.

Para verificar a versão instalada:

```bash
dotnet --version
```

Também é possível visualizar todos os SDKs instalados:

```bash
dotnet --list-sdks
```

---

## Como executar o projeto

Abra o terminal na pasta do projeto e execute:

```bash
dotnet run --urls http://localhost:5050
```

A API ficará disponível em:

```text
http://localhost:5050
```

Para verificar se o projeto compila corretamente:

```bash
dotnet build
```

---

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Verifica se a API está em funcionamento |
| GET | `/api/veiculos` | Lista todos os veículos |
| GET | `/api/veiculos/{id}` | Busca um veículo pelo ID |
| POST | `/api/veiculos` | Cadastra um novo veículo |
| PUT | `/api/veiculos/{id}` | Atualiza os dados de um veículo |
| DELETE | `/api/veiculos/{id}` | Remove um veículo |

---

## Exemplo de cadastro - POST

Rota:

```text
POST /api/veiculos
```

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

Quando o veículo é cadastrado corretamente, a API retorna o código HTTP:

```text
201 Created
```

---

## Exemplo de atualização - PUT

Rota:

```text
PUT /api/veiculos/{id}
```

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

Quando o veículo é atualizado corretamente, a API retorna:

```text
200 OK
```

Caso o ID informado não exista, a API retorna:

```text
404 Not Found
```

---

## Remoção de veículo

Para remover um veículo:

```text
DELETE /api/veiculos/{id}
```

Quando a remoção é realizada com sucesso, a API retorna:

```text
204 No Content
```

Caso o veículo não exista:

```text
404 Not Found
```

---

## Armazenamento dos dados

Os veículos são armazenados em uma `List<Veiculo>` em memória.

A aplicação inicia com dois veículos cadastrados para possibilitar os testes da API.

Não foi utilizado banco de dados ou Entity Framework.

Como os dados ficam somente na memória, qualquer cadastro, alteração ou remoção realizado durante a execução será perdido quando a aplicação for encerrada ou reiniciada.

---

## Testes da API

Os testes foram realizados utilizando o **Bruno**.

A Collection está armazenada na pasta:

```text
/bruno
```

A Collection contém as seguintes requisições:

- `00 - API no ar`
- `01 - Listar`
- `02 - Buscar por id`
- `03 - Cadastrar`
- `04 - Atualizar`
- `05 - Remover`
- `06 - Confirmação remoção`

Os testes permitem verificar os códigos HTTP `200 OK`, `201 Created`, `204 No Content` e `404 Not Found`.

---

## Vídeo de demonstração

O vídeo demonstra a execução da API, o funcionamento das rotas e os testes realizados através do Bruno.

**Link do vídeo:**

```text
https://youtu.be/IabnmqN-gFA
```

---

## Autor

João Vitor Duarte do Santos.

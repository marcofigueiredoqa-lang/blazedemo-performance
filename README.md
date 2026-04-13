# Testes de Performance — Blazedemo (QA Performance)

Testes de performance do fluxo de **compra de passagem aérea** do site [Blazedemo](https://www.blazedemo.com), desenvolvidos com **Apache JMeter 5.6.3**, como parte do teste técnico de QA.

---

## 🎯 Objetivo

Validar se a aplicação suporta a carga esperada de **250 requisições por segundo** com tempo de resposta no **90th percentil inferior a 2 segundos**, através de dois tipos de teste:

- **Teste de Carga:** simula 250 usuários com ramp-up gradual de 10 segundos
- **Teste de Pico:** simula 250 usuários disparados em apenas 1 segundo

---

## 📋 Cenário Testado

**Fluxo:** Compra de passagem aérea com sucesso

**Endpoint:** `POST https://blazedemo.com/purchase.php`

**Parâmetros:**

| Campo | Valor |
|---|---|
| fromPort | Boston |
| toPort | Rome |

---

## 📊 Resultados — Relatório HTML (Execução Combinada)

*500 amostras totais — 250 Teste de Carga + 250 Teste de Pico*

### Statistics

| Label | Amostras | Falhas | Error % | Média (ms) | Mín (ms) | Máx (ms) | 90th pct (ms) | 95th pct (ms) | 99th pct (ms) | Throughput |
|---|---|---|---|---|---|---|---|---|---|---|
| **Total** | 500 | 46 | 9.20% | 1040 | 402 | 3740 | 1953 | 2293 | 2898 | 42.65/s |
| HTTP Request (Pico) | 250 | 31 | 12.40% | 1277 | 428 | 3740 | 2129 | 2552 | 3381 | 58.09/s |
| POST - Comprar Passagem (Carga) | 250 | 15 | 6.00% | 804 | 402 | 2868 | 1522 | 2115 | 2659 | 21.32/s |

### APDEX (Application Performance Index)

| Label | Score |
|---|---|
| Total | 0.515 |
| HTTP Request | 0.380 |
| POST - Comprar Passagem | 0.650 |

> APDEX varia de 0 a 1. Valores abaixo de 0.7 indicam experiência insatisfatória para o usuário.

### Requests Summary

- ✅ PASS: **90.8%**
- ❌ FAIL: **9.2%**

---

## 🔍 Análise dos Resultados

### O critério de aceitação **não foi atendido**.

**Critério:** 250 req/s com 90th percentil < 2000ms

| Critério | Resultado | Status |
|---|---|---|
| Throughput ≥ 250 req/s | 42.65 req/s (total) | ❌ |
| 90th percentil < 2000ms | 1953ms (total) | ⚠️ Próximo do limite |
| Taxa de erro = 0% | 9.20% | ❌ |

**Throughput:** A aplicação atingiu apenas 42.65 req/s no total, muito abaixo das 250 req/s exigidas. O servidor Blazedemo possui limitações de capacidade que impedem atingir a vazão esperada.

**90th percentil:** Ficou em 1953ms — tecnicamente dentro do critério de 2 segundos, porém extremamente próximo do limite. No teste de pico isolado, o 90th percentil foi de 2129ms, ultrapassando o critério.

**Taxa de erro:** 9.2% das requisições falharam. A análise dos erros mostra que todos foram do tipo *"The operation lasted too long"*, ou seja, requisições que ultrapassaram o limite de 2000ms definido na Duration Assertion — confirmando que o servidor não suporta a carga exigida.

**APDEX:** Score de 0.515 indica experiência insatisfatória para o usuário final sob essa carga.

### Conclusão

O site Blazedemo é um ambiente de demonstração com infraestrutura limitada, não projetado para suportar cargas de produção. Em um cenário real, as recomendações seriam:

- Aumentar a capacidade do servidor (scale horizontal ou vertical)
- Implementar cache para reduzir carga no backend
- Revisar o gerenciamento de conexões simultâneas
- Realizar profiling da aplicação para identificar gargalos

---

## ⚙️ Pré-requisitos

- [Java JDK 8+](https://www.oracle.com/java/technologies/downloads/)
- [Apache JMeter 5.6+](https://jmeter.apache.org/download_jmeter.cgi)

---

## 🚀 Como Executar

### Interface Gráfica

1. Abre o JMeter (`bin/jmeter.bat` no Windows)
2. **File → Open** → seleciona o arquivo `Relatório de Carga.jmx`
3. Clica em **▶ (Play)** para rodar
4. Visualiza os resultados nos listeners **Summary Report** e **Árvore de Resultados**

### Linha de Comando (recomendado para CI)

```bash
jmeter -n -t "Relatório de Carga.jmx" -l resultados.jtl -e -o relatorio-html
```

O relatório HTML será gerado na pasta `relatorio-html/`.

---

## 🗂️ Estrutura do Projeto

```
blazedemo-performance/
├── Relatório de Carga.jmx    ← Script JMeter com Teste de Carga e Teste de Pico
├── resultados.jtl            ← Arquivo de resultados brutos
├── relatorio-html/           ← Relatório HTML gerado pelo JMeter
└── README.md
```

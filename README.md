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

## 📊 Resultados

### Teste de Carga
*250 usuários — Ramp-up: 10 segundos*

| Métrica | Resultado | Critério | Status |
|---|---|---|---|
| Throughput | 22 req/s | 250 req/s | ❌ |
| Tempo Médio | 775ms | < 2000ms | ✅ |
| Tempo Máximo | 3382ms | < 2000ms | ❌ |
| Taxa de Erro | 3.20% | 0% | ❌ |

### Teste de Pico
*250 usuários — Ramp-up: 1 segundo*

| Métrica | Resultado | Critério | Status |
|---|---|---|---|
| Throughput | 52.4 req/s | 250 req/s | ❌ |
| Tempo Médio | 1176ms | < 2000ms | ✅ |
| Tempo Máximo | 4072ms | < 2000ms | ❌ |
| Taxa de Erro | 12.80% | 0% | ❌ |

---

## 🔍 Análise dos Resultados

### O critério de aceitação **não foi atendido** em nenhum dos testes.

**Throughput:** A aplicação atingiu apenas 22 req/s no teste de carga e 52.4 req/s no teste de pico, muito abaixo das 250 req/s exigidas. Isso indica que o servidor do Blazedemo possui limitações de capacidade que impedem atingir a vazão esperada.

**Tempo de resposta:** O tempo médio ficou dentro do critério em ambos os testes (775ms e 1176ms), porém o tempo máximo ultrapassou 2 segundos nos dois casos, chegando a 4072ms no teste de pico.

**Taxa de erro:** O teste de carga apresentou 3.2% de erros, que aumentou para 12.8% no teste de pico — evidenciando que a aplicação se degrada significativamente sob alta carga simultânea, característica típica de uma **race condition** no servidor ou limite de conexões simultâneas.

### Conclusão

O site Blazedemo é um ambiente de demonstração com infraestrutura limitada, não projetado para suportar cargas de produção. Em um cenário real, as recomendações seriam:

- Aumentar a capacidade do servidor (scale horizontal ou vertical)
- Implementar cache para reduzir carga no backend
- Revisar o gerenciamento de conexões simultâneas
- Realizar um profiling da aplicação para identificar gargalos

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
└── README.md
```

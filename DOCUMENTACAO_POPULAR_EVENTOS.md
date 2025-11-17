# 📚 DOCUMENTAÇÃO - Script de Popular Eventos

**Arquivo:** `popular_eventos.py`  
**Data:** 16/11/2025  
**Status:** ✅ Pronto para Uso

---

## 📋 DESCRIÇÃO

Script Python para popular o banco de dados com eventos aleatórios e realistas. Ideal para:
- Testes de desenvolvimento
- Demonstrações do sistema
- Popular banco de dados vazio
- Gerar dados de teste

---

## 🚀 USO BÁSICO

### Sintaxe
```bash
python popular_eventos.py <quantidade> [--limpar]
```

### Exemplos

#### Criar 10 eventos
```bash
python popular_eventos.py 10
```

#### Criar 50 eventos
```bash
python popular_eventos.py 50
```

#### Criar 100 eventos (limpar existentes antes)
```bash
python popular_eventos.py 100 --limpar
```

---

## 🎯 FUNCIONALIDADES

### 1. Criação Automática de Usuário
Se não houver usuários no banco, o script oferece criar um organizador padrão:
- **Username:** organizador
- **Email:** organizador@backstage.com
- **Senha:** backstage123
- **Tipo:** Staff (pode criar eventos)

### 2. Dados Realistas

#### Títulos Variados (50+ opções)
- Workshops de tecnologia
- Cursos especializados
- Meetups de networking
- Palestras inspiradoras
- Hackathons
- Conferências

#### Descrições Contextuais
- Geradas baseadas no tipo de evento
- Incluem detalhes do que será aprendido
- Tom profissional e atrativo

#### Valores Realistas
- 30% dos eventos são **gratuitos**
- Valores pagos: R$ 50 a R$ 500
- Distribuição realista de preços

#### Datas Futuras
- Entre 7 e 90 dias no futuro
- Horários comuns: 9h, 10h, 14h, 15h, 18h, 19h, 20h
- Datas e horários variados

#### Locais Reais
- 10 endereços diferentes em São Paulo
- Locais específicos realistas (Auditório, Sala 401, etc)
- Capacidades variadas (20 a 200 pessoas)

#### Itens Incluídos
- Básico: Certificado, Material digital
- Intermediário: + Coffee break, Gravação
- Premium: + Almoço, Kit, Mentoria

### 3. Opção de Limpeza
Flag `--limpar` permite deletar eventos existentes antes de criar novos.
- Pede confirmação antes de deletar
- Mostra quantos eventos serão removidos
- Seguro contra deleções acidentais

### 4. Estatísticas Detalhadas
Após criar, mostra:
- Total criado
- Eventos pagos vs gratuitos
- Valor médio
- Capacidade total
- Exemplos dos eventos criados

### 5. Barra de Progresso
Mostra progresso visual durante criação:
```
[████████████████████████████░░░░░░░░░░░░] 70% (35/50)
```

---

## 📊 DADOS GERADOS

### Categorias Disponíveis
- Workshop
- Palestra
- Networking
- Curso
- Tecnologia
- Educação

### Políticas de Cancelamento
- "Reembolso total até 7 dias antes do evento"
- "Reembolso de 50% até 3 dias antes do evento"
- "Cancelamento gratuito até 48h antes do evento"
- "Sem reembolso, mas permite transferência"
- E mais variações...

### Capacidades
20, 30, 40, 50, 60, 80, 100, 120, 150, 200 pessoas

### Valores
R$ 0 (gratuito), 50, 80, 100, 150, 200, 250, 300, 350, 400, 500

---

## 🎨 EXEMPLOS DE SAÍDA

### Exemplo 1: Criando 5 eventos
```bash
$ python popular_eventos.py 5

============================================================
🎉 GERADOR DE EVENTOS ALEATÓRIOS
============================================================

📊 Organizadores disponíveis: 1

🔄 Criando 5 evento(s) aleatório(s)...

[████████████████████████████████████████] 100% (5/5)

============================================================
📊 ESTATÍSTICAS DOS EVENTOS CRIADOS
============================================================

📈 Total de eventos criados: 5
💰 Eventos pagos: 4
🆓 Eventos gratuitos: 1
💵 Valor médio: R$ 290.00
👥 Capacidade total: 750 pessoas

📋 EXEMPLOS DE EVENTOS CRIADOS:
------------------------------------------------------------

📅 Workshop de Python Avançado
   💰 R$ 200.00
   📍 Auditório Principal
   🗓️  15/12/2025 às 19:00
   👥 Capacidade: 50
   🏷️  Categorias: Workshop, Tecnologia

... (mais eventos)

============================================================
✅ EVENTOS CRIADOS COM SUCESSO!
============================================================

📊 Total de eventos no banco de dados: 9
📊 Eventos publicados: 9

🎉 Pronto! Acesse o frontend para visualizar os eventos.
```

### Exemplo 2: Sem usuários no banco
```bash
$ python popular_eventos.py 10

============================================================
🎉 GERADOR DE EVENTOS ALEATÓRIOS
============================================================

⚠️  Nenhum usuário encontrado no banco de dados!
   Deseja criar um usuário organizador padrão? (S/n): S

📝 Criando usuário organizador padrão...
✅ Usuário criado: organizador
   Email: organizador@backstage.com
   Senha: backstage123

📊 Organizadores disponíveis: 1

🔄 Criando 10 evento(s) aleatório(s)...
```

### Exemplo 3: Limpando eventos existentes
```bash
$ python popular_eventos.py 20 --limpar

============================================================
🎉 GERADOR DE EVENTOS ALEATÓRIOS
============================================================

📊 Organizadores disponíveis: 1

⚠️  Tem certeza que deseja deletar 9 evento(s) existente(s)? (s/N): s
✅ 9 evento(s) deletado(s)

🔄 Criando 20 evento(s) aleatório(s)...
```

---

## ⚙️ REQUISITOS

### Python
- Python 3.8+
- Django configurado
- Apps instalados: eventos, users

### Banco de Dados
- Migrações aplicadas
- Banco acessível

### Dependências
```python
django
```

---

## 🛠️ COMO FUNCIONA

### Fluxo de Execução

1. **Validação de Argumentos**
   - Verifica se quantidade foi fornecida
   - Valida se é número inteiro positivo
   - Verifica flag --limpar

2. **Verificação de Usuários**
   - Busca organizadores no banco
   - Se não houver, oferece criar um padrão
   - Lista usuários disponíveis

3. **Limpeza (Opcional)**
   - Se --limpar, pede confirmação
   - Deleta eventos existentes
   - Mostra quantos foram removidos

4. **Geração de Eventos**
   - Loop criando N eventos
   - Dados aleatórios mas realistas
   - Barra de progresso visual
   - Salva no banco com status 'publicado'

5. **Estatísticas**
   - Calcula totais e médias
   - Mostra exemplos criados
   - Exibe resumo final

---

## 📝 ESTRUTURA DO CÓDIGO

### Constantes (linhas 1-200)
- `TITULOS`: 50+ títulos realistas
- `DESCRICOES_BASE`: Templates por tipo
- `ITENS_INCLUIDOS`: 3 níveis (básico, intermediário, premium)
- `ENDERECOS_SP`: 10 endereços reais
- `LOCAIS_ESPECIFICOS`: Nomes de salas/auditórios
- `POLITICAS_CANCELAMENTO`: Diferentes políticas
- `CATEGORIAS_OPCOES`: Combinações de categorias

### Funções Auxiliares (linhas 200-300)
- `gerar_descricao()`: Cria descrição baseada no título
- `gerar_data_evento()`: Data futura aleatória
- `gerar_capacidade()`: Capacidade realista
- `gerar_valor()`: Valor com distribuição real
- `gerar_itens_incluidos()`: Lista de itens

### Função Principal (linhas 300-450)
- `criar_eventos()`: Orquestra toda a criação
  - Verifica usuários
  - Opção de limpar
  - Loop de criação
  - Estatísticas finais

### Main (linhas 450-500)
- Parsing de argumentos
- Validações
- Chamada da função principal

---

## 🚨 TRATAMENTO DE ERROS

### Erros Comuns

#### 1. Sem Argumentos
```bash
$ python popular_eventos.py

❌ ERRO: Número de eventos não especificado!

Uso:
  python popular_eventos.py <quantidade>
```

#### 2. Quantidade Inválida
```bash
$ python popular_eventos.py abc

❌ ERRO: Quantidade inválida!
   Especifique um número inteiro positivo.
```

#### 3. Sem Usuários (com recusa)
```bash
⚠️  Nenhum usuário encontrado no banco de dados!
   Deseja criar um usuário organizador padrão? (S/n): n

❌ Não é possível criar eventos sem organizadores!
   Execute: python manage.py createsuperuser
```

#### 4. Cancelamento pelo Usuário
```bash
$ python popular_eventos.py 100

⚠️  AVISO: Você está tentando criar 100 eventos.
   Isso pode demorar. Continuar? (s/N): n

❌ Operação cancelada
```

---

## 💡 DICAS DE USO

### Para Desenvolvimento
```bash
# Popular rapidamente para testes
python popular_eventos.py 10
```

### Para Demonstração
```bash
# Criar muitos eventos variados
python popular_eventos.py 50
```

### Para Reset Completo
```bash
# Limpar tudo e criar novos
python popular_eventos.py 20 --limpar
```

### Para Produção
⚠️ **NÃO USE EM PRODUÇÃO!**  
Este script é apenas para desenvolvimento/testes.

---

## 🔒 SEGURANÇA

### Usuário Padrão
Se criado automaticamente:
- **Senha:** backstage123
- ⚠️ Senha fraca, apenas para desenvolvimento
- 🔄 Altere após primeiro login

### Limpeza de Dados
- Sempre pede confirmação antes de deletar
- Mostra quantidade que será removida
- Seguro contra acidentes

---

## 📈 PERFORMANCE

### Tempo de Execução (aproximado)

| Eventos | Tempo |
|---------|-------|
| 10 | ~5 segundos |
| 50 | ~15 segundos |
| 100 | ~30 segundos |
| 500 | ~2 minutos |
| 1000 | ~5 minutos |

*Tempo varia conforme hardware e configuração do banco*

### Validação de Quantidade
- Pede confirmação se > 1000 eventos
- Previne criação acidental de muitos eventos

---

## 🐛 TROUBLESHOOTING

### Erro de Importação
```
ModuleNotFoundError: No module named 'apps'
```
**Solução:** Execute do diretório raiz do projeto

### Erro de Conexão com Banco
```
OperationalError: connection to server...
```
**Solução:** Verifique se PostgreSQL está rodando

### Encoding de Caracteres
```
UnicodeEncodeError: 'charmap' codec...
```
**Solução:** Use terminal com suporte UTF-8 ou redirecione saída

---

## ✅ CHECKLIST DE USO

Antes de executar:
- [ ] Está no diretório raiz do projeto
- [ ] Django está configurado
- [ ] Banco de dados está acessível
- [ ] Migrações foram aplicadas
- [ ] Há pelo menos 1 usuário (ou aceitar criar um)

Ao executar:
- [ ] Especificar quantidade válida
- [ ] Decidir se quer limpar existentes
- [ ] Confirmar operações quando solicitado
- [ ] Aguardar conclusão

Após executar:
- [ ] Verificar estatísticas mostradas
- [ ] Acessar frontend para visualizar
- [ ] Testar com os eventos criados

---

## 📞 SUPORTE

Problemas? Verifique:
1. Documentação acima
2. Mensagens de erro do script
3. Logs do Django
4. Status do banco de dados

---

**Criado em:** 16/11/2025  
**Versão:** 1.0  
**Status:** ✅ Pronto para Uso


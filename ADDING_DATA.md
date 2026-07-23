# 📊 Como Adicionar Dados ao Projeto História

Este documento explica como inserir novos dados (entidades e relacionamentos) no banco de dados PostgreSQL.

## 🚀 Opção 1: Script Python (Recomendado)

### Pré-requisitos
- Backend configurado (`backend/app/main.py` deve estar em funcionamento)
- Banco de dados PostgreSQL conectado
- Dependências instaladas: `pip install -r requirements.txt`

### Como Usar

```bash
# Navegue até a pasta backend
cd backend

# Execute o script
python insert_data.py
```

### O que o script faz
- ✅ Insere 2 cientistas: Isaac Newton e Marie Curie
- ✅ Insere 2 artistas: Leonardo da Vinci e Michelangelo  
- ✅ Insere a era do Renascimento
- ✅ Cria relacionamentos entre os dados
- ✅ Valida se os dados já existem (evita duplicatas)
- ✅ Exibe relatório com total de entidades

### Exemplo de Saída
```
==================================================
  Inserindo dados históricos
==================================================

📚 Inserindo cientistas...
🎨 Inserindo artistas...
🎭 Inserindo era histórica...
🔗 Criando relacionamentos...

✅ Dados inseridos com sucesso!
📊 Total de entidades no banco: 10

👥 Entidades por track:
   • Ciência: 2 entidade(s)
   • Arte: 2 entidade(s)
   • Política: 2 entidade(s)
   • Tecnologia: 2 entidade(s)
   • Cultura: 2 entidade(s)

==================================================
```

---

## 🗄️ Opção 2: SQL Direto (pgAdmin ou Terminal)

### Usando Terminal PostgreSQL

```bash
# Conectar ao banco
psql -d historical -U postgres

# Executar o script SQL
\i sql/insert_more_data.sql
```

### Ou usando um cliente SQL

1. Abra pgAdmin (http://localhost:5050) ou DBeaver
2. Conecte ao banco `historical`
3. Abra o arquivo `sql/insert_more_data.sql`
4. Execute o script

---

## ✍️ Adicionar Dados Customizados

### Opção A: Editar e Executar o Script Python

Edite o arquivo `backend/insert_data.py` para adicionar suas próprias entidades:

```python
# Adicionar nova entidade
nova_entidade = Entity(
    name="Nome da Pessoa/Evento",
    entity_type="Pessoa",  # ou "Evento", "Era Histórica", etc.
    track="Categoria",     # ex: "Ciência", "Arte", "Política"
    description="Descrição detalhada",
    start_year=1900,       # ano de início
    end_year=1950         # ano de fim (None se indeterminado)
)

db.add(nova_entidade)
db.flush()  # Flush para obter o ID
```

### Opção B: Editar o Script SQL

Edite `sql/insert_more_data.sql` e adicione novos INSERT:

```sql
INSERT INTO history.entity (name, entity_type, track, description, start_year, end_year) 
VALUES ('Nome', 'Tipo', 'Track', 'Descrição', 1900, 1950);
```

---

## 📋 Estrutura das Tabelas

### Entity (Entidades)
```sql
CREATE TABLE history.entity (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,           -- Nome da pessoa/evento
    entity_type VARCHAR(50) NOT NULL,     -- "Pessoa", "Evento", "Era Histórica"
    track VARCHAR(100),                   -- Categoria (Ciência, Arte, Política, etc.)
    description TEXT,                     -- Descrição detalhada
    start_year INTEGER,                   -- Ano de início (pode ser negativo para BC)
    end_year INTEGER,                     -- Ano de fim
    created_at TIMESTAMP DEFAULT NOW()
)
```

### Relationship (Relacionamentos)
```sql
CREATE TABLE history.relationship (
    id SERIAL PRIMARY KEY,
    source_entity_id INTEGER NOT NULL,    -- ID da entidade origem
    target_entity_id INTEGER NOT NULL,    -- ID da entidade destino
    relationship_type VARCHAR(100),       -- "participante", "precedente", "contemporâneo", etc.
    description TEXT,                     -- Descrição do relacionamento
    created_at TIMESTAMP DEFAULT NOW()
)
```

---

## 🔍 Exemplos de Dados

### Cientista
```python
Entity(
    name="Albert Einstein",
    entity_type="Pessoa",
    track="Ciência",
    description="Físico teorético alemão. Desenvolveu a teoria da relatividade.",
    start_year=1879,
    end_year=1955
)
```

### Artista
```python
Entity(
    name="Pablo Picasso",
    entity_type="Pessoa",
    track="Arte",
    description="Pintor e escultor espanhol. Fundador do Cubismo.",
    start_year=1881,
    end_year=1973
)
```

### Evento Histórico
```python
Entity(
    name="Revolução Francesa",
    entity_type="Evento",
    track="Política",
    description="Revolução que transformou a sociedade francesa",
    start_year=1789,
    end_year=1799
)
```

### Era/Período
```python
Entity(
    name="Idade Média",
    entity_type="Era Histórica",
    track="História",
    description="Período histórico europeu",
    start_year=476,
    end_year=1453
)
```

---

## 🔗 Criando Relacionamentos

```python
# Após inserir as entidades e fazer flush()
relacionamento = Relationship(
    source_entity_id=leonardo.id,
    target_entity_id=renascimento.id,
    relationship_type="participante",
    description="Leonardo da Vinci participou do Renascimento"
)
db.add(relacionamento)
db.commit()
```

### Tipos de Relacionamentos Recomendados
- `participante` - Uma entidade participou de um evento/era
- `precedente` - Uma entidade precedeu outra temporalmente
- `influenciou` - Uma entidade influenciou outra
- `contemporâneo` - Entidades contemporâneas
- `causou` - Uma entidade causou outra

---

## ❌ Solução de Problemas

### Erro: "Dados já existem no banco"
- Isso significa que os dados já foram inseridos
- Para inserir dados duplicados, edite o script ou execute apenas o SQL

### Erro de Conexão com Banco de Dados
- Verifique se PostgreSQL está rodando
- Confirme as credenciais em `backend/.env`
- Execute: `python test_db_connection.py`

### Erro: "Module not found: app"
- Certifique-se de estar no diretório `backend/`
- Configure PYTHONPATH: `export PYTHONPATH="."`

---

## 📝 Verificar Dados Inseridos

```bash
# Conectar ao banco
psql -d historical -U postgres

# Ver todas as entidades
SELECT * FROM history.entity;

# Contar por categoria
SELECT track, COUNT(*) FROM history.entity GROUP BY track;

# Ver relacionamentos
SELECT * FROM history.relationship;
```

---

## 🎯 Próximas Ações

Após adicionar dados:

1. **Recarregue o frontend** em http://localhost:5173
2. **Os novos eventos apareceront na timeline**
3. **Use os filtros** para explorar os dados
4. **Clique nos eventos** para ver detalhes

---

**Última atualização**: 2026-07-23

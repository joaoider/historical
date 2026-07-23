# 📜 História - Projeto de Timeline Histórico

Um aplicativo web moderno para visualizar, explorar e gerenciar eventos históricos através de uma interface interativa com timeline.

## 🎯 Sobre o Projeto

**História** é uma plataforma que permite aos usuários visualizar e interagir com dados históricos de forma intuitiva. O projeto oferece uma timeline interativa com filtros avançados, cards detalhados de entidades e uma experiência de usuário fluida.

### Características Principais

- 📅 **Timeline Interativa**: Visualização de eventos em uma linha do tempo interativa
- 🔍 **Filtros Avançados**: Filtrar eventos por categorias, períodos e outras dimensões
- 🎴 **Cards de Entidades**: Visualização detalhada de cada entidade histórica
- 🔄 **API REST**: Backend robusto construído com FastAPI
- ⚡ **Frontend Moderno**: Interface construída com React e Vite
- 🗄️ **Banco de Dados**: PostgreSQL para armazenamento persistente

## 🛠️ Stack Tecnológico

### Backend
- **Framework**: FastAPI (Python)
- **Banco de Dados**: PostgreSQL
- **ORM**: SQLAlchemy (inferred from project structure)

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite
- **Visualização**: vis-timeline, vis-data
- **Estilização**: CSS3

## 📁 Estrutura do Projeto

```
.
├── backend/                    # API Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # Aplicação FastAPI principal
│   │   ├── database.py        # Configuração do banco de dados
│   │   ├── models.py          # Modelos SQLAlchemy
│   │   ├── routes.py          # Rotas da API
│   │   └── schemas.py         # Schemas Pydantic
│   └── requirements.txt        # Dependências Python
├── frontend/                   # Aplicação React
│   ├── src/
│   │   ├── main.jsx           # Ponto de entrada
│   │   ├── App.jsx            # Componente principal
│   │   ├── components/
│   │   │   ├── EntityCard.jsx    # Visualização de entidades
│   │   │   ├── Timeline.jsx      # Componente de timeline
│   │   │   └── Filters.jsx       # Filtros avançados
│   │   ├── services/
│   │   │   └── api.js         # Cliente da API
│   │   └── assets/            # Recursos estáticos
│   ├── vite.config.js         # Configuração Vite
│   └── package.json           # Dependências Node
├── postgres/                   # Configuração PostgreSQL
├── sql/                        # Scripts SQL e migrations
└── docs/                       # Documentação do projeto
```

## 🚀 Primeiros Passos

### Pré-requisitos

- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- npm ou yarn

### Instalação

#### 1. Clonar o Repositório
```bash
git clone <repository-url>
cd historical
```

#### 2. Configurar Backend
```bash
cd backend
python -m venv venv
# No Windows:
venv\Scripts\activate
# No macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

#### 3. Configurar Banco de Dados
```bash
# Criar banco de dados PostgreSQL
createdb historical
# Executar migrations
psql -d historical -f ../sql/schema.sql
```

#### 4. Configurar Frontend
```bash
cd frontend
npm install
```

## 📖 Como Usar

### Inicialização Rápida (Recomendado)

#### No Windows (CMD):
```bash
start.bat
```

#### No Windows/Mac/Linux (PowerShell/Terminal):
```bash
python -m uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
# Em outro terminal:
cd frontend && npm run dev
```

### Inicialização Manual

#### 1. Iniciar o Backend
```bash
cd backend

# Ativar ambiente virtual
python -m venv venv
venv\Scripts\activate  # Windows
# ou
source venv/bin/activate  # macOS/Linux

# Instalar dependências
pip install -r requirements.txt

# Iniciar servidor
python -m uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend estará disponível em: **http://localhost:8000**
- API: http://localhost:8000/api
- Documentação Interativa: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

#### 2. Iniciar o Frontend

Em outro terminal:

```bash
cd frontend

# Instalar dependências (se não instalado)
npm install

# Iniciar dev server
npm run dev
```

Frontend estará disponível em: **http://localhost:5173**

### Acessar a Aplicação
1. Abra o navegador em http://localhost:5173
2. A timeline será carregada automaticamente
3. Use os filtros para explorar eventos por:
   - **Track/Categoria**: Agrupa eventos em diferentes faixas
   - **Tipo de Evento**: Filtra por tipo (Política, Tecnologia, etc.)
   - **Período**: Selecione intervalo de anos

### Solução de Problemas

**Erro: "Falha ao carregar eventos"**
- Certifique-se de que o backend está rodando em http://localhost:8000
- Verifique se PostgreSQL está ativo
- Confira as credenciais em `backend/.env`

**Erro de conexão com banco de dados**
- Execute o script de inicialização: `psql -d historical -f sql/init_database.sql`
- Ou teste a conexão: `python backend/test_db_connection.py`

## 📚 API Endpoints

A API fornece os seguintes endpoints (veja `backend/app/routes.py` para detalhes completos):

- `GET /` - Bem-vindo e informações da API
- `GET /api/entities` - Listar todas as entidades
- `GET /api/entities/{id}` - Obter detalhes de uma entidade
- `GET /api/events` - Listar eventos históricos
- E mais...

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` no diretório `backend`:

```env
DATABASE_URL=postgresql://user:password@localhost/historical
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👤 Autor

**João Ider**

## � Licença

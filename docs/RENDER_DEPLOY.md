# Publicação no Render

O arquivo `render.yaml` cria três recursos: a PWA estática `ider`, a API
FastAPI `ider-api` e o PostgreSQL `ider-database`. Frontend e backend recebem
HTTPS automaticamente.

## 1. Antes de enviar ao GitHub

Na raiz do projeto, valide:

```powershell
cd frontend
npm.cmd ci
npm.cmd run lint
npm.cmd test
npm.cmd run build
```

Confirme que nenhum arquivo `.env`, senha ou URL privada será incluído no
commit. O arquivo `backend/.env` já é ignorado pelo Git.

## 2. Criar o Blueprint

1. Envie a branch ao GitHub.
2. Entre em <https://dashboard.render.com/> e escolha **New > Blueprint**.
3. Conecte o repositório e mantenha `render.yaml` como Blueprint Path.
4. Revise os três recursos e aplique o Blueprint.
5. Aguarde primeiro a API e depois o site ficarem com status **Live**.

O plano gratuito é próprio para testes. O PostgreSQL gratuito expira após 30
dias; migre para um plano persistente antes de usar dados importantes.

## 3. Conferir os endereços

O Blueprint espera estes endereços:

- API: `https://ider-api.onrender.com`
- PWA: `https://ider.onrender.com`

Se o Render alterar o subdomínio da API por conflito de nome, abra o serviço
estático `ider`, altere a regra de rewrite `/api/*` para o endereço mostrado
pelo Render e faça um **Manual Deploy**. Atualize também a mesma URL em
`render.yaml` para manter a configuração sincronizada.

Teste:

- `https://ider-api.onrender.com/health` deve retornar `{"status":"ok"}`.
- `https://ider-api.onrender.com/docs` deve abrir a documentação da API.
- `https://ider.onrender.com/api/entities` deve responder através do proxy.
- `https://ider.onrender.com/manifest.webmanifest` deve exibir o manifesto.

## 4. Dados do PostgreSQL

No primeiro início, a API cria o schema `history` e as tabelas vazias. Ela não
copia automaticamente o conteúdo do banco local.

Para migrar dados, abra `ider-database` no Render, copie a **External Database
URL** e use `pg_dump`/`pg_restore` a partir de uma máquina que tenha PostgreSQL:

```powershell
pg_dump --format=custom --no-owner --no-acl --dbname="URL_DO_BANCO_LOCAL" --file=ider.dump
pg_restore --clean --if-exists --no-owner --no-acl --dbname="URL_EXTERNA_DO_RENDER" ider.dump
```

Essas URLs contêm senha: use-as apenas no terminal e nunca as salve no Git.
Depois da importação, reinicie `ider-api` e teste `/api/entities`.

## 5. Instalar no iPhone

1. Abra a URL HTTPS da PWA no Safari.
2. Toque em **Compartilhar**.
3. Escolha **Adicionar à Tela de Início**.
4. Confirme em **Adicionar**.

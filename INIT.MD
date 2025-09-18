# Iniciando o projeto

## 1. Configuração do backend (`/backstage/`)

1. Instale as dependências:

   ```bash
   pip install -r requirements.txt
   ```

2. Crie o arquivo `.env` na raiz do projeto e configure as credenciais do Supabase:

   ```bash
   touch .env
   ```

3. Inicie o servidor backend:

   * Windows:

     ```bash
     python manage.py runserver
     ```
   * Linux/MacOS:

     ```bash
     python3 manage.py runserver
     ```

---

## 2. Configuração do frontend (`/frontend/`)

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

---

## 3. Acessando o projeto

* Backend: [http://127.0.0.1:8000](http://127.0.0.1:8000)
* Frontend: [http://localhost:5173](http://localhost:5173)


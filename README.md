# Backstage  

<img width="350" alt="backstage" src="https://github.com/user-attachments/assets/650fd10b-db2f-4e00-a661-d187d5959cf5"/>

**Sistema de Gestão de Eventos**

Universidade Federal do Tocantins (UFT)  
Curso: Ciência da Computação

---

## Integrantes do Time

| Nome | GitHub |
|------|--------|
| Luís Gustavo Alves Bezerra | [@lu1pinho](https://github.com/lu1pinho) |
| Mara Emanuella Carvalho Martins | [@maraemanuella](https://github.com/maraemanuella) |
| José Lucas Carvalho Silva | [@lalisalix](https://github.com/lalisalix) |
| João Sestari Galvão | [@joaosgalvao](https://github.com/joaosgalvao) |
| João Vitor Braz Lopes Hott | [@HottBraz](https://github.com/HottBraz) |
| Thiago Galvão Amorim | [@DevThiagoGalvao](https://github.com/DevThiagoGalvao) |

---

## Links
- [Repositório](https://github.com/maraemanuella/backstage)
- [Vídeo Pitch - DLJ3](https://youtu.be/QUlsN26qc5k)
- [Apresentação Técnica](https://github.com/maraemanuella/backstage/blob/main/BackstageApresentaçãoTecnica_compressed.pdf)
- [Demonstração da Aplicação](https://www.youtube.com/watch?v=wE_zXBlvV-U)
- [Apresentação Final](https://github.com/maraemanuella/backstage/blob/main/BACKSTAGE.pdf)
- [Landing Page](https://maraemanuella.github.io/backstage/)

---

## Sobre o Projeto

O **Backstage** é uma plataforma completa para gestão de eventos, desenvolvida para facilitar a organização, controle e participação em eventos de todos os tipos. A solução oferece recursos integrados que abrangem desde o cadastro e inscrição em eventos até o acompanhamento em tempo real, proporcionando uma experiência fluida tanto para organizadores quanto para participantes.

### Principais Funcionalidades

- **Gestão de Eventos**: Criação e administração completa de eventos
- **Sistema de Inscrições**: Gerenciamento de participantes e lista de espera
- **Pagamentos Integrados**: Processamento de pagamentos e confirmação de inscrições
- **Check-in em Tempo Real**: Sistema de check-in com WebSockets para atualização instantânea
- **Avaliações**: Coleta de feedback e avaliações dos participantes
- **Notificações**: Sistema inteligente de notificações para manter usuários informados
- **Transferências**: Possibilidade de transferência de ingressos entre usuários
- **Favoritos**: Marcação de eventos de interesse
- **Analytics**: Painel de análise e métricas de eventos
- **Dashboard Administrativo**: Visão completa para gestores e organizadores

---

## Tecnologias Utilizadas

### Backend
- **Python 3.x** - Linguagem principal
- **Django** - Framework web
- **Django REST Framework** - API RESTful
- **Django Channels** - WebSockets e comunicação em tempo real
- **PostgreSQL** - Banco de dados
- **Redis** - Cache e gerenciamento de canais
- **JWT** - Autenticação via tokens
- **Pillow** - Processamento de imagens
- **QRCode** - Geração de códigos QR para check-in
- **ReportLab** - Geração de relatórios em PDF

### Frontend
- **React 19.x** - Biblioteca JavaScript
- **Vite** - Build tool e dev server
- **React Router** - Navegação
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Framework CSS
- **Recharts** - Gráficos e visualizações
- **React Google Maps** - Integração com mapas
- **Lucide React** - Ícones
- **React Toastify** - Notificações

---

## Como Executar o Projeto

### Pré-requisitos
- Python 3.8+
- Node.js 16+
- PostgreSQL
- Redis

### Backend

1. Clone o repositório:
```bash
git clone https://github.com/maraemanuella/backstage.git
cd backstage
```

2. Crie e ative um ambiente virtual:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
```

3. Instale as dependências:
```bash
pip install -r requirements.txt
```

4. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

5. Execute as migrações:
```bash
python manage.py migrate
```

6. Crie um superusuário:
```bash
python manage.py createsuperuser
```

7. Inicie o servidor:
```bash
python manage.py runserver
```

### Frontend

1. Navegue até a pasta frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
# Crie um arquivo .env com as configurações necessárias
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

---

## Licença

Este projeto é de propriedade da Universidade Federal do Tocantins (UFT) e foi desenvolvido para fins acadêmicos.

---

## Contato

Para mais informações sobre o projeto, entre em contato através do GitHub.

#!/usr/bin/env python
"""
Script para popular o banco de dados com eventos aleatórios e realistas.

Uso:
    python popular_eventos.py 10           # Cria 10 eventos
    python popular_eventos.py 50           # Cria 50 eventos
    python popular_eventos.py 100 --limpar # Cria 100 eventos após limpar existentes

Argumentos:
    quantidade: Número de eventos a criar (obrigatório)
    --limpar: Limpa eventos existentes antes de criar novos (opcional)
"""

import os
import sys
import django
import random
from datetime import datetime, timedelta
from decimal import Decimal

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.eventos.models import Evento
from apps.users.models import CustomUser
from django.utils import timezone


# ==================== DADOS REALISTAS ====================

TITULOS = [
    # Tecnologia
    "Workshop de Python Avançado",
    "Bootcamp de JavaScript",
    "Curso de React Native",
    "Meetup de DevOps",
    "Hackathon de IA",
    "Palestra sobre Cloud Computing",
    "Workshop de Machine Learning",
    "Curso de Data Science",
    "Conferência de Blockchain",
    "Meetup de Desenvolvimento Mobile",

    # Educação
    "Curso de Marketing Digital",
    "Workshop de Design Thinking",
    "Palestra sobre Empreendedorismo",
    "Curso de Gestão de Projetos",
    "Workshop de Metodologias Ágeis",
    "Seminário de Inovação",
    "Curso de UX/UI Design",
    "Workshop de Copywriting",
    "Palestra sobre Inteligência Emocional",
    "Curso de Oratória",

    # Networking
    "Networking Tech Meetup",
    "Café com Empreendedores",
    "Business Networking Night",
    "Encontro de Startups",
    "Happy Hour Corporativo",
    "Meetup de Founders",
    "Networking para Freelancers",
    "Encontro de Profissionais de TI",
    "Networking de Marketing",
    "Meetup de Product Managers",

    # Workshops
    "Workshop de Fotografia",
    "Workshop de Culinária Vegana",
    "Workshop de Yoga para Iniciantes",
    "Workshop de Meditação",
    "Workshop de Arte Digital",
    "Workshop de Música Eletrônica",
    "Workshop de Escrita Criativa",
    "Workshop de Teatro",
    "Workshop de Dança Contemporânea",
    "Workshop de Artesanato",

    # Palestras
    "Palestra sobre Sustentabilidade",
    "Palestra sobre Saúde Mental",
    "Palestra sobre Finanças Pessoais",
    "Palestra sobre Carreira em Tech",
    "Palestra sobre Diversidade e Inclusão",
    "Palestra sobre Produtividade",
    "Palestra sobre Liderança",
    "Palestra sobre Inovação Social",
    "Palestra sobre Transformação Digital",
    "Palestra sobre Futuro do Trabalho",
]

DESCRICOES_BASE = {
    "Workshop": [
        "Aprenda na prática com exercícios hands-on e projetos reais. Ideal para quem quer aprofundar conhecimentos e aplicar no dia a dia.",
        "Workshop intensivo com foco em prática. Traga seu notebook e prepare-se para colocar a mão na massa!",
        "Sessão prática e interativa onde você vai aprender fazendo. Material de apoio incluído.",
    ],
    "Curso": [
        "Curso completo do básico ao avançado. Certificado incluso ao final do curso.",
        "Aprenda de forma estruturada com metodologia comprovada. Material didático completo fornecido.",
        "Curso intensivo com teoria e muita prática. Prepare-se para transformar sua carreira!",
    ],
    "Meetup": [
        "Encontro descontraído para networking e troca de experiências. Venha conhecer profissionais da área!",
        "Networking, palestras curtas e muito bate-papo. Perfeito para fazer conexões valiosas.",
        "Ambiente informal para conhecer pessoas, compartilhar ideias e fazer networking.",
    ],
    "Hackathon": [
        "Maratona de programação com desafios reais. Forme seu time ou participe solo. Prêmios incríveis!",
        "48 horas de desenvolvimento intensivo. Mentorias, alimentação e prêmios inclusos.",
        "Competição de desenvolvimento com cases reais de empresas. Network, aprendizado e prêmios!",
    ],
    "Palestra": [
        "Palestra inspiradora com profissional renomado da área. Sessão de perguntas e respostas ao final.",
        "Apresentação seguida de debate aberto. Venha com suas dúvidas e participe ativamente!",
        "Talk inspirador sobre tendências e boas práticas. Networking após a palestra.",
    ],
    "Conferência": [
        "Grande evento com múltiplas palestras, workshops e networking. Não perca!",
        "Dois dias de imersão completa com os maiores especialistas do mercado.",
        "O maior evento do ano sobre o tema. Palestras, workshops, feira de empresas e muito networking.",
    ],
    "Bootcamp": [
        "Programa intensivo de capacitação. Do zero ao profissional em semanas.",
        "Treinamento imersivo com metodologia acelerada. Mude de carreira em poucas semanas!",
        "Bootcamp completo com aulas ao vivo, projetos práticos e mentoria individual.",
    ],
}

ITENS_INCLUIDOS = {
    "basico": [
        "Certificado de participação",
        "Material didático digital",
        "Acesso ao grupo da comunidade",
    ],
    "intermediario": [
        "Certificado de conclusão",
        "Material didático completo",
        "Coffee break",
        "Acesso ao grupo exclusivo",
        "Gravação das aulas",
    ],
    "premium": [
        "Certificado oficial",
        "Material didático físico e digital",
        "Coffee break e almoço",
        "Kit de brindes",
        "Acesso vitalício ao conteúdo",
        "Mentoria pós-evento",
        "Networking exclusivo",
    ],
}

ENDERECOS_SP = [
    "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
    "Rua Augusta, 2500 - Consolação, São Paulo - SP",
    "Av. Faria Lima, 3000 - Itaim Bibi, São Paulo - SP",
    "Rua Oscar Freire, 500 - Jardins, São Paulo - SP",
    "Av. Brigadeiro Faria Lima, 4440 - Itaim Bibi, São Paulo - SP",
    "Rua dos Pinheiros, 700 - Pinheiros, São Paulo - SP",
    "Av. Rebouças, 3970 - Pinheiros, São Paulo - SP",
    "Rua da Consolação, 2000 - Consolação, São Paulo - SP",
    "Av. Ibirapuera, 3103 - Moema, São Paulo - SP",
    "Rua Haddock Lobo, 595 - Jardins, São Paulo - SP",
]

LOCAIS_ESPECIFICOS = [
    "Auditório Principal",
    "Sala 401 - 4º Andar",
    "Espaço de Eventos",
    "Coworking Space",
    "Centro de Convenções",
    "Sala de Conferências",
    "Laboratório de Inovação",
    "Sala Multiuso",
    "Anfiteatro",
    "Sala VIP",
]

POLITICAS_CANCELAMENTO = [
    "Reembolso total até 7 dias antes do evento",
    "Reembolso de 50% até 3 dias antes do evento",
    "Cancelamento gratuito até 48h antes do evento",
    "Reembolso total até 15 dias antes. Após isso, 50% de reembolso",
    "Sem reembolso, mas permite transferência de inscrição",
    "Reembolso total até 10 dias antes do evento",
]

CATEGORIAS_OPCOES = [
    ["Workshop"],
    ["Palestra"],
    ["Networking"],
    ["Curso"],
    ["Workshop", "Tecnologia"],
    ["Palestra", "Educação"],
    ["Networking", "Tecnologia"],
    ["Curso", "Tecnologia"],
    ["Workshop", "Educação"],
]


# ==================== FUNÇÕES AUXILIARES ====================

def gerar_descricao(titulo):
    """Gera uma descrição realista baseada no título"""
    tipo = titulo.split()[0]  # Primeira palavra (Workshop, Curso, etc)

    if tipo in DESCRICOES_BASE:
        descricao_base = random.choice(DESCRICOES_BASE[tipo])
    else:
        descricao_base = random.choice(DESCRICOES_BASE["Workshop"])

    # Adiciona detalhes específicos
    detalhes = [
        f"\n\nNeste evento você vai aprender:",
        f"• Conceitos fundamentais e avançados",
        f"• Melhores práticas do mercado",
        f"• Cases de sucesso reais",
        f"• Ferramentas e técnicas atuais",
    ]

    return descricao_base + "\n".join(detalhes)


def gerar_data_evento():
    """Gera uma data futura aleatória para o evento"""
    dias_futuros = random.randint(7, 90)  # Entre 7 e 90 dias no futuro
    data_base = timezone.now() + timedelta(days=dias_futuros)

    # Horários mais comuns para eventos
    horarios = [
        (9, 0),   # 9h
        (10, 0),  # 10h
        (14, 0),  # 14h
        (15, 0),  # 15h
        (18, 0),  # 18h
        (19, 0),  # 19h
        (20, 0),  # 20h
    ]

    hora, minuto = random.choice(horarios)

    return data_base.replace(hour=hora, minute=minuto, second=0, microsecond=0)


def gerar_capacidade():
    """Gera capacidade realista baseada no tipo de evento"""
    capacidades = [20, 30, 40, 50, 60, 80, 100, 120, 150, 200]
    return random.choice(capacidades)


def gerar_valor():
    """Gera valor realista para o evento"""
    # 30% dos eventos são gratuitos
    if random.random() < 0.3:
        return Decimal('0.00')

    # Valores comuns
    valores = [
        Decimal('50.00'),
        Decimal('80.00'),
        Decimal('100.00'),
        Decimal('150.00'),
        Decimal('200.00'),
        Decimal('250.00'),
        Decimal('300.00'),
        Decimal('350.00'),
        Decimal('400.00'),
        Decimal('500.00'),
    ]

    return random.choice(valores)


def gerar_itens_incluidos():
    """Gera lista de itens incluídos baseada no valor"""
    nivel = random.choice(['basico', 'intermediario', 'premium'])
    itens = ITENS_INCLUIDOS[nivel].copy()
    random.shuffle(itens)
    return itens[:random.randint(3, len(itens))]


# ==================== FUNÇÃO PRINCIPAL ====================

def criar_eventos(quantidade, limpar=False):
    """
    Cria eventos aleatórios no banco de dados

    Args:
        quantidade (int): Número de eventos a criar
        limpar (bool): Se deve limpar eventos existentes antes
    """
    print("\n" + "="*60)
    print("🎉 GERADOR DE EVENTOS ALEATÓRIOS")
    print("="*60)

    # Verificar se há organizadores
    organizadores = list(CustomUser.objects.all())

    if not organizadores:
        print("\n⚠️  Nenhum usuário encontrado no banco de dados!")
        criar_usuario = input("   Deseja criar um usuário organizador padrão? (S/n): ")

        if criar_usuario.lower() != 'n':
            print("\n📝 Criando usuário organizador padrão...")

            try:
                organizador_padrao = CustomUser.objects.create_user(
                    username='organizador',
                    email='organizador@backstage.com',
                    password='backstage123',
                    first_name='Organizador',
                    last_name='Backstage',
                    is_staff=True,
                )
                print(f"✅ Usuário criado: {organizador_padrao.username}")
                print(f"   Email: {organizador_padrao.email}")
                print(f"   Senha: backstage123")
                organizadores = [organizador_padrao]
            except Exception as e:
                print(f"❌ Erro ao criar usuário: {e}")
                sys.exit(1)
        else:
            print("\n❌ Não é possível criar eventos sem organizadores!")
            print("   Execute: python manage.py createsuperuser")
            sys.exit(1)

    print(f"\n📊 Organizadores disponíveis: {len(organizadores)}")

    # Limpar eventos existentes se solicitado
    if limpar:
        eventos_existentes = Evento.objects.count()
        if eventos_existentes > 0:
            confirmar = input(f"\n⚠️  Tem certeza que deseja deletar {eventos_existentes} evento(s) existente(s)? (s/N): ")
            if confirmar.lower() == 's':
                Evento.objects.all().delete()
                print(f"✅ {eventos_existentes} evento(s) deletado(s)")
            else:
                print("❌ Operação cancelada pelo usuário")
                sys.exit(0)

    # Criar eventos
    print(f"\n🔄 Criando {quantidade} evento(s) aleatório(s)...\n")

    eventos_criados = []

    for i in range(quantidade):
        # Dados aleatórios
        titulo = random.choice(TITULOS)
        descricao = gerar_descricao(titulo)
        categorias = random.choice(CATEGORIAS_OPCOES)
        data_evento = gerar_data_evento()
        endereco = random.choice(ENDERECOS_SP)
        local_especifico = random.choice(LOCAIS_ESPECIFICOS)
        capacidade = gerar_capacidade()
        valor = gerar_valor()
        itens = gerar_itens_incluidos()
        organizador = random.choice(organizadores)
        permite_transferencia = random.choice([True, True, False])  # 66% True
        politica = random.choice(POLITICAS_CANCELAMENTO)

        # Criar evento
        evento = Evento.objects.create(
            titulo=titulo,
            descricao=descricao,
            categorias=categorias,
            categorias_customizadas=[],
            itens_incluidos='\n'.join(itens),
            data_evento=data_evento,
            endereco=endereco,
            local_especifico=local_especifico,
            capacidade_maxima=capacidade,
            valor_deposito=valor,
            permite_transferencia=permite_transferencia,
            politica_cancelamento=politica,
            status='publicado',
            organizador=organizador,
        )

        eventos_criados.append(evento)

        # Progress bar simples
        progresso = int((i + 1) / quantidade * 40)
        barra = '█' * progresso + '░' * (40 - progresso)
        porcentagem = int((i + 1) / quantidade * 100)
        print(f"\r[{barra}] {porcentagem}% ({i + 1}/{quantidade})", end='', flush=True)

    print("\n")

    # Estatísticas
    print("="*60)
    print("📊 ESTATÍSTICAS DOS EVENTOS CRIADOS")
    print("="*60)

    total = len(eventos_criados)
    gratuitos = sum(1 for e in eventos_criados if e.valor_deposito == 0)
    pagos = total - gratuitos
    valor_medio = sum(e.valor_deposito for e in eventos_criados) / total if total > 0 else 0
    capacidade_total = sum(e.capacidade_maxima for e in eventos_criados)

    print(f"\n📈 Total de eventos criados: {total}")
    print(f"💰 Eventos pagos: {pagos}")
    print(f"🆓 Eventos gratuitos: {gratuitos}")
    print(f"💵 Valor médio: R$ {valor_medio:.2f}")
    print(f"👥 Capacidade total: {capacidade_total} pessoas")

    # Mostrar alguns eventos criados
    print("\n📋 EXEMPLOS DE EVENTOS CRIADOS:")
    print("-" * 60)

    for evento in eventos_criados[:5]:  # Mostrar primeiros 5
        valor_str = "GRATUITO" if evento.valor_deposito == 0 else f"R$ {evento.valor_deposito:.2f}"
        data_str = evento.data_evento.strftime("%d/%m/%Y às %H:%M")
        print(f"\n📅 {evento.titulo}")
        print(f"   💰 {valor_str}")
        print(f"   📍 {evento.local_especifico}")
        print(f"   🗓️  {data_str}")
        print(f"   👥 Capacidade: {evento.capacidade_maxima}")
        print(f"   🏷️  Categorias: {', '.join(evento.categorias)}")

    if total > 5:
        print(f"\n   ... e mais {total - 5} eventos!")

    print("\n" + "="*60)
    print("✅ EVENTOS CRIADOS COM SUCESSO!")
    print("="*60)

    # Resumo final
    total_db = Evento.objects.count()
    print(f"\n📊 Total de eventos no banco de dados: {total_db}")
    print(f"📊 Eventos publicados: {Evento.objects.filter(status='publicado').count()}")

    print("\n🎉 Pronto! Acesse o frontend para visualizar os eventos.")
    print("\n")


# ==================== MAIN ====================

if __name__ == "__main__":
    # Verificar argumentos
    if len(sys.argv) < 2:
        print("\n❌ ERRO: Número de eventos não especificado!")
        print("\nUso:")
        print("  python popular_eventos.py <quantidade>")
        print("  python popular_eventos.py <quantidade> --limpar")
        print("\nExemplos:")
        print("  python popular_eventos.py 10")
        print("  python popular_eventos.py 50")
        print("  python popular_eventos.py 100 --limpar")
        print("\n")
        sys.exit(1)

    # Obter quantidade
    try:
        quantidade = int(sys.argv[1])
        if quantidade <= 0:
            raise ValueError("Quantidade deve ser maior que zero")
    except ValueError as e:
        print(f"\n❌ ERRO: Quantidade inválida!")
        print(f"   Especifique um número inteiro positivo.")
        print(f"\n   Exemplo: python popular_eventos.py 10\n")
        sys.exit(1)

    # Verificar flag --limpar
    limpar = '--limpar' in sys.argv or '--clear' in sys.argv

    # Validar quantidade máxima
    if quantidade > 1000:
        print(f"\n⚠️  AVISO: Você está tentando criar {quantidade} eventos.")
        confirmar = input("   Isso pode demorar. Continuar? (s/N): ")
        if confirmar.lower() != 's':
            print("❌ Operação cancelada")
            sys.exit(0)

    # Executar
    try:
        criar_eventos(quantidade, limpar)
    except KeyboardInterrupt:
        print("\n\n❌ Operação cancelada pelo usuário")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ ERRO: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


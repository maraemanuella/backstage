# management/commands/generate_test_data.py
"""
Comando Django para gerar dados de teste aleatórios
Uso: python manage.py generate_test_data --users 10 --events 5
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from decimal import Decimal
import random
from datetime import timedelta
from faker import Faker

from api.users.models import CustomUser
from api.events.models import Evento, Avaliacao
from api.registrations.models import Inscricao

fake = Faker('pt_BR')

class Command(BaseCommand):
    help = 'Gera dados de teste aleatórios (usuários, eventos, inscrições, avaliações)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--users',
            type=int,
            default=10,
            help='Número de usuários a criar'
        )
        parser.add_argument(
            '--events',
            type=int,
            default=5,
            help='Número de eventos a criar'
        )
        parser.add_argument(
            '--inscricoes',
            type=int,
            default=20,
            help='Número de inscrições a criar'
        )
        parser.add_argument(
            '--avaliacoes',
            type=int,
            default=15,
            help='Número de avaliações a criar'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Limpar dados existentes antes de gerar novos'
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Iniciando geração de dados de teste...'))
        self.stdout.write('')

        # Limpar dados se solicitado
        if options['clear']:
            self.stdout.write(self.style.WARNING('🗑️  Limpando dados existentes...'))
            Avaliacao.objects.all().delete()
            Inscricao.objects.all().delete()
            Evento.objects.all().delete()
            CustomUser.objects.filter(is_superuser=False).delete()
            self.stdout.write(self.style.SUCCESS('✅ Dados limpos!'))
            self.stdout.write('')

        # Gerar usuários
        users = self.generate_users(options['users'])
        self.stdout.write('')

        # Gerar eventos
        events = self.generate_events(options['events'], users)
        self.stdout.write('')

        # Gerar inscrições
        inscricoes = self.generate_inscricoes(options['inscricoes'], users, events)
        self.stdout.write('')

        # Gerar avaliações
        avaliacoes = self.generate_avaliacoes(options['avaliacoes'], users, events)
        self.stdout.write('')

        # Resumo
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS('✨ GERAÇÃO CONCLUÍDA COM SUCESSO! ✨'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(f'👥 Usuários criados: {len(users)}')
        self.stdout.write(f'🎉 Eventos criados: {len(events)}')
        self.stdout.write(f'📝 Inscrições criadas: {len(inscricoes)}')
        self.stdout.write(f'⭐ Avaliações criadas: {len(avaliacoes)}')
        self.stdout.write(self.style.SUCCESS('=' * 60))

    def generate_users(self, count):
        """Gera usuários aleatórios"""
        self.stdout.write(self.style.HTTP_INFO(f'👥 Gerando {count} usuários...'))

        users = []

        for i in range(count):
            nome = fake.name()
            username = fake.user_name() + str(random.randint(1, 9999))

            # Garantir username único
            while CustomUser.objects.filter(username=username).exists():
                username = fake.user_name() + str(random.randint(1, 9999))

            # Gerar CPF único
            cpf = fake.cpf().replace('.', '').replace('-', '')
            while CustomUser.objects.filter(cpf=cpf).exists():
                cpf = fake.cpf().replace('.', '').replace('-', '')

            user = CustomUser.objects.create_user(
                username=username,
                email=fake.email(),
                password='teste123',  # Senha padrão para testes
                first_name=nome.split()[0],
                last_name=' '.join(nome.split()[1:]),
                cpf=cpf,
                telefone=fake.phone_number()[:15],
                data_nascimento=fake.date_of_birth(minimum_age=18, maximum_age=70),
            )

            # Score aleatório
            user.score = round(random.uniform(3.0, 5.0), 1)
            user.save()

            users.append(user)
            self.stdout.write(f'  ✓ {username} - Score: {user.score}')

        return users

    def generate_events(self, count, users):
        """Gera eventos aleatórios"""
        self.stdout.write(self.style.HTTP_INFO(f'🎉 Gerando {count} eventos...'))

        # Usar usuários aleatórios como organizadores (ou criar um se não houver)
        if not users:
            # Se não houver usuários, criar um organizador
            organizador = CustomUser.objects.create_user(
                username='organizador_principal',
                email='organizador@backstage.com',
                password='teste123',
                first_name='Organizador',
                last_name='Principal',
                cpf='12345678901',
                telefone='11999999999',
            )
            organizadores = [organizador]
        else:
            # Usar até 30% dos usuários como organizadores (mínimo 1)
            num_organizadores = max(1, int(len(users) * 0.3))
            organizadores = random.sample(users, min(num_organizadores, len(users)))

        events = []
        categorias = ['Workshop', 'Palestra', 'Networking', 'Curso']

        titulos = [
            'Workshop de {tema}',
            'Palestra sobre {tema}',
            'Curso de {tema}',
            'Evento de {tema}',
            'Encontro de {tema}',
            'Meetup de {tema}',
            'Conferência {tema}',
            'Seminário de {tema}',
        ]

        temas = [
            'Python', 'Django', 'React', 'Node.js', 'IA', 'Machine Learning',
            'DevOps', 'Cloud Computing', 'Blockchain', 'Segurança', 'UX/UI',
            'Marketing Digital', 'Empreendedorismo', 'Gestão de Projetos',
            'Design Thinking', 'Agilidade', 'Liderança', 'Inovação'
        ]

        for i in range(count):
            tema = random.choice(temas)
            titulo = random.choice(titulos).format(tema=tema)

            # Data do evento (entre 1 dia e 60 dias no futuro)
            dias_futuro = random.randint(1, 60)
            data_evento = timezone.now() + timedelta(days=dias_futuro, hours=random.randint(9, 18))

            evento = Evento.objects.create(
                titulo=titulo,
                descricao=fake.text(max_nb_chars=500),
                categoria=random.choice(categorias),
                data_evento=data_evento,
                endereco=fake.address().replace('\n', ', '),
                local_especifico=f'Sala {random.randint(1, 10)}',
                capacidade_maxima=random.choice([20, 30, 50, 100, 200]),
                valor_deposito=Decimal(random.choice([0, 25, 50, 75, 100])),
                permite_transferencia=random.choice([True, False]),
                politica_cancelamento='Cancelamento gratuito até 24h antes do evento',
                itens_incluidos='\n'.join([
                    'Certificado de participação',
                    'Material didático',
                    random.choice(['Coffee break', 'Lanche', 'Almoço'])
                ]),
                organizador=random.choice(organizadores),
                status='publicado',
                latitude=float(fake.latitude()),
                longitude=float(fake.longitude()),
            )

            events.append(evento)
            self.stdout.write(f'  ✓ {titulo} - {data_evento.strftime("%d/%m/%Y")} - {evento.capacidade_maxima} vagas')

        return events

    def generate_inscricoes(self, count, users, events):
        """Gera inscrições aleatórias"""
        self.stdout.write(self.style.HTTP_INFO(f'📝 Gerando {count} inscrições...'))

        if not events:
            self.stdout.write(self.style.WARNING('  ⚠️  Nenhum evento disponível'))
            return []

        inscricoes = []

        for i in range(count):
            user = random.choice(users)
            evento = random.choice(events)

            # Verificar se já existe inscrição
            if Inscricao.objects.filter(usuario=user, evento=evento).exists():
                continue

            # Verificar se não está lotado
            if evento.esta_lotado:
                continue

            valor_com_desconto = evento.calcular_valor_com_desconto(user)

            inscricao = Inscricao.objects.create(
                usuario=user,
                evento=evento,
                nome_completo_inscricao=user.get_full_name(),
                cpf_inscricao=user.cpf,
                telefone_inscricao=user.telefone,
                email_inscricao=user.email,
                metodo_pagamento=random.choice(['pix', 'cartao_credito', 'boleto']),
                aceita_termos=True,
                valor_original=evento.valor_deposito,
                desconto_aplicado=evento.valor_deposito - valor_com_desconto,
                valor_final=valor_com_desconto,
                status='confirmada',
                status_pagamento='aprovado',
                checkin_realizado=random.choice([True, False, False]),  # 33% de chance
            )

            if inscricao.checkin_realizado:
                inscricao.data_checkin = timezone.now() - timedelta(days=random.randint(1, 10))
                inscricao.save()

            inscricoes.append(inscricao)
            checkin = '✓' if inscricao.checkin_realizado else '✗'
            self.stdout.write(f'  {checkin} {user.username} → {evento.titulo}')

        return inscricoes

    def generate_avaliacoes(self, count, users, events):
        """Gera avaliações aleatórias"""
        self.stdout.write(self.style.HTTP_INFO(f'⭐ Gerando {count} avaliações...'))

        if not events:
            self.stdout.write(self.style.WARNING('  ⚠️  Nenhum evento disponível'))
            return []

        avaliacoes = []

        comentarios_positivos = [
            'Evento incrível! Superou minhas expectativas.',
            'Muito bem organizado e conteúdo de qualidade.',
            'Palestrantes excelentes, aprendi muito!',
            'Recomendo demais! Já estou esperando o próximo.',
            'Networking valeu muito a pena!',
        ]

        comentarios_neutros = [
            'Bom evento, mas poderia melhorar o coffee break.',
            'Conteúdo interessante, mas achei um pouco curto.',
            'No geral foi bom, algumas melhorias são necessárias.',
            'Gostei, mas esperava mais interação.',
        ]

        comentarios_negativos = [
            'Esperava mais do evento, conteúdo básico demais.',
            'Organização deixou a desejar.',
            'Não atendeu minhas expectativas.',
        ]

        for i in range(count):
            user = random.choice(users)
            evento = random.choice(events)

            # Verificar se já existe avaliação
            if Avaliacao.objects.filter(usuario=user, evento=evento).exists():
                continue

            # Nota aleatória (mais comum 4-5)
            nota = random.choices([1, 2, 3, 4, 5], weights=[2, 3, 10, 35, 50])[0]

            # Comentário baseado na nota
            if nota >= 4:
                comentario = random.choice(comentarios_positivos)
            elif nota == 3:
                comentario = random.choice(comentarios_neutros)
            else:
                comentario = random.choice(comentarios_negativos)

            avaliacao = Avaliacao.objects.create(
                usuario=user,
                evento=evento,
                nota=nota,
                comentario=comentario,
            )

            avaliacoes.append(avaliacao)
            stars = '⭐' * nota
            self.stdout.write(f'  {stars} {user.username} → {evento.titulo}')

        return avaliacoes


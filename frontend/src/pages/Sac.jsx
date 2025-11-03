import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { ChevronDown, ChevronUp } from "lucide-react";

// --- Dados da FAQ fornecidos ---
// OBS: Atualizei os dados com base na sua última lista e algumas correções de pontuação/espaçamento.
const backstageFAQData = [
  {
    question: "Posso editar meu perfil (foto, nome, documento)?",
    answer:
      "Sim. Clique no ícone do seu perfil e vá em “Editar Perfil” e atualize foto, dados pessoais e documentos.",
  },
  {
    question: "Como me inscrevo em um evento?",
    answer:
      "Na página do evento, clique em “Inscrever-se”, preencha os dados e finalize o pagamento (se houver custo) para confirmar a vaga.",
  },
  {
    question: "Quais métodos de pagamento são aceitos?",
    answer:
      "Os métodos dependem da integração do projeto (cartão, Pix, boleto). Verifique a tela de pagamento do evento para as opções disponíveis.",
  },
  {
    question: "Como recebo o comprovante da inscrição/pagamento?",
    answer:
      "Após a confirmação, você verá um recibo na tela e poderá receber um e-mail com o comprovante. Também é possível baixar o comprovante na área da minha conta.",
  },
  {
    question: "Posso cancelar minha inscrição e pedir reembolso?",
    answer:
      "Políticas de cancelamento dependem do evento/organizador. Verifique os termos do evento ou entre em contato com suporte via a opção “Suporte/Contato”.",
  },
  {
    question: "Como funciona o check‑in no evento?",
    answer:
      "O organizador usa a tela de check‑in. Você pode apresentar QR code, nome ou ID para que o organizador confirme sua entrada.",
  },
  {
    question: "O que é a lista de espera (waitlist)?",
    answer:
      "Quando o evento está lotado, você pode entrar na lista de espera. Se surgir uma vaga, o sistema notifica por e-mail ou na interface.",
  },
  {
    question: "Receberei notificações sobre eventos?",
    answer:
      "Sim — o app pode enviar notificações, (dependendo das permissões). Verifique suas preferências em “Notificações”.",
  },
  {
    question:
      "Como funcionam os documentos enviados (ex.: identidade, comprovantes)?",
    answer:
      "Envie via formulário indicado e só são acessíveis conforme regras de privacidade do evento/organizador.",
  },
  {
    question:
      "Tenho problemas para fazer upload de arquivos — o que verificar?",
    answer:
      "Confira tamanho do arquivo, formato permitido (jpg, png, pdf) e sua conexão. Se persistir, contate suporte.",
  },
  {
    question: "Onde encontro meus eventos confirmados e ingressos?",
    answer:
      "Na página “Meus Eventos” ou “Minhas Inscrições” do seu perfil, com detalhes e links para ingressos/comprovantes.",
  },
  {
    question: "Como eu reporto um problema ou bug?",
    answer:
      "Use a opção “Suporte/Contato” no app, descreva o problema, passos para reproduzir e anexe prints ou logs quando possível.",
  },
  {
    question: "Meus dados pessoais são seguros?",
    answer:
      "Sim — o projeto armazena dados conforme políticas internas. Em produção, o servidor deve usar HTTPS com certificado confiável e práticas padrão de segurança. Para dúvidas de privacidade.",
  },
  {
    question: "Posso favoritar eventos para ver depois?",
    answer:
      "Sim — utilize o botão de favoritos. Eventos favoritados aparecem na seção de Favoritos.",
  },
  {
    question: "Consigo imprimir o ingresso do evento?",
    answer:
      "Sim — abra o ingresso/comprovante e use a opção de imprimir do navegador ou salvar como PDF.",
  },
  {
    question: "Posso usar o Backstage sem instalar nada?",
    answer:
      "Sim — o Backstage é acessível via navegadores modernos sem necessidade de instalação.",
  },
];

// --- Componente de Item do Acordeão (Reutilizável) ---
const AccordionItem = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button
        className="flex justify-between items-center w-full p-4 text-left font-semibold text-gray-800 hover:text-indigo-600 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{item.question}</span>
        {/* Substituição do 'iCON' pelos ícones reais */}
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400 shrink-0 ml-4" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 shrink-0 ml-4" />
        )}
      </button>

      {/* Conteúdo da Resposta com Transição */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out pl-4 ${
          isOpen ? "max-h-screen opacity-100 pb-4" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-gray-600 pr-12 text-sm">{item.answer}</p>
      </div>
    </div>
  );
};

// --- Componente Principal da FAQ ---
export default function FAQBackstage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFAQ = useMemo(() => {
    if (!searchTerm) {
      return backstageFAQData;
    }
    const lowerCaseSearch = searchTerm.toLowerCase();

    return backstageFAQData.filter(
      (item) =>
        item.question.toLowerCase().includes(lowerCaseSearch) ||
        item.answer.toLowerCase().includes(lowerCaseSearch)
    );
  }, [searchTerm]);

  return (
    <div className="bg-white py-12 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-base text-gray-600 font-semibold tracking-wide uppercase">
            Perguntas Frequentes
          </h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Tudo sobre o Backstage
          </p>
        </div>

        <Link
          to={`/`}
          className="absolute top-4 right-4 border-2 border-gray-300 font-poppins h-[40px] flex items-center justify-center p-2 rounded-full hover:text-white hover:bg-black hover:scale-108 transition-all cursor-pointer"
        >
          <ArrowLeft size={24} /> Voltar
        </Link>

        {/* --- Barra de Pesquisa Adicionada --- */}
        <div className="mb-10 relative">
          <input
            type="text"
            placeholder="Pesquisar perguntas e respostas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
          />
        </div>
        {/* --- Fim da Barra de Pesquisa --- */}

        {/* Blocos de Perguntas e Respostas */}
        <div className="shadow-xl rounded-2xl divide-y divide-gray-200">
          {filteredFAQ.length > 0 ? (
            filteredFAQ.map((item, index) => (
              <AccordionItem key={index} item={item} />
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              Nenhuma pergunta encontrada para "{searchTerm}".
            </div>
          )}
        </div>

        {/* 3. Seção de Canais de Contato */}
        <section className="bg-white shadow-lg rounded-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">
            Fale Conosco
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
            {/* Cartão 1: Telefone */}
            <div className="p-6 border border-gray-200 rounded-lg transition-shadow hover:shadow-md">
              <Phone className="w-6 h-6 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Telefone
              </h3>
              <p className="text-gray-600">
                Ligue para nossa central de atendimento.
              </p>
              <a
                href="tel:+551133334444"
                className="mt-3 inline-block font-medium text-indigo-600 hover:text-indigo-800"
              >
                (63) 9 3333-4444
              </a>
            </div>

            {/* Cartão 3: E-mail */}
            <div className="p-6 border border-gray-200 rounded-lg transition-shadow hover:shadow-md">
              <Mail className="w-6 h-6 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                E-mail
              </h3>
              <p className="text-gray-600">Mande sua dúvida ou sugestão.</p>
              <a
                href="mailto:backstage@gmail.com"
                className="mt-3 inline-block font-medium text-indigo-600 hover:text-indigo-800"
              >
                backstage@gmail.com
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

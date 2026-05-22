import { useState } from 'react'

const faqs = [
  {
    question: 'Preciso de internet para usar?',
    answer: 'O app funciona parcialmente offline e sincroniza os dados automaticamente quando a conexão for restabelecida. Ideal para regiões com sinal instável.',
  },
  {
    question: 'Os pais precisam baixar algum app?',
    answer: 'Não. Os responsáveis recebem notificações por e-mail a cada embarque ou desembarque. Uma futura versão terá app dedicado para os pais.',
  },
  {
    question: 'Posso testar antes de assinar?',
    answer: 'Sim! Oferecemos 14 dias de teste gratuito em qualquer plano, sem necessidade de cartão de crédito. Cancele quando quiser.',
  },
  {
    question: 'Funciona para ônibus com muitos alunos?',
    answer: 'Sim, o sistema é otimizado para listas grandes. O check-in é rápido e pode ser feito sequencialmente sem travar o motorista.',
  },
  {
    question: 'Como cancelo minha assinatura?',
    answer: 'Pelo próprio painel, a qualquer momento, sem multa ou fidelidade. Seus dados ficam disponíveis por 30 dias após o cancelamento.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 reveal">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Perguntas frequentes</h2>
          <p className="text-gray-600 text-lg">Tire suas dúvidas antes de começar.</p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="reveal border border-gray-200 rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-blue-600 flex-shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

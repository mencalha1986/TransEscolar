const plans = [
  {
    name: 'Básico',
    price: 'R$ 59',
    period: '/mês',
    description: 'Ideal para quem está começando',
    features: ['Até 30 alunos', '1 rota', 'Suporte por e-mail', 'Histórico 30 dias'],
    cta: 'Começar grátis',
    highlighted: false,
  },
  {
    name: 'Profissional',
    price: 'R$ 129',
    period: '/mês',
    description: 'O mais escolhido pelos transportadores',
    features: ['Até 100 alunos', '5 rotas', 'Suporte e-mail + chat', 'Histórico 6 meses'],
    cta: 'Começar grátis',
    highlighted: true,
  },
  {
    name: 'Empresarial',
    price: 'R$ 249',
    period: '/mês',
    description: 'Para frotas e empresas de transporte',
    features: ['Alunos ilimitados', 'Rotas ilimitadas', 'Suporte prioritário', 'Histórico ilimitado'],
    cta: 'Falar com vendas',
    highlighted: false,
  },
]

const CheckIcon = ({ highlighted }: { highlighted: boolean }) => (
  <svg
    className={`w-4 h-4 flex-shrink-0 ${highlighted ? 'text-blue-300' : 'text-blue-600'}`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
)

export default function Pricing() {
  return (
    <section id="planos" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 reveal">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Planos e preços</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            14 dias grátis em qualquer plano. Sem cartão de crédito.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`reveal rounded-2xl p-8 border-2 transition-all ${
                plan.highlighted
                  ? 'border-blue-600 bg-blue-600 shadow-xl shadow-blue-200 md:scale-105'
                  : 'border-gray-200 bg-white hover:border-blue-200 hover:shadow-md'
              }`}
            >
              {plan.highlighted && (
                <div className="bg-white text-blue-600 text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                  ⭐ MAIS POPULAR
                </div>
              )}
              <h3 className={`text-xl font-bold mb-1 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mb-4 ${plan.highlighted ? 'text-blue-100' : 'text-gray-500'}`}>
                {plan.description}
              </p>
              <div className={`flex items-baseline gap-1 mb-6 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className={`text-sm ${plan.highlighted ? 'text-blue-200' : 'text-gray-500'}`}>{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className={`flex items-center gap-2 text-sm ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                    <CheckIcon highlighted={plan.highlighted} />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#contato"
                className={`block w-full text-center py-3 rounded-xl font-semibold transition-colors ${
                  plan.highlighted
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const steps = [
  {
    number: '01',
    title: 'Cadastre seus alunos',
    description: 'Informe nome, escola, responsável e ponto de embarque. Tudo organizado em poucos minutos.',
    icon: '👨‍🎓',
  },
  {
    number: '02',
    title: 'Realize o check-in no embarque',
    description: 'O app registra o horário e a localização GPS automaticamente ao confirmar o embarque.',
    icon: '📍',
  },
  {
    number: '03',
    title: 'Registre o desembarque',
    description: 'Confirmação ao chegar na escola ou destino. Tudo rastreado e registrado com precisão.',
    icon: '🏫',
  },
  {
    number: '04',
    title: 'Responsáveis são notificados',
    description: 'Os pais recebem confirmação por e-mail em tempo real. Tranquilidade para toda a família.',
    icon: '✉️',
  },
]

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 reveal">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Como funciona</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Simples, rápido e eficiente. Em 4 passos você tem o controle total do transporte.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="reveal text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-2xl text-2xl mb-4 shadow-lg shadow-blue-200">
                {step.icon}
              </div>
              <div className="text-blue-400 font-bold text-xs tracking-widest mb-2">{step.number}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const problems = [
  {
    icon: '📱',
    title: 'Pais ligando a todo momento',
    description: 'Responsáveis ansiosos perguntando onde está o filho, interrompendo o motorista no trânsito em momentos críticos.',
  },
  {
    icon: '📋',
    title: 'Controle feito no papel ou WhatsApp',
    description: 'Listas de presença manuais, grupos de WhatsApp caóticos e nenhuma rastreabilidade ou histórico confiável.',
  },
  {
    icon: '❌',
    title: 'Nenhum histórico de embarques',
    description: 'Sem registros formais em caso de reclamações ou questionamentos sobre horários e locais de embarque.',
  },
]

export default function Problems() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 reveal">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Você já passou por alguma dessas situações?
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            São os desafios diários de quem gerencia transporte escolar sem a ferramenta certa.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((p, i) => (
            <div
              key={i}
              className="reveal bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-4">{p.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{p.title}</h3>
              <p className="text-gray-600 leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

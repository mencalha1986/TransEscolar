const features = [
  {
    icon: '📍',
    title: 'Check-in com GPS',
    description: 'Cada embarque e desembarque registrado com localização precisa e horário exato.',
  },
  {
    icon: '🔔',
    title: 'Notificação aos pais',
    description: 'Responsáveis avisados automaticamente por e-mail a cada movimentação do aluno.',
  },
  {
    icon: '📊',
    title: 'Histórico completo',
    description: 'Consulte o registro de todas as viagens por aluno. Tenha prova documentada de cada embarque.',
  },
  {
    icon: '👦',
    title: 'Gestão de alunos',
    description: 'Cadastro completo com foto, responsável, escola e ponto de embarque de cada aluno.',
  },
  {
    icon: '🛣️',
    title: 'Multi-rota',
    description: 'Gerencie diferentes horários e rotas no mesmo sistema, com total organização.',
  },
  {
    icon: '🔒',
    title: 'Acesso seguro',
    description: 'Login por perfil: transportador, responsável e administrador com permissões distintas.',
  },
]

export default function Features() {
  return (
    <section id="funcionalidades" className="py-20 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 reveal">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Tudo que você precisa</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Funcionalidades pensadas para o dia a dia do transportador escolar.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="reveal bg-white rounded-2xl p-6 shadow-sm border border-blue-100 hover:shadow-md hover:border-blue-200 transition-all"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

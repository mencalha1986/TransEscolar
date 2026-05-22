const mockStudents = [
  { name: 'Ana Beatriz', initials: 'AB', status: 'Embarcou', time: '07:42', color: 'green' },
  { name: 'Pedro Henrique', initials: 'PH', status: 'Embarcou', time: '07:55', color: 'green' },
  { name: 'Maria Clara', initials: 'MC', status: 'Aguardando', time: '--:--', color: 'yellow' },
  { name: 'João Victor', initials: 'JV', status: 'Aguardando', time: '--:--', color: 'yellow' },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              14 dias grátis · sem cartão de crédito
            </div>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Controle total sobre o transporte escolar dos seus alunos
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Registre embarques e desembarques em tempo real, notifique os pais automaticamente e elimine o caos das planilhas e grupos de WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#contato"
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors text-center shadow-lg shadow-blue-200"
              >
                Começar grátis
              </a>
              <a
                href="#como-funciona"
                className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-blue-300 hover:text-blue-600 transition-colors text-center"
              >
                Ver como funciona
              </a>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-gray-500">
              {['GPS em tempo real', 'Notificação automática', 'Histórico completo'].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              <div className="w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="bg-blue-600 p-4 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold">🚐 TransEscolar</div>
                    <div className="text-xs opacity-80">08:15</div>
                  </div>
                  <div className="text-sm opacity-90">Rota Matutina · 12 alunos</div>
                </div>
                <div className="p-4 space-y-3">
                  {mockStudents.map((s) => (
                    <div key={s.name} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                          {s.initials}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-800">{s.name}</div>
                          <div className={`text-xs ${s.color === 'green' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {s.status}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">{s.time}</div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-100">
                  <div className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold text-center">
                    Registrar Check-in
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg border border-gray-100 p-3 w-52">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-800">Ana embarcou!</div>
                    <div className="text-xs text-gray-500">Rua das Flores, 42 · agora</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg border border-gray-100 p-3 w-44">
                <div className="text-xs text-gray-500 mb-1">Alunos embarcados</div>
                <div className="text-2xl font-bold text-blue-600">8/12</div>
                <div className="mt-1 bg-gray-100 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '66%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

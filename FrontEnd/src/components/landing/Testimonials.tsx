const testimonials = [
  {
    quote: 'Antes eu anotava tudo em papel. Hoje os pais me ligam muito menos porque eles mesmos acompanham pelo app.',
    name: 'Carlos Mendes',
    role: 'Transportador há 8 anos',
    city: 'São Paulo, SP',
    initials: 'CM',
  },
  {
    quote: 'Quando um pai reclamou que o filho não tinha chegado, eu mostrei o registro com horário e GPS. Problema resolvido na hora.',
    name: 'Mariana Souza',
    role: 'Dona de van escolar',
    city: 'Belo Horizonte, MG',
    initials: 'MS',
  },
  {
    quote: 'Profissionalizei meu serviço. Hoje consigo cobrar mais caro porque entrego mais segurança para as famílias.',
    name: 'Roberto Alves',
    role: 'Transportador',
    city: 'Curitiba, PR',
    initials: 'RA',
  },
]

export default function Testimonials() {
  return (
    <section id="depoimentos" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 reveal">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">O que dizem nossos clientes</h2>
          <p className="text-gray-600 text-lg">
            Transportadores que transformaram seu negócio com o TransEscolar.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="reveal bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex mb-4">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed mb-6 italic">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                  {t.initials}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-gray-500 text-xs">{t.role} · {t.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

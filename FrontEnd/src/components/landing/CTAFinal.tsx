import { Link } from 'react-router-dom'

export default function CTAFinal() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4 reveal">
          Comece hoje mesmo. 14 dias grátis.
        </h2>
        <p className="text-blue-200 text-xl mb-10 reveal">
          Sem cartão de crédito. Cancele quando quiser.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center reveal">
          <Link
            to="/login"
            className="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            Criar minha conta grátis
          </Link>
          <a
            href="#contato"
            className="border-2 border-white/40 text-white px-10 py-4 rounded-xl font-bold text-lg hover:border-white hover:bg-white/10 transition-colors"
          >
            Falar com a equipe
          </a>
        </div>
      </div>
    </section>
  )
}

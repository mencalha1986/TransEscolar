import { useState } from 'react'

type FormState = {
  nome: string
  email: string
  telefone: string
  mensagem: string
}

type Status = 'idle' | 'sending' | 'success' | 'error'

export default function ContactForm() {
  const [form, setForm] = useState<FormState>({ nome: '', email: '', telefone: '', mensagem: '' })
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')
    try {
      const res = await fetch('/api/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setStatus('success')
        setForm({ nome: '', email: '', telefone: '', mensagem: '' })
      } else {
        setStatus('error')
        setErrorMsg(data.error || 'Erro ao enviar mensagem.')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Erro de conexão. Tente novamente.')
    }
  }

  const inputClass =
    'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'

  return (
    <section id="contato" className="py-20 bg-blue-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 reveal">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Entre em contato</h2>
          <p className="text-gray-600 text-lg">
            Quer conhecer mais ou contratar o serviço? Mande uma mensagem e retornaremos em breve.
          </p>
        </div>
        <div className="reveal bg-white rounded-2xl shadow-sm border border-blue-100 p-8">
          {status === 'success' ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Mensagem enviada!</h3>
              <p className="text-gray-600">Recebemos seu contato e responderemos em breve.</p>
              <button
                className="mt-6 text-blue-600 font-medium hover:underline"
                onClick={() => setStatus('idle')}
              >
                Enviar outra mensagem
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome *</label>
                  <input
                    type="text"
                    name="nome"
                    value={form.nome}
                    onChange={handleChange}
                    required
                    placeholder="Seu nome completo"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="seu@email.com"
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefone</label>
                <input
                  type="tel"
                  name="telefone"
                  value={form.telefone}
                  onChange={handleChange}
                  placeholder="(11) 99999-0000"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mensagem *</label>
                <textarea
                  name="mensagem"
                  value={form.mensagem}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Como podemos te ajudar?"
                  className={`${inputClass} resize-none`}
                />
              </div>
              {status === 'error' && (
                <div className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  {errorMsg}
                </div>
              )}
              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === 'sending' ? 'Enviando...' : 'Enviar mensagem'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

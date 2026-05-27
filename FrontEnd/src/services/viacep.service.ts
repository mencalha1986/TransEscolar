export interface ViaCEPResponse {
  logradouro: string
  bairro: string
  localidade: string
  uf: string
  cep: string
  erro?: boolean
}

export async function buscarEnderecoPorCEP(cep: string): Promise<ViaCEPResponse | null> {
  const digits = cep.replace(/\D/g, "")
  if (digits.length !== 8) return null
  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
    if (!res.ok) return null
    const data: ViaCEPResponse = await res.json()
    return data.erro ? null : data
  } catch {
    return null
  }
}

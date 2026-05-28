import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { useRecados } from "./useRecados"

export function useRecadosNotificacao() {
  const { user } = useAuth()
  const isTransportador = user?.perfil === "Admin" || user?.perfil === "Motorista" || user?.perfil === "SuperAdmin"

  const { data: recados } = useRecados()
  const lastSeenTsRef = useRef<number | null>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!isTransportador || !recados || recados.length === 0) return

    if (!initializedRef.current) {
      const maxTs = Math.max(...recados.map(r => new Date(r.criadoEm).getTime()))
      lastSeenTsRef.current = maxTs
      initializedRef.current = true
      return
    }

    const novos = recados.filter(r =>
      !r.euEnviei &&
      r.tipo === "DoResponsavel" &&
      new Date(r.criadoEm).getTime() > (lastSeenTsRef.current ?? 0)
    )

    if (novos.length === 0) return

    novos.forEach(r => {
      const alunos = r.alunoNomes ? ` — Aluno(s): ${r.alunoNomes}` : ""
      toast(`📨 ${r.autorNome}${alunos}`, {
        description: r.conteudo.length > 80 ? r.conteudo.slice(0, 80) + "…" : r.conteudo,
        duration: 6000,
      })
    })

    const maxTs = Math.max(...recados.map(r => new Date(r.criadoEm).getTime()))
    lastSeenTsRef.current = maxTs
  }, [recados, isTransportador])
}

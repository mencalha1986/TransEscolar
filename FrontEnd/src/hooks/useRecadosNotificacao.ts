import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { useRecados } from "./useRecados"

export function useRecadosNotificacao() {
  const { user } = useAuth()
  const isTransportador = user?.perfil === "Admin" || user?.perfil === "Motorista" || user?.perfil === "SuperAdmin"
  const isResponsavel = user?.perfil === "Responsavel"

  const { data: recados } = useRecados()

  // Notificação para transportador: novo recado do responsável
  const lastSeenTsRef = useRef<number | null>(null)
  const initializedRef = useRef(false)

  // Notificação para responsável: transportador deu ciência
  const cienciaNotificadosRef = useRef<Set<string>>(new Set())
  const cienciaInitializedRef = useRef(false)

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

    if (novos.length > 0) {
      novos.forEach(r => {
        const alunos = r.alunoNomes ? ` — Aluno(s): ${r.alunoNomes}` : ""
        toast(`📨 ${r.autorNome}${alunos}`, {
          description: r.conteudo.length > 80 ? r.conteudo.slice(0, 80) + "…" : r.conteudo,
          duration: 6000,
        })
      })

      const maxTs = Math.max(...recados.map(r => new Date(r.criadoEm).getTime()))
      lastSeenTsRef.current = maxTs
    }
  }, [recados, isTransportador])

  useEffect(() => {
    if (!isResponsavel || !recados || recados.length === 0) return

    if (!cienciaInitializedRef.current) {
      // Na inicialização, marcar os já com ciência para não notificar retroativamente
      recados.filter(r => r.euEnviei && r.cienciaAdmin).forEach(r => {
        cienciaNotificadosRef.current.add(r.id)
      })
      cienciaInitializedRef.current = true
      return
    }

    const novaCiencia = recados.filter(r =>
      r.euEnviei &&
      r.cienciaAdmin &&
      !cienciaNotificadosRef.current.has(r.id)
    )

    novaCiencia.forEach(r => {
      cienciaNotificadosRef.current.add(r.id)
      toast.success("O transportador deu ciência do seu recado!", {
        description: r.conteudo.length > 80 ? r.conteudo.slice(0, 80) + "…" : r.conteudo,
        duration: 6000,
      })
    })
  }, [recados, isResponsavel])
}

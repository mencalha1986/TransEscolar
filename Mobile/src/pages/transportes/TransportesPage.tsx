import { useAlunos } from "@/hooks/useAlunos"
import { useRegistrarCheckIn, useCheckIns } from "@/hooks/useTransportes"
import { useGeolocation } from "@/hooks/useGeolocation"
import { Bus, CheckCircle, Loader2, Map as MapIcon, UserPlus, UserMinus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { MapaViagem } from "./MapaViagem"

export function TransportesPage() {
  const [view, setView] = useState<'lista' | 'mapa' | 'historico'>('lista')
  const { data: alunos, isLoading: loadingAlunos } = useAlunos()
  const { data: checkins, isLoading: loadingCheckins } = useCheckIns()
  const { mutate: registrar, isPending: isRegistering } = useRegistrarCheckIn()
  const { getCurrentPosition, loading: isGettingLocation } = useGeolocation()

  const handleRegistro = async (alunoId: string, nome: string, tipo: 'Embarque' | 'Desembarque') => {
    if (isRegistering || isGettingLocation) return;

    try {
      toast.loading(`Registrando ${tipo}...`, { id: "gps-status" })
      const location = await getCurrentPosition()

      registrar({
        alunoId,
        tipo,
        latitude: location?.latitude,
        longitude: location?.longitude
      }, {
        onSuccess: () => {
          toast.success(`${tipo} de ${nome} registrado!`, { id: "gps-status" })
        },
        onError: (err: any) => {
          toast.error("Erro ao salvar: " + err.message, { id: "gps-status" })
        }
      })
    } catch (error) {
      toast.error("Falha ao obter GPS.", { id: "gps-status" })
    }
  }

  // Filtrar checkins de hoje para o mapa
  const checkinsHoje = checkins?.filter(c => {
    const data = new Date(c.horaRegistro).toDateString()
    return data === new Date().toDateString()
  }) ?? []

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="p-4 bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Controle de Viagem</h2>
            <p className="text-xs text-slate-500">Gestão de embarque e localização</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView('lista')}
              className={`p-2 rounded-lg ${view === 'lista' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              <Bus className="h-5 w-5" />
            </button>
            <button
              onClick={() => setView('mapa')}
              className={`p-2 rounded-lg ${view === 'mapa' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              <MapIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {view === 'lista' ? (
          <div className="p-4 space-y-3">
            {loadingAlunos ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
            ) : (
              alunos?.map(aluno => {
                const ultimoCheckin = checkinsHoje
                  .filter(c => c.alunoId === aluno.id)
                  .sort((a, b) => new Date(b.horaRegistro).getTime() - new Date(a.horaRegistro).getTime())[0]

                const status = ultimoCheckin?.tipo || 'Pendente'

                return (
                  <div key={aluno.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                        status === 'Embarque' ? 'bg-blue-100 text-blue-600' :
                        status === 'Desembarque' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {aluno.nome.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-800">{aluno.nome}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-medium">{aluno.escolaNome} • {aluno.turno}</p>
                      </div>
                      <div className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        status === 'Embarque' ? 'bg-blue-50 text-blue-600' :
                        status === 'Desembarque' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'
                      }`}>
                        {status.toUpperCase()}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleRegistro(aluno.id, aluno.nome, 'Embarque')}
                        disabled={status === 'Embarque' || isRegistering || isGettingLocation}
                        className="flex items-center justify-center gap-2 h-10 rounded-xl border border-blue-200 text-blue-600 text-xs font-bold active:bg-blue-50 disabled:opacity-30"
                      >
                        <UserPlus className="h-4 w-4" />
                        Embarcar
                      </button>
                      <button
                        onClick={() => handleRegistro(aluno.id, aluno.nome, 'Desembarque')}
                        disabled={status !== 'Embarque' || isRegistering || isGettingLocation}
                        className="flex items-center justify-center gap-2 h-10 rounded-xl border border-green-200 text-green-600 text-xs font-bold active:bg-green-50 disabled:opacity-30"
                      >
                        <UserMinus className="h-4 w-4" />
                        Desembarcar
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        ) : (
          <div className="h-full">
            <MapaViagem checkins={checkinsHoje} />
          </div>
        )}
      </div>
    </div>
  )
}

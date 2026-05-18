import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { listarCheckIns, listarTransportes, registrarCheckIn } from "@/services/transportes.service"
import type { RegistrarCheckInRequest } from "@/types/transporte"

export function useTransportes() {
  return useQuery({
    queryKey: ["transportes"],
    queryFn: listarTransportes,
  })
}

export function useCheckIns() {
  return useQuery({
    queryKey: ["checkins"],
    queryFn: listarCheckIns,
  })
}

export function useRegistrarCheckIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: RegistrarCheckInRequest) => registrarCheckIn(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["checkins"] }),
  })
}

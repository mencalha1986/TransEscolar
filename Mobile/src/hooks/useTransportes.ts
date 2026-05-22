import { useQuery, useMutation } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import { listarTransportes, registrarCheckIn, listarCheckIns } from "@/services/transportes.service"
import type { RegistrarCheckInRequest } from "@/types/transporte"

export const TRANSPORTE_KEYS = {
  all: ["transportes"] as const,
  checkins: ["checkins"] as const,
}

export function useTransportes() {
  return useQuery({
    queryKey: TRANSPORTE_KEYS.all,
    queryFn: listarTransportes,
  })
}

export function useCheckIns() {
  return useQuery({
    queryKey: TRANSPORTE_KEYS.checkins,
    queryFn: listarCheckIns,
  })
}

export function useRegistrarCheckIn() {
  return useMutation({
    mutationFn: (data: RegistrarCheckInRequest) => registrarCheckIn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSPORTE_KEYS.checkins })
    },
  })
}

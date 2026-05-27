import { useQuery, useMutation } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import { listarTransportes, registrarCheckIn, listarCheckIns } from "@/services/transportes.service"
import type { CheckInResultDto } from "@/services/transportes.service"
import type { RegistrarCheckInRequest } from "@/types/transporte"

export const TRANSPORTE_KEYS = {
  all: ["transportes"] as const,
  checkins: (data?: string) => ["checkins", data] as const,
}

export function useTransportes() {
  return useQuery({
    queryKey: TRANSPORTE_KEYS.all,
    queryFn: listarTransportes,
  })
}

export function useCheckIns(data?: string) {
  return useQuery({
    queryKey: TRANSPORTE_KEYS.checkins(data),
    queryFn: () => listarCheckIns(data),
  })
}

export function useRegistrarCheckIn() {
  return useMutation<CheckInResultDto, Error, RegistrarCheckInRequest>({
    mutationFn: (data) => registrarCheckIn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkins"] })
    },
  })
}

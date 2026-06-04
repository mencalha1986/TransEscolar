import { useEffect, useRef } from "react"
import { NavigateFunction } from "react-router-dom"
import { Capacitor } from "@capacitor/core"
import { PushNotifications } from "@capacitor/push-notifications"
import { toast } from "sonner"
import { api } from "@/lib/axios"
import { useAuth } from "@/contexts/AuthContext"
import { queryClient } from "@/lib/queryClient"
import { RECADO_KEYS } from "./useRecados"
import { VIAGEM_KEYS } from "./useViagens"

export function usePushNotifications(navigate: NavigateFunction) {
  const { isAuthenticated } = useAuth()
  const tokenSentRef = useRef(false)

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !isAuthenticated) return

    tokenSentRef.current = false

    async function init() {
      const permission = await PushNotifications.requestPermissions()
      if (permission.receive !== "granted") return

      if (Capacitor.getPlatform() === "android") {
        await PushNotifications.createChannel({
          id: "transescolar_default",
          name: "Notificações TransEscolar",
          importance: 5,
          sound: "default",
          vibration: true,
          visibility: 1,
        })
      }

      await PushNotifications.register()

      PushNotifications.addListener("registration", async ({ value: token }) => {
        if (tokenSentRef.current) return
        tokenSentRef.current = true
        console.log("[Push] Token FCM recebido:", token)
        try {
          await api.post("/dispositivos/token", {
            token,
            plataforma: Capacitor.getPlatform(),
          })
          console.log("[Push] Token registrado no backend com sucesso")
        } catch (err) {
          console.error("[Push] Erro ao registrar token no backend:", err)
        }
      })

      PushNotifications.addListener("registrationError", (err) => {
        console.error("Erro ao registrar push:", err)
      })

      PushNotifications.addListener("pushNotificationReceived", (notification) => {
        toast(notification.title ?? "TransEscolar", {
          description: notification.body ?? "",
          duration: 6000,
        })
        const tipo = notification.data?.tipo
        if (tipo === "recado") queryClient.invalidateQueries({ queryKey: RECADO_KEYS.all })
        if (tipo === "viagem") queryClient.invalidateQueries({ queryKey: VIAGEM_KEYS.atual })
        if (tipo === "checkin") queryClient.invalidateQueries({ queryKey: ["checkins"] })
      })

      PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
        const tipo = action.notification.data?.tipo
        if (tipo === "recado") navigate("/mural")
        else if (tipo === "viagem" || tipo === "checkin") navigate("/transportes")
        else navigate("/dashboard")
      })
    }

    init()

    return () => {
      PushNotifications.removeAllListeners()
    }
  }, [isAuthenticated, navigate])
}

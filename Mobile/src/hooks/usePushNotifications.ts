import { useEffect, useRef } from "react"
import { Capacitor } from "@capacitor/core"
import { PushNotifications } from "@capacitor/push-notifications"
import { toast } from "sonner"
import { api } from "@/lib/axios"
import { useAuth } from "@/contexts/AuthContext"

export function usePushNotifications() {
  const { isAuthenticated } = useAuth()
  const tokenSentRef = useRef(false)

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !isAuthenticated) return

    tokenSentRef.current = false

    async function init() {
      const permission = await PushNotifications.requestPermissions()
      if (permission.receive !== "granted") return

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
        const title = notification.title ?? "TransEscolar"
        const body = notification.body ?? ""
        toast(title, { description: body, duration: 6000 })
      })

      PushNotifications.addListener("pushNotificationActionPerformed", () => {
        // futuro: navegar para tela relevante via notification.notification.data
      })
    }

    init()

    return () => {
      PushNotifications.removeAllListeners()
    }
  }, [isAuthenticated])
}

import { Capacitor } from "@capacitor/core"
import { NativeBiometric } from "capacitor-native-biometric"

const SERVER = "com.transescolar.app"

export async function biometricIsAvailable(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false
  try {
    const result = await NativeBiometric.isAvailable()
    return result.isAvailable
  } catch {
    return false
  }
}

export async function biometricHasCredentials(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false
  try {
    await NativeBiometric.getCredentials({ server: SERVER })
    return true
  } catch {
    return false
  }
}

export async function biometricAuthenticate(): Promise<{ username: string; password: string }> {
  await NativeBiometric.verifyIdentity({
    reason: "Confirme sua identidade para entrar no TransEscolar",
    title: "Login com Biometria",
    subtitle: "Use sua impressão digital ou Face ID",
    negativeButtonText: "Usar senha",
  })
  return NativeBiometric.getCredentials({ server: SERVER })
}

export async function biometricSaveCredentials(email: string, senha: string): Promise<void> {
  await NativeBiometric.setCredentials({
    username: email,
    password: senha,
    server: SERVER,
  })
}

export async function biometricDeleteCredentials(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  try {
    await NativeBiometric.deleteCredentials({ server: SERVER })
  } catch {
    // sem credenciais salvas — ignorar silenciosamente
  }
}

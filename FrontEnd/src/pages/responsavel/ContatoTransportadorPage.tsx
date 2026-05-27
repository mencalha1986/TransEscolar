import { PageHeader } from "@/components/layout/PageHeader"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useResponsavelPerfil } from "@/hooks/useResponsavel"
import { Phone, Mail, Building2 } from "lucide-react"

export function ContatoTransportadorPage() {
  const { data: perfil, isLoading } = useResponsavelPerfil()

  return (
    <div>
      <PageHeader title="Contato" description="Dados do seu transportador escolar" />

      {isLoading ? (
        <Card><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
      ) : !perfil?.transportador ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Informações do transportador não disponíveis.
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-md">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Empresa</p>
                <p className="font-semibold">{perfil.transportador.nomeEmpresa}</p>
              </div>
            </div>

            {perfil.transportador.telefone && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Telefone</p>
                  <a
                    href={`tel:${perfil.transportador.telefone}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    {perfil.transportador.telefone}
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">E-mail</p>
                <a
                  href={`mailto:${perfil.transportador.email}`}
                  className="font-semibold text-primary hover:underline"
                >
                  {perfil.transportador.email}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

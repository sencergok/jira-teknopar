// Code: Landing page features section
// This page is a part of the landing page. It displays the features of the product.

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Layout, Clock, Users, Zap, Shield, LineChart } from "lucide-react";

export function Features() {
  return (
    <section className="border-t border-b bg-muted/40" id="features">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 md:px-8 py-8 md:py-12 lg:py-14">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <Badge className="mb-4" variant="secondary">Özellikler</Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-indigo-600">
            Her Şey Kontrol Altında
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            ProPar&apos;ın güçlü özellikleriyle projelerinizi ve ekibinizi yönetmek artık çok daha kolay.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <Card className="group hover:shadow-lg transition-all duration-300 bg-background">
            <CardHeader className="text-center relative">
              <div className="mb-6 rounded-2xl bg-primary/10 w-16 h-16 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Layout className="h-8 w-8 text-indigo-600" />
              </div>
              <CardTitle className="text-2xl mb-3">Akıllı Proje Yönetimi</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Sürükle-bırak arayüzü ve yapay zeka destekli önerilerle projelerinizi 
                ve görevlerinizi en verimli şekilde organize edin.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 bg-background">
            <CardHeader className="text-center relative">
              <div className="mb-6 rounded-2xl bg-primary/10 w-16 h-16 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-8 w-8 text-indigo-600" />
              </div>
              <CardTitle className="text-2xl mb-3">Gelişmiş Zaman Takibi</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Otomatik zaman takibi, detaylı raporlama ve verimlilik analizleriyle 
                ekibinizin performansını optimize edin.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 bg-background">
            <CardHeader className="text-center relative">
              <div className="mb-6 rounded-2xl bg-primary/10 w-16 h-16 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
              <CardTitle className="text-2xl mb-3">Gerçek Zamanlı İş Birliği</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Anlık mesajlaşma, video konferans ve paylaşımlı belgelerle 
                ekip çalışmasını güçlendirin.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-8">
          <Card className="p-6 bg-background">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-2">
                <Zap className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Hızlı Kurulum</h3>
                <p className="text-sm text-muted-foreground">
                  Dakikalar içinde sistemi kurun ve kullanmaya başlayın
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-background">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-2">
                <Shield className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Güvenli Altyapı</h3>
                <p className="text-sm text-muted-foreground">
                  En son güvenlik standartlarıyla verilerinizi koruyun
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-background">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-2">
                <LineChart className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Detaylı Analizler</h3>
                <p className="text-sm text-muted-foreground">
                  Proje ve ekip performansını detaylı raporlarla takip edin
                </p>
              </div>
            </div>
          </Card>
        </div>
        </div>
    </section>
  );
} 
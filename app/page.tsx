/* import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/auth/login');
}  

Normal ana sayfaya geri dönmek istersem üstteki kod çalışıyor.
*/


import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  ArrowRight,
  CheckCircle,
  Layout,
  Clock,
  Users,
  Zap,
  Shield,
  LineChart,
  ArrowUpRight,
  Menu
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col antialiased">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto">
          <div className="flex h-14 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-indigo-600">
              <CheckCircle className="h-6 w-6" />
              Jira Teknopar
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="#features" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Özellikler
              </Link>
              <Link 
                href="#pricing"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Fiyatlandırma
              </Link>
                <Button asChild size="sm" className="bg-indigo-600 text-white font-semibold">
                  <Link href="/auth/login">Giriş Yap</Link>
                </Button>
            </nav>

            {/* Mobile Navigation */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menü</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetTitle className="text-left">Menü</SheetTitle>
                <nav className="flex flex-col gap-4 mt-6">
                  <Link 
                    href="#features"
                    className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Özellikler
                  </Link>
                  <Link 
                    href="#pricing"
                    className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Fiyatlandırma
                  </Link>
                  <Button asChild className="mt-4">
                    <Link href="/login">Giriş Yap</Link>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-screen-xl px-4 sm:px-6 md:px-8 py-10 md:py-14 lg:py-18">
            <div className="flex flex-col items-center text-center space-y-8">
              <Badge className="px-4 py-1 mb-4" variant="secondary">
                🚀 Yeni Özellik: Görev Planlama
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl mx-auto leading-tight">
                Projelerinizi Yönetmenin{" "}
                <span className="text-indigo-600">Modern ve Akıllı</span>{" "}
                Yolu
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                ProPar ile projelerinizi ve ekibinizi tek platformda yönetin. 
                Yapay zeka destekli özelliklerle verimliliğinizi artırın.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-8 w-full sm:w-auto text-indigo-600">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto min-w-[200px] h-12 bg-indigo-600 text-white font-semibold"
                  asChild
                >
                  <Link href="/auth/login">
                    Ücretsiz Başla <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto min-w-[200px] h-12 text-base group"
                >
                  Canlı Demo İzle{" "}
                  <ArrowUpRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Button>
              </div>
              <div className="pt-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>14 Gün Ücretsiz</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Kurulum Gerektirmez</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>7/24 Destek</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-b bg-muted/40" id="features">
          <div className="mx-auto max-w-screen-xl px-4 sm:px-6 md:px-8 py-8 md:py-12 lg:py-14">
            <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
              <Badge className="mb-4" variant="secondary">Özellikler</Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-indigo-600">
                Her Şey Kontrol Altında
              </h2>
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                ProPar&apos;ın güçlü özellikleriyle projelerinizi ve ekibinizi yönetmek artık çok daha kolay.
                Yapay zeka destekli araçlarla verimliliğinizi maksimuma çıkarın.
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
                <CardFooter className="pt-4 pb-8 text-center">
                  <Button variant="ghost" className="mx-auto group-hover:text-primary transition-colors">
                    Daha Fazla Bilgi <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
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
                <CardFooter className="pt-4 pb-8 text-center">
                  <Button variant="ghost" className="mx-auto group-hover:text-primary transition-colors">
                    Daha Fazla Bilgi <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
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
                <CardFooter className="pt-4 pb-8 text-center">
                  <Button variant="ghost" className="mx-auto group-hover:text-primary transition-colors">
                    Daha Fazla Bilgi <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
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
                      Gelişmiş raporlar ve performans metrikleri
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
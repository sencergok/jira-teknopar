import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle } from "lucide-react";

export function Hero() {
  return (
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
  );
} 
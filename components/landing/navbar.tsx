import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { CheckCircle, Menu } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-indigo-600">
            <CheckCircle className="h-6 w-6" />
            Jira Teknopar
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
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
                <Button asChild className="mt-4">
                  <Link href="/login">Giriş Yap</Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
} 
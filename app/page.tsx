/* import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/auth/login');
}  

Normal ana sayfaya geri dönmek istersem üstteki kod çalışıyor.
*/

import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col antialiased">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
      </main>
    </div>
  );
}
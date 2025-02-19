# Jira Teknopar - Proje Yönetim Sistemi

Modern ve kullanıcı dostu bir proje yönetim sistemi.

## 🚀 Özellikler

- **Kanban Board**: Sürükle-bırak arayüzü ile görev yönetimi
- **Gerçek Zamanlı Güncelleme**: Anlık task güncellemeleri ve senkronizasyon
- **Rol Tabanlı Yetkilendirme**: OWNER, ADMIN, MEMBER ve VIEWER rolleri
- **Proje Metrikleri**: Detaylı proje ve görev istatistikleri
- **Responsive Tasarım**: Mobil uyumlu arayüz

## 🛠️ Teknolojiler

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Realtime)
- **State Management**: React Hooks
- **UI Components**: shadcn/ui
- **Drag & Drop**: @dnd-kit/core
- **Authentication**: Supabase Auth

## 📦 Kurulum

1. Repoyu klonlayın:
```bash
git clone https://github.com/sencergok/jira-teknopar.git
cd jira-teknopar
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Supabase projenizi oluşturun ve .env dosyasını yapılandırın:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

## 🏗️ Proje Yapısı

```
jira-teknopar/
├── app/                    # Next.js app router
├── components/            # React bileşenleri
│   ├── kanban/           # Kanban board bileşenleri
│   ├── task/             # Task ile ilgili bileşenler
│   ├── project/          # Proje bileşenleri
│   ├── ui/               # Genel UI bileşenleri
│   └── modals/           # Modal bileşenleri
├── lib/                   # Yardımcı fonksiyonlar
│   ├── hooks/            # Custom React hooks
│   ├── services/         # Servis katmanı
│   ├── supabase/         # Supabase konfigürasyonu
│   └── db/               # Veritabanı şemaları
├── types/                # TypeScript tip tanımlamaları
└── views/                # Sayfa görünümleri
```

## 🔐 Rol ve İzinler

- **OWNER**: Tüm yetkilere sahip
- **ADMIN**: Proje düzenleme ve üye yönetimi
- **MEMBER**: Görev oluşturma ve düzenleme
- **VIEWER**: Sadece görüntüleme ve yorum yapma

## 🔄 Realtime Özellikler

- Task durumu güncellemeleri
- Task sıralaması değişiklikleri
- Üye atamaları ve güncellemeleri
- Proje değişiklikleri

## 📱 Responsive Tasarım

- Mobil uyumlu Kanban board
- Adaptif UI bileşenleri
- Touch-friendly sürükle-bırak

## 🤝 Katkıda Bulunma

1. Fork'layın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit'leyin (`git commit -m 'feat: add amazing feature'`)
4. Push'layın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun


## 👥 Ekip

- Sencer Gök
- Salih Elçiçek

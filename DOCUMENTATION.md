# Jira Teknopar - Teknik Dokümantasyon

## 1. Proje Yapısı

### 1.1 Klasör Yapısı

```
jira-teknopar/
├── app/                    # Next.js 14 App Router yapısı
│   ├── auth/              # Kimlik doğrulama sayfaları
│   ├── dashboard/         # Dashboard ve proje yönetimi sayfaları
│   └── page.tsx           # Ana sayfa (Landing)
│
├── components/            # React bileşenleri
│   ├── kanban/           # Kanban board bileşenleri
│   ├── landing/          # Landing page bileşenleri
│   ├── metrics/          # Metrik ve grafik bileşenleri
│   ├── modals/           # Modal dialog bileşenleri
│   ├── project/          # Proje yönetimi bileşenleri
│   ├── task/             # Görev yönetimi bileşenleri
│   └── ui/               # Genel UI bileşenleri (shadcn/ui)
│
├── lib/                   # Yardımcı fonksiyonlar ve servisler
│   ├── db/               # Veritabanı şemaları ve yapılandırması
│   ├── hooks/            # Custom React hooks
│   ├── services/         # Servis katmanı implementasyonları
│   └── supabase/         # Supabase client yapılandırması
│
├── types/                # TypeScript tip tanımlamaları
│   ├── project.ts        # Proje ile ilgili tipler
│   ├── task.ts          # Görev ile ilgili tipler
│   ├── user.ts          # Kullanıcı ile ilgili tipler
│   └── ui/              # UI bileşenleri için tipler
│
├── views/                # Sayfa görünümleri ve kompozisyonları
│
└── public/              # Statik dosyalar
```

### 1.2 Teknoloji Yığını

- **Frontend Framework**: Next.js 14 (App Router)
- **Programlama Dili**: TypeScript
- **Stil**: Tailwind CSS
- **UI Kütüphanesi**: shadcn/ui
- **State Yönetimi**: Zustand
- **Backend/BaaS**: Supabase
- **Veritabanı**: PostgreSQL
- **Realtime**: Supabase Realtime
- **Drag & Drop**: @dnd-kit/core
- **Grafik**: Recharts
- **Form Yönetimi**: React Hook Form
- **Validasyon**: Zod

## 2. Temel Bileşenler ve Dosyalar

### 2.1 Middleware (middleware.ts)
- Oturum kontrolü
- Yetkilendirme kontrolleri
- Kullanıcı otomatik kayıt işlemleri
- Rota koruması

### 2.2 Servisler (lib/services/)
- **ProjectService**: Proje CRUD işlemleri
- **DashboardService**: Dashboard metrikleri ve istatistikler
- **RealtimeService**: Gerçek zamanlı güncelleme yönetimi

### 2.3 Custom Hooks (lib/hooks/)
- **useAuth**: Kimlik doğrulama yönetimi
- **useProjectPermissions**: Proje bazlı yetkilendirme
- **useTaskManagement**: Görev yönetimi ve sürükle-bırak
- **useProjectPage**: Proje sayfası state yönetimi
- **useDebounce**: Performans optimizasyonu

### 2.4 Tip Tanımlamaları (types/)
- Proje, görev ve kullanıcı tipleri
- UI bileşen prop tipleri
- Realtime payload tipleri
- Veritabanı şema tipleri

## 3. Temel Özellikler ve İmplementasyonları

### 3.1 Kanban Board
- Sürükle-bırak görev yönetimi
- Gerçek zamanlı güncelleme
- Görev sıralama ve filtreleme
- Görev detay modalı

### 3.2 Proje Yönetimi
- CRUD operasyonları
- Üye yönetimi
- Rol tabanlı yetkilendirme
- Proje metrikleri

### 3.3 Görev Yönetimi
- Görev oluşturma ve düzenleme
- Atama ve önceliklendirme
- Durum takibi
- Gerçek zamanlı güncellemeler

### 3.4 Metrikler ve Raporlama
- Görev dağılımı grafikleri
- Proje ilerleme durumu
- Haftalık aktivite grafikleri
- Performans metrikleri

## 4. State Yönetimi

### 4.1 Mevcut State Yönetimi
- React hooks (useState, useEffect)
- Custom hooks ile state enkapsülasyonu
- Props drilling minimizasyonu
- Context API kullanımı

### 4.2 Planlanan State Yönetimi
Zustand implementasyonu planlanmış ancak henüz uygulanmamıştır. Aşağıdaki state'ler için Zustand store'ları oluşturulacaktır:
- Filtre durumu (KanbanBoard filtreleri)
- UI durumu (tema, modal yönetimi)
- Form durumu (form state persistence)
- Kullanıcı tercihleri

### 4.3 Mevcut Context Kullanımı
- Auth context (kullanıcı oturumu)
- Toast notifications (bildirimler)

## 5. Veritabanı Şeması

### 5.1 Tablolar
- users
- projects
- project_members
- tasks

### 5.2 İlişkiler
- Project -> User (created_by)
- Project -> ProjectMember (members)
- Task -> Project (project_id)
- Task -> User (assigned_to, created_by)

## 6. Güvenlik ve Yetkilendirme

### 6.1 Rol Tipleri
- OWNER: Tam yetki
- ADMIN: Proje yönetimi ve üye yönetimi
- MEMBER: Görev yönetimi
- VIEWER: Sadece görüntüleme

### 6.2 Yetki Kontrolleri
- Middleware seviyesinde rota koruması
- Servis seviyesinde CRUD kontrolü
- UI seviyesinde conditional rendering

## 7. Performans Optimizasyonları

### 7.1 Frontend
- Debounced arama ve filtreler
- Lazy loading bileşenler
- Memoized değerler
- Image optimizasyonu

### 7.2 Backend
- Veritabanı indeksleri
- Batch işlemler
- Önbellekleme stratejileri

## 8. Dosya İlişkileri ve Bağımlılıklar

### 8.1 Bileşen Hiyerarşisi
```
ProjectPage
├── ProjectHeader
├── ProjectContent
│   ├── KanbanBoard
│   │   └── KanbanColumn
│   │       └── TaskCard
│   ├── ProjectSummary
│   └── TaskMetricsCharts
└── ProjectModals
    ├── TaskModal
    ├── ProjectModal
    └── MemberModal
```

### 8.2 Servis Bağımlılıkları
```
ProjectService
├── RealtimeService
└── DashboardService

TaskManagementHook
├── ProjectService
└── RealtimeService
```

## 9. Test Stratejisi

### 9.1 Birim Testler
- Hooks
- Utilities
- Services

### 9.2 Entegrasyon Testler
- API endpoints
- Database operations
- Authentication flows

### 9.3 E2E Testler
- User flows
- Critical paths
- Edge cases

## 10. Deployment ve CI/CD

### 10.1 Development Workflow
- Feature branch workflow
- Code review süreci
- Merge stratejisi

### 10.2 Environment Variables
- Development
- Staging
- Production

## 11. Bilinen Sınırlamalar ve Gelecek Geliştirmeler

### 11.1 Sınırlamalar
- Concurrent updates handling
- Real-time performance at scale
- Browser storage limitations

### 11.2 Planlanan Geliştirmeler
- Advanced analytics
- Integration capabilities
- Mobile application
- Offline support 

## 12. Dosya Bazlı Açıklamalar

### 12.1 Hooks
- **use-auth.ts**: Supabase auth yönetimi, oturum durumu ve kullanıcı bilgileri
- **use-project-permissions.ts**: Rol tabanlı yetkilendirme mantığı, proje bazlı izinler
- **use-task-management.ts**: Kanban board drag-drop mantığı, görev sıralama
- **use-project-page.ts**: Proje sayfası state ve modal yönetimi
- **use-debounce.ts**: Input ve filtreleme optimizasyonu
- **use-toast.ts**: Bildirim sistemi yönetimi

### 12.2 Servisler
- **project-service.ts**: 
  - Proje CRUD operasyonları
  - Üye yönetimi
  - Task sıralama ve güncelleme
  - Detaylı proje bilgisi çekme

- **dashboard-service.ts**:
  - Dashboard istatistikleri
  - Proje ve görev metrikleri
  - Kullanıcı bazlı istatistikler

- **realtime-service.ts**:
  - Supabase realtime subscription yönetimi
  - Task ve üye güncellemeleri
  - Realtime event handling

### 12.3 Bileşenler
- **Kanban/**
  - **board.tsx**: Ana kanban board yapısı ve state yönetimi
  - **column.tsx**: Kanban kolonları ve görev listeleme

- **Task/**
  - **task-card.tsx**: Görev kartı UI ve interaksiyon
  - **task-modal.tsx**: Görev detay ve düzenleme modalı

- **Project/**
  - **project-card.tsx**: Proje kartı UI
  - **project-list.tsx**: Proje listesi ve grid yapısı
  - **project-header.tsx**: Proje başlık ve aksiyonları

- **Metrics/**
  - **project-summary.tsx**: Proje özet metrikleri
  - **task-metrics-charts.tsx**: Görev dağılım grafikleri

- **Modals/**
  - **project-modal.tsx**: Proje oluşturma/düzenleme
  - **member-modal.tsx**: Üye yönetimi
  - **task-modal.tsx**: Görev yönetimi
  - **confirm-modal.tsx**: Onay dialogları

### 12.4 Tipler
- **project.ts**:
  - Project interface
  - ProjectMember interface
  - ProjectRole type
  - ProjectPermissions interface

- **task.ts**:
  - Task interface
  - TaskStatus enum
  - TaskPriority enum
  - TaskMetrics interface

- **dashboard.ts**:
  - DashboardStats interface
  - ProjectRecord interface
  - TaskStatusRecord interface

### 12.5 Views
- **project-content.tsx**: 
  - Proje detay sayfası kompozisyonu
  - Tab yönetimi
  - Bileşen organizasyonu

- **modals.tsx**:
  - Modal kompozisyonları
  - Props yönetimi
  - Event handling

### 12.6 Middleware
- **middleware.ts**:
  - Rota koruması
  - Oturum kontrolü
  - Kullanıcı oluşturma
  - Yetki kontrolü

## 13. Dosya İlişkileri

### 13.1 Veri Akışı
```
DashboardService -> ProjectService -> RealtimeService
       ↓                   ↓               ↓
   Dashboard         ProjectPage      TaskManagement
       ↓                   ↓               ↓
   Metrics          ProjectContent    KanbanBoard
```

### 13.2 Bileşen İlişkileri
```
ProjectPage
    ↓
ProjectContent
    ├── KanbanBoard
    │      ├── KanbanColumn
    │      └── TaskCard
    │           └── TaskModal
    ├── ProjectSummary
    └── TaskMetricsCharts

Dashboard
    ├── ProjectList
    │      └── ProjectCard
    └── ProjectHeader
```

### 13.3 Hook Bağımlılıkları
```
useProjectPage
    ├── useProjectPermissions
    ├── useProjectDetails
    └── useProjectModals
        └── useTaskManagement
            └── useRealtimeSubscription
``` 
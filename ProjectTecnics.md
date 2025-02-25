# Jira-Teknopar Proje Analizi

Bu doküman, Jira-Teknopar projesinin detaylı bir analizini içermektedir. Projedeki tüm dosyalar, klasörler, bileşenler, hook'lar ve fonksiyonlar arasındaki ilişkiler incelenmiştir.

## Proje Yapısı

Proje, Next.js framework'ü üzerine kurulmuş bir React uygulamasıdır. TypeScript kullanılarak tip güvenliği sağlanmıştır. Veritabanı olarak Supabase kullanılmaktadır. Aşağıda projenin ana klasör yapısı bulunmaktadır:

- **app/**: Next.js App Router yapısı, sayfa bileşenleri
- **components/**: Yeniden kullanılabilir UI bileşenleri
- **lib/**: Yardımcı fonksiyonlar, hook'lar, servisler
- **types/**: TypeScript tip tanımlamaları
- **views/**: Sayfa düzeni bileşenleri
- **supabase/**: Supabase yapılandırması ve migrasyonlar
- **public/**: Statik dosyalar

## Tip Tanımlamaları (types/)

### user.ts
- `User` interface'i: Kullanıcı verilerinin yapısını tanımlar (id, name, email, avatar_url)
- `AuthContextType` interface'i: Kimlik doğrulama bağlamı için tip tanımı

### task.ts
- `TaskStatus` enum: Görev durumlarını tanımlar (TODO, IN_PROGRESS, IN_REVIEW, DONE)
- `TaskPriority` enum: Görev önceliklerini tanımlar (LOW, MEDIUM, HIGH)
- `AssignedUser` interface: Göreve atanan kullanıcı bilgilerini tanımlar
- `Task` interface: Görev verilerinin yapısını tanımlar
- `TaskMetrics` interface: Görev metrikleri için tip tanımı
- `TaskCardProps`, `KanbanColumnProps`, `KanbanBoardProps`: UI bileşenleri için prop tipleri
- `KanbanFilterState`, `KanbanDragState`: Kanban panosu durumu için tipler
- `TaskModalProps`: Görev modalı için prop tipleri
- Sabit değerler: `TASK_STATUS_LABELS`, `TASK_PRIORITY_LABELS`, `TASK_STATUS_COLORS`, `TASK_PRIORITY_COLORS`

### project.ts
- `Project` type: Proje verilerinin yapısını tanımlar
- `ProjectMemberWithUser`, `ProjectMember` interface'leri: Proje üyeleri için tip tanımları
- `ProjectMetrics` interface: Proje metrikleri için tip tanımı
- `ProjectRole` type: Proje rollerini tanımlar (OWNER, ADMIN, MEMBER, VIEWER)
- `ProjectPermissions` interface: Proje izinleri için tip tanımı

### dashboard.ts
- `ProjectRecord`, `ProjectDetailPageProps`, `ProjectHeaderProps`, `ProjectContentProps`, `ProjectModalsProps` interface'leri: Dashboard bileşenleri için prop tipleri

### realtime.ts
- `SupabaseRealtimePayload`, `RealtimeMemberPayload` interface'leri: Gerçek zamanlı güncellemeler için tip tanımları

### kanban.ts
- Kanban panosu için tip tanımlamaları

### error.ts
- `DatabaseError` interface: Veritabanı hatalarını tanımlar

### index.ts
- Tip tanımlamalarını dışa aktarır

## Servisler (lib/services/)

### project-service.ts
- `ProjectService` sınıfı: Proje ile ilgili tüm veritabanı işlemlerini yönetir
  - `getProjectDetails`: Proje detaylarını, görevleri ve üyeleri getirir
  - `updateTaskStatus`: Görev durumunu günceller
  - `deleteProject`: Projeyi siler
  - `updateTaskOrder`: Görev sıralamasını günceller
  - `getAvailableUsers`: Projeye eklenebilecek kullanıcıları getirir
  - `addProjectMember`: Projeye yeni üye ekler
  - `updateProjectMember`: Proje üyesini günceller
  - `deleteProjectMember`: Proje üyesini siler
  - `getProjectAdminCount`: Projedeki admin sayısını getirir

### dashboard-service.ts
- `DashboardService` sınıfı: Dashboard ile ilgili veritabanı işlemlerini yönetir
  - `getDashboardStats`: Dashboard istatistiklerini getirir
  - `getUserProjects`: Kullanıcının projelerini getirir
  - `getProjectStats`: Proje istatistiklerini getirir

### realtime-service.ts
- `RealtimeService` sınıfı: Gerçek zamanlı güncellemeleri yönetir
  - `subscribeToProjectUpdates`: Proje güncellemelerine abone olur

## Hook'lar (lib/hooks/)

### use-auth.tsx
- Kimlik doğrulama işlemlerini yönetir
- `useAuth` hook'u: Kullanıcı oturumunu yönetir (giriş, çıkış, kullanıcı bilgileri)

### use-task-management.ts
- Görev yönetimi işlemlerini yönetir
- `useTaskManagement` hook'u: Görev oluşturma, güncelleme, silme, sürükleme işlemlerini yönetir

### use-project-details.ts
- Proje detaylarını yönetir
- `useProjectDetails` hook'u: Proje bilgilerini, görevleri ve üyeleri getirir
- Gerçek zamanlı güncellemeleri dinler ve state'i günceller
- Görev taşıma ve proje silme işlemlerini yönetir

### use-project-permissions.ts
- Proje izinlerini yönetir
- `useProjectPermissions` hook'u: Kullanıcının proje üzerindeki izinlerini kontrol eder

### use-project-modals.ts
- Modal durumlarını yönetir
- `useProjectModals` hook'u: Görev, proje ve üye modallarının durumlarını yönetir

### use-project-page.ts
- Proje sayfası durumunu yönetir
- `useProjectPage` hook'u: Proje sayfasındaki tüm durumları ve işlemleri birleştirir
- Orchestrator (orkestrasyon) pattern'i kullanılarak diğer hook'ları koordine eder
- Sayfa bileşenlerine gerekli prop'ları hazırlar

### use-realtime.ts
- Gerçek zamanlı güncellemeleri yönetir
- `useRealtime` hook'u: Supabase gerçek zamanlı güncellemelerini dinler

### use-realtime-subscription.ts
- Gerçek zamanlı abonelikleri yönetir
- `useRealtimeSubscription` hook'u: Proje güncellemelerine abone olur

### use-debounce.ts
- Debounce işlemlerini yönetir
- `useDebounce` hook'u: Fonksiyon çağrılarını belirli bir süre sonra gerçekleştirir

### use-media-query.ts
- Medya sorguları için hook
- `useMediaQuery` hook'u: Ekran boyutuna göre sorgu yapar

## Bileşenler (components/)

### modals/

#### task-modal.tsx
- `TaskModal` bileşeni: Görev oluşturma ve düzenleme modalı
  - Görev başlığı, açıklaması, durumu, önceliği ve atanan kişi bilgilerini yönetir
  - Görev oluşturma, güncelleme ve silme işlemlerini gerçekleştirir
  - Yetki kontrolü yapar
  - Form durumunu React state ile yönetir
  - useCallback ve useEffect hook'ları ile optimizasyon sağlar
  - Headless UI Dialog bileşenini kullanarak erişilebilir modal oluşturur

#### member-modal.tsx
- `MemberModal` bileşeni: Proje üyesi ekleme ve düzenleme modalı
  - Kullanıcı seçimi ve rol atama işlemlerini yönetir
  - Üye ekleme, güncelleme ve silme işlemlerini gerçekleştirir
  - Yetki kontrolü yapar
  - ProjectService ile veritabanı işlemlerini gerçekleştirir
  - Rol bazlı erişim kontrolü uygular (RBAC)
  - Admin sayısı kontrolü ile kritik rollerin korunmasını sağlar

#### project-modal.tsx
- `ProjectModal` bileşeni: Proje oluşturma ve düzenleme modalı
  - Proje adı ve açıklaması bilgilerini yönetir
  - Proje oluşturma ve güncelleme işlemlerini gerçekleştirir

#### confirm-modal.tsx
- `ConfirmModal` bileşeni: Onay modalı
  - Silme gibi kritik işlemler için onay alır

### kanban/
- Kanban panosu bileşenleri
- Sürükle-bırak işlevselliği
- Görev kartları ve sütunlar

### task/
- Görev ile ilgili bileşenler
- Görev kartları, görev detayları

### project/
- Proje ile ilgili bileşenler
- Proje kartları, proje detayları

### metrics/
- Metrik ve istatistik bileşenleri
- Proje ve görev istatistikleri

### ui/
- Temel UI bileşenleri
- Butonlar, formlar, dialoglar, vb.

### landing/
- Ana sayfa bileşenleri

## Görünümler (views/)

### modals.tsx
- `ProjectModals` bileşeni: Tüm modalları birleştirir
  - TaskModal, ProjectModal, MemberModal ve ConfirmModal bileşenlerini yönetir
  - Prop drilling'i azaltmak için merkezi bir yapı sağlar
  - Facade pattern'i kullanarak modal yönetimini basitleştirir

### project-content.tsx
- `ProjectContent` bileşeni: Proje içeriğini gösterir
  - Kanban panosu, görev listesi ve proje metrikleri
  - Görev sürükleme ve bırakma işlemlerini yönetir
  - Responsive tasarım için mobil ve masaüstü görünümleri sunar
  - Tab yapısı ile farklı içerikleri organize eder (Genel Bakış, Görevler, Metrikler, Üyeler)

### projects-header.tsx
- `ProjectsHeader` bileşeni: Proje başlığını ve eylemlerini gösterir
  - Yeni görev oluşturma, proje düzenleme ve silme butonları

## Sayfalar (app/)

### page.tsx
- Ana sayfa

### layout.tsx
- Uygulama düzeni

### dashboard/page.tsx
- Dashboard sayfası
  - Kullanıcının projelerini ve istatistiklerini gösterir

### dashboard/layout.tsx
- Dashboard düzeni
  - Navigasyon ve kullanıcı menüsü

### dashboard/projects/[id]/page.tsx
- Proje detay sayfası
  - Proje içeriğini, görevleri ve üyeleri gösterir
  - useProjectPage hook'u ile tüm proje verilerini ve işlevlerini alır
  - Yükleme ve hata durumlarını yönetir
  - Kompozisyon pattern'i kullanarak bileşenleri birleştirir

## Veri Akışı

1. **Sayfa Yükleme**:
   - Sayfa bileşeni (`app/dashboard/projects/[id]/page.tsx`) yüklenir
   - `useProjectPage` hook'u çağrılır
   - `useProjectDetails` hook'u proje verilerini getirir
   - `useProjectPermissions` hook'u kullanıcı izinlerini kontrol eder
   - `useProjectModals` hook'u modal durumlarını yönetir
   - `useRealtimeSubscription` hook'u gerçek zamanlı güncellemeleri dinler

2. **Görev İşlemleri**:
   - Kullanıcı görev oluşturma/düzenleme butonuna tıklar
   - `TaskModal` açılır
   - Kullanıcı formu doldurur ve gönderir
   - `ProjectService.addTask` veya `ProjectService.updateTask` çağrılır
   - Veritabanı güncellenir
   - Gerçek zamanlı güncelleme tetiklenir
   - UI güncellenir

3. **Üye İşlemleri**:
   - Kullanıcı üye ekleme/düzenleme butonuna tıklar
   - `MemberModal` açılır
   - Kullanıcı formu doldurur ve gönderir
   - `ProjectService.addProjectMember` veya `ProjectService.updateProjectMember` çağrılır
   - Veritabanı güncellenir
   - Gerçek zamanlı güncelleme tetiklenir
   - UI güncellenir

4. **Kanban İşlemleri**:
   - Kullanıcı görevi sürükler
   - `useTaskManagement` hook'u sürükleme işlemini yönetir
   - `ProjectService.updateTaskStatus` çağrılır
   - Veritabanı güncellenir
   - Gerçek zamanlı güncelleme tetiklenir
   - UI güncellenir

## Veritabanı Yapısı

Supabase veritabanı aşağıdaki tabloları içerir:

1. **users**: Kullanıcı bilgileri
   - id, name, email, avatar_url

2. **projects**: Proje bilgileri
   - id, name, description, created_by_id, created_at, updated_at

3. **project_members**: Proje üyeleri
   - id, project_id, user_id, role, created_at

4. **tasks**: Görevler
   - id, title, description, status, priority, task_order, created_by_id, assigned_to_id, project_id, created_at, updated_at

## Güvenlik ve İzinler

- `useProjectPermissions` hook'u kullanıcının proje üzerindeki izinlerini kontrol eder
- Rol tabanlı erişim kontrolü (RBAC) uygulanmıştır
- Supabase Row Level Security (RLS) politikaları kullanılmıştır
- Admin sayısı kontrolü ile kritik rollerin korunması sağlanmıştır
- Yetki kontrolü UI seviyesinde ve servis seviyesinde çift katmanlı olarak uygulanmıştır

## Gerçek Zamanlı Özellikler

- `RealtimeService` ve `useRealtimeSubscription` hook'u ile gerçek zamanlı güncellemeler sağlanır
- Görev ve üye değişiklikleri anında tüm kullanıcılara yansıtılır
- Supabase Realtime API kullanılarak veritabanı değişiklikleri dinlenir
- Channel pattern'i ile farklı veri türleri için ayrı kanallar oluşturulur
- Cleanup fonksiyonları ile bellek sızıntıları önlenir

## Performans Optimizasyonları

- `useDebounce` hook'u ile gereksiz yeniden render'lar önlenir
- `useCallback` ve `useMemo` ile fonksiyon ve değerler memoize edilir
- Veritabanı sorgularında ilişkisel sorgular kullanılarak veri transferi optimize edilir
- Lazy loading ile büyük bileşenler gerektiğinde yüklenir
- Responsive tasarım için koşullu render kullanılır
- Form state'leri için optimizasyon yapılmıştır

## Hata Yönetimi

- Try-catch blokları ile hatalar yakalanır
- Hata mesajları kullanıcıya gösterilir
- Konsola hata detayları loglanır
- Kullanıcı dostu hata mesajları sunulur
- Kritik işlemlerde onay mekanizması kullanılır
- Yükleme durumları gösterilir

## Kod Organizasyonu ve Mimari Desenler

- **Servis Katmanı (Service Layer)**: Veritabanı işlemleri servis sınıflarında toplanmıştır
- **Hook Pattern**: React hook'ları ile durum yönetimi ve iş mantığı ayrılmıştır
- **Kompozisyon Pattern**: Bileşenler küçük, yeniden kullanılabilir parçalara bölünmüştür
- **Facade Pattern**: Karmaşık alt sistemler basit arayüzler arkasında gizlenmiştir
- **Orchestrator Pattern**: useProjectPage hook'u diğer hook'ları koordine eder
- **Repository Pattern**: Veritabanı işlemleri soyutlanmıştır
- **Observer Pattern**: Gerçek zamanlı güncellemeler için kullanılmıştır
- **Strategy Pattern**: Farklı rol ve izinler için farklı stratejiler uygulanmıştır

## Kod Kalitesi ve Best Practices

- **Tip Güvenliği**: TypeScript ile tip güvenliği sağlanmıştır
- **Tek Sorumluluk İlkesi (SRP)**: Her bileşen ve fonksiyon tek bir sorumluluğa sahiptir
- **DRY (Don't Repeat Yourself)**: Kod tekrarı minimuma indirilmiştir
- **KISS (Keep It Simple, Stupid)**: Basit ve anlaşılır kod yazılmıştır
- **Erişilebilirlik**: UI bileşenleri erişilebilirlik standartlarına uygundur
- **Responsive Tasarım**: Farklı ekran boyutları için uyarlanmıştır
- **Hata Yönetimi**: Kapsamlı hata yakalama ve işleme mekanizmaları kullanılmıştır
- **Performans Optimizasyonu**: Gereksiz render'lar ve veritabanı çağrıları minimize edilmiştir
- **Kod Yorumları**: Karmaşık işlemler için açıklayıcı yorumlar eklenmiştir
- **Tutarlı Kod Stili**: Tutarlı isimlendirme ve kod formatı kullanılmıştır

## Dosya Bağımlılıkları

1. **Sayfa Bileşenleri**:
   - `app/dashboard/projects/[id]/page.tsx` -> `views/project-content.tsx`, `views/projects-header.tsx`, `views/modals.tsx`

2. **Görünümler**:
   - `views/project-content.tsx` -> `components/kanban/board.tsx`, `components/metrics/project-summary.tsx`
   - `views/modals.tsx` -> `components/modals/task-modal.tsx`, `components/modals/project-modal.tsx`, `components/modals/member-modal.tsx`

3. **Bileşenler**:
   - `components/modals/task-modal.tsx` -> `lib/services/project-service.ts`, `types/task.ts`
   - `components/modals/member-modal.tsx` -> `lib/services/project-service.ts`, `types/project.ts`
   - `components/kanban/board.tsx` -> `lib/hooks/use-task-management.ts`, `types/kanban.ts`

4. **Hook'lar**:
   - `lib/hooks/use-project-page.ts` -> `lib/hooks/use-project-details.ts`, `lib/hooks/use-project-permissions.ts`, `lib/hooks/use-project-modals.ts`
   - `lib/hooks/use-task-management.ts` -> `lib/services/project-service.ts`
   - `lib/hooks/use-project-details.ts` -> `lib/services/project-service.ts`

5. **Servisler**:
   - `lib/services/project-service.ts` -> `lib/supabase/client.ts`, `types/project.ts`, `types/task.ts`
   - `lib/services/dashboard-service.ts` -> `lib/supabase/client.ts`, `types/dashboard.ts`
   - `lib/services/realtime-service.ts` -> `lib/supabase/client.ts`, `types/realtime.ts`

## Bileşenler Arası İletişim

1. **Props Passing**: Üst bileşenlerden alt bileşenlere veri ve fonksiyon aktarımı
2. **Callback Functions**: Alt bileşenlerden üst bileşenlere olayları bildirmek için
3. **Custom Hooks**: Bileşenler arasında durum ve mantık paylaşımı
4. **Service Layer**: Veritabanı işlemleri için merkezi bir nokta
5. **Realtime Updates**: Gerçek zamanlı güncellemeler için Supabase kanalları

## Gelecek İyileştirmeler

1. **Test Coverage**: Birim ve entegrasyon testleri eklenebilir
2. **State Management**: Büyüyen uygulama için global state yönetimi (Redux, Zustand)
3. **Performans Optimizasyonu**: Büyük listelerde virtualization
4. **Offline Support**: Çevrimdışı çalışma desteği
5. **Internationalization**: Çoklu dil desteği
6. **Tema Desteği**: Açık/koyu tema ve özelleştirilebilir temalar
7. **Daha Modüler Yapı**: Feature-based klasör yapısına geçiş
8. **API Katmanı**: Servis katmanı ile UI arasında bir API katmanı
9. **Daha İyi Hata İzleme**: Merkezi hata izleme sistemi
10. **Daha İyi Dokümantasyon**: Kod dokümantasyonu ve kullanıcı kılavuzları

## Sonuç

Jira-Teknopar projesi, modern web geliştirme pratiklerini takip eden, modüler ve bakımı kolay bir yapıya sahiptir. Servis katmanı, hook'lar ve bileşenler arasındaki net ayrım, kodun anlaşılabilirliğini ve yeniden kullanılabilirliğini artırmaktadır. TypeScript ile sağlanan tip güvenliği, hataların erken tespit edilmesine yardımcı olmaktadır. Supabase ile entegrasyon, veritabanı işlemlerini ve gerçek zamanlı özellikleri kolaylaştırmaktadır.

Proje, Clean Architecture prensiplerini takip ederek, iş mantığını, veri erişimini ve kullanıcı arayüzünü birbirinden ayırmıştır. Bu yaklaşım, kodun test edilebilirliğini, bakımını ve genişletilebilirliğini artırmaktadır. Ayrıca, React'in modern özelliklerini (hooks, context, functional components) etkin bir şekilde kullanarak, performanslı ve ölçeklenebilir bir uygulama oluşturulmuştur.

Rol tabanlı erişim kontrolü ve güvenlik önlemleri, uygulamanın güvenliğini sağlamaktadır. Gerçek zamanlı güncellemeler, kullanıcılar arasında işbirliğini kolaylaştırmaktadır. Responsive tasarım, uygulamanın farklı cihazlarda kullanılabilirliğini artırmaktadır.

Sonuç olarak, Jira-Teknopar projesi, modern web geliştirme standartlarını ve best practice'leri uygulayan, kullanıcı dostu, güvenli ve ölçeklenebilir bir proje yönetim uygulamasıdır. 


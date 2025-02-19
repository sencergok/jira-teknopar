# Jira Teknopar - Detaylı Teknik Dokümantasyon

## İçindekiler

1. [Proje Yapısı ve Klasörler](#proje-yapısı-ve-klasörler)
2. [Mimari Yapı](#mimari-yapı)
3. [Veritabanı Şeması ve İlişkiler](#veritabanı-şeması-ve-ilişkiler)
4. [Bileşen Yapısı ve Detayları](#bileşen-yapısı-ve-detayları)
5. [State Yönetimi ve Hooks](#state-yönetimi-ve-hooks)
6. [Realtime İşlemler ve Senkronizasyon](#realtime-işlemler-ve-senkronizasyon)
7. [Yetkilendirme Sistemi ve Güvenlik](#yetkilendirme-sistemi-ve-güvenlik)
8. [Kanban Board İmplementasyonu](#kanban-board-implementasyonu)
9. [Servis Katmanı ve API İşlemleri](#servis-katmanı-ve-api-işlemleri)
10. [Hata Yönetimi ve Loglama](#hata-yönetimi-ve-loglama)

## Proje Yapısı ve Klasörler

### `/app` Klasörü
Next.js 14 App Router yapısını içerir.

#### `/app/page.tsx`
- Ana landing sayfası
- Hero, Features ve Navbar bileşenlerini içerir
- Giriş yapmamış kullanıcılar için bilgilendirme sayfası

#### `/app/dashboard/page.tsx`
- Kullanıcının projelerini listeler
- Proje oluşturma ve yönetim fonksiyonlarını içerir
- Realtime proje güncellemelerini dinler

#### `/app/dashboard/projects/[id]/page.tsx`
- Spesifik proje detay sayfası
- Kanban board ve proje yönetimi
- Proje metrikleri ve üye yönetimi

#### `/app/dashboard/projects/new/page.tsx`
- Yeni proje oluşturma formu
- Proje ve ilk görev oluşturma mantığı
- Kullanıcı doğrulama ve yetki kontrolleri

### `/components` Klasörü
Yeniden kullanılabilir React bileşenlerini içerir.

#### `/components/kanban`
- `board.tsx`: Ana Kanban board konteyner bileşeni
  - DND Kit entegrasyonu
  - Task filtreleme ve sıralama
  - Realtime güncelleme yönetimi

- `column.tsx`: Kanban sütun bileşeni
  - Task listesi görüntüleme
  - Drop zone yönetimi
  - Task ekleme butonu

#### `/components/task`
- `task-card.tsx`: Görev kartı bileşeni
  - Sürüklenebilir task kartı
  - Task detayları görüntüleme
  - Atanan kişi ve öncelik göstergeleri

- `task-modal.tsx`: Görev detay/düzenleme modalı
  - Form validasyonu
  - Task CRUD işlemleri
  - Yetki bazlı UI kontrolü

#### `/components/project`
- `project-card.tsx`: Proje kartı bileşeni
- `project-header.tsx`: Proje başlık ve aksiyonları
- `project-list.tsx`: Proje listesi görüntüleme
- `project-summary.tsx`: Proje özet metrikleri

#### `/components/ui`
Temel UI bileşenleri (shadcn/ui tabanlı)
- `button.tsx`: Özelleştirilmiş buton bileşeni
- `input.tsx`: Form input bileşeni
- `select.tsx`: Seçim kutusu bileşeni
- `modal.tsx`: Modal dialog bileşeni
- `dropdown-menu.tsx`: Açılır menü bileşeni

### `/lib` Klasörü
Yardımcı fonksiyonlar ve servisler.

#### `/lib/hooks`
Custom React hooks:

- `use-task-management.ts`:
  ```typescript
  // Task state ve işlem yönetimi
  const {
    tasks,
    selectedTask,
    filteredTasks,
    handleDragStart,
    handleDragEnd,
    handleTaskClick,
    // ...
  } = useTaskManagement({ projectId, initialTasks });
  ```

- `use-project-permissions.ts`:
  ```typescript
  // Rol ve yetki yönetimi
  const {
    permissions,
    role,
    isOwner,
    checkRole
  } = useProjectPermissions(projectId, userId);
  ```

- `use-realtime-subscription.ts`:
  ```typescript
  // Realtime güncelleme yönetimi
  useRealtimeSubscription(projectId, onTaskMove, onMemberUpdate);
  ```

#### `/lib/services`
API ve servis katmanı:

- `project-service.ts`:
  ```typescript
  // Proje işlemleri
  class ProjectService {
    static async getProjectDetails(projectId: string);
    static async updateTaskStatus(taskId: string, newStatus: string);
    static async deleteProject(projectId: string);
  }
  ```

- `realtime-service.ts`:
  ```typescript
  // Realtime işlemleri
  class RealtimeService {
    static subscribeToProjectUpdates(
      projectId: string,
      onTaskUpdate: (payload: any) => void,
      onMemberUpdate: () => void
    );
  }
  ```

#### `/lib/db`
Veritabanı şemaları ve tip tanımlamaları:

- `schema.ts`:
  ```typescript
  // Veritabanı tablo tanımlamaları
  export const users = pgTable('users', {
    id: uuid('id').primaryKey(),
    // ...
  });

  export const projects = pgTable('projects', {
    // ...
  });
  ```

### `/types` Klasörü
TypeScript tip tanımlamaları:

- `task.ts`: Task ile ilgili tipler ve enum'lar
  ```typescript
  export enum TaskStatus {
    TODO = 'todo',
    IN_PROGRESS = 'in_progress',
    // ...
  }

  export interface Task {
    id: string;
    title: string;
    // ...
  }
  ```

- `project.ts`: Proje ile ilgili tipler
  ```typescript
  export interface Project {
    id: string;
    name: string;
    // ...
  }

  export type ProjectRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  ```

### `/views` Klasörü
Sayfa düzeni bileşenleri:

- `project-content.tsx`: Proje içerik düzeni
- `modals.tsx`: Modal yönetimi
- `projects-header.tsx`: Proje başlık düzeni

## Veritabanı Şeması ve İlişkiler

### Tablolar ve İlişkiler

#### Users Tablosu
```sql
users (
  id: uuid PRIMARY KEY,
  email: varchar(255) UNIQUE NOT NULL,
  name: varchar(255),
  avatar_url: text,
  role: varchar(50) DEFAULT 'member',
  created_at: timestamp DEFAULT now(),
  updated_at: timestamp DEFAULT now()
)

-- İlişkiler:
-- 1. projects (created_by_id) -> ONE-TO-MANY
-- 2. project_members (user_id) -> ONE-TO-MANY
-- 3. tasks (assigned_to_id) -> ONE-TO-MANY
-- 4. tasks (created_by_id) -> ONE-TO-MANY
```

#### Projects Tablosu
```sql
projects (
  id: uuid PRIMARY KEY,
  name: varchar(255) NOT NULL,
  description: text,
  created_by_id: uuid REFERENCES users(id),
  created_at: timestamp DEFAULT now(),
  updated_at: timestamp DEFAULT now()
)

-- İlişkiler:
-- 1. users (created_by_id) -> MANY-TO-ONE
-- 2. project_members (project_id) -> ONE-TO-MANY
-- 3. tasks (project_id) -> ONE-TO-MANY
```

#### Project_Members Tablosu
```sql
project_members (
  id: uuid PRIMARY KEY,
  project_id: uuid REFERENCES projects(id),
  user_id: uuid REFERENCES users(id),
  role: varchar(50) DEFAULT 'MEMBER',
  created_at: timestamp DEFAULT now()
)

-- İlişkiler:
-- 1. projects (project_id) -> MANY-TO-ONE
-- 2. users (user_id) -> MANY-TO-ONE
```

#### Tasks Tablosu
```sql
tasks (
  id: uuid PRIMARY KEY,
  title: varchar(255) NOT NULL,
  description: text,
  status: varchar(50) DEFAULT 'todo',
  priority: varchar(50) DEFAULT 'medium',
  project_id: uuid REFERENCES projects(id),
  assigned_to_id: uuid REFERENCES users(id),
  created_by_id: uuid REFERENCES users(id),
  task_order: text NOT NULL,
  metadata: jsonb,
  created_at: timestamp DEFAULT now(),
  updated_at: timestamp DEFAULT now()
)

-- İlişkiler:
-- 1. projects (project_id) -> MANY-TO-ONE
-- 2. users (assigned_to_id) -> MANY-TO-ONE
-- 3. users (created_by_id) -> MANY-TO-ONE
```

## Realtime İşlemler ve Senkronizasyon

### Task Güncellemeleri
```typescript
// /lib/hooks/use-realtime-subscription.ts
useEffect(() => {
  const channel = supabase
    .channel(`project_tasks:${projectId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'tasks',
      filter: `project_id=eq.${projectId}`
    }, (payload) => {
      if (payload.eventType === 'UPDATE') {
        // Task güncelleme
        setTasks(prevTasks => {
          const updatedTasks = prevTasks.map(task => 
            task.id === payload.new.id ? { ...task, ...payload.new } : task
          );
          return updatedTasks;
        });
      } else if (payload.eventType === 'DELETE') {
        // Task silme
        setTasks(prevTasks => prevTasks.filter(task => task.id !== payload.old.id));
      } else if (payload.eventType === 'INSERT') {
        // Yeni task ekleme
        setTasks(prevTasks => [...prevTasks, payload.new]);
      }
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [projectId]);
```

### Üye Güncellemeleri
```typescript
// /lib/hooks/use-realtime-subscription.ts
useEffect(() => {
  const channel = supabase
    .channel(`project_members:${projectId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'project_members',
      filter: `project_id=eq.${projectId}`
    }, (payload) => {
      // Üye değişikliklerini yönet
      onMemberUpdate();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [projectId, onMemberUpdate]);
```

## Yetkilendirme Sistemi ve Güvenlik

### Rol Hiyerarşisi ve İzinler

```typescript
// /lib/hooks/use-project-permissions.ts
const calculatePermissions = (role: ProjectRole): ProjectPermissions => {
  const permissions: ProjectPermissions = {
    canEditProject: false,
    canDeleteProject: false,
    canManageMembers: false,
    canCreateTasks: false,
    canEditTasks: false,
    canDeleteTasks: false,
    canAssignTasks: false,
    canComment: false
  };

  switch (role) {
    case 'OWNER':
      // Tüm izinleri ver
      Object.keys(permissions).forEach(key => {
        permissions[key as keyof ProjectPermissions] = true;
      });
      break;

    case 'ADMIN':
      permissions.canEditProject = true;
      permissions.canManageMembers = true;
      permissions.canCreateTasks = true;
      permissions.canEditTasks = true;
      permissions.canDeleteTasks = true;
      permissions.canAssignTasks = true;
      permissions.canComment = true;
      break;

    case 'MEMBER':
      permissions.canCreateTasks = true;
      permissions.canEditTasks = true;
      permissions.canAssignTasks = true;
      permissions.canComment = true;
      break;

    case 'VIEWER':
      permissions.canComment = true;
      break;
  }

  return permissions;
};
```

### Row Level Security (RLS) Politikaları

```sql
-- projects tablosu için RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Projeleri görüntüleme izni"
ON projects FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id 
    FROM project_members 
    WHERE project_id = id
  )
);

-- tasks tablosu için RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Task görüntüleme izni"
ON tasks FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id 
    FROM project_members 
    WHERE project_id = project_id
  )
);

CREATE POLICY "Task düzenleme izni"
ON tasks FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id 
    FROM project_members 
    WHERE project_id = project_id
    AND role IN ('OWNER', 'ADMIN', 'MEMBER')
  )
);
```

## Hata Yönetimi ve Loglama

### Global Error Boundary
```typescript
// /components/error-boundary.tsx
class ErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Hata loglama servisi
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorComponent error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### API Hata Yönetimi
```typescript
// /lib/services/project-service.ts
static async updateTaskStatus(taskId: string, newStatus: string) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      // Spesifik hata tipleri
      if (error.code === '23503') {
        throw new Error('Referans hatası: İlgili kayıt bulunamadı');
      }
      if (error.code === '23505') {
        throw new Error('Benzersizlik kısıtlaması ihlali');
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Task status update error:', error);
    throw new Error('Görev durumu güncellenirken bir hata oluştu');
  }
}
```

### Toast Bildirimleri
```typescript
// /components/task/task-modal.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    await updateTask(taskId, taskData);
    
    toast({
      title: "Başarılı",
      description: "Görev başarıyla güncellendi",
    });
    
    onSuccess?.();
    onClose();
  } catch (error) {
    toast({
      title: "Hata",
      description: error.message || "Görev güncellenirken bir hata oluştu",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};
``` 
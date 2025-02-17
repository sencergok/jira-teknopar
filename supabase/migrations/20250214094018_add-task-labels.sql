-- Etiketler tablosu
CREATE TABLE labels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#6B7280',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (project_id, name)
);

-- Görev-etiket ilişkileri tablosu
CREATE TABLE task_labels (
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id, label_id)
);

-- Bildirimler tablosu
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS politikaları
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Etiketler için politikalar
CREATE POLICY "Etiketleri herkes görebilir" ON labels
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members
            WHERE project_members.project_id = labels.project_id
            AND project_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Etiketleri admin ve member ekleyebilir" ON labels
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM project_members
            WHERE project_members.project_id = NEW.project_id
            AND project_members.user_id = auth.uid()
            AND project_members.role IN ('admin', 'member')
        )
    );

CREATE POLICY "Etiketleri admin ve member düzenleyebilir" ON labels
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM project_members
            WHERE project_members.project_id = labels.project_id
            AND project_members.user_id = auth.uid()
            AND project_members.role IN ('admin', 'member')
        )
    );

CREATE POLICY "Etiketleri admin ve member silebilir" ON labels
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM project_members
            WHERE project_members.project_id = labels.project_id
            AND project_members.user_id = auth.uid()
            AND project_members.role IN ('admin', 'member')
        )
    );

-- Görev-etiket ilişkileri için politikalar
CREATE POLICY "Görev etiketlerini herkes görebilir" ON task_labels
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tasks
            JOIN project_members ON project_members.project_id = tasks.project_id
            WHERE tasks.id = task_labels.task_id
            AND project_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Görev etiketlerini admin ve member ekleyebilir" ON task_labels
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM tasks
            JOIN project_members ON project_members.project_id = tasks.project_id
            WHERE tasks.id = NEW.task_id
            AND project_members.user_id = auth.uid()
            AND project_members.role IN ('admin', 'member')
        )
    );

CREATE POLICY "Görev etiketlerini admin ve member silebilir" ON task_labels
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM tasks
            JOIN project_members ON project_members.project_id = tasks.project_id
            WHERE tasks.id = task_labels.task_id
            AND project_members.user_id = auth.uid()
            AND project_members.role IN ('admin', 'member')
        )
    );

-- Bildirimler için politikalar
CREATE POLICY "Kullanıcılar kendi bildirimlerini görebilir" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Bildirimler otomatik oluşturulur" ON notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Kullanıcılar kendi bildirimlerini güncelleyebilir" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Kullanıcılar kendi bildirimlerini silebilir" ON notifications
    FOR DELETE USING (user_id = auth.uid());

-- Hata ayıklama için fonksiyonlar
CREATE OR REPLACE FUNCTION debug_label_access(project_id UUID)
RETURNS TABLE (
    has_access boolean,
    user_id UUID,
    role text
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = $1 
            AND project_members.user_id = auth.uid()
        ),
        auth.uid(),
        (SELECT role FROM project_members WHERE project_id = $1 AND user_id = auth.uid());
END;
$$;

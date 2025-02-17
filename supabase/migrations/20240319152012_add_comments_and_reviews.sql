-- Yorumlar tablosu
CREATE TABLE comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    mentioned_users UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Görev incelemeleri tablosu
CREATE TABLE task_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('approved', 'rejected', 'pending')),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, reviewer_id)
);

-- RLS'yi etkinleştir
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_reviews ENABLE ROW LEVEL SECURITY;

-- Yorum politikaları
CREATE POLICY "Yorumları herkes görebilir" ON comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tasks
            JOIN project_members ON project_members.project_id = tasks.project_id
            WHERE tasks.id = comments.task_id
            AND project_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Yorumları proje üyeleri ekleyebilir" ON comments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM tasks
            JOIN project_members ON project_members.project_id = tasks.project_id
            WHERE tasks.id = task_id
            AND project_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Yorumları sadece sahipleri düzenleyebilir" ON comments
    FOR UPDATE USING (
        user_id = auth.uid()
    );

CREATE POLICY "Yorumları sadece sahipleri silebilir" ON comments
    FOR DELETE USING (
        user_id = auth.uid()
    );

-- İnceleme politikaları
CREATE POLICY "İncelemeleri herkes görebilir" ON task_reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tasks
            JOIN project_members ON project_members.project_id = tasks.project_id
            WHERE tasks.id = task_reviews.task_id
            AND project_members.user_id = auth.uid()
        )
    );

CREATE POLICY "İncelemeleri admin ve member ekleyebilir" ON task_reviews
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM tasks
            JOIN project_members ON project_members.project_id = tasks.project_id
            WHERE tasks.id = task_id
            AND project_members.user_id = auth.uid()
            AND project_members.role IN ('admin', 'member')
        )
    );

CREATE POLICY "İncelemeleri sadece inceleyenler düzenleyebilir" ON task_reviews
    FOR UPDATE USING (
        reviewer_id = auth.uid()
    );

CREATE POLICY "İncelemeleri admin ve inceleyenler silebilir" ON task_reviews
    FOR DELETE USING (
        reviewer_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM tasks
            JOIN project_members ON project_members.project_id = tasks.project_id
            WHERE tasks.id = task_reviews.task_id
            AND project_members.user_id = auth.uid()
            AND project_members.role = 'admin'
        )
    );

-- Yorum yapıldığında veya güncellendiğinde updated_at alanını güncelle
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- İnceleme güncellendiğinde updated_at alanını güncelle
CREATE TRIGGER set_task_reviews_updated_at
    BEFORE UPDATE ON task_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Yorum yapıldığında bildirim gönder
CREATE OR REPLACE FUNCTION notify_comment_mentions()
RETURNS TRIGGER AS $$
DECLARE
    project_id_var UUID;
BEGIN
    -- Önce project_id'yi al
    SELECT tasks.project_id INTO project_id_var
    FROM tasks
    WHERE tasks.id = NEW.task_id;

    -- Bildirimleri ekle
    IF NEW.mentioned_users IS NOT NULL THEN
        INSERT INTO notifications (user_id, project_id, task_id, type, title, content)
        SELECT 
            mentioned_user_id,
            project_id_var,
            NEW.task_id,
            'comment_mention',
            'Bir yorumda bahsedildiniz',
            format('%s sizi bir yorumda bahsetti', (SELECT name FROM users WHERE id = NEW.user_id))
        FROM unnest(NEW.mentioned_users) AS mentioned_user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_comment_mentions_trigger
    AFTER INSERT ON comments
    FOR EACH ROW
    EXECUTE FUNCTION notify_comment_mentions();

-- İnceleme eklendiğinde bildirim gönder
CREATE OR REPLACE FUNCTION notify_task_review()
RETURNS TRIGGER AS $$
DECLARE
    task_record RECORD;
BEGIN
    -- Görev bilgilerini al
    SELECT * INTO task_record
    FROM tasks
    WHERE id = NEW.task_id;

    -- Bildirimi ekle
    INSERT INTO notifications (
        user_id,
        project_id,
        task_id,
        type,
        title,
        content
    )
    VALUES (
        CASE
            WHEN NEW.status = 'approved' THEN task_record.assigned_to_id
            WHEN NEW.status = 'rejected' THEN task_record.assigned_to_id
            ELSE task_record.created_by_id
        END,
        task_record.project_id,
        NEW.task_id,
        'task_review',
        CASE
            WHEN NEW.status = 'approved' THEN 'Görev onaylandı'
            WHEN NEW.status = 'rejected' THEN 'Görev reddedildi'
            ELSE 'Görev incelemeye alındı'
        END,
        format(
            CASE
                WHEN NEW.status = 'approved' THEN '%s görevi onayladı'
                WHEN NEW.status = 'rejected' THEN '%s görevi reddetti'
                ELSE '%s görevi incelemeye aldı'
            END,
            (SELECT name FROM users WHERE id = NEW.reviewer_id)
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_task_review_trigger
    AFTER INSERT OR UPDATE ON task_reviews
    FOR EACH ROW
    EXECUTE FUNCTION notify_task_review(); 
-- Önce RLS'yi etkinleştirelim
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizleyelim
DROP POLICY IF EXISTS "Projeleri herkes görebilir" ON projects;
DROP POLICY IF EXISTS "Projeleri sahipleri düzenleyebilir" ON projects;
DROP POLICY IF EXISTS "Projeleri sahipleri silebilir" ON projects;

-- Yeni politikalar oluşturalım
CREATE POLICY "Kullanıcılar yalnızca üye oldukları projeleri görebilir" ON projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members
            WHERE project_members.project_id = projects.id
            AND project_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Projeleri admin rolündeki üyeler düzenleyebilir" ON projects
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM project_members
            WHERE project_members.project_id = projects.id
            AND project_members.user_id = auth.uid()
            AND project_members.role = 'admin'
        )
    );

CREATE POLICY "Projeleri admin rolündeki üyeler silebilir" ON projects
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM project_members
            WHERE project_members.project_id = projects.id
            AND project_members.user_id = auth.uid()
            AND project_members.role = 'admin'
        )
    );

CREATE POLICY "Yeni proje oluşturma" ON projects
    FOR INSERT WITH CHECK (true);

-- Hata ayıklama için yardımcı fonksiyon
CREATE OR REPLACE FUNCTION debug_project_access(project_id UUID)
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
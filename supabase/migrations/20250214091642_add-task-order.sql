-- Görev sıralaması için order sütunu ekleme
ALTER TABLE tasks ADD COLUMN "order" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Mevcut görevler için order değerini güncelleme
UPDATE tasks SET "order" = CURRENT_TIMESTAMP;

-- order sütununu zorunlu yapma
ALTER TABLE tasks ALTER COLUMN "order" SET NOT NULL;
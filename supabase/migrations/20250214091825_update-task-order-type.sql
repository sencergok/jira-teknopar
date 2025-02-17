-- Önce mevcut order sütununu float tipine dönüştürelim
ALTER TABLE tasks ALTER COLUMN "order" TYPE float USING EXTRACT(EPOCH FROM "order")::float;

-- Mevcut görevlerin sırasını güncelle (her görev arasında 1000 birimlik boşluk bırak)
WITH numbered_tasks AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY project_id, status ORDER BY "order") * 1000 as new_order
  FROM tasks
)
UPDATE tasks t
SET "order" = n.new_order
FROM numbered_tasks n
WHERE t.id = n.id;

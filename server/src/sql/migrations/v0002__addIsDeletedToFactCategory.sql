ALTER TABLE fact_category ADD COLUMN is_deleted boolean;
ALTER TABLE fact_category ALTER COLUMN is_deleted SET NOT NULL;
ALTER TABLE fact_category ALTER COLUMN is_deleted SET DEFAULT false;
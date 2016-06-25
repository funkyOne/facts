ALTER TABLE fact_topic ADD COLUMN is_deleted boolean;
ALTER TABLE fact_topic ALTER COLUMN is_deleted SET NOT NULL;
ALTER TABLE fact_topic ALTER COLUMN is_deleted SET DEFAULT false;
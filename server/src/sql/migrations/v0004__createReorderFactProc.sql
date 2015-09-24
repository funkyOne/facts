CREATE OR REPLACE FUNCTION reoder_fact(fact_id integer, category_id integer, anchor_id integer, before boolean)
RETURNS void AS
$$
    DECLARE
        new_order INTEGER;
    BEGIN
        SELECT "order" + CASE WHEN $4 = true THEN 0 ELSE 1 END
            INTO new_order
        WHERE fact_id = $1 AND category_id = $2
        LIMIT 1;

        UPDATE fact_category SET "order" = "order" + 1
        WHERE category_id = $2 AND "order" >= new_order;

        UPDATE fact_category SET "order" = new_order
        WHERE fact_id = $1;
    END;
$$ LANGUAGE plpgsql;
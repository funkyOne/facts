CREATE OR REPLACE FUNCTION build_facts() RETURNS void
AS
$$
DECLARE
    last_id integer;
	issue_r RECORD;  
BEGIN
    WITH CTE AS (SELECT DISTINCT epic_key FROM issue WHERE epic_key is not null)
    INSERT INTO topic (title, epic_key)
	SELECT title, key
	FROM issue join CTE on issue.key=CTE.epic_key;

    -- loop through issues
    FOR issue_r IN
	SELECT i.id, text, c.id as cat_id
	FROM issue i
	LEFT JOIN topic c on i.epic_key = c.epic_key
	WHERE i.text IS NOT NULL
    LOOP
        -- create fact for issue, if not exists
        IF NOT EXISTS (SELECT 1 from fact_issue where issue_id=issue_r.id) THEN

            INSERT INTO fact(text,html)
            VALUES (issue_r.text, issue_r.text)
            RETURNING id INTO last_id;

            INSERT INTO fact_issue (fact_id, issue_id)
            VALUES (last_id, issue_r.id);

            if(issue_r.cat_id IS NOT NULL) THEN
                INSERT INTO fact_topic(fact_id,topic_id)
                VALUES (last_id,issue_r.cat_id);
            END IF;

        END IF;
    END LOOP;
END;
$$
LANGUAGE plpgsql;

SELECT build_facts()
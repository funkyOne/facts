;WITH CTE
as
(SELECT DISTINCT epic_key FROM issue WHERE epic_key is not null)

INSERT INTO category (title,epic_key)
SELECT title,[key]
FROM issue join CTE on issue.[key]=CTE.epic_key


DECLARE @issue_id int, @text nvarchar(max),@cat_id int;

DECLARE @tmp TABLE (id int)
DECLARE @factId int

DECLARE vend_cursor CURSOR
FOR SELECT i.id,[text],c.id as cat_id FROM dbo.issue i
LEFT JOIN category c on i.epic_key = c.epic_key
where i.[text] IS NOT NULL 

OPEN vend_cursor
FETCH NEXT FROM vend_cursor
INTO @issue_id, @text,@cat_id


WHILE @@FETCH_STATUS = 0
BEGIN

	IF NOT EXISTS (select 1 from fact_issue where issue_id=@issue_id)
	BEGIN 

		INSERT INTO fact
		OUTPUT INSERTED.Id
		INTO @tmp(id)
		SELECT @text,@text

		SET @factId = (SELECT MAX(Id) FROM @tmp)

		INSERT INTO fact_issue 
		SELECT @factId,@issue_id
		
		if(@cat_id IS NOT NULL)
		BEGIN
			INSERT INTO fact_category
			SELECT @factId,@cat_id
		END

		delete @tmp
	END
 FETCH NEXT FROM vend_cursor 
    INTO @issue_id, @text,@cat_id
END 
CLOSE vend_cursor;
DEALLOCATE vend_cursor;
--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

--
-- Name: build_facts(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION build_facts() RETURNS void
    LANGUAGE plpgsql
    AS $$
    DECLARE
	last_id integer;
	issue_r RECORD;  
    BEGIN     

    WITH CTE AS (SELECT DISTINCT epic_key FROM issue WHERE epic_key is not null)
    INSERT INTO category (title,epic_key)
	SELECT title,key
	FROM issue join CTE on issue.key=CTE.epic_key;
      
 FOR issue_r IN
	SELECT i.id,text,c.id as cat_id 
	FROM issue i
	LEFT JOIN category c on i.epic_key = c.epic_key
	where i.text IS NOT NULL
   LOOP	
	IF NOT EXISTS (SELECT 1 from fact_issue where issue_id=issue_r.id) THEN	
		INSERT INTO fact(text,html)
		--OUTPUT INSERTED.Id
		--INTO @tmp(id)
		VALUES (issue_r.text, issue_r.text)
		RETURNING id INTO last_id
		;

		--SET @factId = (SELECT MAX(Id) FROM @tmp)

		INSERT INTO fact_issue (fact_id, issue_id)
		VALUES (last_id, issue_r.id);
		
		if(issue_r.cat_id IS NOT NULL) THEN		
			INSERT INTO fact_category(fact_id,category_id)
			VALUES (last_id,issue_r.cat_id);
		END IF;

	END IF;
   END LOOP;      
   END;
   $$;


ALTER FUNCTION public.build_facts() OWNER TO postgres;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: category; Type: TABLE; Schema: public; Owner: facts_app; Tablespace: 
--

CREATE TABLE category (
    id integer NOT NULL,
    title text,
    epic_key character varying(10),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE category OWNER TO facts_app;

--
-- Name: category_id_seq; Type: SEQUENCE; Schema: public; Owner: facts_app
--

CREATE SEQUENCE category_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE category_id_seq OWNER TO facts_app;

--
-- Name: category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: facts_app
--

ALTER SEQUENCE category_id_seq OWNED BY category.id;


--
-- Name: fact; Type: TABLE; Schema: public; Owner: facts_app; Tablespace: 
--

CREATE TABLE fact (
    id integer NOT NULL,
    text text,
    html text,
    hidden boolean,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE fact OWNER TO facts_app;

--
-- Name: fact_category; Type: TABLE; Schema: public; Owner: facts_app; Tablespace: 
--

CREATE TABLE fact_category (
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    fact_id integer NOT NULL,
    category_id integer NOT NULL
);


ALTER TABLE fact_category OWNER TO facts_app;

--
-- Name: fact_id_seq; Type: SEQUENCE; Schema: public; Owner: facts_app
--

CREATE SEQUENCE fact_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE fact_id_seq OWNER TO facts_app;

--
-- Name: fact_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: facts_app
--

ALTER SEQUENCE fact_id_seq OWNED BY fact.id;


--
-- Name: fact_issue; Type: TABLE; Schema: public; Owner: facts_app; Tablespace: 
--

CREATE TABLE fact_issue (
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    fact_id integer NOT NULL,
    issue_id integer NOT NULL
);


ALTER TABLE fact_issue OWNER TO facts_app;

--
-- Name: issue; Type: TABLE; Schema: public; Owner: facts_app; Tablespace: 
--

CREATE TABLE issue (
    id integer NOT NULL,
    text text,
    title text,
    key character varying(10),
    epic_key character varying(10),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    processed boolean DEFAULT false NOT NULL,
    jira_id integer NOT NULL,
    issue_type smallint
);


ALTER TABLE issue OWNER TO facts_app;

--
-- Name: issue_id_seq; Type: SEQUENCE; Schema: public; Owner: facts_app
--

CREATE SEQUENCE issue_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE issue_id_seq OWNER TO facts_app;

--
-- Name: issue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: facts_app
--

ALTER SEQUENCE issue_id_seq OWNED BY issue.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: facts_app
--

ALTER TABLE ONLY category ALTER COLUMN id SET DEFAULT nextval('category_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: facts_app
--

ALTER TABLE ONLY fact ALTER COLUMN id SET DEFAULT nextval('fact_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: facts_app
--

ALTER TABLE ONLY issue ALTER COLUMN id SET DEFAULT nextval('issue_id_seq'::regclass);


--
-- Name: category_pkey; Type: CONSTRAINT; Schema: public; Owner: facts_app; Tablespace: 
--

ALTER TABLE ONLY category
    ADD CONSTRAINT category_pkey PRIMARY KEY (id);


--
-- Name: fact_category_pkey; Type: CONSTRAINT; Schema: public; Owner: facts_app; Tablespace: 
--

ALTER TABLE ONLY fact_category
    ADD CONSTRAINT fact_category_pkey PRIMARY KEY (fact_id, category_id);


--
-- Name: fact_issue_pkey; Type: CONSTRAINT; Schema: public; Owner: facts_app; Tablespace: 
--

ALTER TABLE ONLY fact_issue
    ADD CONSTRAINT fact_issue_pkey PRIMARY KEY (fact_id, issue_id);


--
-- Name: fact_pkey; Type: CONSTRAINT; Schema: public; Owner: facts_app; Tablespace: 
--

ALTER TABLE ONLY fact
    ADD CONSTRAINT fact_pkey PRIMARY KEY (id);


--
-- Name: issue_pkey; Type: CONSTRAINT; Schema: public; Owner: facts_app; Tablespace: 
--

ALTER TABLE ONLY issue
    ADD CONSTRAINT issue_pkey PRIMARY KEY (id);


--
-- Name: uq_epic_key; Type: CONSTRAINT; Schema: public; Owner: facts_app; Tablespace: 
--

ALTER TABLE ONLY category
    ADD CONSTRAINT uq_epic_key UNIQUE (epic_key);


--
-- Name: uq_jira_id; Type: CONSTRAINT; Schema: public; Owner: facts_app; Tablespace: 
--

ALTER TABLE ONLY issue
    ADD CONSTRAINT uq_jira_id UNIQUE (jira_id);


--
-- Name: fact_category_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: facts_app
--

ALTER TABLE ONLY fact_category
    ADD CONSTRAINT fact_category_category_id_fkey FOREIGN KEY (category_id) REFERENCES category(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fact_category_fact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: facts_app
--

ALTER TABLE ONLY fact_category
    ADD CONSTRAINT fact_category_fact_id_fkey FOREIGN KEY (fact_id) REFERENCES fact(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fact_issue_fact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: facts_app
--

ALTER TABLE ONLY fact_issue
    ADD CONSTRAINT fact_issue_fact_id_fkey FOREIGN KEY (fact_id) REFERENCES fact(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fact_issue_issue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: facts_app
--

ALTER TABLE ONLY fact_issue
    ADD CONSTRAINT fact_issue_issue_id_fkey FOREIGN KEY (issue_id) REFERENCES issue(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--


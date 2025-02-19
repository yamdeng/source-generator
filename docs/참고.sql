-- insert if null check : 하단 부분 : "를 치환 후에 다시 .equals()를 .equals("")로 치환
select concat('<if test=', '''', camel_case, ' != null and !', camel_case, '.equals("")', '''', '>',
			  chr(10),
			  '  ,', '#{', camel_case, '}',
			  chr(10),
			 '</if>') as mybatis_text
from (
SELECT (lower(substring(pascal_case,1,1)) || substring(pascal_case,2)) AS camel_case
FROM (
SELECT column_name
	,replace(initcap(replace(column_name, '_', ' ')), ' ', '') As pascal_case
	,CASE WHEN data_type in('character', 'character varying') THEN 'String'
			WHEN data_type in('timestamp without time zone', 'timestamp') THEN 'LocalDateTime'
			WHEN data_type in('numeric') THEN 'Double'
			WHEN data_type in('integer') THEN 'Long'
			WHEN data_type in('boolean') THEN 'Boolean'
			WHEN data_type in('date') THEN 'LocalDate'
            ELSE
             	''
            END AS java_type
FROM information_schema.columns
WHERE table_name = lower('OFFICE_COMMUTE_DAY')
order by ordinal_position) As foo ) as camel_foo;

-- insert if null check : 상단 부분 : "를 치환 후에 다시 .equals()를 .equals("")로 치환
select concat('<if test=', '''', camel_case, ' != null and !', camel_case, '.equals("")', '''', '>',
			  chr(10),
			  '  ,', column_name,
			  chr(10),
			 '</if>') as mybatis_text
from (
SELECT column_name, (lower(substring(pascal_case,1,1)) || substring(pascal_case,2)) AS camel_case
FROM (
SELECT column_name
	,replace(initcap(replace(column_name, '_', ' ')), ' ', '') As pascal_case
	,CASE WHEN data_type in('character', 'character varying') THEN 'String'
			WHEN data_type in('timestamp without time zone', 'timestamp') THEN 'LocalDateTime'
			WHEN data_type in('numeric') THEN 'Double'
			WHEN data_type in('integer') THEN 'Long'
			WHEN data_type in('boolean') THEN 'Boolean'
			WHEN data_type in('date') THEN 'LocalDate'
            ELSE
             	''
            END AS java_type
FROM information_schema.columns
WHERE table_name = lower('OFFICE_COMMUTE_DAY')
order by ordinal_position) As foo ) as camel_foo;

-- update if null check : 상단 부분 : "를 치환 후에 다시 .equals()를 .equals("")로 치환
select concat('<if test=', '''', camel_case, ' != null and !', camel_case, '.equals("")', '''', '>',
			  chr(10),
			  '  ,', column_name, ' = ', '#{', camel_case, '}',
			  chr(10),
			 '</if>') as mybatis_text
from (
SELECT column_name, (lower(substring(pascal_case,1,1)) || substring(pascal_case,2)) AS camel_case
FROM (
SELECT column_name
	,replace(initcap(replace(column_name, '_', ' ')), ' ', '') As pascal_case
	,CASE WHEN data_type in('character', 'character varying') THEN 'String'
			WHEN data_type in('timestamp without time zone', 'timestamp') THEN 'LocalDateTime'
			WHEN data_type in('numeric') THEN 'Double'
			WHEN data_type in('integer') THEN 'Long'
			WHEN data_type in('boolean') THEN 'Boolean'
			WHEN data_type in('date') THEN 'LocalDate'
            ELSE
             	''
            END AS java_type
FROM information_schema.columns
WHERE table_name = lower('OFFICE_COMMUTE_DAY')
order by ordinal_position) As foo ) as camel_foo;

-- typescript 추출
SELECT concat(
	(lower(substring(pascal_case,1,1)) || substring(pascal_case,2)), ': ', java_type, ';',
	' /* ', COLUMN_COMMENT, ' */'
	) as typescript_string
FROM (
SELECT a.column_name
	,replace(initcap(replace(a.column_name, '_', ' ')), ' ', '') As pascal_case
	,CASE WHEN a.data_type in('character', 'character varying') THEN 'string'
			WHEN a.data_type in('timestamp without time zone', 'timestamp') THEN 'Date'
			WHEN a.data_type in('numeric') THEN 'number'
			WHEN a.data_type in('integer') THEN 'number'
			WHEN a.data_type in('boolean') THEN 'boolean'
			WHEN a.data_type in('date') THEN 'Date'
            ELSE
             	''
            END AS java_type
	,b.COLUMN_COMMENT
FROM information_schema.columns a
	inner join (
		SELECT
			PS.RELNAME AS TABLE_NAME,
			PA.ATTNAME AS COLUMN_NAME,
			PD.DESCRIPTION AS COLUMN_COMMENT
		FROM PG_STAT_ALL_TABLES PS, PG_DESCRIPTION PD, PG_ATTRIBUTE PA
		WHERE PD.OBJSUBID<>0
			AND PS.RELID=PD.OBJOID
			AND PD.OBJOID=PA.ATTRELID
			AND PD.OBJSUBID=PA.ATTNUM
			AND PS.RELNAME= lower('app_user') ) b
			on a.column_name = b.column_name
WHERE a.table_name = lower('app_user')
order by a.ordinal_position) As data_type_comment;

-- swagger description + validation dto 추출
SELECT concat(
	'@Schema(description = "', '', COLUMN_COMMENT, '"', ')'
	) as java_swagger_description,
	CASE WHEN is_nullable in('NO') THEN '@NotEmpty'
            ELSE
             	''
            END AS java_validation,
	concat(
	'private ', java_type, ' ', (lower(substring(pascal_case,1,1)) || substring(pascal_case,2)), ';',
	' /* ', COLUMN_COMMENT, ' */'
	) as java_vo_string
	,chr(10)
FROM (
SELECT a.column_name
	,replace(initcap(replace(a.column_name, '_', ' ')), ' ', '') As pascal_case
	,CASE WHEN a.data_type in('character', 'character varying') THEN 'String'
			WHEN a.data_type in('timestamp without time zone', 'timestamp') THEN 'LocalDateTime'
			WHEN a.data_type in('numeric') THEN 'Double'
			WHEN a.data_type in('integer') THEN 'Long'
			WHEN a.data_type in('boolean') THEN 'Boolean'
			WHEN a.data_type in('date') THEN 'LocalDate'
            ELSE
             	''
            END AS java_type
	,b.COLUMN_COMMENT
	,a.is_nullable 
FROM information_schema.columns a
	inner join (
		SELECT
			PS.RELNAME AS TABLE_NAME,
			PA.ATTNAME AS COLUMN_NAME,
			PD.DESCRIPTION AS COLUMN_COMMENT
		FROM PG_STAT_ALL_TABLES PS, PG_DESCRIPTION PD, PG_ATTRIBUTE PA
		WHERE PD.OBJSUBID<>0
			AND PS.RELID=PD.OBJOID
			AND PD.OBJOID=PA.ATTRELID
			AND PD.OBJSUBID=PA.ATTNUM
			AND PS.RELNAME= lower('app_airplane') ) b
			on a.column_name = b.column_name
WHERE a.table_name = lower('app_airplane')
and a.column_name not in(
	lower('ID'),
	lower('CREATE_DATE'),
	lower('UPDATE_DATE'),
	lower('CREATE_USER_ID'),
	lower('UPDATE_USER_ID'),
	lower('IS_DELETE')
)
order by a.ordinal_position) As data_type_comment;

-- front source generate sql
SELECT
	(lower(substring(pascal_case,1,1)) || substring(pascal_case,2)) as column_name,
	column_name as column_name_original,
	COLUMN_COMMENT as column_comment,
	data_type,
	java_type,
	is_nullable 
FROM (
SELECT a.column_name
	,replace(initcap(replace(a.column_name, '_', ' ')), ' ', '') As pascal_case
	,CASE WHEN a.data_type in('character', 'character varying') THEN 'String'
			WHEN a.data_type in('timestamp without time zone', 'timestamp') THEN 'LocalDateTime'
			WHEN a.data_type in('numeric') THEN 'Double'
			WHEN a.data_type in('integer') THEN 'Long'
			WHEN a.data_type in('boolean') THEN 'Boolean'
			WHEN a.data_type in('date') THEN 'LocalDate'
            ELSE
             	''
            END AS java_type
	,b.COLUMN_COMMENT
	,a.data_type
	,a.is_nullable
FROM information_schema.columns a
	inner join (
		SELECT
			PS.RELNAME AS TABLE_NAME,
			PA.ATTNAME AS COLUMN_NAME,
			PD.DESCRIPTION AS COLUMN_COMMENT
		FROM PG_STAT_ALL_TABLES PS, PG_DESCRIPTION PD, PG_ATTRIBUTE PA
		WHERE PD.OBJSUBID<>0
			AND PS.RELID=PD.OBJOID
			AND PD.OBJOID=PA.ATTRELID
			AND PD.OBJSUBID=PA.ATTNUM
			AND PS.RELNAME= lower('app_airplane') ) b
			on a.column_name = b.column_name
WHERE a.table_name = lower('app_airplane')
order by a.ordinal_position) As data_type_comment;

-- 테이블명, 테이블주석 조회 : 2025-02-11 추가
select upper(table_name), obj_description(oid) AS table_comment
from information_schema.tables a inner join pg_class b on a.table_name = b.relname
where table_catalog = 'obiswork' and table_schema = 'public'
and table_name like 'tas%';

-- 2025-02-14 sql 고도화
SELECT 
    UPPER(a.table_name) AS table_name,
    UPPER(a.column_name) AS column_name,
    COALESCE(b.column_comment, '') AS column_comment,
    CASE WHEN a.data_type in('character varying') THEN 'VARCHAR'
    WHEN a.data_type in('character') THEN 'CHAR'
			WHEN a.data_type in('timestamp without time zone', 'timestamp') THEN 'TIMESTAMP'
			WHEN data_type in('numeric') THEN 'NUMERIC'
			WHEN data_type in('integer') THEN 'INTEGER'
			WHEN data_type in('boolean') THEN 'BOOLEAN'
			WHEN data_type in('date') THEN 'DATE'
            ELSE
             	''
            END AS column_type,
    character_maximum_length as column_size,
    CASE WHEN a.is_nullable in('NO') THEN 'N'
            ELSE
             	'Y'
            END as null허용,
   CASE 
        WHEN (
            SELECT COUNT(*)
            FROM information_schema.key_column_usage usag_cols
            WHERE usag_cols.table_name = a.table_name 
              AND usag_cols.column_name = a.column_name 
              AND usag_cols.constraint_name LIKE '%_pk'
        ) > 0 THEN 'Y'
        ELSE 'N'
    END AS is_primary_key
FROM information_schema.columns a
LEFT JOIN (
    SELECT 
        ps.relname AS table_name,
        pa.attname AS column_name,
        pd.description AS column_comment
    FROM pg_stat_all_tables ps
    LEFT JOIN pg_description pd 
        ON ps.relid = pd.objoid 
        AND pd.objsubid <> 0
    LEFT JOIN pg_attribute pa 
        ON pd.objoid = pa.attrelid 
        AND pd.objsubid = pa.attnum
    WHERE ps.relname = LOWER('TAS_A_DOC_H_MANAGE')
) b 
ON a.column_name = b.column_name
AND a.table_name = b.table_name
WHERE a.table_name = LOWER('TAS_A_DOC_H_MANAGE')
ORDER BY a.ordinal_position;

-- column 정보와 size를 한까번에 표기 2025-02-14 추가
-- 테이블명, 컬럼명, 컬럼설명 컬럼타입, PK여부, 널허용

SELECT 
    UPPER(a.table_name) AS table_name,
    UPPER(a.column_name) AS column_name,
    COALESCE(b.column_comment, '') AS column_comment,
    CASE WHEN a.data_type in('character varying') THEN concat('VARCHAR(', character_maximum_length, ')')
    WHEN a.data_type in('character') THEN concat('CHAR(', character_maximum_length, ')')
			WHEN a.data_type in('timestamp without time zone', 'timestamp') THEN 'TIMESTAMP'
			WHEN data_type in('numeric') THEN 'NUMERIC'
			WHEN data_type in('integer') THEN 'INTEGER'
			WHEN data_type in('boolean') THEN 'BOOLEAN'
			WHEN data_type in('date') THEN 'DATE'
            ELSE
             	upper(a.data_type)
            END AS column_type,
    CASE WHEN a.is_nullable in('NO') THEN 'N'
            ELSE
             	'Y'
            END as null허용,
   CASE 
        WHEN (
            SELECT COUNT(*)
            FROM information_schema.key_column_usage usag_cols
            WHERE usag_cols.table_name = a.table_name 
              AND usag_cols.column_name = a.column_name 
              AND usag_cols.constraint_name LIKE '%_pk'
        ) > 0 THEN 'Y'
        ELSE 'N'
    END AS is_primary_key
FROM information_schema.columns a
LEFT JOIN (
    SELECT 
        ps.relname AS table_name,
        pa.attname AS column_name,
        pd.description AS column_comment
    FROM pg_stat_all_tables ps
    LEFT JOIN pg_description pd 
        ON ps.relid = pd.objoid 
        AND pd.objsubid <> 0
    LEFT JOIN pg_attribute pa 
        ON pd.objoid = pa.attrelid 
        AND pd.objsubid = pa.attnum
    WHERE ps.relname = LOWER('TAS_A_DOC')
) b 
ON a.column_name = b.column_name
AND a.table_name = b.table_name
WHERE a.table_name = LOWER('TAS_A_DOC')
ORDER BY a.ordinal_position;

-- java vo 멤버변수 반영 2025-02-15 추가 : TODO(swagger 반영 필요)

select concat(
	'private ', java_type, ' ', (lower(substring(pascal_case,1,1)) || substring(pascal_case,2)), ';',
	' /* ', COLUMN_COMMENT, ' */'
	) as java_vo_string
	from (
	SELECT 
    CASE WHEN a.data_type in('character', 'character varying') THEN 'String'
			WHEN a.data_type in('timestamp without time zone', 'timestamp') THEN 'LocalDateTime'
			WHEN a.data_type in('numeric') THEN 'Double'
			WHEN a.data_type in('integer') THEN 'Long'
			WHEN a.data_type in('boolean') THEN 'Boolean'
			WHEN a.data_type in('date') THEN 'LocalDate'
			WHEN a.data_type in('text') THEN 'String'
			WHEN a.data_type in('bytea') THEN 'byte[]'
            ELSE
             	a.data_type || 'ssxx' 
            END AS java_type, a.column_name,
            a.column_name
	,replace(initcap(replace(a.column_name, '_', ' ')), ' ', '') As pascal_case
	,b.COLUMN_COMMENT
FROM information_schema.columns a
LEFT JOIN (
    SELECT 
        ps.relname AS table_name,
        pa.attname AS column_name,
        pd.description AS column_comment
    FROM pg_stat_all_tables ps
    LEFT JOIN pg_description pd 
        ON ps.relid = pd.objoid 
        AND pd.objsubid <> 0
    LEFT JOIN pg_attribute pa 
        ON pd.objoid = pa.attrelid 
        AND pd.objsubid = pa.attnum
    WHERE ps.relname = LOWER('TAS_A_DOC')
) b 
ON a.column_name = b.column_name
AND a.table_name = b.table_name
WHERE a.table_name = LOWER('TAS_A_DOC')
ORDER BY a.ordinal_position
	) as full_vo_table;

-- string_agg 반영 2025-02-16 추가

SELECT 'insert into TO0_CORPORATION' || E'\n' || '(' || string_agg(concat(upper(column_name)), ', ') || ')'
FROM information_schema.columns
WHERE table_name = lower('TO0_CORPORATION');

SELECT string_agg(concat('#{', (lower(substring(pascal_case,1,1)) || substring(pascal_case,2)), '}', ', '), '') AS camel_case
FROM (
         SELECT column_name
              ,replace(initcap(replace(column_name, '_', ' ')), ' ', '') As pascal_case
         FROM information_schema.columns
         WHERE table_name = lower('tas_a_doc_info')
         order by ordinal_position) As foo;


		 
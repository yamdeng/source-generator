-- 테이블 목록 조회
select *
FROM information_schema.tables
where table_name like '%tas%'
and table_type = 'BASE TABLE'
and table_schema = 'public';

-- 컬럼 데이터타입 유형 1
SELECT DISTINCT udt_name 
FROM information_schema.columns
ORDER BY udt_name;

-- 컬럼 데이터타입 유형 2
SELECT DISTINCT data_type
FROM information_schema.columns
ORDER BY data_type;

-- 컬럼 기본 정보 조회 유형 1
-- 테이블명, 컬럼명, 컬럼주석, 컬럼타입, size, null 허용, 기본값, pk여부, java_type
SELECT ordinal_position
       ,table_name
       ,column_name
       ,(SELECT pg_catalog.Col_description(c.oid, cols.ordinal_position :: INT)
         FROM   pg_catalog.pg_class c
         WHERE  c.oid = (SELECT cols.table_name :: regclass :: oid)
                AND c.relname = cols.table_name)                                   AS column_comment
       ,udt_name                                                                   AS column_type
       ,character_maximum_length                                                   AS column_size
       ,is_nullable
       ,column_default
       ,CASE
          WHEN (SELECT Count(*)
                FROM   information_schema.key_column_usage usag_cols
                WHERE  usag_cols.table_name = cols.table_name
                       AND usag_cols.column_name = cols.column_name
                       AND usag_cols.constraint_name LIKE '%_pk') > 0 THEN 'Y'
          ELSE 'N'
        end                                                                        AS is_primary_key
       ,CASE
          WHEN cols.data_type IN( 'character', 'character varying' ) THEN 'String'
          WHEN cols.data_type IN( 'date' ) THEN 'LocalDate'
          WHEN cols.data_type IN( 'timestamp without time zone', 'time without time zone', 'timestamp' ) THEN 'LocalDateTime'
          WHEN cols.data_type IN( 'numeric' ) and (cols.numeric_scale = 0 or cols.numeric_scale is null) THEN 'Long'
          WHEN cols.data_type IN( 'numeric' ) and (cols.numeric_scale != 0 or cols.numeric_scale is not null) THEN 'BigDecimal'
          WHEN cols.data_type IN( 'real' ) THEN 'Float'
          WHEN cols.data_type IN( 'double precision' ) THEN 'Double'
          WHEN cols.data_type IN( 'integer', 'smallint' ) THEN 'Integer'
          WHEN cols.data_type IN( 'bigint' ) THEN 'Long'
          WHEN cols.data_type IN( 'boolean' ) THEN 'Boolean'
          WHEN cols.data_type IN( 'date' ) THEN 'LocalDate'
          WHEN cols.data_type IN( 'text' ) THEN 'String'
          WHEN cols.data_type IN( 'bytea' ) THEN 'byte[]'
          ELSE cols.data_type
               || 'require checked'
        end                                                                        AS java_type
       ,REPLACE(Initcap(REPLACE(column_name, '_', ' ')), ' ', '')                  AS pascal_case
       ,Lower(Substring(REPLACE(Initcap(REPLACE(column_name, '_', ' ')), ' ', ''), 1, 1))
        || Substring(REPLACE(Initcap(REPLACE(column_name, '_', ' ')), ' ', ''), 2) AS camel_case
FROM   information_schema.columns cols
WHERE  table_name = Lower('tas_a_doc_info')
ORDER  BY ordinal_position;

-- 컬럼 기본 정보 조회 유형 2 : join
-- 테이블명, 컬럼명, 컬럼주석, 컬럼타입, size, null 허용, 기본값, pk여부, java_type
SELECT cols.table_name                                                                  AS table_name
       ,cols.column_name                                                                AS column_name
       ,COALESCE(b.column_comment, '')                                                  AS column_comment
       ,data_type                                                                       AS column_type
       ,character_maximum_length                                                        AS column_size
       ,is_nullable
       ,column_default
       ,CASE
          WHEN (SELECT Count(*)
                FROM   information_schema.key_column_usage usag_cols
                WHERE  usag_cols.table_name = cols.table_name
                       AND usag_cols.column_name = cols.column_name
                       AND usag_cols.constraint_name LIKE '%_pk') > 0 THEN 'Y'
          ELSE 'N'
        END                                                                             AS is_primary_key
       ,CASE
          WHEN cols.data_type IN( 'character', 'character varying' ) THEN 'String'
          WHEN cols.data_type IN( 'date' ) THEN 'LocalDate'
          WHEN cols.data_type IN( 'timestamp without time zone', 'time without time zone', 'timestamp' ) THEN 'LocalDateTime'
          WHEN cols.data_type IN( 'numeric' ) and (cols.numeric_scale = 0 or cols.numeric_scale is null) THEN 'Long'
          WHEN cols.data_type IN( 'numeric' ) and (cols.numeric_scale != 0 or cols.numeric_scale is not null) THEN 'BigDecimal'
          WHEN cols.data_type IN( 'real' ) THEN 'Float'
          WHEN cols.data_type IN( 'double precision' ) THEN 'Double'
          WHEN cols.data_type IN( 'integer', 'smallint' ) THEN 'Integer'
          WHEN cols.data_type IN( 'bigint' ) THEN 'Long'
          WHEN cols.data_type IN( 'boolean' ) THEN 'Boolean'
          WHEN cols.data_type IN( 'date' ) THEN 'LocalDate'
          WHEN cols.data_type IN( 'text' ) THEN 'String'
          WHEN cols.data_type IN( 'bytea' ) THEN 'byte[]'
          ELSE cols.data_type
               || 'require checked'
        END                                                                             AS java_type
       ,Replace(Initcap(Replace(cols.column_name, '_', ' ')), ' ', '')                  AS pascal_case
       ,Lower(Substring(Replace(Initcap(Replace(cols.column_name, '_', ' ')), ' ', ''), 1, 1))
        || Substring(Replace(Initcap(Replace(cols.column_name, '_', ' ')), ' ', ''), 2) AS camel_case
FROM   information_schema.columns cols
       LEFT JOIN (SELECT ps.relname      AS table_name
                         ,pa.attname     AS column_name
                         ,pd.description AS column_comment
                  FROM   pg_stat_all_tables ps
                         LEFT JOIN pg_description pd
                                ON ps.relid = pd.objoid
                                   AND pd.objsubid <> 0
                         LEFT JOIN pg_attribute pa
                                ON pd.objoid = pa.attrelid
                                   AND pd.objsubid = pa.attnum
                  WHERE  ps.relname = Lower('tas_a_doc_info')) b
              ON cols.column_name = b.column_name
                 AND cols.table_name = b.table_name
WHERE  cols.table_name = Lower('tas_a_doc_info')
ORDER  BY cols.ordinal_position; 

-- 단순 column 목록 추출: 마지막에 , 기준으로 추출 
select concat(column_name, ',')
from information_schema.columns
where table_name = lower('tas_a_doc_info')
order by ordinal_position;

-- insert 파라미터 매핑 : #{baseDateStr},
SELECT concat('#{', (lower(substring(pascal_case,1,1)) || substring(pascal_case,2)), '},') AS camel_case
FROM (
SELECT column_name
	,replace(initcap(replace(column_name, '_', ' ')), ' ', '') As pascal_case
FROM information_schema.columns
WHERE table_name = lower('to0_user_main')
order by ordinal_position) As foo;

-- update 파라미터 매핑 : a_html_doc_data = ${aHtmlDocData},
SELECT concat(column_name, ' = ${', (lower(substring(pascal_case,1,1)) || substring(pascal_case,2)), '},') AS camel_case
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
WHERE table_name = lower('tas_a_doc')
order by ordinal_position) As foo;

-- select column 낙타표기법 추출 : ,base_date_str AS baseDateStr
SELECT concat(',', column_name, ' AS ', (lower(substring(pascal_case,1,1)) || substring(pascal_case,2))) AS camel_case
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
WHERE table_name = lower('tas_a_doc_info')
order by ordinal_position) As foo;

-- java vo 멤버변수 별도 추출 sql => private String aDocKey; /* 문서키 */
select concat(
	'private ', java_type, ' ', camel_case, ';',
	' /* ', COLUMN_COMMENT, ' */'
	) as java_vo_string
from (
SELECT 
       (SELECT pg_catalog.Col_description(c.oid, cols.ordinal_position :: INT)
         FROM   pg_catalog.pg_class c
         WHERE  c.oid = (SELECT cols.table_name :: regclass :: oid)
                AND c.relname = cols.table_name)                                   AS column_comment
       ,CASE
          WHEN cols.data_type IN( 'character', 'character varying' ) THEN 'String'
          WHEN cols.data_type IN( 'date' ) THEN 'LocalDate'
          WHEN cols.data_type IN( 'timestamp without time zone', 'time without time zone', 'timestamp' ) THEN 'LocalDateTime'
          WHEN cols.data_type IN( 'numeric' ) and (cols.numeric_scale = 0 or cols.numeric_scale is null) THEN 'Long'
          WHEN cols.data_type IN( 'numeric' ) and (cols.numeric_scale != 0 or cols.numeric_scale is not null) THEN 'BigDecimal'
          WHEN cols.data_type IN( 'real' ) THEN 'Float'
          WHEN cols.data_type IN( 'double precision' ) THEN 'Double'
          WHEN cols.data_type IN( 'integer', 'smallint' ) THEN 'Integer'
          WHEN cols.data_type IN( 'bigint' ) THEN 'Long'
          WHEN cols.data_type IN( 'boolean' ) THEN 'Boolean'
          WHEN cols.data_type IN( 'date' ) THEN 'LocalDate'
          WHEN cols.data_type IN( 'text' ) THEN 'String'
          WHEN cols.data_type IN( 'bytea' ) THEN 'byte[]'
          ELSE cols.data_type
               || 'require checked'
        end                                                                        AS java_type
       ,Lower(Substring(REPLACE(Initcap(REPLACE(column_name, '_', ' ')), ' ', ''), 1, 1))
        || Substring(REPLACE(Initcap(REPLACE(column_name, '_', ' ')), ' ', ''), 2) AS camel_case
FROM   information_schema.columns cols
WHERE  table_name = Lower('tas_a_doc')
ORDER  BY ordinal_position);

-- 테이블 주석 가져오기 case1
SELECT C.relname              AS table_name,
       Obj_description(C.oid) AS table_comment
FROM   pg_catalog.pg_class C
       INNER JOIN pg_catalog.pg_namespace N
               ON C.relnamespace = N.oid
WHERE  C.relkind = 'r'
       AND relname = 'to0_rank_main'; 

-- 테이블 주석 가져오기 case2
SELECT Obj_description('to0_rank_main' :: regclass, 'pg_class') AS table_comment; 
      
-- pk 조회
 SELECT
      kcu.column_name AS pk_column
    FROM
      information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_name = 'tas_a_doc';
   
-- fk 조회
   SELECT
      kcu.column_name AS fk_column
    FROM
      information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'tas_a_doc';

-- table comment ddl
SELECT 'COMMENT ON TABLE ' || 'elsn.to0_corporation IS' || E' \'' || COALESCE(Obj_description('to0_corporation' :: regclass, 'pg_class'), 'No Comment') || E'\'' || ';';

-- column comment ddl
select 'COMMENT ON COLUMN elsn.' || table_name || '.' || column_name || ' IS' || E' \'' || COALESCE(column_comment, 'No Comment') || E'\'' || ';'
from 
(
SELECT table_name
       ,column_name
       ,(SELECT pg_catalog.Col_description(c.oid, cols.ordinal_position :: INT)
         FROM   pg_catalog.pg_class c
         WHERE  c.oid = (SELECT cols.table_name :: regclass :: oid)
                AND c.relname = cols.table_name)                                   AS column_comment
FROM   information_schema.columns cols
WHERE  table_name = Lower('to0_corporation')
ORDER  BY ordinal_position);

/* 제약조건 삭제 sql 생성 : 테이블명 기준 */
SELECT 'ALTER TABLE ' || conrelid::regclass || ' DROP CONSTRAINT ' || conname || ';'
FROM pg_constraint 
WHERE conrelid = 'tas_cor_config_sub'::regclass;

/* 제약조건 조회 : 테이블명 기준 */
SELECT conname, conrelid::regclass 
FROM pg_constraint 
WHERE conrelid = 'tas_cor_config_sub'::regclass;

/* DROP TABLE 반영 */
SELECT 'drop table ' || table_name || ';'
FROM information_schema.tables
WHERE table_type = 'BASE TABLE' and table_schema = 'elsn';


-- 테이블 정보 추출 : 0505
select lower(table_name), obj_description(oid) AS table_comment, obj_description(oid) AS table_comment2
from information_schema.tables a
left join pg_class b on a.table_name = b.relname and b.relowner = 16388
where table_schema = 'elsown'
order by table_name;

-- 컬럼 정보 추출 : 0505
select all_table.*, concat('[정책자금 전자결재솔루션]: ', column_comment) as "속성설명"
from (
SELECT table_name,
		(select obj_description(oid)
		from pg_class a
		where a.relname = cols.table_name and a.relowner = 16388) as table_comment
       ,column_name
       ,(SELECT pg_catalog.Col_description(c.oid, cols.ordinal_position :: INT)
         FROM   pg_catalog.pg_class c
         WHERE  c.oid = (SELECT cols.table_name :: regclass :: oid)
                AND c.relname = cols.table_name)                                   AS column_comment
FROM   information_schema.columns cols
WHERE  cols.table_schema = 'elsown'
ORDER BY table_name, ordinal_position) all_table;

-- 컬럼 정보 추출 : 0512
SELECT table_comment as 엔티티명,
upper(table_name) as 테이블영문명,
table_name as 테이블영문명_소문자,
column_comment as 속성명,
속성설명,
upper(column_name) as 컬럼명,
column_name as 컬럼명_소문자,
column_order,
data_type,
is_primary_key,
is_not_null,
column_default
FROM (
    SELECT 
        c.table_name,
        t.table_comment,
        c.column_name,
        c.ordinal_position AS column_order,
        CASE 
            WHEN typ.typname = 'varchar' THEN 
                format('VARCHAR(%s)', c.character_maximum_length)
            WHEN typ.typname = 'bpchar' THEN 
                format('CHAR(%s)', c.character_maximum_length)
            WHEN typ.typname = 'numeric' THEN 
                CASE 
                    WHEN c.numeric_precision IS NULL THEN 'NUMERIC'
                    ELSE format('NUMERIC(%s, %s)', c.numeric_precision, c.numeric_scale)
                END
            WHEN typ.typname = 'int4' THEN 'INT'
            WHEN typ.typname = 'int8' THEN 'BIGINT'
            WHEN typ.typname = 'text' THEN 'TEXT'
            WHEN typ.typname = 'timestamp' THEN 'TIMESTAMP'
            ELSE upper(typ.typname)
        END AS data_type,
        CASE WHEN kcu.column_name IS NOT NULL THEN 'Y' ELSE 'N' END AS is_primary_key,
        CASE WHEN c.is_nullable = 'NO' THEN 'Y' ELSE 'N' END AS is_not_null,
        c.column_default,
        col_description(format('%s.%s', c.table_schema, c.table_name)::regclass::oid, c.ordinal_position) AS column_comment,
        CONCAT('[정책자금 전자결재솔루션]: ', col_description(format('%s.%s', c.table_schema, c.table_name)::regclass::oid, c.ordinal_position)) AS 속성설명
    FROM 
        information_schema.columns c
    LEFT JOIN (
        SELECT 
            table_name,
            obj_description(format('%s.%s', table_schema, table_name)::regclass::oid) AS table_comment
        FROM information_schema.tables
        WHERE table_schema = 'elsown'
    ) t ON t.table_name = c.table_name
    LEFT JOIN information_schema.key_column_usage kcu 
        ON c.table_name = kcu.table_name 
        AND c.column_name = kcu.column_name
        AND c.table_schema = kcu.table_schema
    LEFT JOIN pg_class cls ON cls.relname = c.table_name
        AND cls.relnamespace = 'elsown'::regnamespace
    LEFT JOIN pg_attribute att ON att.attrelid = cls.oid AND att.attname = c.column_name
    LEFT JOIN pg_type typ ON typ.oid = att.atttypid
    WHERE 
        c.table_schema = 'elsown'
    ORDER BY 
        c.table_name,
        c.ordinal_position
) AS all_table;
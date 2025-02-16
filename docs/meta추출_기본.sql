-- 컬럼 데이터타입 유형 1
SELECT DISTINCT udt_name 
FROM information_schema.columns
ORDER BY udt_name;

-- 컬럼 데이터타입 유형 2
SELECT DISTINCT data_type
FROM information_schema.columns
ORDER BY data_type;

-- 컬럼 기본 정보 조회 유형 2
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
          WHEN cols.data_type IN( 'numeric' ) THEN 'BigDecimal'
          WHEN cols.data_type IN( 'real' ) THEN 'Float'
          WHEN cols.data_type IN( 'double precision' ) THEN 'Double'
          WHEN cols.data_type IN( 'integer', 'smallint' ) THEN 'Integer'
          WHEN cols.data_type IN( 'bigint' ) THEN 'Long'
          WHEN cols.data_type IN( 'boolean' ) THEN 'Boolean'
          WHEN cols.data_type IN( 'date' ) THEN 'LocalDate'
          WHEN cols.data_type IN( 'text' ) THEN 'String'
          WHEN cols.data_type IN( 'bytea' ) THEN 'byte[]'
          ELSE cols.data_type
               || 'ssxx'
        end                                                                        AS java_type
       ,REPLACE(Initcap(REPLACE(column_name, '_', ' ')), ' ', '')                  AS pascal_case
       ,Lower(Substring(REPLACE(Initcap(REPLACE(column_name, '_', ' ')), ' ', ''), 1, 1))
        || Substring(REPLACE(Initcap(REPLACE(column_name, '_', ' ')), ' ', ''), 2) AS camel_case
FROM   information_schema.columns cols
WHERE  table_name = Lower('tas_a_doc_info')
ORDER  BY ordinal_position;

-- 컬럼 기본 정보 조회 유형 1 : join
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
          WHEN cols.data_type IN( 'numeric' ) THEN 'BigDecimal'
          WHEN cols.data_type IN( 'real' ) THEN 'Float'
          WHEN cols.data_type IN( 'double precision' ) THEN 'Double'
          WHEN cols.data_type IN( 'integer', 'smallint' ) THEN 'Integer'
          WHEN cols.data_type IN( 'bigint' ) THEN 'Long'
          WHEN cols.data_type IN( 'boolean' ) THEN 'Boolean'
          WHEN cols.data_type IN( 'date' ) THEN 'LocalDate'
          WHEN cols.data_type IN( 'text' ) THEN 'String'
          WHEN cols.data_type IN( 'bytea' ) THEN 'byte[]'
          ELSE cols.data_type
               || 'required check'
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
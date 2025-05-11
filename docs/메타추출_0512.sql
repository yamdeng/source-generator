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
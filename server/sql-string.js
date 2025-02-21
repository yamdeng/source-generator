// const tableSelectSql = `select *
// FROM information_schema.tables
// where table_name like :keyword
// and table_type = 'BASE TABLE'
// and table_schema = 'public'
// `;

const tableSelectSql = `SELECT C.RELNAME as table_name, OBJ_DESCRIPTION(C.OID) as table_comment
FROM PG_CATALOG.PG_CLASS C INNER JOIN PG_CATALOG.PG_NAMESPACE N ON C.RELNAMESPACE=N.OID
WHERE C.RELKIND = 'r'
AND RELNAME like :keyword`;

const tableSelectSqlEqual = `SELECT obj_description(?::regclass, 'pg_class') AS table_comment`;

const columnSelectSql = `SELECT ordinal_position
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
WHERE  table_name = Lower(?)
ORDER  BY ordinal_position`;

module.exports = {
  tableSelectSql: tableSelectSql,
  tableSelectSqlEqual: tableSelectSqlEqual,
  columnSelectSql: columnSelectSql,
};

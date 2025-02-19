const tableSelectSql = `select *
FROM information_schema.tables
where table_name like :keyword
and table_type = 'BASE TABLE'
and table_schema = 'public'
`;

const columnSelectSql = `SELECT
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
	left outer join (
		SELECT
			PS.RELNAME AS TABLE_NAME,
			PA.ATTNAME AS COLUMN_NAME,
			PD.DESCRIPTION AS COLUMN_COMMENT
		FROM PG_STAT_ALL_TABLES PS, PG_DESCRIPTION PD, PG_ATTRIBUTE PA
		WHERE PD.OBJSUBID<>0
			AND PS.RELID=PD.OBJOID
			AND PD.OBJOID=PA.ATTRELID
			AND PD.OBJSUBID=PA.ATTNUM
			AND PS.RELNAME= lower(?) ) b
			on a.column_name = b.column_name
WHERE a.table_name = lower(?)
order by a.ordinal_position) As data_type_comment`;

module.exports = {
  tableSelectSql: tableSelectSql,
  columnSelectSql: columnSelectSql,
};

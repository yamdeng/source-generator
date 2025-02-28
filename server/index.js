require("dotenv").config();
const path = require("path");
const _ = require("lodash");
const fs = require("fs");
const { SERVER_PORT } = process.env;
const { tableSelectSql, columnSelectSql, columnOnlySelectSql } = require("./sql-string");
const Config = require("./config");
const Code = require("./code");
const {
  readTemplateFile,
  getEjsParameter,
  getGeneratorResult,
  createAllFile,
  createZipArchive,
  createFiledownloadByGeneratorDetailInfo,
  convertTemplateSqlString,
  getResponseDtoEjsParameter,
} = require("./util");
const db = require("./db");

// ======= server init start =======

const express = require("express");
const app = express();
const cors = require("cors");
const Constant = require("./constant");
const port = SERVER_PORT;
app.use(
  cors({
    origin: "*", // 모든 출처 허용 옵션. true 를 써도 된다.
  })
);
app.use(express.static("public"));
app.use(express.json({ extended: true }));

// 서버 listen
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const resultDirectory = path.join(__dirname, "result");
const resultBackendDirectory = path.join(__dirname, "result" + path.sep + "backend");
const resultFrontendDirectory = path.join(__dirname, "result" + path.sep + "frontend");
const resultSqlDirectory = path.join(__dirname, "result" + path.sep + "sql");
if (!fs.existsSync(resultDirectory)) {
  fs.mkdirSync(resultDirectory);
}
if (!fs.existsSync(resultBackendDirectory)) {
  fs.mkdirSync(resultBackendDirectory);
}
if (!fs.existsSync(resultFrontendDirectory)) {
  fs.mkdirSync(resultFrontendDirectory);
}
if (!fs.existsSync(resultSqlDirectory)) {
  fs.mkdirSync(resultSqlDirectory);
}

// Config log print
console.log(`Config : `, Config);

// generator map 변수 셋팅
const generatorFileMap = {};
readTemplateFile(generatorFileMap);

// ======= server init end =======

/* 코드 조회 : /api/codes */
app.get("/api/codes/:groupCode", async (req, res) => {
  const groupCode = req.params.groupCode;
  let codeList = Code[groupCode];
  res.json(codeList);
});

/* 테이블 조회 : /api/tables */
app.get("/api/tables", async (req, res) => {
  const keyword = req.query.keyword;
  let tableList = [];
  try {
    const dbResponse = await db.raw(tableSelectSql, {
      keyword: `%${keyword}%`,
    });
    tableList = dbResponse.rows;
    console.log(tableList);
  } catch (e) {
    console.log(e);
  }

  res.json({
    list: tableList,
  });
});

/* 테이블명 기준으로 컬럼 정보 조회 : /api/columns/:tableName */
app.get("/api/columns/:tableName", async (req, res) => {
  const tableName = req.params.tableName;
  let columnList = [];
  try {
    const dbResponse = await db.raw(columnSelectSql, [tableName]);
    columnList = dbResponse.rows;
    console.log(columnList);
  } catch (e) {
    console.log(e);
  }

  res.json({
    list: columnList,
  });
});

/* 테이블명 N개 기준으로 컬럼 정보 조회 : /api/columns */
app.post("/api/columns", async (req, res) => {
  const tableNameList = req.body.tableNameList || [];

  const applySqlString = `
    ${columnOnlySelectSql}
    WHERE table_name IN (${tableNameList.map(() => "?").join(", ")})
    ORDER BY table_name, ordinal_position`;

  let columnList = [];
  try {
    const dbResponse = await db.raw(applySqlString, tableNameList);
    columnList = dbResponse.rows;
    console.log(columnList);
  } catch (e) {
    console.log(e);
  }

  res.json({
    list: columnList,
  });
});

/* generate 문자열 반환 : /api/generate/:tableName */
app.post("/api/generate/:templateType/:tableName", async (req, res) => {
  const tableName = req.params.tableName;
  const templateType = req.params.templateType;
  const checkedColumns = req.body.checkedColumns || [];
  const ejsParameter = await getEjsParameter(tableName, checkedColumns);
  const generatorResult = getGeneratorResult(tableName, generatorFileMap, ejsParameter, templateType);

  res.json(generatorResult);
});

/* generate 결과물 압축 파일로 반환 : generatorKey 파라미터 존재시 개별 다운로드 */
app.get("/api/generate/:templateType/:tableName/fileDownload", async (req, res) => {
  const tableName = req.params.tableName;
  const templateType = req.params.templateType;
  const generatorKey = req.query.generatorKey;
  const checkedColumns = req.body.checkedColumns || [];
  const ejsParameter = await getEjsParameter(tableName, checkedColumns);
  const generatorResult = getGeneratorResult(tableName, generatorFileMap, ejsParameter, templateType);

  let downloadFileName = "";
  if (generatorKey) {
    const generatorDetailInfo = generatorResult[generatorKey];
    const { resultFileFullPath } = generatorDetailInfo;
    createFiledownloadByGeneratorDetailInfo(generatorDetailInfo);
    downloadFileName = resultFileFullPath;
  } else {
    // generatorKey 파라미터가 존재하지 않으면 전체 다운로드
    downloadFileName = await createZipArchive(tableName, generatorResult);
  }

  res.download(downloadFileName);
});

/* generate 결과물 result/:templateType 폴더에 파일 생성 */
app.get("/api/generate/:templateType/:tableName/fileCreate", async (req, res) => {
  const tableName = req.params.tableName;
  const templateType = req.params.templateType;
  const generatorKey = req.query.generatorKey;
  const checkedColumns = req.body.checkedColumns || [];
  const ejsParameter = await getEjsParameter(tableName, checkedColumns);
  const generatorResult = getGeneratorResult(tableName, generatorFileMap, ejsParameter, templateType);
  if (generatorKey) {
    const generatorDetailInfo = generatorResult[generatorKey];
    createFiledownloadByGeneratorDetailInfo(generatorDetailInfo);
  } else {
    await createAllFile(tableName, generatorResult);
  }

  res.json({ success: true });
});

/* join-sql, select dto generate : file-create, result json */
app.post("/api/generate/joinSql", async (req, res) => {
  const tableNameList = req.body.tableNameList || [];
  const joinConditions = req.body.joinConditions || [];
  const isLeftJoin = req.body.isLeftJoin ? true : false;
  const isRemoveDuplicateColumn = req.body.isRemoveDuplicateColumn ? true : false;
  const applySqlString = `
    ${columnOnlySelectSql}
    WHERE table_name IN (${tableNameList.map(() => "?").join(", ")})
    ORDER BY table_name, ordinal_position`;
  const tableNameListSortInfo = {};
  tableNameList.forEach((tableName, index) => {
    tableNameListSortInfo[tableName] = index + 1;
  });

  console.log("tableNameListSortInfo : ", tableNameListSortInfo);

  let columnList = [];
  try {
    const dbResponse = await db.raw(applySqlString, tableNameList);
    columnList = dbResponse.rows;
  } catch (e) {
    console.log(e);
  }

  // columnList 정렬 : 파라미터 테이블 순서 + ordinal_position 컬럼값 기준으로
  columnList.forEach((columnInfo) => {
    columnInfo.tableSortIndex = tableNameListSortInfo[columnInfo.table_name];
  });
  columnList = _.sortBy(columnList, ["tableSortIndex", "ordinal_position"]);

  const grouped = _.groupBy(columnList, "column_name");
  const duplicates = _.pickBy(grouped, (group) => group.length > 1);
  const duplicateColumns = _.keys(duplicates);

  // 중복된 column_name에서 첫 번째 항목만 유지
  const seen = new Set();
  const filteredList = columnList.filter((item) => {
    if (!isRemoveDuplicateColumn) {
      return true;
    } else {
      if (duplicateColumns.includes(item.column_name)) {
        if (seen.has(item.column_name)) {
          return false; // 이미 추가된 column_name이면 제거
        }
        seen.add(item.column_name);
      }
      return true; // 첫 번째 등장한 경우 유지
    }
  });

  // 컬럼 정보를 테이블별로 분류
  const tableColumns = filteredList.reduce((acc, row) => {
    if (!acc[row.table_name]) acc[row.table_name] = [];
    acc[row.table_name].push({
      column: row.column_name,
      comment: row.column_comment || "",
    });
    return acc;
  }, {});

  // SELECT 문 생성
  const selectColumns = Object.entries(tableColumns)
    .map(([table, columns]) => columns.map((col) => `    ${table}.${col.column} /* ${col.comment} */`).join(",\n"))
    .join(",\n");

  // console.log("tableColumns", tableColumns);
  // console.log("selectColumns", selectColumns);

  // JOIN 조건을 기반으로 FROM ~ JOIN 절 생성
  const fromTable = tableNameList[0]; // 첫 번째 테이블을 FROM으로 지정
  const joinClauses = joinConditions.map((cond) => `${isLeftJoin ? "left " : ""}JOIN ${cond.table} ON ${cond.condition}`).join("\n");

  // 최종 SQL 생성
  const sql = `/* ${fromTable} select join column */
SELECT 
${selectColumns}
FROM ${fromTable}
${joinClauses};
`;

  const dtoEjsParameter = await getResponseDtoEjsParameter(fromTable, filteredList);
  console.log("dtoEjsParameter", dtoEjsParameter);
  const dtoGeneratorString = convertTemplateSqlString(generatorFileMap[Constant.GENERATE_TYPE_DTO], dtoEjsParameter);

  createFiledownloadByGeneratorDetailInfo({
    resultFileFullPath: "./result/sql/ResponseDto.java",
    finalResultString: dtoGeneratorString,
  });

  createFiledownloadByGeneratorDetailInfo({
    resultFileFullPath: "./result/sql/JoinSql.sql",
    finalResultString: sql,
  });

  res.json({ sql: sql, tableColumns: tableColumns });
});

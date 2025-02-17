require("dotenv").config();
const path = require("path");
const _ = require("lodash");
const ejs = require("ejs");
const fs = require("fs");
const AdmZip = require("adm-zip");
const { tableSelectSql, columnSelectSql } = require("./sql-string");
const Config = require("./config");
const pgFormatter = require("pg-formatter");

const testSqlString = `INSERT INTO TO0_CORPORATION
(A_DOC_KEY, A_DOC_NUM, SITE_KEY, A_DOC_NAME, SEND_TYPE_CODE, DOC_TYPE_CODE, REAL_A_STATUS, SECRET_LEVEL_CODE, OPEN_TYPE, TIME_LIMIT, DEPT_KEY, SPEED_YN, SECURITY_YN, SECURITY_END_DAY, HISTORY_M_YN, PAGE, A_SUMMARY, BEFORE_A_DOC_KEY, BEFORE_R_DOC_KEY, ATTACHED_YN, HISTORY_YN, DISPLAY_YN, RETURN_YN, RECOVERY_YN, COMMENTS_YN, EXECUTE_DATE, DRAFT_DATE, DRAFT_USER_KEY, REG_USER_KEY, MOD_DATE, MOD_USER_KEY, USE_YN, S_DOC_KEY, RECORDS_NUM, A_END_DATE, R_DEPT_YN, STORAGE_KEY, P_REG_NUM, IO_DIV, ADD_COL1, ADD_COL2, ADD_COL3, ADD_COL4, ADD_COL5, ADD_COL6)
VALUES(#{aDocKey}, #{aDocNum}, #{siteKey}, #{aDocName}, #{sendTypeCode}, #{docTypeCode}, #{realAStatus}, #{secretLevelCode}, #{openType}, #{timeLimit}, #{deptKey}, #{speedYn}, #{securityYn}, #{securityEndDay}, #{historyMYn}, #{page}, #{aSummary}, #{beforeADocKey}, #{beforeRDocKey}, #{attachedYn}, #{historyYn}, #{displayYn}, #{returnYn}, #{recoveryYn}, #{commentsYn}, #{executeDate}, #{draftDate}, #{draftUserKey}, #{regUserKey}, #{modDate}, #{modUserKey}, #{useYn}, #{sDocKey}, #{recordsNum}, #{aEndDate}, #{rDeptYn}, #{storageKey}, #{pRegNum}, #{ioDiv}, #{addCol1}, #{addCol2}, #{addCol3}, #{addCol4}, #{addCol5}, #{addCol6})`;

const testSqlString2 = `select cor_name, cor_key from TO0_CORPORATION where 1=1 and cor_name =''`;

// const {
//   listComponentGenerateString,
//   formStoreGenerateString,
//   formViewGenerateString,
//   detailViewGenerateString,
//   detailViewGenerateNoStoreString,
//   formModalGenerateString,
//   formUseStateModalGenerateString,
//   detailModalGenerateString,
//   searchFormGenerateString,
// } = require("./generate-string");

// DB 정보
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE, SERVER_PORT } = process.env;
const db = require("knex")({
  client: "pg",
  version: "7.2",
  connection: {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
  },
});

// generator map 변수
const generatorFileMap = {};

// ======= server init start =======
const express = require("express");
const app = express();
const cors = require("cors");
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
if (!fs.existsSync(resultDirectory)) {
  fs.mkdirSync(resultDirectory);
}

console.log(`Config : `, Config);

readTemplateFile();

// ======= server init end =======

// test api

app.get("/api/test", async (req, res) => {
  // const formatResult = format(testSqlString);
  // const formatResult = pgFormatter.format(testSqlString);
  // const formatResult = pgFormatter.format(testSqlString, {
  //   params: {}, // `#{}` 변수를 그대로 유지하는 효과는 없음
  // });
  // console.info("formatResult", formatResult);

  // start

  // 1. `#{}` 변수를 임시 플레이스홀더로 변경
  const placeholderMap = {};
  let index = 0;

  const transformedSQL = testSqlString.replace(/#\{([^}]+)\}/g, (_, key) => {
    const placeholder = `__PLACEHOLDER_${index++}__`;
    placeholderMap[placeholder] = `#{${key}}`;
    return placeholder;
  });

  // 2. SQL 포맷팅 수행
  const formattedSQL = pgFormatter.format(transformedSQL);

  // 3. 포맷된 SQL에서 원래 `#{}` 변수를 복원
  const finalSQL = formattedSQL.replace(/__PLACEHOLDER_\d+__/g, (match) => placeholderMap[match]);

  console.log(finalSQL);

  // end
  res.json({
    result: finalSQL,
    orginal: testSqlString,
  });
});

// 테이블 조회 : /api/tables
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

// 테이블명 기준으로 컬럼 정보 조회 : /api/columns
app.get("/api/columns/:tableName", async (req, res) => {
  const tableName = req.params.tableName;
  let columnList = [];
  try {
    const dbResponse = await db.raw(columnSelectSql, [tableName]);
    columnList = dbResponse.rows;
    // 컬럼주석명이 존재하지 않을 경우 낙타표기법 컬럼명으로 대체
    // converColumnList(columnList);
    console.log(columnList);
  } catch (e) {
    console.log(e);
  }

  res.json({
    list: columnList,
  });
});

// api/generate/backend/{generateType} { tableName, checkedColumns }
// api/generate/frontend

// namespace, packageName, entityName, tableName, columnNames, primaryKeyConditions, nowDateSqlString
// isMapper => namespace (풀패키지) 아니면 entityName

function readTemplateFile() {
  // 1. 템플릿 파일을 미리 읽어서 메모리에 저장
  const templateFileList = Config.templateFileList;
  templateFileList.forEach((templateFileInfo) => {
    const { generatorKey, fileName } = templateFileInfo;
    const templateFilePath = path.join(__dirname, `templates/${fileName}`);
    const templateFileContent = fs.readFileSync(templateFilePath, "utf-8");
    generatorFileMap[generatorKey] = templateFileContent;
  });
}

function applyEjsRender(ejsContent, ejsParameter) {
  return ejs.render(ejsContent, ejsParameter);
}

// 1.templates file 기준으로 : SQL.xml 데이터 바인딩 및 특정한 경로에 파일 생성
//  -api/generator/backend/{type} => type 'sql' || 'dto' | 'dao : test' | 'service' | 'controller'

/*
  1.templates에 있는 SQL.xml 파일을 읽어서 단순하게 바인딩하는 예제 확인
   1-1.g 기준 replace
   1-2.ejb 라이브러리 사용

  2.

*/

function getApplyFileName(camelCaseTableName) {
  // let camelCaseTableName = _.camelCase(tableName);
  // return camelCaseTableName.charAt(0).toUpperCase() + camelCaseTableName.slice(1);
  // 테이블명이 tb_로 시작해서 앞을 자름
  return camelCaseTableName.slice(2);
}

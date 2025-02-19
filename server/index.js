require("dotenv").config();
const path = require("path");
const _ = require("lodash");
const fs = require("fs");
const { SERVER_PORT } = process.env;
const { tableSelectSql, columnSelectSql } = require("./sql-string");
const Config = require("./config");
const { readTemplateFile, formatSqlString, getEjsParameter, getGeneratorResult, createAllFile, createZipArchive, createFiledownloadByGeneratorDetailInfo } = require("./util");
const db = require("./db");

const testSqlString = `INSERT INTO TO0_CORPORATION
(A_DOC_KEY, A_DOC_NUM, SITE_KEY, A_DOC_NAME, SEND_TYPE_CODE, DOC_TYPE_CODE, REAL_A_STATUS, SECRET_LEVEL_CODE, OPEN_TYPE, TIME_LIMIT, DEPT_KEY, SPEED_YN, SECURITY_YN, SECURITY_END_DAY, HISTORY_M_YN, PAGE, A_SUMMARY, BEFORE_A_DOC_KEY, BEFORE_R_DOC_KEY, ATTACHED_YN, HISTORY_YN, DISPLAY_YN, RETURN_YN, RECOVERY_YN, COMMENTS_YN, EXECUTE_DATE, DRAFT_DATE, DRAFT_USER_KEY, REG_USER_KEY, MOD_DATE, MOD_USER_KEY, USE_YN, S_DOC_KEY, RECORDS_NUM, A_END_DATE, R_DEPT_YN, STORAGE_KEY, P_REG_NUM, IO_DIV, ADD_COL1, ADD_COL2, ADD_COL3, ADD_COL4, ADD_COL5, ADD_COL6)
VALUES(#{aDocKey}, #{aDocNum}, #{siteKey}, #{aDocName}, #{sendTypeCode}, #{docTypeCode}, #{realAStatus}, #{secretLevelCode}, #{openType}, #{timeLimit}, #{deptKey}, #{speedYn}, #{securityYn}, #{securityEndDay}, #{historyMYn}, #{page}, #{aSummary}, #{beforeADocKey}, #{beforeRDocKey}, #{attachedYn}, #{historyYn}, #{displayYn}, #{returnYn}, #{recoveryYn}, #{commentsYn}, #{executeDate}, #{draftDate}, #{draftUserKey}, #{regUserKey}, #{modDate}, #{modUserKey}, #{useYn}, #{sDocKey}, #{recordsNum}, #{aEndDate}, #{rDeptYn}, #{storageKey}, #{pRegNum}, #{ioDiv}, #{addCol1}, #{addCol2}, #{addCol3}, #{addCol4}, #{addCol5}, #{addCol6})`;

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
const resultBackendDirectory = path.join(__dirname, "result" + path.sep + "backend");
const resultFrontendDirectory = path.join(__dirname, "result" + path.sep + "frontend");
if (!fs.existsSync(resultDirectory)) {
  fs.mkdirSync(resultDirectory);
}
if (!fs.existsSync(resultBackendDirectory)) {
  fs.mkdirSync(resultBackendDirectory);
}
if (!fs.existsSync(resultFrontendDirectory)) {
  fs.mkdirSync(resultFrontendDirectory);
}

// Config log print
console.log(`Config : `, Config);

// generator map 변수 셋팅
const generatorFileMap = {};
readTemplateFile(generatorFileMap);

// ======= server init end =======

/* 기본 기능 테스트 api */
app.get("/api/test", async (req, res) => {
  const finalSQL = formatSqlString(testSqlString);
  console.log(finalSQL);
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

// generate 문자열 반환 : /api/generate/:tableName
app.post("/api/generate/:templateType/:tableName", async (req, res) => {
  const tableName = req.params.tableName;
  const templateType = req.params.templateType;
  // let checkedColumns = req.body.checkedColumns || [];
  // let checkedMultiColumn = req.body.checkedMultiColumn;
  // let checkedModalUseState = req.body.checkedModalUseState;
  // let checkedInnerFormStore = req.body.checkedInnerFormStore;
  // let checkedSearchFormDetail = req.body.checkedSearchFormDetail;
  const ejsParameter = await getEjsParameter(tableName);
  const generatorResult = getGeneratorResult(tableName, generatorFileMap, ejsParameter, templateType);

  res.json(generatorResult);
});

// generate 결과물 압축 파일로 반환 : generatorKey 파라미터 존재시 개별 다운로드
app.get("/api/generate/:templateType/:tableName/fileDownload", async (req, res) => {
  const tableName = req.params.tableName;
  const templateType = req.params.templateType;
  const generatorKey = req.query.generatorKey;
  const ejsParameter = await getEjsParameter(tableName);
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

// generate 결과물 result/:templateType 폴더에 파일 생성
app.get("/api/generate/:templateType/:tableName/fileCreate", async (req, res) => {
  const tableName = req.params.tableName;
  const templateType = req.params.templateType;
  const generatorKey = req.query.generatorKey;
  const ejsParameter = await getEjsParameter(tableName);
  const generatorResult = getGeneratorResult(tableName, generatorFileMap, ejsParameter, templateType);

  let downloadFileName = "";
  if (generatorKey) {
    const generatorDetailInfo = generatorResult[generatorKey];
    createFiledownloadByGeneratorDetailInfo(generatorDetailInfo);
  } else {
    await createAllFile(tableName, generatorResult);
  }

  res.json({ success: true });
});

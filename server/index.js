require("dotenv").config();
const path = require("path");
const _ = require("lodash");
const fs = require("fs");
const { SERVER_PORT } = process.env;
const { tableSelectSql, columnSelectSql } = require("./sql-string");
const Config = require("./config");
const Code = require("./code");
const { readTemplateFile, getEjsParameter, getGeneratorResult, createAllFile, createZipArchive, createFiledownloadByGeneratorDetailInfo } = require("./util");
const db = require("./db");

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

/* 테이블명 기준으로 컬럼 정보 조회 : /api/columns */
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

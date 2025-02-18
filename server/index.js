require("dotenv").config();
const path = require("path");
const _ = require("lodash");
const ejs = require("ejs");
const fs = require("fs");
const AdmZip = require("adm-zip");
const { tableSelectSql, tableSelectSqlEqual, columnSelectSql } = require("./sql-string");
const Config = require("./config");
const Constant = require("./constant");
const pgFormatter = require("pg-formatter");
const tableEntityMapping = require("./table-mapping");

const testSqlString = `INSERT INTO TO0_CORPORATION
(A_DOC_KEY, A_DOC_NUM, SITE_KEY, A_DOC_NAME, SEND_TYPE_CODE, DOC_TYPE_CODE, REAL_A_STATUS, SECRET_LEVEL_CODE, OPEN_TYPE, TIME_LIMIT, DEPT_KEY, SPEED_YN, SECURITY_YN, SECURITY_END_DAY, HISTORY_M_YN, PAGE, A_SUMMARY, BEFORE_A_DOC_KEY, BEFORE_R_DOC_KEY, ATTACHED_YN, HISTORY_YN, DISPLAY_YN, RETURN_YN, RECOVERY_YN, COMMENTS_YN, EXECUTE_DATE, DRAFT_DATE, DRAFT_USER_KEY, REG_USER_KEY, MOD_DATE, MOD_USER_KEY, USE_YN, S_DOC_KEY, RECORDS_NUM, A_END_DATE, R_DEPT_YN, STORAGE_KEY, P_REG_NUM, IO_DIV, ADD_COL1, ADD_COL2, ADD_COL3, ADD_COL4, ADD_COL5, ADD_COL6)
VALUES(#{aDocKey}, #{aDocNum}, #{siteKey}, #{aDocName}, #{sendTypeCode}, #{docTypeCode}, #{realAStatus}, #{secretLevelCode}, #{openType}, #{timeLimit}, #{deptKey}, #{speedYn}, #{securityYn}, #{securityEndDay}, #{historyMYn}, #{page}, #{aSummary}, #{beforeADocKey}, #{beforeRDocKey}, #{attachedYn}, #{historyYn}, #{displayYn}, #{returnYn}, #{recoveryYn}, #{commentsYn}, #{executeDate}, #{draftDate}, #{draftUserKey}, #{regUserKey}, #{modDate}, #{modUserKey}, #{useYn}, #{sDocKey}, #{recordsNum}, #{aEndDate}, #{rDeptYn}, #{storageKey}, #{pRegNum}, #{ioDiv}, #{addCol1}, #{addCol2}, #{addCol3}, #{addCol4}, #{addCol5}, #{addCol6})`;

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
readTemplateFile();

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

// api/generate/frontend

// generate 문자열 반환 : /api/generate/:tableName
app.post("/api/generate/:templateType/:tableName", async (req, res) => {
  const tableName = req.params.tableName;
  const templateType = req.params.templateType;
  // let checkedColumns = req.body.checkedColumns || [];
  // let checkedMultiColumn = req.body.checkedMultiColumn;
  // let checkedModalUseState = req.body.checkedModalUseState;
  // let checkedInnerFormStore = req.body.checkedInnerFormStore;
  // let checkedSearchFormDetail = req.body.checkedSearchFormDetail;
  const result = {};
  const entityName = getEntityNameByTableName(tableName);
  const entityNameFirstLower = _.lowerFirst(entityName);
  const apiPath = getApiPathNameByTableName(tableName);

  let columnList = [];
  let tableDescription = "";

  try {
    const dbResponse1 = await db.raw(tableSelectSqlEqual, [tableName]);
    const dbResponse2 = await db.raw(columnSelectSql, [tableName]);
    columnList = dbResponse2.rows;
    console.log(columnList);
    tableDescription = dbResponse1.rows[0].table_comment;
    console.log("tableDescription : ", tableDescription);
  } catch (e) {
    console.log(e);
  }

  let selectColumnNames = "";
  let pkColumnList = columnList.filter((columnInfo) => columnInfo.is_primary_key === "Y");
  let saveColumnList = columnList.filter((columnInfo) => {
    const { column_name } = columnInfo;
    if (Config.basicColumnList.find((basicColumnName) => basicColumnName === column_name)) {
      return false;
    }
    return true;
  });

  let primaryKeyConditions = "";
  if (pkColumnList.length !== 0) {
    pkColumnList.forEach((pkColumnInfo) => {
      const { column_name } = pkColumnInfo;
      primaryKeyConditions = primaryKeyConditions + ` AND ${column_name} = #{${_.camelCase(column_name)}}`;
    });
  }

  let insertColumns = "";
  let insertValues = "";
  let updateColums = "";
  let dtoMembers = "";

  columnList.forEach((columnDbInfo, columnListIndex) => {
    const { column_name, column_comment, camel_case } = columnDbInfo;
    // 마지막이 아닌 경우에만 반영
    if (columnListIndex !== columnList.length - 1) {
      selectColumnNames = selectColumnNames + `${columnListIndex !== 0 ? "\t\t\t\t" + column_name : column_name}, /* ${column_comment} */ \n`;
      // selectColumnNames = selectColumnNames + `${columnListIndex !== 0 ? "\t\t\t\t" + column_name : column_name} as ${camel_case}, /* ${column_comment} */ \n`;
    } else {
      selectColumnNames = selectColumnNames + `${columnListIndex !== 0 ? "\t\t\t\t" + column_name : column_name} /* ${column_comment} */`;
      // selectColumnNames = selectColumnNames + `${columnListIndex !== 0 ? "\t\t\t\t" + column_name : column_name} as ${camel_case} /* ${column_comment} */`;
    }
  });

  let existNotNullColumn = false;
  let existNotBlankColumn = false;

  saveColumnList.forEach((columnDbInfo, columnListIndex) => {
    const { column_name, java_type, column_comment, camel_case, is_nullable } = columnDbInfo;
    let notNullAnnotationApply = false;
    let notBlankAnnotationApply = false;
    // 마지막이 아닌 경우에만 반영
    if (columnListIndex !== saveColumnList.length - 1) {
      insertColumns = insertColumns + column_name + ", ";
      insertValues = insertValues + `#{${camel_case}}, `;
      updateColums = updateColums + `${column_name} = #{${camel_case}}, `;
    } else {
      insertColumns = insertColumns + column_name;
      insertValues = insertValues + `#{${camel_case}}`;
      updateColums = updateColums + `${column_name} = #{${camel_case}}`;
    }
    if (is_nullable) {
      if (java_type === "String") {
        existNotBlankColumn = true;
        notBlankAnnotationApply = true;
      } else {
        existNotNullColumn = true;
        notNullAnnotationApply = true;
      }
    }
    if (notNullAnnotationApply) {
      dtoMembers = dtoMembers + `\t@Schema(description = "${column_comment}")\n\t@NotNull\n` + `\tprivate ${java_type} ${camel_case};\n\n`;
    } else if (notBlankAnnotationApply) {
      dtoMembers = dtoMembers + `\t@Schema(description = "${column_comment}")\n\t@NotBlank\n` + `\tprivate ${java_type} ${camel_case};\n\n`;
    } else {
      dtoMembers = dtoMembers + `\t@Schema(description = "${column_comment}")\n` + `\tprivate ${java_type} ${camel_case};\n\n`;
    }
  });

  const ejsParameter = {
    tableDescription: tableDescription,
    columnList: columnList,
    saveColumnList: saveColumnList,
    packageName: Config.javaBasePackage,
    mapperNamespace: entityName,
    tableName: tableName,
    entityName: entityName,
    selectColumnNames: selectColumnNames,
    primaryKeyConditions: primaryKeyConditions,
    insertColumns: insertColumns,
    insertValues: insertValues,
    updateColums: updateColums,
    nowDateSqlString: Config.nowDateSqlString,
    dtoMembers: dtoMembers,
    existNotNullColumn: existNotNullColumn,
    existNotBlankColumn: existNotBlankColumn,
    apiRootPath: Config.apiRootPath,
    apiPath: apiPath,
    entityNameFirstLower: entityNameFirstLower,
    idDefaultJavaType: Config.idDefaultJavaType,
  };

  const generatorFileMapKeys = _.keys(generatorFileMap);
  generatorFileMapKeys.forEach((generatorKey) => {
    const templateContentString = generatorFileMap[generatorKey];
    ejsParameter.mapperNamespace = entityName;
    let resultFileName = "";
    if (generatorKey === Constant.GENERATE_TYPE_SQL) {
      resultFileName = `${entityName}Sql.xml`;
    } else if (generatorKey === Constant.GENERATE_TYPE_MAPPER_SQL) {
      ejsParameter.mapperNamespace = `${Config.javaBasePackage}.mapper.${entityName}Mapper`;
      resultFileName = `${entityName}Mapper.xml`;
    } else if (generatorKey === Constant.GENERATE_TYPE_DTO) {
      resultFileName = `${entityName}Dto.java`;
    } else if (generatorKey === Constant.GENERATE_TYPE_MYABITS_MAPPER) {
      resultFileName = `${entityName}Mapper.java`;
    } else if (generatorKey === Constant.GENERATE_TYPE_CONTROLLER) {
      resultFileName = `${entityName}Controller.java`;
    } else if (generatorKey === Constant.GENERATE_TYPE_SERVICE_INTERFACE) {
      resultFileName = `${entityName}Service.java`;
    } else if (generatorKey === Constant.GENERATE_TYPE_SERVICE_CLASS) {
      resultFileName = `${entityName}ServiceImpl.java`;
    } else if (generatorKey === Constant.GENERATE_TYPE_SERVICE_CLASS_MAPPER) {
      resultFileName = `${entityName}ServiceMapperImpl.java`;
    } else if (generatorKey === Constant.GENERATE_TYPE_TEST_COMMON_DAO) {
      resultFileName = `${entityName}DaoTest.java`;
    } else if (generatorKey === Constant.GENERATE_TYPE_TEST_MYBATIS_MAPPER) {
      resultFileName = `${entityName}MapperTest.java`;
    }

    let bindMappingResultString = "";
    if (resultFileName) {
      bindMappingResultString = convertTemplateSqlString(templateContentString, ejsParameter);
      fs.writeFileSync(`./result/${templateType}/${resultFileName}`, bindMappingResultString);
    } else {
      // postman인 경우 : ejsParameter 기준으로 json을 만들어서 파일로 생성
      if (generatorKey === Constant.GENERATE_TYPE_POSTMAN) {
        bindMappingResultString = getPostmanJsonStringByEjsParameter(ejsParameter);
        fs.writeFileSync(`./result/${templateType}/${entityName}Postman.json`, bindMappingResultString);
      }
    }

    console.log("bindMappingResultString : ", bindMappingResultString);
    result[generatorKey] = bindMappingResultString;
  });

  res.json(result);
});

/* 서버 구동시 generatorFileMap 변수에 generatorKey, fileName 반영 */
function readTemplateFile() {
  const templateFileList = Config.templateFileList;
  templateFileList.forEach((templateFileInfo) => {
    const { generatorKey, fileName, templateType } = templateFileInfo;
    if (fileName) {
      const templateFilePath = path.join(__dirname, `templates/${templateType}/${fileName}`);
      const templateFileContent = fs.readFileSync(templateFilePath, "utf-8");
      generatorFileMap[generatorKey] = templateFileContent;
    } else {
      generatorFileMap[generatorKey] = "";
    }
  });
}

/* ejs 렌더와 format을 동시에하는 함수 */
function convertTemplateSqlString(sqlString, ejsParameter) {
  // return formatSqlString(applyEjsRender(sqlString, ejsParameter));
  return applyEjsRender(sqlString, ejsParameter);
}

/* ejs 렌더 */
function applyEjsRender(ejsContent, ejsParameter) {
  return ejs.render(ejsContent, ejsParameter);
}

/* 테이블명을 기준으로 Entity명(기준명) 추출 */
function getEntityNameByTableName(tableName) {
  return tableEntityMapping[tableName.toUpperCase()].entityName;
}

/* 테이블명을 기준으로 apiPath 추출 */
function getApiPathNameByTableName(tableName) {
  const entityName = tableEntityMapping[tableName.toUpperCase()].entityName;
  const apiPath = tableEntityMapping[tableName.toUpperCase()].apiPath;
  if (apiPath) {
    return apiPath;
  }
  return `/${_.kebabCase(entityName)}`;
}

/* sql 문자열 포맷팅 */
function formatSqlString(ejsRenderAfterSqlString) {
  const placeholderMap = {};
  let index = 0;
  const transformedSQL = ejsRenderAfterSqlString.replace(/#\{([^}]+)\}/g, (_, key) => {
    const placeholder = `__PLACEHOLDER_${index++}__`;
    placeholderMap[placeholder] = `#{${key}}`;
    return placeholder;
  });
  const formattedSQL = pgFormatter.format(transformedSQL);
  const finalSQL = formattedSQL.replace(/__PLACEHOLDER_\d+__/g, (match) => placeholderMap[match]);
  return finalSQL;
}

/* postman json 추출 */
function getPostmanJsonStringByEjsParameter(ejsParameter) {
  const { tableDescription, columnList, apiRootPath, apiPath } = ejsParameter;
  const result = {
    info: {
      name: `${tableDescription} API`,
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
  };

  const requestList = [];
  const requestBody = {};
  columnList.forEach((columnDbInfo, columnListIndex) => {
    const { camel_case, java_type } = columnDbInfo;
    requestBody[camel_case] = "";
  });

  // 상세 : get
  requestList.push({
    name: `${tableDescription} 상세 조회`,
    request: {
      method: "GET",
      header: [
        {
          key: "Content-Type",
          value: "application/json",
        },
      ],
      url: {
        raw: "{{hostname}}" + `${apiRootPath}${apiPath}/id1`,
        host: ["{{hostname}}"],
        path: [`${apiRootPath}${apiPath}`, "id1"],
      },
    },
  });

  // 목록 : get
  requestList.push({
    name: `${tableDescription} 목록 조회`,
    request: {
      method: "GET",
      header: [
        {
          key: "Content-Type",
          value: "application/json",
        },
      ],
      url: {
        raw: "{{hostname}}" + `${apiRootPath}${apiPath}`,
        host: ["{{hostname}}"],
        path: [`${apiRootPath}${apiPath}`],
      },
    },
  });

  // 추가 : post
  requestList.push({
    name: `${tableDescription} 추가`,
    request: {
      method: "POST",
      header: [
        {
          key: "Content-Type",
          value: "application/json",
        },
      ],
      body: {
        mode: "raw",
        raw: JSON.stringify(requestBody, null, 2),
      },
      url: {
        raw: "{{hostname}}" + `${apiRootPath}${apiPath}`,
        host: ["{{hostname}}"],
        path: [`${apiRootPath}${apiPath}`],
      },
    },
  });

  // 수정 : put
  requestList.push({
    name: `${tableDescription} 수정`,
    request: {
      method: "PUT",
      header: [
        {
          key: "Content-Type",
          value: "application/json",
        },
      ],
      body: {
        mode: "raw",
        raw: JSON.stringify(requestBody, null, 2),
      },
      url: {
        raw: "{{hostname}}" + `${apiRootPath}${apiPath}/id1`,
        host: ["{{hostname}}"],
        path: [`${apiRootPath}${apiPath}`, "id1"],
      },
    },
  });

  // 삭제
  requestList.push({
    name: `${tableDescription} 삭제`,
    request: {
      method: "DELETE",
      header: [
        {
          key: "Content-Type",
          value: "application/json",
        },
      ],
      body: {
        mode: "raw",
        raw: JSON.stringify({}, null, 2),
      },
      url: {
        raw: "{{hostname}}" + `${apiRootPath}${apiPath}/id1`,
        host: ["{{hostname}}"],
        path: [`${apiRootPath}${apiPath}`, "id1"],
      },
    },
  });

  result.item = requestList;
  return JSON.stringify(result, null, 2);
}

const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const ejs = require("ejs");
const pgFormatter = require("pg-formatter");
const Config = require("./config");
const tableEntityMapping = require("./table-mapping");

/* 서버 구동시 generatorFileMap 변수에 generatorKey, fileName 반영 */
function readTemplateFile(generatorFileMap) {
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

// ✅ 여러 개의 변수를 객체로 내보내기
module.exports = {
  readTemplateFile,
  convertTemplateSqlString,
  applyEjsRender,
  getEntityNameByTableName,
  getApiPathNameByTableName,
  formatSqlString,
  getPostmanJsonStringByEjsParameter,
};

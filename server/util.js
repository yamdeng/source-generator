const fs = require("fs");
const AdmZip = require("adm-zip");
const path = require("path");
const _ = require("lodash");
const ejs = require("ejs");
const pgFormatter = require("pg-formatter");
const { tableSelectSqlEqual, columnSelectSql } = require("./sql-string");
const Config = require("./config");
const Constant = require("./constant");
const tableEntityMapping = require("./table-mapping");
const db = require("./db");

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
  const tableEntityMappingInfo = tableEntityMapping[tableName.toUpperCase()];
  if (tableEntityMappingInfo) {
    return tableEntityMappingInfo.entityName;
  } else {
    return _.upperFirst(_.camelCase(tableName.split("_").slice(1).join("_")));
  }
}

/* 테이블명을 기준으로 apiPath 추출 */
function getApiPathNameByTableName(tableName) {
  const tableEntityMappingInfo = tableEntityMapping[tableName.toUpperCase()];
  if (tableEntityMappingInfo) {
    const { entityName, apiPath } = tableEntityMappingInfo;
    if (apiPath) {
      return apiPath;
    } else {
      return `/${_.kebabCase(entityName)}`;
    }
  } else {
    return `${Config.apiRootPath}/${_.kebabCase(_.camelCase(tableName.split("_").slice(1).join("_")))}`;
  }
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
    if (java_type === "String") {
      requestBody[camel_case] = "";
    } else {
      requestBody[camel_case] = null;
    }
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

/* file 하나만 생성 */
async function createFiledownloadByGeneratorDetailInfo(generatorDetailInfo) {
  try {
    const { resultFileFullPath, finalResultString } = generatorDetailInfo;
    fs.writeFileSync(resultFileFullPath, finalResultString);
  } catch (e) {
    console.log(`Something went wrong. ${e}`);
  }
}

/* 파일 생성 */
async function createAllFile(tableName, generatorResult) {
  const entityName = getEntityNameByTableName(tableName);
  const generatorResultKeys = _.keys(generatorResult);
  try {
    generatorResultKeys.forEach((key) => {
      const generatorDetailInfo = generatorResult[key];
      const { resultFileFullPath, finalResultString } = generatorDetailInfo;
      fs.writeFileSync(resultFileFullPath, finalResultString);
    });
    console.log(`Created all file successfully`);
  } catch (e) {
    console.log(`createAllFile error. ${e}`);
  }
}

/* 파일 압축 */
async function createZipArchive(tableName, generatorResult) {
  const entityName = getEntityNameByTableName(tableName);
  let zipFileName = `./result/${entityName}-all.zip`;
  const generatorResultKeys = _.keys(generatorResult);
  try {
    const zip = new AdmZip();
    const childFileFullPathList = [];

    generatorResultKeys.forEach((key) => {
      const generatorDetailInfo = generatorResult[key];
      const { resultFileFullPath, finalResultString } = generatorDetailInfo;
      fs.writeFileSync(resultFileFullPath, finalResultString);
      childFileFullPathList.push(resultFileFullPath);
    });
    childFileFullPathList.forEach((fileName) => {
      zip.addLocalFile(fileName);
    });

    zip.writeZip(zipFileName);
    console.log(`Created ${zipFileName} successfully`);
  } catch (e) {
    console.log(`createZipArchive error. ${e}`);
  }
  return zipFileName;
}

/* ejs 템플릿 파일에 바인딩할 종합 파라미터 추출 */
async function getEjsParameter(tableName, checkedColumns) {
  const entityName = getEntityNameByTableName(tableName);
  const entityNameFirstLower = _.lowerFirst(entityName);
  const apiPath = getApiPathNameByTableName(tableName);

  let columnList = checkedColumns || [];
  let tableDescription = "";

  try {
    const dbResponse1 = await db.raw(tableSelectSqlEqual, [tableName]);
    if (!checkedColumns || !checkedColumns.length) {
      const dbResponse2 = await db.raw(columnSelectSql, [tableName]);
      columnList = dbResponse2.rows;
    }
    console.log(columnList);
    tableDescription = dbResponse1.rows[0].table_comment;
    console.log("tableDescription : ", tableDescription);
  } catch (e) {
    console.log(e);
  }

  let existJsonProperty = false;

  // columnList 속성 재반영
  columnList.forEach((columnDbInfo) => {
    const { camel_case } = columnDbInfo;
    // 첫번째 문자가 소문자이고 두번째 문자가 대문자인지 확인
    if (isFirstLowerSecondUpper(camel_case)) {
      columnDbInfo.isFirstLowerSecondUpper = true;
      existJsonProperty = true;
    } else {
      columnDbInfo.isFirstLowerSecondUpper = false;
    }
  });

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
  let updateColumns = "";
  let dtoMembers = "";

  // mybatis null check
  let ifCheckInsertColumns = "";
  let ifCheckInsertValues = "";
  let ifCheckUpdateColumns = "";

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
    const { column_name, java_type, column_comment, camel_case, is_nullable, is_primary_key, isFirstLowerSecondUpper } = columnDbInfo;
    let notNullAnnotationApply = false;
    let notBlankAnnotationApply = false;
    // 마지막이 아닌 경우에만 반영
    if (columnListIndex !== saveColumnList.length - 1) {
      insertColumns = insertColumns + column_name + ", ";
      insertValues = insertValues + `#{${camel_case}}, `;
      if (is_primary_key !== "Y") {
        updateColumns = updateColumns + `${column_name} = #{${camel_case}}, `;
      }
    } else {
      insertColumns = insertColumns + column_name;
      insertValues = insertValues + `#{${camel_case}}`;
      if (is_primary_key !== "Y") {
        updateColumns = updateColumns + `${column_name} = #{${camel_case}}`;
      }
    }
    if (is_nullable == "NO") {
      existNotNullColumn = true;
      if (java_type === "String") {
        existNotBlankColumn = true;
        notBlankAnnotationApply = true;
      } else {
        notNullAnnotationApply = true;
      }
    }

    if (isFirstLowerSecondUpper) {
      dtoMembers = dtoMembers + `\t@JsonProperty("${camel_case}")\n`;
    }

    if (notBlankAnnotationApply) {
      dtoMembers = dtoMembers + `\t@Schema(description = "${column_comment}")\n\t@NotNull\n\t@NotBlank\n` + `\tprivate ${java_type} ${camel_case};\n\n`;
      // dtoMembers = dtoMembers + `\t@Schema(description = "${column_comment}")\n\t@NotBlank\n` + `\tprivate ${java_type} ${camel_case};\n\n`;
    } else if (notNullAnnotationApply) {
      dtoMembers = dtoMembers + `\t@Schema(description = "${column_comment}")\n\t@NotNull\n` + `\tprivate ${java_type} ${camel_case};\n\n`;
    } else {
      dtoMembers = dtoMembers + `\t@Schema(description = "${column_comment}")\n` + `\tprivate ${java_type} ${camel_case};\n\n`;
    }

    // mybatis <if> 반영 insert, update
    if (is_nullable === "YES" && is_primary_key === "N") {
      ifCheckInsertColumns =
        ifCheckInsertColumns + `\t\t\t\t<if test="${camel_case} != null and !${camel_case}.equals('')">${column_name},</if>${columnListIndex === saveColumnList.length - 1 ? "" : "\n"}`;
      ifCheckInsertValues =
        ifCheckInsertValues + `\t\t\t\t<if test="${camel_case} != null and !${camel_case}.equals('')">#{${camel_case}},</if>${columnListIndex === saveColumnList.length - 1 ? "" : "\n"}`;
      ifCheckUpdateColumns =
        ifCheckUpdateColumns + `\t\t\t\t<if test="${camel_case} != null and ${camel_case} != ''">${column_name} = #{${camel_case}},</if>${columnListIndex === saveColumnList.length - 1 ? "" : "\n"}`;
    } else {
      ifCheckInsertColumns = ifCheckInsertColumns + `\t\t\t\t${column_name},${columnListIndex === saveColumnList.length - 1 ? "" : "\n"}`;
      ifCheckInsertValues = ifCheckInsertValues + `\t\t\t\t#{${camel_case}},${columnListIndex === saveColumnList.length - 1 ? "" : "\n"}`;
      ifCheckUpdateColumns = ifCheckUpdateColumns + `\t\t\t\t${column_name} = #{${camel_case}},${columnListIndex === saveColumnList.length - 1 ? "" : "\n"}`;
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
    updateColumns: updateColumns,
    nowDateSqlString: Config.nowDateSqlString,
    dtoMembers: dtoMembers,
    existJsonProperty: existJsonProperty,
    existNotNullColumn: existNotNullColumn,
    existNotBlankColumn: existNotBlankColumn,
    apiRootPath: Config.apiRootPath,
    apiPath: apiPath,
    entityNameFirstLower: entityNameFirstLower,
    idDefaultJavaType: Config.idDefaultJavaType,
    ifCheckInsertColumns: ifCheckInsertColumns,
    ifCheckInsertValues: ifCheckInsertValues,
    ifCheckUpdateColumns: ifCheckUpdateColumns,
  };

  return ejsParameter;
}

/* generator 결과값을 Map 유형으로 반환 */
function getGeneratorResult(tableName, generatorFileMap, ejsParameter, templateType) {
  const result = {};
  const entityName = getEntityNameByTableName(tableName);
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
    } else if (generatorKey === Constant.GENERATE_TYPE_POSTMAN) {
      resultFileName = `${entityName}Postman.json`;
    }

    let bindMappingResultString = "";

    // postman인 경우 : ejsParameter 기준으로 json을 만들어서 파일로 생성
    if (generatorKey === Constant.GENERATE_TYPE_POSTMAN) {
      bindMappingResultString = getPostmanJsonStringByEjsParameter(ejsParameter);
    } else {
      bindMappingResultString = convertTemplateSqlString(templateContentString, ejsParameter);
    }

    console.log("bindMappingResultString : ", bindMappingResultString);

    result[generatorKey] = {
      resultFileName: resultFileName,
      resultFileFullPath: `./result/${templateType}/${resultFileName}`,
      finalResultString: bindMappingResultString,
    };
  });

  return result;
}

/* 첫번째 문자가 소문자이고 두번째 문자가 대문자인지 체크 */
function isFirstLowerSecondUpper(str) {
  return /^[a-z][A-Z]/.test(str);
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
  createAllFile,
  createZipArchive,
  getEjsParameter,
  getGeneratorResult,
  createFiledownloadByGeneratorDetailInfo,
  isFirstLowerSecondUpper,
};

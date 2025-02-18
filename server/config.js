const Constant = require("./constant");

const Config = {
  javaBasePackage: "com.orbis.gw",
  tablePrefixNameList: ["tas_", "to0_", "tm0_"],
  entityExtractStrategy: Constant.ENTITY_EXTRACT_STRATEGY_BASE,
  defaultNowString: "now()",
  basicColumnList: ["reg_date", "reg_user_key", "mod_date", "mod_user_key"],
  templateFileList: [
    {
      generatorKey: "sql",
      fileName: "sql.ejs",
    },
    {
      generatorKey: "dto",
      fileName: "dto.ejs",
    },
    {
      generatorKey: "controller",
      fileName: "controller.ejs",
    },
  ],
  applyXmlSqlIdEntity: false,
  nowDateSqlString: "now()",
  isMapperNameSpaceFullPackage: false,
  apiRootPath: "/api",
  idDefaultJavaType: "String",
};

module.exports = Config;

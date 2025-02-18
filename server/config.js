const Constant = require("./constant");

const Config = {
  javaBasePackage: "com.orbiswork.gw",
  tablePrefixNameList: ["tas_", "to0_", "tm0_"],
  entityExtractStrategy: Constant.ENTITY_EXTRACT_STRATEGY_BASE,
  defaultNowString: "now()",
  basicColumnList: ["reg_date", "reg_user_key", "mod_date", "mod_user_key"],
  templateFileList: [
    {
      generatorKey: Constant.GENERATE_TYPE_SQL,
      fileName: "sql.ejs",
    },
    {
      generatorKey: Constant.GENERATE_TYPE_MYABITS_MAPPER,
      fileName: "mybatis-mapper.ejs",
    },
    {
      generatorKey: Constant.GENERATE_TYPE_DTO,
      fileName: "dto.ejs",
    },
    {
      generatorKey: Constant.GENERATE_TYPE_CONTROLLER,
      fileName: "controller.ejs",
    },
    {
      generatorKey: Constant.GENERATE_TYPE_SERVICE_INTERFACE,
      fileName: "service-interface.ejs",
    },
    {
      generatorKey: Constant.GENERATE_TYPE_SERVICE_CLASS,
      fileName: "service-class.ejs",
    },
    {
      generatorKey: Constant.GENERATE_TYPE_SERVICE_CLASS_MAPPER,
      fileName: "service-class-mapper.ejs",
    },
  ],
  applyXmlSqlIdEntity: false,
  nowDateSqlString: "now()",
  isMapperNameSpaceFullPackage: false,
  apiRootPath: "/api",
  idDefaultJavaType: "String",
};

module.exports = Config;

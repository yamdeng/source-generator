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
      templateType: Constant.TEMPLATE_TYPE_BACKEND,
      fileName: "sql.ejs",
    },
    {
      generatorKey: Constant.GENERATE_TYPE_MAPPER_SQL,
      templateType: Constant.TEMPLATE_TYPE_BACKEND,
      fileName: "sql.ejs",
    },
    {
      generatorKey: Constant.GENERATE_TYPE_MYABITS_MAPPER,
      templateType: Constant.TEMPLATE_TYPE_BACKEND,
      fileName: "mybatis-mapper.ejs",
    },
    {
      generatorKey: Constant.GENERATE_TYPE_DTO,
      templateType: Constant.TEMPLATE_TYPE_BACKEND,
      fileName: "dto.ejs",
    },
    {
      generatorKey: Constant.GENERATE_TYPE_CONTROLLER,
      templateType: Constant.TEMPLATE_TYPE_BACKEND,
      fileName: "controller.ejs",
    },
    {
      generatorKey: Constant.GENERATE_TYPE_SERVICE_INTERFACE,
      templateType: Constant.TEMPLATE_TYPE_BACKEND,
      fileName: "service-interface.ejs",
    },
    {
      generatorKey: Constant.GENERATE_TYPE_SERVICE_CLASS,
      templateType: Constant.TEMPLATE_TYPE_BACKEND,
      fileName: "service-class.ejs",
    },
    {
      generatorKey: Constant.GENERATE_TYPE_SERVICE_CLASS_MAPPER,
      templateType: Constant.TEMPLATE_TYPE_BACKEND,
      fileName: "service-class-mapper.ejs",
    },
    {
      generatorKey: Constant.GENERATE_TYPE_TEST_COMMON_DAO,
      templateType: Constant.TEMPLATE_TYPE_BACKEND,
      fileName: "test-common-dao.ejs",
    },
    {
      generatorKey: Constant.GENERATE_TYPE_TEST_MYBATIS_MAPPER,
      templateType: Constant.TEMPLATE_TYPE_BACKEND,
      fileName: "test-mybatis-mapper.ejs",
    },
    {
      generatorKey: Constant.GENERATE_TYPE_POSTMAN,
      templateType: Constant.TEMPLATE_TYPE_BACKEND,
    },
  ],
  applyXmlSqlIdEntity: false,
  nowDateSqlString: "now()",
  isMapperNameSpaceFullPackage: false,
  apiRootPath: "/api",
  idDefaultJavaType: "String",
};

module.exports = Config;

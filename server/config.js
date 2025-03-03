const Constant = require("./constant");

// mybatis에 <if> 반영 여부
const isSqlSaveQueryNullCheck = false;

const Config = {
  javaBasePackage: "com.orbiswork.gw",
  tablePrefixNameList: ["tas_", "to0_", "tm0_"],
  defaultNowString: "now()",
  basicColumnList: ["reg_date", "reg_user_key", "mod_date", "mod_user_key"],
  isSqlSaveQueryNullCheck: isSqlSaveQueryNullCheck,
  templateFileList: [
    {
      generatorKey: Constant.GENERATE_TYPE_SQL,
      templateType: Constant.TEMPLATE_TYPE_BACKEND,
      fileName: isSqlSaveQueryNullCheck ? "sql-null-check.ejs" : "sql.ejs",
      default: true,
    },
    {
      generatorKey: Constant.GENERATE_TYPE_MAPPER_SQL,
      templateType: Constant.TEMPLATE_TYPE_BACKEND,
      fileName: isSqlSaveQueryNullCheck ? "sql-null-check.ejs" : "sql.ejs",
      default: false,
    },
    {
      generatorKey: Constant.GENERATE_TYPE_MYABITS_MAPPER,
      templateType: Constant.TEMPLATE_TYPE_BACKEND,
      fileName: "mybatis-mapper.ejs",
      default: false,
    },
    {
      generatorKey: Constant.GENERATE_TYPE_DTO,
      templateType: Constant.TEMPLATE_TYPE_BACKEND,
      fileName: "dto.ejs",
      default: true,
    },
    {
      generatorKey: Constant.GENERATE_TYPE_CONTROLLER,
      templateType: Constant.TEMPLATE_TYPE_BACKEND,
      fileName: "controller.ejs",
      default: true,
    },
    {
      generatorKey: Constant.GENERATE_TYPE_SERVICE_INTERFACE,
      templateType: Constant.TEMPLATE_TYPE_BACKEND,
      fileName: "service-interface.ejs",
      default: true,
    },
    {
      generatorKey: Constant.GENERATE_TYPE_SERVICE_CLASS,
      templateType: Constant.TEMPLATE_TYPE_BACKEND,
      fileName: "service-class.ejs",
      default: true,
    },
    {
      generatorKey: Constant.GENERATE_TYPE_SERVICE_CLASS_MAPPER,
      templateType: Constant.TEMPLATE_TYPE_BACKEND,
      fileName: "service-class-mapper.ejs",
      default: false,
    },
    {
      generatorKey: Constant.GENERATE_TYPE_TEST_COMMON_DAO,
      templateType: Constant.TEMPLATE_TYPE_BACKEND,
      fileName: "test-common-dao.ejs",
      default: true,
    },
    {
      generatorKey: Constant.GENERATE_TYPE_TEST_MYBATIS_MAPPER,
      templateType: Constant.TEMPLATE_TYPE_BACKEND,
      fileName: "test-mybatis-mapper.ejs",
      default: false,
    },
    {
      generatorKey: Constant.GENERATE_TYPE_POSTMAN,
      templateType: Constant.TEMPLATE_TYPE_BACKEND,
    },
  ],
  nowDateSqlString: "now()",
  apiRootPath: "/api",
  idDefaultJavaType: "String",
};

module.exports = Config;

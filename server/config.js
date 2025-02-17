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
  ],
  applyXmlSqlIdEntity: false,
  nowDateSqlString: "now()",
  isMapperNameSpaceFullPackage: false,
};

const tableEntityMapping = {
  TO0_AUTH: "Auth",
  TO0_AUTH_CODE: "AuthCode",
  TO0_AUTH_CODE_SITE: "AuthCodeSite",
  TO0_AUTH_GROUP: "AuthGroup",
  TO0_AUTH_SITE: "AuthSite",
  TO0_AUTH_USER: "AuthUser",
  TO0_CORPORATION: "Corporation",
  TO0_CORPORATION_HISTORY: "CorporationHistory",
  TO0_DEPT_MAST: "DeptMast",
  TO0_DEPT_MAST_HISTORY: "DeptMastHistory",
  TO0_DUTY_MAIN: "Duty",
  TO0_DUTY_MAIN_HISTORY: "DutyHistory",
  TO0_I18N_MESSAGE: "I18NMessage",
  TO0_MULTI_LOGIN_INFO: "MultiLoginInfo",
  TO0_POSITION_MAIN: "Position",
  TO0_POSITION_MAIN_HISTORY: "PositionHistory",
  TO0_PROPERTIES: "GlobalProperties",
  TO0_RANK_MAIN: "Rank",
  TO0_RANK_MAIN_HISTORY: "RankHistory",
  TO0_SITE_DOMAIN: "SiteDomain",
  TO0_SITE_MAIN: "SiteMain",
  TO0_USER_ADD_JOB: "UserAddJob",
  TO0_USER_LOG_INFO: "UserLogInfo",
  TO0_USER_MAIN: "User",
  TO0_USER_MAIN_HISTORY: "UserHistory",
  TM0_ADMIN_MENU: "AdminMenu",
  TM0_ADMIN_MENU_ACL: "AdminMenuAcl",
  TM0_ADMINPAGE_MANAGE: "AdminpageManage",
  TM0_MENU: "Menu",
  TM0_MENU_ACL: "MenuAcl",
  TAS_A_DOC: "ApprovalDoc",
  TAS_A_DOC_ATTACHED: "ApprovalDocLink",
  TAS_A_DOC_H_MANAGE: "ApprovalDocHisotryManage",
  TAS_A_DOC_HISTORY: "ApprovalDocHistory",
  TAS_A_DOC_INFO: "ApprovalDocInfo",
  TAS_A_DOC_INTERFACE: "ApprovalDocInterface",
  TAS_A_DOC_POST: "ApprovalDocPost",
  TAS_A_LINE: "ApprovalLine",
  TAS_A_LINE_GROUP: "ApprovalLineGroup",
  TAS_A_LINE_GROUP_SUB: "ApprovalLineGroupSub",
  TAS_A_LINE_HISTROY: "ApprovalLineHistory",
  TAS_A_PUBDOC_CONFIG: "ApporvalPubdocConfig",
  TAS_A_PUBDOC_DIS_LOG: "ApporvalPubdocDisLog",
  TAS_A_PUBDOC_ERR: "ApporvalPubdocError",
  TAS_A_PUBDOC_INFO: "ApporvalPubdocInfo",
  TAS_A_PUBDOC_IO_D: "ApporvalPubdocIODetail",
  TAS_A_PUBDOC_IO_M: "ApporvalPubdocIOMaster",
  TAS_A_PUBDOC_LINE: "ApporvalPubdocLine",
  TAS_A_PUBDOC_LOG: "ApporvalPubdocLog",
  TAS_APPACTION_LOG: "ApprovalActionLog",
  TAS_C_SIGNATURE_CONFIG: "CorporationSignatureConfig",
  TAS_C_TITLE_CONFIG: "CorporationTitleConfig",
  TAS_CABINET_LINE_MAPPING: "CabinetLineMapping",
  TAS_CD_SUB_CONFIG: "ApprovalCDSubConfig",
  TAS_CODE: "ApprovalCode",
  TAS_COR_CONFIG_SUB: "ApprovalCorporationManager",
  TAS_D_SIGNATURE_CONFIG: "ApprovalDeptSignatureConfig",
  TAS_DEPT_CONFIG: "ApprovalDeptConfig",
  TAS_DEPT_CONFIG_SUB: "ApprovalDeptManager",
  TAS_DISPLAY: "ApprovalDisplayInfo",
  TAS_DOC_ATTACHED: "ApprovalDocFile",
  TAS_DOC_ATTACHED_HISTORY: "ApprovalDocFileHistory",
  TAS_DOC_CABINET: "ApprovalDocCabinet",
  TAS_DOC_NUM: "ApprovalDocNum",
  TAS_DOC_PARSER: "ApprovalDocParser",
  TAS_DOC_PROGRESS_LOG: "ApprovalDocProcessLog",
  TAS_DOC_TYPE: "ApprovalDocType",
  TAS_G_RECEIVER: "ApprovalDocReceiver",
  TAS_GROUP: "ApprovalGroup",
  TAS_GROUP_SUB_DEPT: "ApprovalGroupSubDept",
  TAS_GROUP_SUB_USER: "ApprovalGroupSubUser",
  TAS_GWIN010M: "ApprovalGwin010M",
  TAS_INTERFACE_MAPPING: "ApprovalInterfaceMapping",
  TAS_LATEST_DOC: "ApprovalLatestSample",
  TAS_LIKED_CABINET: '"ApprovalLikedDoc',
  TAS_MULTI_A_DOC: "ApprovalMultiDoc",
  TAS_NUM_CONFIG: "ApprovalNumberConfig",
  TAS_OPEN_TYPE: "ApprovalOpenType",
  TAS_PENDING_DOC_MAPPING: "ApprovalPendingDocMapping",
  TAS_R_STAFF: "ApprovalReceiveStaff",
  TAS_RECEIVER: "ApprovalDocReceiverProcess",
  TAS_S_DOC_MAPPING: "ApprovalSampleDocMapping",
  TAS_SAMPLE_DOC: "ApprovalSampleDoc",
  TAS_SAMPLE_DOC_A_LINE: "ApprovalSampleDocLine",
  TAS_SEARCH_WORD: "ApprovalDocSearchWord",
  TAS_SENDER: "ApprovalSender",
  TAS_SENDER_HISTORY: "ApprovalSenderHistory",
  TAS_SHARE_CABINET: "ApprovalShareCabinet",
  TAS_STATUS: "ApprovalStatusCode",
  TAS_TMPSAVE: "ApprovalTempSaveInfo",
  TAS_USER_ABSENCE: "ApprovalUserAbsence",
  TAS_USER_ABSENCE_HISTORY: "ApprovalUserAbsenceHistory",
  TAS_USER_CONFIG: "ApprovalUserConifg",
  TAS_USER_DOC: "ApprovalUserDoc",
  TAS_WT_MANAGEMENT: "ApprovalWtManagement",
  TRS_DISTRIBUTION: "RegistrationDistribution",
  TRS_MOVE_RECORDS: "RegistrationMoveRecords",
  TRS_R_CABINET: "RegistrationCabinet",
  TRS_RECORDS: "RegistrationRecords",
  TRS_RECORDS_SUB: "RegistrationRecordsSub",
  TRS_REGISTRATION: "Registration",
  TRS_REGISTRATION_HISTROY: "RegistrationHistory",
  TRS_SHARE_SECURITY: "RegistrationShareSecurity",
  TRS_U_B_CODE: "RegistrationUnitCode",
  TRS_UNOFFICIAL_REGISTRATION: "RegistrationUnofficialDoc",
};

Config.tableEntityMapping = tableEntityMapping;

module.exports = Config;

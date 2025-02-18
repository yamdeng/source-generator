const tableEntityMapping = {
  TO0_AUTH: { entityName: "Auth", apiPath: "/auth" },
  TO0_AUTH_CODE: { entityName: "AuthCode", apiPath: "" },
  TO0_AUTH_CODE_SITE: { entityName: "AuthCodeSite", apiPath: "" },
  TO0_AUTH_GROUP: { entityName: "AuthGroup", apiPath: "" },
  TO0_AUTH_SITE: { entityName: "AuthSite", apiPath: "" },
  TO0_AUTH_USER: { entityName: "AuthUser", apiPath: "" },
  TO0_CORPORATION: { entityName: "Corporation", apiPath: "" },
  TO0_CORPORATION_HISTORY: { entityName: "CorporationHistory", apiPath: "" },
  TO0_DEPT_MAST: { entityName: "DeptMast", apiPath: "" },
  TO0_DEPT_MAST_HISTORY: { entityName: "DeptMastHistory", apiPath: "" },
  TO0_DUTY_MAIN: { entityName: "Duty", apiPath: "" },
  TO0_DUTY_MAIN_HISTORY: { entityName: "DutyHistory", apiPath: "" },
  TO0_I18N_MESSAGE: { entityName: "I18NMessage", apiPath: "" },
  TO0_MULTI_LOGIN_INFO: { entityName: "MultiLoginInfo", apiPath: "" },
  TO0_POSITION_MAIN: { entityName: "Position", apiPath: "" },
  TO0_POSITION_MAIN_HISTORY: { entityName: "PositionHistory", apiPath: "" },
  TO0_PROPERTIES: { entityName: "GlobalProperties", apiPath: "" },
  TO0_RANK_MAIN: { entityName: "Rank", apiPath: "" },
  TO0_RANK_MAIN_HISTORY: { entityName: "RankHistory", apiPath: "" },
  TO0_SITE_DOMAIN: { entityName: "SiteDomain", apiPath: "" },
  TO0_SITE_MAIN: { entityName: "SiteMain", apiPath: "" },
  TO0_USER_ADD_JOB: { entityName: "UserAddJob", apiPath: "" },
  TO0_USER_LOG_INFO: { entityName: "UserLogInfo", apiPath: "" },
  TO0_USER_MAIN: { entityName: "User", apiPath: "" },
  TO0_USER_MAIN_HISTORY: { entityName: "UserHistory", apiPath: "" },
  TM0_ADMIN_MENU: { entityName: "AdminMenu", apiPath: "" },
  TM0_ADMIN_MENU_ACL: { entityName: "AdminMenuAcl", apiPath: "" },
  TM0_ADMINPAGE_MANAGE: { entityName: "AdminpageManage", apiPath: "" },
  TM0_MENU: { entityName: "Menu", apiPath: "" },
  TM0_MENU_ACL: { entityName: "MenuAcl", apiPath: "" },
  TAS_A_DOC: { entityName: "ApprovalDoc", apiPath: "/approval" },
  TAS_A_DOC_ATTACHED: { entityName: "ApprovalDocLink", apiPath: "" },
  TAS_A_DOC_H_MANAGE: { entityName: "ApprovalDocHisotryManage", apiPath: "" },
  TAS_A_DOC_HISTORY: { entityName: "ApprovalDocHistory", apiPath: "" },
  TAS_A_DOC_INFO: { entityName: "ApprovalDocInfo", apiPath: "" },
  TAS_A_DOC_INTERFACE: { entityName: "ApprovalDocInterface", apiPath: "" },
  TAS_A_DOC_POST: { entityName: "ApprovalDocPost", apiPath: "" },
  TAS_A_LINE: { entityName: "ApprovalLine", apiPath: "" },
  TAS_A_LINE_GROUP: { entityName: "ApprovalLineGroup", apiPath: "" },
  TAS_A_LINE_GROUP_SUB: { entityName: "ApprovalLineGroupSub", apiPath: "" },
  TAS_A_LINE_HISTROY: { entityName: "ApprovalLineHistory", apiPath: "" },
  TAS_A_PUBDOC_CONFIG: { entityName: "ApporvalPubdocConfig", apiPath: "" },
  TAS_A_PUBDOC_DIS_LOG: { entityName: "ApporvalPubdocDisLog", apiPath: "" },
  TAS_A_PUBDOC_ERR: { entityName: "ApporvalPubdocError", apiPath: "" },
  TAS_A_PUBDOC_INFO: { entityName: "ApporvalPubdocInfo", apiPath: "" },
  TAS_A_PUBDOC_IO_D: { entityName: "ApporvalPubdocIODetail", apiPath: "" },
  TAS_A_PUBDOC_IO_M: { entityName: "ApporvalPubdocIOMaster", apiPath: "" },
  TAS_A_PUBDOC_LINE: { entityName: "ApporvalPubdocLine", apiPath: "" },
  TAS_A_PUBDOC_LOG: { entityName: "ApporvalPubdocLog", apiPath: "" },
  TAS_APPACTION_LOG: { entityName: "ApprovalActionLog", apiPath: "" },
  TAS_C_SIGNATURE_CONFIG: { entityName: "CorporationSignatureConfig", apiPath: "" },
  TAS_C_TITLE_CONFIG: { entityName: "CorporationTitleConfig", apiPath: "" },
  TAS_CABINET_LINE_MAPPING: { entityName: "CabinetLineMapping", apiPath: "" },
  TAS_CD_SUB_CONFIG: { entityName: "ApprovalCDSubConfig", apiPath: "" },
  TAS_CODE: { entityName: "ApprovalCode", apiPath: "" },
  TAS_COR_CONFIG_SUB: { entityName: "ApprovalCorporationManager", apiPath: "" },
  TAS_D_SIGNATURE_CONFIG: { entityName: "ApprovalDeptSignatureConfig", apiPath: "" },
  TAS_DEPT_CONFIG: { entityName: "ApprovalDeptConfig", apiPath: "" },
  TAS_DEPT_CONFIG_SUB: { entityName: "ApprovalDeptManager", apiPath: "" },
  TAS_DISPLAY: { entityName: "ApprovalDisplayInfo", apiPath: "" },
  TAS_DOC_ATTACHED: { entityName: "ApprovalDocFile", apiPath: "" },
  TAS_DOC_ATTACHED_HISTORY: { entityName: "ApprovalDocFileHistory", apiPath: "" },
  TAS_DOC_CABINET: { entityName: "ApprovalDocCabinet", apiPath: "" },
  TAS_DOC_NUM: { entityName: "ApprovalDocNum", apiPath: "" },
  TAS_DOC_PARSER: { entityName: "ApprovalDocParser", apiPath: "" },
  TAS_DOC_PROGRESS_LOG: { entityName: "ApprovalDocProcessLog", apiPath: "" },
  TAS_DOC_TYPE: { entityName: "ApprovalDocType", apiPath: "" },
  TAS_G_RECEIVER: { entityName: "ApprovalDocReceiver", apiPath: "" },
  TAS_GROUP: { entityName: "ApprovalGroup", apiPath: "" },
  TAS_GROUP_SUB_DEPT: { entityName: "ApprovalGroupSubDept", apiPath: "" },
  TAS_GROUP_SUB_USER: { entityName: "ApprovalGroupSubUser", apiPath: "" },
  TAS_GWIN010M: { entityName: "ApprovalGwin010M", apiPath: "" },
  TAS_INTERFACE_MAPPING: { entityName: "ApprovalInterfaceMapping", apiPath: "" },
  TAS_LATEST_DOC: { entityName: "ApprovalLatestSample", apiPath: "" },
  TAS_LIKED_CABINET: { entityName: '"ApprovalLikedDoc', apiPath: "" },
  TAS_MULTI_A_DOC: { entityName: "ApprovalMultiDoc", apiPath: "" },
  TAS_NUM_CONFIG: { entityName: "ApprovalNumberConfig", apiPath: "" },
  TAS_OPEN_TYPE: { entityName: "ApprovalOpenType", apiPath: "" },
  TAS_PENDING_DOC_MAPPING: { entityName: "ApprovalPendingDocMapping", apiPath: "" },
  TAS_R_STAFF: { entityName: "ApprovalReceiveStaff", apiPath: "" },
  TAS_RECEIVER: { entityName: "ApprovalDocReceiverProcess", apiPath: "" },
  TAS_S_DOC_MAPPING: { entityName: "ApprovalSampleDocMapping", apiPath: "" },
  TAS_SAMPLE_DOC: { entityName: "ApprovalSampleDoc", apiPath: "" },
  TAS_SAMPLE_DOC_A_LINE: { entityName: "ApprovalSampleDocLine", apiPath: "" },
  TAS_SEARCH_WORD: { entityName: "ApprovalDocSearchWord", apiPath: "" },
  TAS_SENDER: { entityName: "ApprovalSender", apiPath: "" },
  TAS_SENDER_HISTORY: { entityName: "ApprovalSenderHistory", apiPath: "" },
  TAS_SHARE_CABINET: { entityName: "ApprovalShareCabinet", apiPath: "" },
  TAS_STATUS: { entityName: "ApprovalStatusCode", apiPath: "" },
  TAS_TMPSAVE: { entityName: "ApprovalTempSaveInfo", apiPath: "" },
  TAS_USER_ABSENCE: { entityName: "ApprovalUserAbsence", apiPath: "" },
  TAS_USER_ABSENCE_HISTORY: { entityName: "ApprovalUserAbsenceHistory", apiPath: "" },
  TAS_USER_CONFIG: { entityName: "ApprovalUserConifg", apiPath: "" },
  TAS_USER_DOC: { entityName: "ApprovalUserDoc", apiPath: "" },
  TAS_WT_MANAGEMENT: { entityName: "ApprovalWtManagement", apiPath: "" },
  TRS_DISTRIBUTION: { entityName: "RegistrationDistribution", apiPath: "" },
  TRS_MOVE_RECORDS: { entityName: "RegistrationMoveRecords", apiPath: "" },
  TRS_R_CABINET: { entityName: "RegistrationCabinet", apiPath: "" },
  TRS_RECORDS: { entityName: "RegistrationRecords", apiPath: "" },
  TRS_RECORDS_SUB: { entityName: "RegistrationRecordsSub", apiPath: "" },
  TRS_REGISTRATION: { entityName: "Registration", apiPath: "" },
  TRS_REGISTRATION_HISTROY: { entityName: "RegistrationHistory", apiPath: "" },
  TRS_SHARE_SECURITY: { entityName: "RegistrationShareSecurity", apiPath: "" },
  TRS_U_B_CODE: { entityName: "RegistrationUnitCode", apiPath: "" },
  TRS_UNOFFICIAL_REGISTRATION: { entityName: "RegistrationUnofficialDoc", apiPath: "" },
};

module.exports = tableEntityMapping;

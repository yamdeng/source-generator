// config.js

// Config.js
//  1.기본 패키지 경로 : baseJavaPackagePath
//  2.tablePrefixNameList = ['TAS_']
//  3.Entity 추출기본전략 : base || slicePrefixTableName || mappingEntity
//  4.table과 매칭되는 이름을 별도로 관리 => metal sql 반영 필요
//  5.기본 sysdate
//  5.기본 컬럼명 목록 : reg_dttm, reg_user_id, upd_dttm, upd_user_id => 삭제일시, 삭제시간 존재 가능

const Constant = {
  ENTITY_EXTRACT_STRATEGY_BASE: "base",
  ENTITY_EXTRACT_STRATEGY_SLICE_TABLE_NAME: "slicePrefixTableName",
  ENTITY_EXTRACT_STRATEGY_MAPPING: "mappingEntity",
  GENERATE_TYPE_SQL: "sql",
};

module.exports = Constant;

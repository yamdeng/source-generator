const _ = require("lodash");

const Code = {};

/*
    generateType
*/
Code.generateType = [
  {
    label: "Sql.xml",
    value: "sql",
  },
  {
    label: "MapperSql.xml",
    value: "mapper-sql",
  },
  {
    label: "Dto.java",
    value: "dto",
  },
  {
    label: "Controller.java",
    value: "controller",
  },
  {
    label: "Service.java",
    value: "service-interface",
  },
  {
    label: "ServiceImpl.java",
    value: "service-class",
  },
  {
    label: "ServiceMapperImpl.java",
    value: "service-class-mapper",
  },

  {
    label: "Mapper.java",
    value: "mybatis-mapper",
  },
  {
    label: "DaoTest.java",
    value: "test-common-dao",
  },
  {
    label: "MapperTest.java",
    value: "test-mybatis-mapper",
  },
  {
    label: "Postman.json",
    value: "postman",
  },
];

/*
    사용여부
*/
Code.useYn = [
  {
    label: "예",
    value: "Y",
  },
  {
    label: "아니오",
    value: "N",
  },
];

// 코드명 가져오기 : value 기준
Code.getCodeLabelByValue = function (codeCategory, codeValue) {
  let codeLabel = null;
  const codeList = Code[codeCategory] || [];
  const searchIndex = _.findIndex(codeList, (codeInfo) => {
    if (codeValue === codeInfo.value) {
      return true;
    } else {
      return false;
    }
  });
  if (searchIndex !== -1) {
    const findCodeInfo = codeList[searchIndex];
    codeLabel = findCodeInfo.label;
  }
  return codeLabel;
};

module.exports = Code;

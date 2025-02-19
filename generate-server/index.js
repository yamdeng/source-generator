require('dotenv').config();
const path = require('path');
const _ = require('lodash');
const ejs = require('ejs');
const fs = require('fs');
const AdmZip = require('adm-zip');
const { tableSelectSql, columnSelectSql } = require('./sql-string');

const {
  listComponentGenerateString,
  formStoreGenerateString,
  formViewGenerateString,
  detailViewGenerateString,
  detailViewGenerateNoStoreString,
  formModalGenerateString,
  formUseStateModalGenerateString,
  detailModalGenerateString,
  searchFormGenerateString,
} = require('./generate-string');

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE, SERVER_PORT } = process.env;

const db = require('knex')({
  client: 'pg',
  version: '7.2',
  connection: {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
  },
});

const express = require('express');
const app = express();
const cors = require('cors');
const port = SERVER_PORT;
app.use(
  cors({
    origin: '*', // 모든 출처 허용 옵션. true 를 써도 된다.
  })
);
app.use(express.static('public'));
app.use(express.json({ extended: true }));

// 테이블 조회 : /api/tables
app.get('/api/tables', async (req, res) => {
  const keyword = req.query.keyword;
  let tableList = [];
  try {
    const dbResponse = await db.raw(tableSelectSql, {
      keyword: `%${keyword}%`,
    });
    tableList = dbResponse.rows;
    console.log(tableList);
  } catch (e) {
    console.log(e);
  }

  res.json({
    list: tableList,
  });
});

// 테이블명 기준으로 컬럼 정보 조회 : /api/columns
app.get('/api/columns/:tableName', async (req, res) => {
  const tableName = req.params.tableName;
  let columnList = [];
  try {
    const dbResponse = await db.raw(columnSelectSql, [tableName, tableName]);
    columnList = dbResponse.rows;
    // 컬럼주석명이 존재하지 않을 경우 낙타표기법 컬럼명으로 대체
    converColumnList(columnList);
    console.log(columnList);
  } catch (e) {
    console.log(e);
  }

  res.json({
    list: columnList,
  });
});

// 파일 다운로드하기 : /api/generate/:tableName/:generateType/fileDownload
app.post('/api/generate/:tableName/:generateType/fileDownload', async (req, res) => {
  const tableName = req.params.tableName;
  const generateType = req.params.generateType || 'all'; // all, list, formStore, formView, detailView, modalForm, modalView
  let columnList = req.body.checkedColumns || [];
  let checkedMultiColumn = req.body.checkedMultiColumn;
  let checkedModalUseState = req.body.checkedModalUseState;
  let checkedInnerFormStore = req.body.checkedInnerFormStore;
  let checkedSearchFormDetail = req.body.checkedSearchFormDetail;
  let downloadFileName = '';
  try {
    converColumnList(columnList);
    let listFileName = '';
    let formStoreFileName = '';
    let formViewFileName = '';
    let detailViewFileName = '';
    let modalFormFileName = '';
    let modalViewFileName = '';
    let searchFormFileName = '';
    if (generateType === 'all' || generateType === 'list') {
      listFileName = await createListfile(tableName, columnList);
      if (generateType === 'list') {
        downloadFileName = listFileName;
      }
    }
    if (generateType === 'all' || generateType === 'formStore') {
      formStoreFileName = await createFormStorefile(tableName, columnList);
      if (generateType === 'formStore') {
        downloadFileName = formStoreFileName;
      }
    }
    if (generateType === 'all' || generateType === 'formView') {
      formViewFileName = await createFormViewfile(tableName, columnList, checkedMultiColumn, checkedInnerFormStore);
      if (generateType === 'formView') {
        downloadFileName = formViewFileName;
      }
    }

    if (generateType === 'all' || generateType === 'detailView') {
      detailViewFileName = await createDetailViewfile(tableName, columnList, checkedMultiColumn, checkedInnerFormStore);
      if (generateType === 'detailView') {
        downloadFileName = detailViewFileName;
      }
    }

    if (generateType === 'all' || generateType === 'modalForm') {
      modalFormFileName = await createModalFormfile(tableName, columnList, checkedMultiColumn, checkedModalUseState, checkedInnerFormStore);
      if (generateType === 'modalForm') {
        downloadFileName = modalFormFileName;
      }
    }

    if (generateType === 'all' || generateType === 'modalView') {
      modalViewFileName = await createModalViewfile(tableName, columnList, checkedMultiColumn);
      if (generateType === 'modalView') {
        downloadFileName = modalViewFileName;
      }
    }
    if (generateType === 'all' || generateType === 'searchForm') {
      searchFormFileName = await createSearchFormfile(
        tableName,
        columnList,
        checkedMultiColumn,
        checkedSearchFormDetail
      );
      if (generateType === 'searchForm') {
        downloadFileName = modalViewFileName;
      }
    }
    if (generateType === 'all') {
      downloadFileName = await createZipArchive(tableName, [
        listFileName,
        formStoreFileName,
        formViewFileName,
        detailViewFileName,
        modalFormFileName,
        modalViewFileName,
        searchFormFileName,
      ]);
    }
  } catch (e) {
    console.log(e);
  }

  res.download(downloadFileName);
});

// generate 문자열 반환 : /api/generate/:tableName
app.post('/api/generate/:tableName', async (req, res) => {
  const tableName = req.params.tableName;
  let columnList = req.body.checkedColumns || [];
  let checkedMultiColumn = req.body.checkedMultiColumn;
  let checkedModalUseState = req.body.checkedModalUseState;
  let checkedInnerFormStore = req.body.checkedInnerFormStore;
  let checkedSearchFormDetail = req.body.checkedSearchFormDetail;

  let result = {};
  try {
    converColumnList(columnList);

    const requiredFields = columnList.filter((info) => info.is_nullable !== 'YES').map((info) => info.column_name);

    let camelCaseTableName = _.camelCase(tableName);
    const applyFileName = getApplyFileName(camelCaseTableName);
    const listData = {
      fileName: `${applyFileName}List`,
      storeName: `${applyFileName}ListStore`,
      tableColumns: columnList,
    };
    const listComponentContent = ejs.render(listComponentGenerateString, listData);

    const formStoreData = {
      formName: `${applyFileName}Form`,
      fileName: `use${applyFileName}FormStore`,
      requiredFieldList: requiredFields,
      tableColumns: columnList,
    };

    const formStoreContent = ejs.render(formStoreGenerateString, formStoreData);

    const formViewData = {
      formName: `${applyFileName}Form`,
      fileName: `${applyFileName}Form`,
      storeName: `use${applyFileName}FormStore`,
      tableColumns: columnList,
      importList: createCommonImportListToColumnList(columnList),
      tableColumnMultiArray: toMultiArray(columnList, checkedMultiColumn ? 2 : 1),
      checkedMultiColumn: checkedMultiColumn,
      checkedInnerFormStore: checkedInnerFormStore
    };

    const detailViewData = {
      fileName: `${applyFileName}Detail`,
      storeName: `use${applyFileName}FormStore`,
      tableColumns: columnList,
      importList: createCommonImportListToColumnList(columnList),
      tableColumnMultiArray: toMultiArray(columnList, checkedMultiColumn ? 2 : 1),
      checkedMultiColumn: checkedMultiColumn,
    };

    const modalFormData = {
      formName: `${applyFileName}Form`,
      fileName: `${applyFileName}FormModal`,
      storeName: `use${applyFileName}FormStore`,
      tableColumns: columnList,
      importList: createCommonImportListToColumnList(columnList),
      tableColumnMultiArray: toMultiArray(columnList, checkedMultiColumn ? 2 : 1),
      checkedMultiColumn: checkedMultiColumn,
      checkedInnerFormStore: checkedInnerFormStore
    };

    const modalDetailData = {
      fileName: `${applyFileName}DetailModal`,
      storeName: `use${applyFileName}FormStore`,
      tableColumns: columnList,
      importList: createCommonImportListToColumnList(columnList),
      tableColumnMultiArray: toMultiArray(columnList, checkedMultiColumn ? 2 : 1),
      checkedMultiColumn: checkedMultiColumn,
    };

    const searchFormData = {
      fileName: `${applyFileName}SearchForm`,
      storeName: `${applyFileName}ListStore`,
      tableColumns: columnList,
      importList: createCommonImportListToColumnList(columnList),
      tableColumnMultiArray: toMultiArray(columnList, checkedMultiColumn ? 2 : 1),
      checkedMultiColumn: checkedMultiColumn,
      checkedSearchFormDetail: checkedSearchFormDetail,
    };

    const formViewContent = ejs.render(formViewGenerateString, formViewData);
    const detailViewContent = ejs.render(checkedInnerFormStore ? detailViewGenerateNoStoreString : detailViewGenerateString, detailViewData);
    const modalFormContent = ejs.render(
      checkedModalUseState ? formUseStateModalGenerateString : formModalGenerateString,
      modalFormData
    );
    const modalViewContent = ejs.render(detailModalGenerateString, modalDetailData);
    const searchFormContent = ejs.render(searchFormGenerateString, searchFormData);
    result.listComponentContent = listComponentContent;
    result.formStoreContent = formStoreContent;
    result.formViewContent = formViewContent;
    result.detailViewContent = detailViewContent;
    result.modalFormContent = modalFormContent;
    result.modalViewContent = modalViewContent;
    result.searchFormContent = searchFormContent;
  } catch (e) {
    console.log(e);
  }

  res.json(result);
});

// 테이블 목록 파일 생성
async function createListfile(tableName, columnList) {
  // 템플릿에서 대체할 변수들
  let camelCaseTableName = _.camelCase(tableName);
  const applyFileName = getApplyFileName(camelCaseTableName);
  const data = {
    fileName: `${applyFileName}List`,
    storeName: `${applyFileName}ListStore`,
    tableColumns: columnList,
    importList: createCommonImportListToColumnList(columnList),
  };
  const content = ejs.render(listComponentGenerateString, data);
  fs.writeFileSync(`./result/${applyFileName}List.tsx`, content);
  return `./result/${applyFileName}List.tsx`;
}

// form store 파일 생성
async function createFormStorefile(tableName, columnList) {
  // 템플릿에서 대체할 변수들
  let camelCaseTableName = _.camelCase(tableName);
  const applyFileName = getApplyFileName(camelCaseTableName);

  // yup 가공 start
  columnList.map((info) => {
    let yupType = 'string';
    let formInitValue = '""';
    if (info.java_type === 'Double' || info.java_type === 'Long') {
      yupType = 'number';
      formInitValue = 'null';
    } else if (info.java_type === 'Boolean') {
      yupType = 'boolean';
      formInitValue = 'false';
    }
    info.yupType = yupType + '()' + (info.is_nullable !== 'YES' ? '.required()' : '');
    info.formInitValue = formInitValue;
    return info;
  });

  const requiredFields = columnList.filter((info) => info.is_nullable !== 'YES').map((info) => info.column_name);
  // yup 가공 end

  const data = {
    formName: `${applyFileName}Form`,
    fileName: `use${applyFileName}FormStore`,
    requiredFieldList: requiredFields,
    tableColumns: columnList,
  };
  const content = ejs.render(formStoreGenerateString, data);
  fs.writeFileSync(`./result/${applyFileName}FormStore.ts`, content);
  return `./result/${applyFileName}FormStore.ts`;
}

// form view 파일 생성
async function createFormViewfile(tableName, columnList, checkedMultiColumn, checkedInnerFormStore) {
  // 템플릿에서 대체할 변수들
  let camelCaseTableName = _.camelCase(tableName);
  const applyFileName = getApplyFileName(camelCaseTableName);

  const data = {
    formName: `${applyFileName}Form`,
    fileName: `${applyFileName}Form`,
    storeName: `use${applyFileName}FormStore`,
    tableColumns: columnList,
    tableColumnMultiArray: toMultiArray(columnList, checkedMultiColumn ? 2 : 1),
    checkedMultiColumn: checkedMultiColumn,
    checkedInnerFormStore: checkedInnerFormStore,
    importList: createCommonImportListToColumnList(columnList),
  };
  const content = ejs.render(formViewGenerateString, data);
  fs.writeFileSync(`./result/${applyFileName}Form.tsx`, content);
  return `./result/${applyFileName}Form.tsx`;
}

// detail view 파일 생성
async function createDetailViewfile(tableName, columnList, checkedMultiColumn, checkedInnerFormStore) {
  // 템플릿에서 대체할 변수들
  let camelCaseTableName = _.camelCase(tableName);
  const applyFileName = getApplyFileName(camelCaseTableName);

  const data = {
    fileName: `${applyFileName}Detail`,
    storeName: `use${applyFileName}FormStore`,
    tableColumns: columnList,
    tableColumnMultiArray: toMultiArray(columnList, checkedMultiColumn ? 2 : 1),
    checkedMultiColumn: checkedMultiColumn,
    importList: createCommonImportListToColumnList(columnList),
  };
  const content = ejs.render(checkedInnerFormStore ? detailViewGenerateNoStoreString : detailViewGenerateString, data);
  fs.writeFileSync(`./result/${applyFileName}Detail.tsx`, content);
  return `./result/${applyFileName}Detail.tsx`;
}

// modal form 파일 생성
async function createModalFormfile(tableName, columnList, checkedMultiColumn, checkedModalUseState, checkedInnerFormStore) {
  // 템플릿에서 대체할 변수들
  let camelCaseTableName = _.camelCase(tableName);
  const applyFileName = getApplyFileName(camelCaseTableName);

  const data = {
    formName: `${applyFileName}Form`,
    fileName: `${applyFileName}FormModal`,
    storeName: `use${applyFileName}FormStore`,
    tableColumns: columnList,
    tableColumnMultiArray: toMultiArray(columnList, checkedMultiColumn ? 2 : 1),
    checkedMultiColumn: checkedMultiColumn,
    checkedInnerFormStore: checkedInnerFormStore,
    importList: createCommonImportListToColumnList(columnList),
  };
  const content = ejs.render(checkedModalUseState ? formUseStateModalGenerateString : formModalGenerateString, data);
  fs.writeFileSync(`./result/${applyFileName}FormModal.tsx`, content);
  return `./result/${applyFileName}FormModal.tsx`;
}

// detail view 파일 생성
async function createModalViewfile(tableName, columnList, checkedMultiColumn) {
  // 템플릿에서 대체할 변수들
  let camelCaseTableName = _.camelCase(tableName);
  const applyFileName = getApplyFileName(camelCaseTableName);

  const data = {
    fileName: `${applyFileName}DetailModal`,
    storeName: `use${applyFileName}FormStore`,
    tableColumns: columnList,
    tableColumnMultiArray: toMultiArray(columnList, checkedMultiColumn ? 2 : 1),
    checkedMultiColumn: checkedMultiColumn,
    importList: createCommonImportListToColumnList(columnList),
  };
  const content = ejs.render(detailModalGenerateString, data);
  fs.writeFileSync(`./result/${applyFileName}DetailModal.tsx`, content);
  return `./result/${applyFileName}DetailModal.tsx`;
}

// search form 파일 생성
function createSearchFormfile(tableName, columnList, checkedMultiColumn, checkedSearchFormDetail) {
  // 템플릿에서 대체할 변수들
  let camelCaseTableName = _.camelCase(tableName);
  const applyFileName = getApplyFileName(camelCaseTableName);

  const data = {
    fileName: `${applyFileName}SearchForm`,
    storeName: `use${applyFileName}ListStore`,
    tableColumns: columnList,
    tableColumnMultiArray: toMultiArray(columnList, checkedMultiColumn ? 2 : 1),
    checkedMultiColumn: checkedMultiColumn,
    importList: createCommonImportListToColumnList(columnList),
    checkedSearchFormDetail: checkedSearchFormDetail,
  };
  const content = ejs.render(searchFormGenerateString, data);
  fs.writeFileSync(`./result/${applyFileName}SearchForm.tsx`, content);
  return `./result/${applyFileName}SearchForm.tsx`;
}

// 파일 압축
async function createZipArchive(tableName, fileNameList) {
  let zipFileName = `./result/${tableName}-all.zip`;
  try {
    const zip = new AdmZip();
    fileNameList.forEach((fileName) => {
      zip.addLocalFile(fileName);
    });
    zip.writeZip(zipFileName);
    console.log(`Created ${zipFileName} successfully`);
  } catch (e) {
    console.log(`Something went wrong. ${e}`);
  }
  return zipFileName;
}

function getApplyFileName(camelCaseTableName) {
  // return camelCaseTableName.charAt(0).toUpperCase() + camelCaseTableName.slice(1);
  // 테이블명이 tb_로 시작해서 앞을 자름
  return camelCaseTableName.slice(2);
}

function toMultiArray(array, spliceCount = 2) {  
  const originalArray = _.cloneDeep(array);
  const results = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (!originalArray.length) {
      break;
    }
    const firstComponentType = originalArray[0].componentType;
    let secondComponentType = null;
    if (originalArray.length > 1) {
      secondComponentType = originalArray[1].componentType;
    }

    let fullComponent = false;
    if (firstComponentType === 'textarea' || firstComponentType === 'editor' || firstComponentType === 'file') {
      fullComponent = true;
    }
    if (secondComponentType) {
      if (secondComponentType === 'textarea' || secondComponentType === 'editor' || secondComponentType === 'file') {
        fullComponent = true;
      }
    }
    const removeArray = fullComponent ? originalArray.splice(0, 1) : originalArray.splice(0, spliceCount);
    results.push(removeArray);
  }
  return results;
}

function converColumnList(columnList) {
  // 컬럼주석명이 존재하지 않을 경우 낙타표기법 컬럼명으로 대체
  columnList.map((info) => {
    if (!info.column_comment) {
      info.column_comment = info.column_name;
    }
    // componentType 값이 존재하지 않을 경우만 자동으로 셋팅
    if (!info.componentType) {
      info.componentType = 'text';
    }

    if (!info.codeGroupId) {
      info.codeGroupId = '';
    }
    info.formGroupClassName = 'form-group';
    if (info.componentType === 'radio' || info.componentType === 'checkboxgroup' || info.componentType === 'checkbox') {
      info.formGroupClassName = 'group-box-wrap';
    }

    let yupType = 'string';
    let formInitValue = '""';
    if (info.java_type === 'Double' || info.java_type === 'Long') {
      yupType = 'number';
      formInitValue = 'null';
    } else if (info.java_type === 'Boolean') {
      yupType = 'boolean';
      formInitValue = 'false';
    }
    if (yupType === 'number') {
      if (info.is_nullable === 'YES') {
        info.yupType = yupType + '().nullable()';
      } else {
        info.yupType = yupType + '().required()';
      }
    } else {
      info.yupType = yupType + '()' + (info.is_nullable !== 'YES' ? '.required()' : '');
    }
    info.formInitValue = formInitValue;

    return info;
  });
}

function createCommonImportListToColumnList(columnList) {
  const columnFilterList = _.uniqBy(
    columnList.filter((info) => info.componentType),
    'componentType'
  );
  const commonImportStringList = columnFilterList.map((info) => {
    let importString = `import AppTextInput from '@/components/common/AppTextInput';`;
    const componentType = info.componentType;

    if (componentType === 'code') {
      return `import AppCodeSelect from '@/components/common/AppCodeSelect';`;
    } else if (componentType === 'select') {
      return `import AppSelect from '@/components/common/AppSelect';`;
    } else if (componentType === 'search-input') {
      return `import AppSearchInput from '@/components/common/AppSearchInput';`;
    } else if (componentType === 'textarea') {
      return `import AppTextArea from '@/components/common/AppTextArea';`;
    } else if (componentType === 'editor') {
      return `import AppEditor from '@/components/common/AppEditor';`;
    } else if (componentType === 'datepicker') {
      return `import AppDatePicker from '@/components/common/AppDatePicker';`;
    } else if (componentType === 'timepicker') {
      return `import AppTimePicker from '@/components/common/AppTimePicker';`;
    } else if (componentType === 'rangepicker') {
      return `import AppRangeDatePicker from '@/components/common/AppRangeDatePicker';`;
    } else if (componentType === 'checkbox') {
      return `import AppCheckbox from '@/components/common/AppCheckbox';`;
    } else if (componentType === 'checkboxgroup') {
      return `import AppCheckboxGroup from '@/components/common/AppCheckboxGroup';`;
    } else if (componentType === 'radio') {
      return `import AppRadioGroup from '@/components/common/AppRadioGroup';`;
    } else if (componentType === 'user-select-input') {
      return `import AppUserSelectInput from '@/components/common/AppUserSelectInput';`;
    } else if (componentType === 'dept-select-input') {
      return `import AppDeptSelectInput from '@/components/common/AppDeptSelectInput';`;
    } else if (componentType === 'auto-complete') {
      return `import AppAutoComplete from '@/components/common/AppAutoComplete';`;
    } else if (componentType === 'tree-select') {
      return `import AppTreeSelect from '@/components/common/AppTreeSelect';`;
    } else if (componentType === 'file') {
      return `import AppFileAttach from '@/components/common/AppFileAttach';`;
    }
    return importString;
  });
  return _.uniq(commonImportStringList);
}

// 서버 listen
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const resultDirectory = path.join(__dirname, 'result');
if (!fs.existsSync(resultDirectory)) {
  fs.mkdirSync(resultDirectory);
}

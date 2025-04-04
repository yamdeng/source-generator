const listComponentGenerateString = `import AppTable from "@/components/common/AppTable";
import AppNavigation from '@/components/common/AppNavigation';
import AppTableBaseSearchInput from '@/components/common/AppTableBaseSearchInput';
import { createListSlice, listBaseState } from "@/stores/slice/listSlice";
import { useEffect, useState, useCallback } from "react";
import CommonUtil from '@/utils/CommonUtil';
import { create } from "zustand";

const initListData = {
  ...listBaseState,
  listApiPath: "TODO:목록api패스",
  baseRoutePath: 'TODO:UI라우트패스',
};

// TODO : 검색 초기값 설정
const initSearchParam = {
  searchWord: '',
};

/* zustand store 생성 */
const <%= storeName %> = create<any>((set, get) => ({
  ...createListSlice(set, get),

  ...initListData,

  /* TODO : 검색에서 사용할 input 선언 및 초기화 반영 */
  searchParam: {
    searchWord: '',
  },

  initSearchInput: () => {
    set({
      searchParam: {
        ...initSearchParam,
      },
    });
  },

  clear: () => {
    set({ ...listBaseState, searchParam: { ...initSearchParam } });
  },
}));

function <%= fileName %>() {
  const store = <%= storeName %>();
  const [columns, setColumns] = useState(
  CommonUtil.mergeColumnInfosByLocal([<% tableColumns.forEach((columnInfo)=> { %>
      { key: "<%= columnInfo.column_name %>", dataIndex: "<%= columnInfo.column_name %>", title: "<%= columnInfo.column_comment %>" },<% }) %>
  ])
  );
  const { enterSearch, list, clear } = store;

  const handleRowDoubleClick = useCallback((selectedInfo) => {
    // TODO : 더블클릭시 상세 페이지 또는 모달 페이지 오픈
  }, []);

  useEffect(() => {
    enterSearch();
    return clear;
  }, []);

  return (
    <div>
      <AppNavigation />
      {/* TODO : 헤더 영역입니다 */}
      <div className="conts-title">
        <h2>TODO: 타이틀</h2>
      </div>
      {/* TODO : 검색 input 영역입니다 */}
      <AppTable
        rowData={list}
        columns={columns}
        setColumns={setColumns}
        store={store}
        handleRowDoubleClick={handleRowDoubleClick}
        searchInputComponent={<AppTableBaseSearchInput store={store} />}
      />
    </div>
  );
}

export default <%= fileName %>;
`;

const formStoreGenerateString = `import { create } from "zustand";
import { formBaseState, createFormSliceYup } from "@/stores/slice/formSlice";
import * as yup from "yup";

/* yup validation */
const yupFormSchema = yup.object({<% tableColumns.forEach((columnInfo)=> { %>
  <%= columnInfo.column_name %>: yup.<%= columnInfo.yupType %>,<% }) %>
});

/* TODO : form 초기값 상세 셋팅 */
/* formValue 초기값 */
const initFormValue = {
  <% tableColumns.forEach((columnInfo)=> { %>
  <%= columnInfo.column_name %>: <%- columnInfo.formInitValue %>,<% }) %>
};

/* form 초기화 */
const initFormData = {
  ...formBaseState,

  initFormValue: { ...initFormValue },

  formApiPath: 'TODO : api path',
  baseRoutePath: 'TODO : UI route path',
  formName: '<%= formName %>',
  formValue: {
    ...initFormValue,
  }
};

/* zustand store 생성 */
const <%= fileName %> = create<any>((set, get) => ({
  ...createFormSliceYup(set, get),

  ...initFormData,

  yupFormSchema: yupFormSchema,

  clear: () => {
    set({ ...formBaseState, formValue: { ...initFormValue } });
  },
}));

export default <%= fileName %>`;

const formViewGenerateString = `import { useEffect } from 'react';
import AppNavigation from '@/components/common/AppNavigation';
import AppAreaDirect from '@/components/common/AppAreaDirect';
import AppButton from '@/components/common/AppButton';
import { FORM_TYPE_ADD } from '@/config/CommonConstant';
import { useParams } from 'react-router-dom';<% importList.forEach((importString)=> { %>
<%- importString %><% }) %><% if(checkedInnerFormStore) { %>
import { create } from "zustand";
import { formBaseState, createFormSliceYup } from "@/stores/slice/formSlice";
import * as yup from "yup"; <% } %>
<% if(checkedInnerFormStore) { %>
/* yup validation */
const yupFormSchema = yup.object({<% tableColumns.forEach((columnInfo)=> { %>
  <%= columnInfo.column_name %>: yup.<%= columnInfo.yupType %>,<% }) %>
});

/* TODO : form 초기값 상세 셋팅 */
/* formValue 초기값 */
const initFormValue = {<% tableColumns.forEach((columnInfo)=> { %>
  <%= columnInfo.column_name %>: <%- columnInfo.formInitValue %>,<% }) %>
};

/* form 초기화 */
const initFormData = {
  ...formBaseState,

  initFormValue: { ...initFormValue },

  formApiPath: 'TODO : api path',
  baseRoutePath: 'TODO : UI route path',
  formName: '<%= formName %>',
  formValue: {
    ...initFormValue,
  }
};

/* zustand store 생성 */
const <%= storeName %> = create<any>((set, get) => ({
  ...createFormSliceYup(set, get),

  ...initFormData,

  yupFormSchema: yupFormSchema,

  clear: () => {
    set({ ...formBaseState, formValue: { ...initFormValue } });
  },
}));<% } else { %>
/* TODO : store 경로를 변경해주세요. */
import <%= storeName %> from '@/stores/guide/<%= storeName %>';
<% } %>

/* TODO : 컴포넌트 이름을 확인해주세요 */
function <%= fileName %>() {

  /* formStore state input 변수 */
  const {
    errors,
    changeInput,
    getDetail,
    formType,
    formValue,
    save,
    cancel,
    clear } =
    <%= storeName %>();

  const { <% tableColumns.forEach((columnInfo)=> { %> <%= columnInfo.column_name %>,<% }) %> } = formValue;

  const { detailId } = useParams();

  useEffect(() => {
    if (detailId && detailId !== FORM_TYPE_ADD) {
      getDetail(detailId);
    }
    return clear;
  }, []);

  useEffect(() => {
    if (detailId && detailId !== FORM_TYPE_ADD) {
      getDetail(detailId);
    }
  }, [detailId]);

  useEffect(() => {
    return clear;
  }, []);


  return (
    <div>
      <AppNavigation />
      <div className="conts-title">
        <h2>{formType === FORM_TYPE_ADD ? '등록' : '수정'}</h2>
      </div>
      <div className="editbox">
        <AppAreaDirect direction="column" gap={10} parentLine={true}><% tableColumnMultiArray.forEach((rootArray)=> { %>
          <AppAreaDirect direction="row" gap={20} uniform={true}><% rootArray.forEach((columnInfo)=> { %><% if (columnInfo.componentType === 'number') { %>
            <AppTextInput
              inputType="number"
              id="<%= formName %><%= columnInfo.column_name %>"
              name="<%= columnInfo.column_name %>"
              label="<%= columnInfo.column_comment %>"
              value={<%= columnInfo.column_name %>}
              onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
              errorMessage={errors.<%= columnInfo.column_name %>}
              <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
            /><% } else if(columnInfo.componentType === 'select'){ %>
              <AppSelect
              id="<%= formName %><%= columnInfo.column_name %>"
              name="<%= columnInfo.column_name %>"
              label="<%= columnInfo.column_comment %>"
              value={<%= columnInfo.column_name %>}
              onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
              options={[]}
              errorMessage={errors.<%= columnInfo.column_name %>}
              <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
            /><% } else if(columnInfo.componentType === 'textarea'){ %>
              <AppTextArea
              id="<%= formName %><%= columnInfo.column_name %>"
              name="<%= columnInfo.column_name %>"
              label="<%= columnInfo.column_comment %>"
              value={<%= columnInfo.column_name %>}
              onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
              errorMessage={errors.<%= columnInfo.column_name %>}
              <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
            /><% } else if(columnInfo.componentType === 'code'){ %>
            <AppCodeSelect
              codeGrpId="<%= columnInfo.codeGroupId %>"
              id="<%= formName %><%= columnInfo.column_name %>"
              name="<%= columnInfo.column_name %>"
              label="<%= columnInfo.column_comment %>"
              value={<%= columnInfo.column_name %>}
              onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
              errorMessage={errors.<%= columnInfo.column_name %>}
              <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
            /><% } else if(columnInfo.componentType === 'editor'){ %>
            <AppEditor
              id="<%= formName %><%= columnInfo.column_name %>"
              name="<%= columnInfo.column_name %>"
              label="<%= columnInfo.column_comment %>"
              value={<%= columnInfo.column_name %>}
              onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
              errorMessage={errors.<%= columnInfo.column_name %>}
              <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
            /><% } else if(columnInfo.componentType === 'datepicker'){ %>
            <AppDatePicker
              id="<%= formName %><%= columnInfo.column_name %>"
              name="<%= columnInfo.column_name %>"
              label="<%= columnInfo.column_comment %>"
              value={<%= columnInfo.column_name %>}
              onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
              errorMessage={errors.<%= columnInfo.column_name %>}
              <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
            /><% } else if(columnInfo.componentType === 'timepicker'){ %>
            <AppTimePicker
              id="<%= formName %><%= columnInfo.column_name %>"
              name="<%= columnInfo.column_name %>"
              label="<%= columnInfo.column_comment %>"
              value={<%= columnInfo.column_name %>}
              onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
              errorMessage={errors.<%= columnInfo.column_name %>}
              <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
            /><% } else if(columnInfo.componentType === 'checkbox'){ %>              
            <AppCheckbox
              id="<%= formName %><%= columnInfo.column_name %>"
              name="<%= columnInfo.column_name %>"
              label="<%= columnInfo.column_comment %>"
              value={<%= columnInfo.column_name %>}
              onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
              errorMessage={errors.<%= columnInfo.column_name %>}
              <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
            /><% } else if(columnInfo.componentType === 'checkboxgroup'){ %>
            <AppCheckboxGroup
              id="<%= formName %><%= columnInfo.column_name %>"
              name="<%= columnInfo.column_name %>"
              label="<%= columnInfo.column_comment %>"
              options={[]}
              value={<%= columnInfo.column_name %>}
              onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
              errorMessage={errors.<%= columnInfo.column_name %>}
              <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
            /><% } else if(columnInfo.componentType === 'radio'){ %>
            <AppRadioGroup
              id="<%= formName %><%= columnInfo.column_name %>"
              name="<%= columnInfo.column_name %>"
              label="<%= columnInfo.column_comment %>"
              options={[]}
              value={<%= columnInfo.column_name %>}
              onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
              errorMessage={errors.<%= columnInfo.column_name %>}
              <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
            /><% } else if(columnInfo.componentType === 'user-select-input'){ %>
            <AppUserSelectInput
              id="<%= formName %><%= columnInfo.column_name %>"
              name="<%= columnInfo.column_name %>"
              label="<%= columnInfo.column_comment %>"
              value={<%= columnInfo.column_name %>}
              onChange={(value) => {
                changeInput('<%= columnInfo.column_name %>', value)
              }}
              errorMessage={errors.<%= columnInfo.column_name %>}
              <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
            /><% } else if(columnInfo.componentType === 'dept-select-input'){ %>
            <AppDeptSelectInput
              id="<%= formName %><%= columnInfo.column_name %>"
              name="<%= columnInfo.column_name %>"
              label="<%= columnInfo.column_comment %>"
              value={<%= columnInfo.column_name %>}
              onChange={(value) => {
                changeInput('<%= columnInfo.column_name %>', value)
              }}
              errorMessage={errors.<%= columnInfo.column_name %>}
              <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
            /><% } else if(columnInfo.componentType === 'auto-complete'){ %>
            <AppAutoComplete
              id="<%= formName %><%= columnInfo.column_name %>"
              name="<%= columnInfo.column_name %>"
              label="<%= columnInfo.column_comment %>"
              value={<%= columnInfo.column_name %>}
              apiUrl="TODO: apiUrl"
              labelKey="TODO: labelKey"
              valueKey="TODO: valueKey"
              onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
              errorMessage={errors.<%= columnInfo.column_name %>}
              <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
            /><% } else if(columnInfo.componentType === 'file'){ %>
            <AppFileAttach
              id="<%= formName %><%= columnInfo.column_name %>"
              name="<%= columnInfo.column_name %>"
              label="<%= columnInfo.column_comment %>"
              fileGroupSeq={<%= columnInfo.column_name %>}
              workScope={'업무구문(A,O,S)'}
              updateFileGroupSeq={(newFileGroupSeq) => {
                changeInput('fileGroupSeq', newFileGroupSeq);
              }}
            /><% } else if(columnInfo.componentType === 'tree-select'){ %>
            <AppTreeSelect
              id="<%= formName %><%= columnInfo.column_name %>"
              name="<%= columnInfo.column_name %>"
              label="<%= columnInfo.column_comment %>"
              fieldNames={{ label: '라벨키', value: 'value키' }}
              treeData={[]}
              treeDefaultExpandAll={false}
              treeCheckable={false}
              value={<%= columnInfo.column_name %>}
              onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
              errorMessage={errors.<%= columnInfo.column_name %>}
              <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
            /><% } else if(columnInfo.componentType === 'search-input'){ %>
            <AppSearchInput
              id="<%= formName %><%= columnInfo.column_name %>"
              name="<%= columnInfo.column_name %>"
              label="<%= columnInfo.column_comment %>"
              value={<%= columnInfo.column_name %>}
              onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
              errorMessage={errors.<%= columnInfo.column_name %>}
              <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
            /><% } else { %>
            <AppTextInput
              id="<%= formName %><%= columnInfo.column_name %>"
              name="<%= columnInfo.column_name %>"
              label="<%= columnInfo.column_comment %>"
              value={<%= columnInfo.column_name %>}
              onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
              errorMessage={errors.<%= columnInfo.column_name %>}
              <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
            /><% } %><% }) %>
          </AppAreaDirect><% }) %>
        </AppAreaDirect>
      </div>
      {/* 하단 버튼 영역 */}
      <div className="content_btns">
        <AppButton value="저장" size="large" isFix={true} onClick={save} />
        <AppButton value="취소" size="large" variant="lower" isFix={true} onClick={cancel} />
      </div>
    </div>
  );
}
export default <%= fileName %>;
`;

const detailViewGenerateString = `import { useEffect } from 'react';
import AppNavigation from '@/components/common/AppNavigation';
import AppAreaDirect from '@/components/common/AppAreaDirect';
import AppButton from '@/components/common/AppButton';
import { useParams } from 'react-router-dom';

/* TODO : store 경로를 변경해주세요. */
import <%= storeName %> from '@/stores/guide/<%= storeName %>';

/* TODO : 컴포넌트 이름을 확인해주세요 */
function <%= fileName %>() {

  /* formStore state input 변수 */
  const {
    detailInfo,
    getDetail,
    clear } =
    <%= storeName %>();
  const { <% tableColumns.forEach((columnInfo)=> { %> <%= columnInfo.column_name %>,<% }) %> } = detailInfo;

  const { detailId } = useParams();

  useEffect(() => {
    getDetail(detailId);
    return clear;
  }, []);

  return (
    <div>
      <AppNavigation />
      <div className="conts-title">
        <h2>TODO : 헤더 타이틀</h2>
      </div>
      <AppAreaDirect direction="row" gap={0} align="flex-start">
        <AppAreaDirect direction="column" gap={20}>
          <div className="key-value-wrap two-row "><% tableColumnMultiArray.forEach((rootArray)=> { %><% rootArray.forEach((columnInfo)=> { %>
            <div className="key-value-item column">
              <p className="key"><%= columnInfo.column_comment %></p>
              <p className="value">{<%= columnInfo.column_name %>}</p>
            </div><% }) %><% }) %>
          </div>
        </AppAreaDirect>
      </AppAreaDirect>
      {/* 하단 버튼 영역 */}
      <div className="content_btns">
        <AppButton size="large" value="저장" />
      </div>
    </div>
  );
}
export default <%= fileName %>;
`;

const detailViewGenerateNoStoreString = `import { useEffect, useState } from 'react';
import AppNavigation from '@/components/common/AppNavigation';
import AppAreaDirect from '@/components/common/AppAreaDirect';
import AppButton from '@/components/common/AppButton';
import { useParams } from 'react-router-dom';
import ApiService from '@/services/ApiService';

/* TODO : 컴포넌트 이름을 확인해주세요 */
function <%= fileName %>() {

  const [detailInfo, setDetailInfo] = useState<any>({});

  const { <% tableColumns.forEach((columnInfo)=> { %> <%= columnInfo.column_name %>,<% }) %> } = detailInfo;

  const { detailId } = useParams();

  const cancel = () => {
    // TODO : [목록으로] 버튼 처리
  };

  const goFormPage = () => {
    // TODO : [수정] 버튼 처리
  };

  useEffect(() => {
    ApiService.get('TODO: detailId with api path').then((apiResult) => {
      const detailInfo = apiResult.data || {};
      setDetailInfo(detailInfo);
    });
  }, []);

  return (
    <div>
      <AppNavigation />
      <div className="conts-title">
        <h2>TODO : 헤더 타이틀</h2>
      </div>
      <AppAreaDirect direction="row" gap={0} align="flex-start">
        <AppAreaDirect direction="column" gap={20}>
          <div className="key-value-wrap two-row "><% tableColumnMultiArray.forEach((rootArray)=> { %><% rootArray.forEach((columnInfo)=> { %>
            <div className="key-value-item column">
              <p className="key"><%= columnInfo.column_comment %></p>
              <p className="value">{<%= columnInfo.column_name %>}</p>
            </div><% }) %><% }) %>
          </div>
        </AppAreaDirect>
      </AppAreaDirect>
      {/* 하단 버튼 영역 */}
      <div className="content_btns">
        <AppButton size="large" value="저장" />
      </div>
    </div>
  );
}
export default <%= fileName %>;
`;

const formModalGenerateString = `import { useEffect } from 'react';<% importList.forEach((importString)=> { %>
<%- importString %><% }) %>
import AppAreaDirect from "@/components/common/AppAreaDirect";
import AppButton from "@/components/common/AppButton";
import { FORM_TYPE_ADD } from '@/config/CommonConstant';
import Modal from 'react-modal';<% if(checkedInnerFormStore) { %>
import { create } from "zustand";
import { formBaseState, createFormSliceYup } from "@/stores/slice/formSlice";
import * as yup from "yup";<% } %>
<% if(checkedInnerFormStore) { %>
/* yup validation */
const yupFormSchema = yup.object({<% tableColumns.forEach((columnInfo)=> { %>
  <%= columnInfo.column_name %>: yup.<%= columnInfo.yupType %>,<% }) %>
});

/* TODO : form 초기값 상세 셋팅 */
/* formValue 초기값 */
const initFormValue = {<% tableColumns.forEach((columnInfo)=> { %>
  <%= columnInfo.column_name %>: <%- columnInfo.formInitValue %>,<% }) %>
};

/* form 초기화 */
const initFormData = {
  ...formBaseState,

  initFormValue: { ...initFormValue },

  formApiPath: 'TODO : api path',
  baseRoutePath: 'TODO : UI route path',
  formName: '<%= formName %>',
  formValue: {
    ...initFormValue,
  }
};

/* zustand store 생성 */
const <%= storeName %> = create<any>((set, get) => ({
  ...createFormSliceYup(set, get),

  ...initFormData,

  yupFormSchema: yupFormSchema,

  clear: () => {
    set({ ...formBaseState, formValue: { ...initFormValue } });
  },
}));<% } else { %>
/* TODO : store 경로를 변경해주세요. */
import <%= storeName %> from '@/stores/guide/<%= storeName %>';
<% } %>

/* TODO : 컴포넌트 이름을 확인해주세요3 */
function <%= fileName %>(props) {
  const { isOpen, closeModal } = props;

  // TODO : 목록에서 선택한 값을 그대로 이용할지 여부 결정
  // const { detailInfo } = props;

  /* formStore state input 변수 */
  const {
    errors,
    changeInput,
    getDetail,
    formType,
    formValue,
    detailInfo,
    save,
    cancel,
    clear } =
    <%= storeName %>();

  const { <% tableColumns.forEach((columnInfo)=> { %> <%= columnInfo.column_name %>,<% }) %> } = formValue;

  useEffect(() => {
    // TODO : isOpen일 경우에 상세 api 호출 할지 결정 : if(isOpen)
    // TODO : isOpen일 경우에 formValue를 넘겨준 값으로 셋팅할지 말지 : if(isOpen && detailInfo)
    return clear;
  }, [isOpen, detailInfo]);

  return (
    <>
      <Modal
        shouldCloseOnOverlayClick={false}
        isOpen={isOpen}
        ariaHideApp={false}
        overlayClassName={'alert-modal-overlay'}
        className={'middle-modal-content'}
        onRequestClose={() => {
          closeModal();
        }}
      >
        <div className="popup-container">
          <h3 className="pop_title">{formType === FORM_TYPE_ADD ? '등록' : '수정'}</h3>
          <div className="pop_cont">
            <div className="content-border-box">
              <AppAreaDirect direction="column" gap={10} parentLine={true}><% tableColumnMultiArray.forEach((rootArray)=> { %>
                <AppAreaDirect direction="row" gap={20} uniform={true}><% rootArray.forEach((columnInfo)=> { %><% if (columnInfo.componentType === 'number') { %>
                  <AppTextInput
                    inputType="number"
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    value={<%= columnInfo.column_name %>}
                    onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
                    errorMessage={errors.<%= columnInfo.column_name %>}
                    <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
                  /><% } else if(columnInfo.componentType === 'select'){ %>
                    <AppSelect
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    value={<%= columnInfo.column_name %>}
                    onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
                    options={[]}
                    errorMessage={errors.<%= columnInfo.column_name %>}
                    <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
                  /><% } else if(columnInfo.componentType === 'textarea'){ %>
                    <AppTextArea
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    value={<%= columnInfo.column_name %>}
                    onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
                    errorMessage={errors.<%= columnInfo.column_name %>}
                    <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
                  /><% } else if(columnInfo.componentType === 'code'){ %>
                  <AppCodeSelect
                    codeGrpId="<%= columnInfo.codeGroupId %>"
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    value={<%= columnInfo.column_name %>}
                    onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
                    errorMessage={errors.<%= columnInfo.column_name %>}
                    <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
                  /><% } else if(columnInfo.componentType === 'editor'){ %>
                  <AppEditor
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    value={<%= columnInfo.column_name %>}
                    onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
                    errorMessage={errors.<%= columnInfo.column_name %>}
                    <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
                  /><% } else if(columnInfo.componentType === 'datepicker'){ %>
                  <AppDatePicker
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    value={<%= columnInfo.column_name %>}
                    onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
                    errorMessage={errors.<%= columnInfo.column_name %>}
                    <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
                  /><% } else if(columnInfo.componentType === 'timepicker'){ %>
                  <AppTimePicker
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    value={<%= columnInfo.column_name %>}
                    onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
                    errorMessage={errors.<%= columnInfo.column_name %>}
                    <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
                  /><% } else if(columnInfo.componentType === 'checkbox'){ %>              
                  <AppCheckbox
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    value={<%= columnInfo.column_name %>}
                    onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
                    errorMessage={errors.<%= columnInfo.column_name %>}
                    <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
                  /><% } else if(columnInfo.componentType === 'checkboxgroup'){ %>
                  <AppCheckboxGroup
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    options={[]}
                    value={<%= columnInfo.column_name %>}
                    onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
                    errorMessage={errors.<%= columnInfo.column_name %>}
                    <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
                  /><% } else if(columnInfo.componentType === 'radio'){ %>
                  <AppRadioGroup
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    options={[]}
                    value={<%= columnInfo.column_name %>}
                    onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
                    errorMessage={errors.<%= columnInfo.column_name %>}
                    <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
                  /><% } else if(columnInfo.componentType === 'user-select-input'){ %>
                  <AppUserSelectInput
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    value={<%= columnInfo.column_name %>}
                    onChange={(value) => {
                      changeInput('<%= columnInfo.column_name %>', value)
                    }}
                    errorMessage={errors.<%= columnInfo.column_name %>}
                    <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
                  /><% } else if(columnInfo.componentType === 'dept-select-input'){ %>
                  <AppDeptSelectInput
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    value={<%= columnInfo.column_name %>}
                    onChange={(value) => {
                      changeInput('<%= columnInfo.column_name %>', value)
                    }}
                    errorMessage={errors.<%= columnInfo.column_name %>}
                    <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
                  /><% } else if(columnInfo.componentType === 'auto-complete'){ %>
                  <AppAutoComplete
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    value={<%= columnInfo.column_name %>}
                    apiUrl="TODO: apiUrl"
                    labelKey="TODO: labelKey"
                    valueKey="TODO: valueKey"
                    onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
                    errorMessage={errors.<%= columnInfo.column_name %>}
                    <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
                  /><% } else if(columnInfo.componentType === 'file'){ %>
                  <AppFileAttach
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    fileGroupSeq={<%= columnInfo.column_name %>}
                    workScope={'업무구문(A,O,S)'}
                    updateFileGroupSeq={(newFileGroupSeq) => {
                      changeInput('fileGroupSeq', newFileGroupSeq);
                    }}
                  /><% } else if(columnInfo.componentType === 'tree-select'){ %>
                  <AppTreeSelect
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    fieldNames={{ label: '라벨키', value: 'value키' }}
                    treeData={[]}
                    treeDefaultExpandAll={false}
                    treeCheckable={false}
                    value={<%= columnInfo.column_name %>}
                    onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
                    errorMessage={errors.<%= columnInfo.column_name %>}
                    <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
                  /><% } else if(columnInfo.componentType === 'search-input'){ %>
                  <AppSearchInput
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    value={<%= columnInfo.column_name %>}
                    onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
                    errorMessage={errors.<%= columnInfo.column_name %>}
                    <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
                  /><% } else { %>
                  <AppTextInput
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    value={<%= columnInfo.column_name %>}
                    onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
                    errorMessage={errors.<%= columnInfo.column_name %>}
                    <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
                  /><% } %><% }) %>
                </AppAreaDirect><% }) %>
              </AppAreaDirect>
            </div>
          </div>
          {/* 하단 버튼 영역 */}
          <div className="pop_btns">
            <AppButton size="large" value="취소" variant="lower" onClick={closeModal} />
            <AppButton size="large" value="확인" onClick={save} />
          </div>
          <span className="pop_close" onClick={closeModal}>
            X
          </span>
        </div>
      </Modal>
    </>
  );
}
export default <%= fileName %>;
`;

const formUseStateModalGenerateString = `import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import * as yup from 'yup';
import { useImmer } from 'use-immer';
import AppAreaDirect from "@/components/common/AppAreaDirect";
import AppButton from "@/components/common/AppButton";
import CommonUtil from '@/utils/CommonUtil';<% importList.forEach((importString)=> { %>
<%- importString %><% }) %>

const formName = '<%= formName %>';

/* yup validation */
const yupFormSchema = yup.object({<% tableColumns.forEach((columnInfo)=> { %>
  <%= columnInfo.column_name %>: yup.<%= columnInfo.yupType %>,<% }) %>
});

/* form 초기화 */
const initFormValue = {<% tableColumns.forEach((columnInfo)=> { %>
  <%= columnInfo.column_name %>: <%- columnInfo.formInitValue %>,<% }) %>
};

/* TODO : 컴포넌트 이름을 확인해주세요 */
function <%= fileName %>(props) {

  const { isOpen, closeModal, detailInfo, ok } = props;
  const [formValue, setFormValue] = useImmer({ ...initFormValue });
  const [errors, setErrors] = useState<any>({});
  const [isDirty, setIsDirty] = useState(false);

  const { <% tableColumns.forEach((columnInfo)=> { %> <%= columnInfo.column_name %>,<% }) %> } = formValue;

  const changeInput = (inputName, inputValue) => {
    setFormValue((formValue) => {
      formValue[inputName] = inputValue;
    });
    setIsDirty(true);
  };

  const save = async () => {
    const validateResult = await CommonUtil.validateYupForm(yupFormSchema, formValue);
    const { success, firstErrorFieldKey, errors } = validateResult;
    if (success) {
      // TODO : 모달 최종 저장시 액션 정의
      ok(formValue);
    } else {
      setErrors(errors);
      if (formName + firstErrorFieldKey) {
        document.getElementById(formName + firstErrorFieldKey).focus();
      }
    }
  };

  useEffect(() => {
    // TODO : isOpen일 경우에 상세 api 호출 할지 결정 : if(isOpen)
    if (isOpen) {
      if (detailInfo) {
        setFormValue(detailInfo);
      } else {
        setFormValue({ ...initFormValue });
      }
    }
  }, [isOpen, detailInfo]);

  return (
    <>
      <Modal
        shouldCloseOnOverlayClick={false}
        isOpen={isOpen}
        ariaHideApp={false}
        overlayClassName={'alert-modal-overlay'}
        className={'middle-modal-content'}
        onRequestClose={() => {
          closeModal();
        }}
      >
        <div className="popup-container">
          <h3 className="pop_title">TODO : 모달 타이틀</h3>
          <div className="pop_cont">
            <div className="content-border-box">
              <AppAreaDirect direction="column" gap={10} parentLine={true}><% tableColumnMultiArray.forEach((rootArray)=> { %>
                <AppAreaDirect direction="row" gap={20} uniform={true}><% rootArray.forEach((columnInfo)=> { %><% if (columnInfo.componentType === 'number') { %>
                  <AppTextInput
                    inputType="number"
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    value={<%= columnInfo.column_name %>}
                    onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
                    errorMessage={errors.<%= columnInfo.column_name %>}
                    <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
                  /><% } else if(columnInfo.componentType === 'select'){ %>
                    <AppSelect
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    value={<%= columnInfo.column_name %>}
                    onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
                    options={[]}
                    errorMessage={errors.<%= columnInfo.column_name %>}
                    <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
                  /><% } else if(columnInfo.componentType === 'textarea'){ %>
                    <AppTextArea
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    value={<%= columnInfo.column_name %>}
                    onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
                    errorMessage={errors.<%= columnInfo.column_name %>}
                    <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
                  /><% } else if(columnInfo.componentType === 'code'){ %>
                  <AppCodeSelect
                    codeGrpId="<%= columnInfo.codeGroupId %>"
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    value={<%= columnInfo.column_name %>}
                    onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
                    errorMessage={errors.<%= columnInfo.column_name %>}
                    <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
                  /><% } else if(columnInfo.componentType === 'editor'){ %>
                  <AppEditor
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    value={<%= columnInfo.column_name %>}
                    onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
                    errorMessage={errors.<%= columnInfo.column_name %>}
                    <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
                  /><% } else if(columnInfo.componentType === 'datepicker'){ %>
                  <AppDatePicker
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    value={<%= columnInfo.column_name %>}
                    onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
                    errorMessage={errors.<%= columnInfo.column_name %>}
                    <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
                  /><% } else if(columnInfo.componentType === 'timepicker'){ %>
                  <AppTimePicker
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    value={<%= columnInfo.column_name %>}
                    onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
                    errorMessage={errors.<%= columnInfo.column_name %>}
                    <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
                  /><% } else if(columnInfo.componentType === 'checkbox'){ %>              
                  <AppCheckbox
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    value={<%= columnInfo.column_name %>}
                    onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
                    errorMessage={errors.<%= columnInfo.column_name %>}
                    <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
                  /><% } else if(columnInfo.componentType === 'checkboxgroup'){ %>
                  <AppCheckboxGroup
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    options={[]}
                    value={<%= columnInfo.column_name %>}
                    onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
                    errorMessage={errors.<%= columnInfo.column_name %>}
                    <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
                  /><% } else if(columnInfo.componentType === 'radio'){ %>
                  <AppRadioGroup
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    options={[]}
                    value={<%= columnInfo.column_name %>}
                    onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
                    errorMessage={errors.<%= columnInfo.column_name %>}
                    <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
                  /><% } else if(columnInfo.componentType === 'user-select-input'){ %>
                  <AppUserSelectInput
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    value={<%= columnInfo.column_name %>}
                    onChange={(value) => {
                      changeInput('<%= columnInfo.column_name %>', value)
                    }}
                    errorMessage={errors.<%= columnInfo.column_name %>}
                    <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
                  /><% } else if(columnInfo.componentType === 'dept-select-input'){ %>
                  <AppDeptSelectInput
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    value={<%= columnInfo.column_name %>}
                    onChange={(value) => {
                      changeInput('<%= columnInfo.column_name %>', value)
                    }}
                    errorMessage={errors.<%= columnInfo.column_name %>}
                    <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
                  /><% } else if(columnInfo.componentType === 'auto-complete'){ %>
                  <AppAutoComplete
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    value={<%= columnInfo.column_name %>}
                    apiUrl="TODO: apiUrl"
                    labelKey="TODO: labelKey"
                    valueKey="TODO: valueKey"
                    onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
                    errorMessage={errors.<%= columnInfo.column_name %>}
                    <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
                  /><% } else if(columnInfo.componentType === 'file'){ %>
                  <AppFileAttach
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    fileGroupSeq={<%= columnInfo.column_name %>}
                    workScope={'업무구문(A,O,S)'}
                    updateFileGroupSeq={(newFileGroupSeq) => {
                      changeInput('fileGroupSeq', newFileGroupSeq);
                    }}
                  /><% } else if(columnInfo.componentType === 'tree-select'){ %>
                  <AppTreeSelect
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    fieldNames={{ label: '라벨키', value: 'value키' }}
                    treeData={[]}
                    treeDefaultExpandAll={false}
                    treeCheckable={false}
                    value={<%= columnInfo.column_name %>}
                    onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
                    errorMessage={errors.<%= columnInfo.column_name %>}
                    <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
                  /><% } else if(columnInfo.componentType === 'search-input'){ %>
                  <AppSearchInput
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    value={<%= columnInfo.column_name %>}
                    onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
                    errorMessage={errors.<%= columnInfo.column_name %>}
                    <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
                  /><% } else { %>
                  <AppTextInput
                    id="<%= formName %><%= columnInfo.column_name %>"
                    name="<%= columnInfo.column_name %>"
                    label="<%= columnInfo.column_comment %>"
                    value={<%= columnInfo.column_name %>}
                    onChange={(value) => changeInput('<%= columnInfo.column_name %>', value)}
                    errorMessage={errors.<%= columnInfo.column_name %>}
                    <% if (columnInfo.is_nullable !== 'YES') { %>required<% } %>
                  /><% } %><% }) %>
                </AppAreaDirect><% }) %>
              </AppAreaDirect>
            </div>
          </div>
          {/* 하단 버튼 영역 */}
          <div className="pop_btns">
            <AppButton size="large" value="취소" variant="lower" onClick={closeModal} />
            <AppButton size="large" value="확인" onClick={closeModal} />
          </div>
          <span className="pop_close" onClick={save}>
            X
          </span>
        </div>
      </Modal>
    </>
  );
}
export default <%= fileName %>;
`;

const detailModalGenerateString = `import { useEffect } from 'react';
import Modal from 'react-modal';
import AppButton from '@/components/common/AppButton';
import AppAreaDirect from '@/components/common/AppAreaDirect';

/* TODO : 컴포넌트 이름을 확인해주세요 */
function <%= fileName %>(props) {
  const { isOpen, closeModal } = props;

  // TODO : 목록에서 선택한 값을 그대로 이용할지 여부 결정
  // const { detailInfo } = props;

  /* formStore state input 변수 */
  const {
    detailInfo,
    getDetail,
    clear } =
    <%= storeName %>();
  const { <% tableColumns.forEach((columnInfo)=> { %> <%= columnInfo.column_name %>,<% }) %> } = detailInfo;

  useEffect(() => {
    // TODO : isOpen일 경우에 상세 api 호출 할지 결정
    return clear;
  }, [isOpen]);

  return (
    <>
      <Modal
        shouldCloseOnOverlayClick={false}
        isOpen={isOpen}
        ariaHideApp={false}
        overlayClassName={'alert-modal-overlay'}
        className={'middle-modal-content'}
        onRequestClose={() => {
          closeModal();
        }}
      >
        <div className="popup-container">
          <h3 className="pop_title">TODO : 모달 타이틀</h3>
          <div className="pop_cont">
            <div className="content-border-box">
              <AppAreaDirect direction="row" gap={0} align="flex-start">
                <AppAreaDirect direction="column" gap={20}>
                  <div className="key-value-wrap two-row "><% tableColumnMultiArray.forEach((rootArray)=> { %><% rootArray.forEach((columnInfo)=> { %>
                    <div className="key-value-item column">
                      <p className="key"><%= columnInfo.column_comment %></p>
                      <p className="value">{<%= columnInfo.column_name %>}</p>
                    </div><% }) %><% }) %>
                  </div>
                </AppAreaDirect>
              </AppAreaDirect>
            </div>
          </div>
          {/* 하단 버튼 영역 */}
          <div className="pop_btns">
            <AppButton size="large" value="취소" variant="lower" onClick={closeModal} />
            <AppButton size="large" value="확인" onClick={closeModal} />
          </div>
          <span className="pop_close" onClick={closeModal}>
            X
          </span>
        </div>
      </Modal>
    </>
  );
}
export default <%= fileName %>;
`;

const searchFormGenerateString = `import AppAreaDirect from "@/components/common/AppAreaDirect";
import AppCommonSearchLayer from "@/components/common/AppCommonSearchLayer";

function <%= fileName %>(props) {
  const { store } = props;
  const { changeSearchInput, searchParam } = store;
  const { <% tableColumns.forEach((columnInfo)=> { %> <%= columnInfo.column_name %>,<% }) %> } = searchParam;

  const childComponent = (
    <AppAreaDirect direction="column" gap={10}>
      <AppAreaDirect direction="column" gap={10} parentLine={true}><% tableColumnMultiArray.forEach((rootArray)=> { %><% rootArray.forEach((columnInfo)=> { %>
        <AppAreaDirect direction="column" gap={10} uniform={true}>
          <AppAreaDirect direction="row" gap={10} uniform={true}><% if (columnInfo.componentType === 'search-input') { %>
            <AppSearchInput 
              label="<%= columnInfo.column_comment %>"
              value={<%= columnInfo.column_name %>}
              onChange={(value) => {
                changeSearchInput('<%= columnInfo.column_name %>', value);
              }}
              search={enterSearch}
            /><% } else if(columnInfo.componentType === 'number'){ %>
            <AppTextInput
              inputType="number"
              label="<%= columnInfo.column_comment %>"
              value={<%= columnInfo.column_name %>}
              onChange={(value) => {
                changeSearchInput('<%= columnInfo.column_name %>', value);
              }}
            /><% } else if(columnInfo.componentType === 'select'){ %>
            <AppSelect
              label="<%= columnInfo.column_comment %>"
              value={<%= columnInfo.column_name %>}
              onChange={(value) => {
                changeSearchInput('<%= columnInfo.column_name %>', value);
              }}
              options={[]}
            /><% } else if(columnInfo.componentType === 'code'){ %>
            <AppCodeSelect
              codeGrpId="<%= columnInfo.codeGroupId %>"
              label="<%= columnInfo.column_comment %>"
              value={<%= columnInfo.column_name %>}
              onChange={(value) => {
                changeSearchInput('<%= columnInfo.column_name %>', value);
              }}
            /><% } else if(columnInfo.componentType === 'datepicker'){ %>
            <AppDatePicker
              label="<%= columnInfo.column_comment %>"
              value={<%= columnInfo.column_name %>}
              onChange={(value) => {
                changeSearchInput('<%= columnInfo.column_name %>', value);
              }}
            /><% } else if(columnInfo.componentType === 'rangepicker'){ %>
            <AppRangeDatePicker
              label="<%= columnInfo.column_comment %>"
              value={<%= columnInfo.column_name %>}
              onChange={(value) => {
                changeSearchInput('<%= columnInfo.column_name %>', value);
              }}
            /><% } else if(columnInfo.componentType === 'timepicker'){ %>
            <AppTimePicker
              label="<%= columnInfo.column_comment %>"
              value={<%= columnInfo.column_name %>}
              onChange={(value) => {
                changeSearchInput('<%= columnInfo.column_name %>', value);
              }}
            /><% } else if(columnInfo.componentType === 'checkbox'){ %>              
            <AppCheckbox
              label="<%= columnInfo.column_comment %>"
              value={<%= columnInfo.column_name %>}
              onChange={(value) => {
                changeSearchInput('<%= columnInfo.column_name %>', value);
              }}
            /><% } else if(columnInfo.componentType === 'checkboxgroup'){ %>
            <AppCheckboxGroup
              label="<%= columnInfo.column_comment %>"
              options={[]}
              value={<%= columnInfo.column_name %>}
              onChange={(value) => {
                changeSearchInput('<%= columnInfo.column_name %>', value);
              }}
            /><% } else if(columnInfo.componentType === 'radio'){ %>
            <AppRadioGroup
              label="<%= columnInfo.column_comment %>"
              options={[]}
              value={<%= columnInfo.column_name %>}
              onChange={(value) => {
                changeSearchInput('<%= columnInfo.column_name %>', value);
              }}
            /><% } else if(columnInfo.componentType === 'user-select-input'){ %>
            <AppUserSelectInput
              label="<%= columnInfo.column_comment %>"
              value={<%= columnInfo.column_name %>}
              onChange={(value) => {
                changeSearchInput('<%= columnInfo.column_name %>', value)
              }}
            /><% } else if(columnInfo.componentType === 'dept-select-input'){ %>
            <AppDeptSelectInput
              label="<%= columnInfo.column_comment %>"
              value={<%= columnInfo.column_name %>}
              onChange={(value) => {
                changeSearchInput('<%= columnInfo.column_name %>', value)
              }}
            /><% } else if(columnInfo.componentType === 'auto-complete'){ %>
            <AppAutoComplete
              label="<%= columnInfo.column_comment %>"
              value={<%= columnInfo.column_name %>}
              apiUrl="TODO: apiUrl"
              labelKey="TODO: labelKey"
              valueKey="TODO: valueKey"
              onChange={(value) => {
                changeSearchInput('<%= columnInfo.column_name %>', value);
              }}
            /><% } else if(columnInfo.componentType === 'tree-select'){ %>
            <AppTreeSelect
              label="<%= columnInfo.column_comment %>"
              fieldNames={{ label: '라벨키', value: 'value키' }}
              treeData={[]}
              treeDefaultExpandAll={false}
              treeCheckable={false}
              value={<%= columnInfo.column_name %>}
              onChange={(value) => {
                changeSearchInput('<%= columnInfo.column_name %>', value);
              }}
            /><% } else { %>
            <AppTextInput
              label="<%= columnInfo.column_comment %>"
              value={<%= columnInfo.column_name %>}
              onChange={(value) => {
                changeSearchInput('<%= columnInfo.column_name %>', value);
              }}
            /><% } %>
          </AppAreaDirect>
        </AppAreaDirect><% }) %><% }) %>
      </AppAreaDirect>
      <AppAreaDirect direction="row" gap={10} uniform={false} className="justify-content-end">
        <AppButton value="검색" size="large" />
        <AppButton value="초기화" size="large" variant="secondary" />
      </AppAreaDirect>
    </AppAreaDirect>
  );
  
  return (
    <AppCommonSearchLayer style={{ width: '250px' }} searchLayerCustomComponent={childComponent}></AppCommonSearchLayer>
  );
}
export default <%= fileName %>;
`;

module.exports = {
  listComponentGenerateString: listComponentGenerateString,
  formStoreGenerateString: formStoreGenerateString,
  formViewGenerateString: formViewGenerateString,
  detailViewGenerateString: detailViewGenerateString,
  detailViewGenerateNoStoreString: detailViewGenerateNoStoreString,
  formModalGenerateString: formModalGenerateString,
  formUseStateModalGenerateString: formUseStateModalGenerateString,
  detailModalGenerateString: detailModalGenerateString,
  searchFormGenerateString: searchFormGenerateString,
};

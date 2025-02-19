const listComponentGenerateString = `import AppTable from "@/components/common/AppTable";
import AppNavigation from '@/components/common/AppNavigation';
import { createListSlice, listBaseState } from "@/stores/slice/listSlice";
import { useEffect, useState, useCallback } from "react";
import CommonUtil from '@/utils/CommonUtil';
import { create } from "zustand";
import AppSearchInput from '@/components/common/AppSearchInput';

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
  const state = <%= storeName %>();
  const [columns, setColumns] = useState(
  CommonUtil.mergeColumnInfosByLocal([<% tableColumns.forEach((columnInfo)=> { %>
      { field: "<%= columnInfo.column_name %>", headerName: "<%= columnInfo.column_comment %>" },<% }) %>
  ])
  );
  const { enterSearch, searchParam, list, goAddPage, changeSearchInput, initSearchInput, isExpandDetailSearch, toggleExpandDetailSearch, clear } = state;
  // TODO : 검색 파라미터 나열
  const { searchWord } = searchParam;

  const handleRowDoubleClick = useCallback((selectedInfo) => {
    // TODO : 더블클릭시 상세 페이지 또는 모달 페이지 오픈
  }, []);

  useEffect(() => {
    enterSearch();
    return clear;
  }, []);

  return (
    <>
      <AppNavigation />
      {/* TODO : 헤더 영역입니다 */}
      <div className="conts-title">
        <h2>TODO: 타이틀</h2>
      </div>
      {/* TODO : 검색 input 영역입니다 */}
      <div className="boxForm">
        <div className={isExpandDetailSearch ? 'area-detail active' : 'area-detail'}>
          <div className="form-table">
            <div className="form-cell wid50">
              <div className="form-group wid100">
                <AppSearchInput 
                  label="이름"
                  value={searchWord}
                  onChange={(value) => {
                    changeSearchInput('searchWord', value);
                  }}
                  search={enterSearch}
                />
              </div>
            </div>
          </div>
          <div className="btn-area">
            <button type="button" name="button" className="btn-sm btn_text btn-darkblue-line" onClick={enterSearch}>
              조회
            </button>
            <button type="button" name="button" className="btn-sm btn_text btn-darkblue-line" onClick={initSearchInput}>
              초기화
            </button>
          </div>          
        </div>
        <button
            type="button"
            name="button"
            className={isExpandDetailSearch ? 'arrow button _control active' : 'arrow button _control'}
            onClick={toggleExpandDetailSearch}
          >
          <span className="hide">접기</span>
        </button>
      </div>
      <AppTable
        rowData={list}
        columns={columns}
        setColumns={setColumns}
        store={state}
        handleRowDoubleClick={handleRowDoubleClick}
      />
      <div className="contents-btns">
        {/* TODO : 버튼 목록 정의 */}
        <button type="button" name="button" className="btn_text text_color_neutral-10 btn_confirm" onClick={goAddPage}>
          신규
        </button>
      </div>
    </>
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
import { useFormDirtyCheck } from '@/hooks/useFormDirtyCheck';
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
    isDirty,
    save,
    remove,
    cancel,
    clear } =
    <%= storeName %>();

  const { <% tableColumns.forEach((columnInfo)=> { %> <%= columnInfo.column_name %>,<% }) %> } = formValue;

  const { detailId } = useParams();

  useFormDirtyCheck(isDirty);

  useEffect(() => {
    if (detailId && detailId !== 'add') {
      getDetail(detailId);
    }
    return clear;
  }, []);

  return (
    <>
      <AppNavigation />
      <div className="conts-title">
        <h2>TODO : 헤더 타이틀</h2>
      </div>
      <div className="editbox"><% tableColumnMultiArray.forEach((rootArray)=> { %>
        <div className="<% if (rootArray.length > 1) { %>form-table line<% } else { %>form-table<% } %>"><% rootArray.forEach((columnInfo)=> { %>          
          <div className="<% if (rootArray.length > 1) { %>form-cell wid50<% } else { %>form-cell wid100<% } %>">
            <div className="<%= columnInfo.formGroupClassName %> wid100"><% if (columnInfo.componentType === 'number') { %>
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
                onChange={(value, userId) => {
                  // TODO : value가 object 형이여서 추가 처리가 필요함
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
                onChange={(value, deptCd) => {
                  // TODO : value가 object 형이여서 추가 처리가 필요함
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
                  // TODO : newFileGroupSeq를 handle
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
              /><% } %>              
            </div>
          </div><% }) %>
        </div>
        <hr className="<% if (rootArray.length > 1) { %>line dp-n<% } else { %>line<% } %>"></hr>
        <% }) %>
      </div>
      {/* 하단 버튼 영역 */}
      <div className="contents-btns">
        <button className="btn_text text_color_neutral-10 btn_confirm" onClick={save}>
          저장
        </button>
        <button
          className="btn_text text_color_darkblue-100 btn_close"
          onClick={remove}
          style={{ display: formType !== 'add' ? '' : 'none' }}
        >
          삭제
        </button>
        <button className="btn_text text_color_darkblue-100 btn_close" onClick={cancel}>
          취소
        </button>
      </div>
    </>
  );
}
export default <%= fileName %>;
`;

const detailViewGenerateString = `import { useEffect } from 'react';
import AppNavigation from '@/components/common/AppNavigation';
import { useParams } from 'react-router-dom';
import { Viewer } from '@toast-ui/react-editor';
import AppFileAttach from '@/components/common/AppFileAttach';

/* TODO : store 경로를 변경해주세요. */
import <%= storeName %> from '@/stores/guide/<%= storeName %>';

/* TODO : 컴포넌트 이름을 확인해주세요 */
function <%= fileName %>() {

  /* formStore state input 변수 */
  const {
    detailInfo,
    getDetail,
    formType,
    cancel,
    goFormPage,
    clear } =
    <%= storeName %>();
  const { <% tableColumns.forEach((columnInfo)=> { %> <%= columnInfo.column_name %>,<% }) %> } = detailInfo;

  const { detailId } = useParams();

  useEffect(() => {
    getDetail(detailId);
    return clear;
  }, []);

  return (
    <>
      <AppNavigation />
      <div className="conts-title">
        <h2>TODO : 헤더 타이틀</h2>
      </div>
      <div className="eidtbox"> <% tableColumnMultiArray.forEach((rootArray)=> { %>
        <div className="<% if (checkedMultiColumn) { %>form-table line<% } else { %>form-table<% } %>"><% rootArray.forEach((columnInfo)=> { %>
          <div className="<% if (checkedMultiColumn) { %>form-cell wid50<% } else { %>form-cell wid100<% } %>">
            <div className="form-group wid100">
              <div className="box-view-list">
                <ul className="view-list">
                  <li className="accumlate-list">
                    <label className="t-label">                        
                      <%= columnInfo.column_comment %>
                    </label><% if (columnInfo.componentType === 'file') { %>
                    <span className="text-desc-type1">
                        <AppFileAttach mode="view" fileGroupSeq={<%= columnInfo.column_name %>} workScope={'업무구문(A,O,S)'} onlyImageUpload={false} />
                    </span><% } else if(columnInfo.componentType === 'editor') { %>
                    <span className="text-desc-type1">
                        <Viewer initialValue={<%= columnInfo.column_name %>} />
                    </span><% } else { %>
                    <span className="text-desc-type1">{<%= columnInfo.column_name %>}</span><% } %>
                  </li>
                </ul>
              </div>
            </div>
          </div><% }) %>
        </div>
        <hr className="<% if (checkedMultiColumn) { %>line dp-n<% } else { %>line<% } %>"></hr>
        <% }) %>        
      </div>
      {/* 하단 버튼 영역 */}
      <div className="contents-btns">
        <button className="btn_text text_color_neutral-10 btn_confirm" onClick={cancel}>
          목록으로
        </button>
        <button
          className="btn_text text_color_darkblue-100 btn_close"
          onClick={goFormPage}
        >
          수정
        </button>
      </div>
    </>
  );
}
export default <%= fileName %>;
`;

const detailViewGenerateNoStoreString = `import { useEffect, useState } from 'react';
import AppNavigation from '@/components/common/AppNavigation';
import { useParams } from 'react-router-dom';
import ApiService from '@/services/ApiService';
import { Viewer } from '@toast-ui/react-editor';
import AppFileAttach from '@/components/common/AppFileAttach';

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
    <>
      <AppNavigation />
      <div className="conts-title">
        <h2>TODO : 헤더 타이틀</h2>
      </div>
      <div className="eidtbox"> <% tableColumnMultiArray.forEach((rootArray)=> { %>
        <div className="<% if (checkedMultiColumn) { %>form-table line<% } else { %>form-table<% } %>"><% rootArray.forEach((columnInfo)=> { %>
          <div className="<% if (checkedMultiColumn) { %>form-cell wid50<% } else { %>form-cell wid100<% } %>">
            <div className="form-group wid100">
              <div className="box-view-list">
                <ul className="view-list">
                  <li className="accumlate-list">
                    <label className="t-label">                        
                      <%= columnInfo.column_comment %>
                    </label><% if (columnInfo.componentType === 'file') { %>
                    <span className="text-desc-type1">
                        <AppFileAttach mode="view" fileGroupSeq={<%= columnInfo.column_name %>} workScope={'업무구문(A,O,S)'} onlyImageUpload={false} />
                    </span><% } else if(columnInfo.componentType === 'editor') { %>
                    <span className="text-desc-type1">
                        <Viewer initialValue={<%= columnInfo.column_name %>} />
                    </span><% } else { %>
                    <span className="text-desc-type1">{<%= columnInfo.column_name %>}</span><% } %>
                  </li>
                </ul>
              </div>
            </div>
          </div><% }) %>
        </div>
        <hr className="<% if (checkedMultiColumn) { %>line dp-n<% } else { %>line<% } %>"></hr>
        <% }) %>        
      </div>
      {/* 하단 버튼 영역 */}
      <div className="contents-btns">
        <button className="btn_text text_color_neutral-10 btn_confirm" onClick={cancel}>
          목록으로
        </button>
        <button
          className="btn_text text_color_darkblue-100 btn_close"
          onClick={goFormPage}
        >
          수정
        </button>
      </div>
    </>
  );
}
export default <%= fileName %>;
`;

const formModalGenerateString = `import { useEffect } from 'react';
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
    remove,
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
        className={'list-common-modal-content'}
        onRequestClose={() => {
          closeModal();
        }}
      >
        <div className="popup-container">
          <h3 className="pop_title">TODO : 모달 타이틀</h3>
          <div className="pop_full_cont_box">
            <div className="pop_flex_group">
              <div className="pop_cont_form">
                <div className="editbox"><% tableColumnMultiArray.forEach((rootArray)=> { %>
                  <div className="<% if (rootArray.length > 1) { %>form-table line<% } else { %>form-table<% } %>"><% rootArray.forEach((columnInfo)=> { %>
                    <div className="<% if (rootArray.length > 1) { %>form-cell wid50<% } else { %>form-cell wid100<% } %>">
                      <div className="<%= columnInfo.formGroupClassName %> wid100"><% if (columnInfo.componentType === 'number') { %>
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
                          onChange={(value, userId) => {
                            // TODO : value가 object 형이여서 추가 처리가 필요함
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
                          onChange={(value, deptCd) => {
                            // TODO : value가 object 형이여서 추가 처리가 필요함
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
                            // TODO : newFileGroupSeq를 handle
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
                        /><% } %>         
                      </div>
                    </div><% }) %>
                  </div>
                  <hr className="<% if (rootArray.length > 1) { %>line dp-n<% } else { %>line<% } %>"></hr>
                  <% }) %>
                </div>
              </div>
            </div>
          </div>
          {/* 하단 버튼 영역 */}
          <div className="pop_btns">
            <button className="btn_text text_color_neutral-90 btn_close" onClick={closeModal}>
              취소
            </button>
            <button className="btn_text text_color_neutral-10 btn_confirm" onClick={closeModal}>
              확인
            </button>
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
        className={'list-common-modal-content'}
        onRequestClose={() => {
          closeModal();
        }}
      >
        <div className="popup-container">
          <h3 className="pop_title">TODO : 모달 타이틀</h3>
          <div className="pop_full_cont_box">
            <div className="pop_flex_group">
              <div className="pop_cont_form">
                <div className="editbox"><% tableColumnMultiArray.forEach((rootArray)=> { %>
                  <div className="<% if (rootArray.length > 1) { %>form-table line<% } else { %>form-table<% } %>"><% rootArray.forEach((columnInfo)=> { %>
                    <div className="<% if (rootArray.length > 1) { %>form-cell wid50<% } else { %>form-cell wid100<% } %>">
                      <div className="<%= columnInfo.formGroupClassName %> wid100"><% if (columnInfo.componentType === 'number') { %>
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
                          onChange={(value, userId) => {
                            // TODO : value가 object 형이여서 추가 처리가 필요함
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
                          onChange={(value, deptCd) => {
                            // TODO : value가 object 형이여서 추가 처리가 필요함
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
                            // TODO : newFileGroupSeq를 handle
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
                        /><% } %>              
                      </div>
                    </div><% }) %>
                  </div>
                  <hr className="<% if (rootArray.length > 1) { %>line dp-n<% } else { %>line<% } %>"></hr>
                  <% }) %>
                </div>
              </div>
            </div>
          </div>
          {/* 하단 버튼 영역 */}
          <div className="pop_btns">
            <button className="btn_text text_color_neutral-90 btn_close" onClick={closeModal}>
              취소
            </button>
            <button className="btn_text text_color_neutral-10 btn_confirm" onClick={save}>
              확인
            </button>
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

const detailModalGenerateString = `import { useEffect } from 'react';
import Modal from 'react-modal';
import { Viewer } from '@toast-ui/react-editor';
import AppFileAttach from '@/components/common/AppFileAttach';

/* TODO : 컴포넌트 이름을 확인해주세요 */
function <%= fileName %>(props) {
  const { isOpen, closeModal } = props;

  // TODO : 목록에서 선택한 값을 그대로 이용할지 여부 결정
  // const { detailInfo } = props;

  /* formStore state input 변수 */
  const {
    detailInfo,
    getDetail,
    formType,
    cancel,
    goFormPage,
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
        className={'list-common-modal-content'}
        onRequestClose={() => {
          closeModal();
        }}
      >
        <div className="popup-container">
          <h3 className="pop_title">TODO : 모달 타이틀</h3>
          <div className="pop_full_cont_box">
            <div className="pop_flex_group">
              <div className="pop_cont_form">
                <div className="editbox"> <% tableColumnMultiArray.forEach((rootArray)=> { %>
                  <div className="<% if (checkedMultiColumn) { %>form-table line<% } else { %>form-table<% } %>"><% rootArray.forEach((columnInfo)=> { %>
                    <div className="<% if (checkedMultiColumn) { %>form-cell wid50<% } else { %>form-cell wid100<% } %>">
                      <div className="form-group wid100">
                        <div className="box-view-list">
                          <ul className="view-list">
                            <li className="accumlate-list">
                              <label className="t-label">                        
                                <%= columnInfo.column_comment %>
                              </label><% if (columnInfo.componentType === 'file') { %>
                              <span className="text-desc-type1">
                                  <AppFileAttach mode="view" fileGroupSeq={<%= columnInfo.column_name %>} workScope={'업무구문(A,O,S)'} onlyImageUpload={false} />
                              </span><% } else if(columnInfo.componentType === 'editor') { %>
                              <span className="text-desc-type1">
                                  <Viewer initialValue={<%= columnInfo.column_name %>} />
                              </span><% } else { %>
                              <span className="text-desc-type1">{<%= columnInfo.column_name %>}</span><% } %>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div><% }) %>
                  </div>
                  <hr className="<% if (checkedMultiColumn) { %>line dp-n<% } else { %>line<% } %>"></hr>
                  <% }) %>
                </div>
              </div>
            </div>
          </div>
          {/* 하단 버튼 영역 */}
          <div className="pop_btns">
            <button className="btn_text text_color_neutral-90 btn_close" onClick={closeModal}>
              취소
            </button>
            <button className="btn_text text_color_neutral-10 btn_confirm" onClick={closeModal}>
              확인
            </button>
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

const searchFormGenerateString = `import AppTable from "@/components/common/AppTable";
import { createListSlice, listBaseState } from "@/stores/slice/listSlice";<% importList.forEach((importString)=> { %>
<%- importString %><% }) %>

function <%= fileName %>() {
  const state = <%= storeName %>();

  const { <% tableColumns.forEach((columnInfo)=> { %> <%= columnInfo.column_name %>,<% }) %> } = searchParam;

  return (
    <>
      {/* TODO : 검색 input 영역입니다 */}
      <% if (checkedSearchFormDetail) { %>
      <div className="boxForm">
        <div className={isExpandDetailSearch ? 'area-detail active' : 'area-detail'}><% tableColumnMultiArray.forEach((rootArray)=> { %>
          <div className="form-table"><% rootArray.forEach((columnInfo)=> { %>
            <div className="<% if (checkedMultiColumn) { %>form-cell wid50<% } else { %>form-cell wid100<% } %>">
              <div className="<%= columnInfo.formGroupClassName %> wid100"><% if (columnInfo.componentType === 'search-input') { %>
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
                  onChange={(value, userId) => {
                    // TODO : value가 object 형이여서 추가 처리가 필요함
                    changeSearchInput('<%= columnInfo.column_name %>', value)
                  }}
                /><% } else if(columnInfo.componentType === 'dept-select-input'){ %>
                <AppDeptSelectInput
                  label="<%= columnInfo.column_comment %>"
                  value={<%= columnInfo.column_name %>}
                  onChange={(value, deptCd) => {
                    // TODO : value가 object 형이여서 추가 처리가 필요함
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
              </div>
            </div><% }) %>              
          </div><% }) %>
          <div className="btn-area">
            <button type="button" name="button" className="btn-sm btn_text btn-darkblue-line">
              조회
            </button>
            <button type="button" name="button" className="btn-sm btn_text btn-darkblue-line">
              초기화
            </button>
          </div>      
        </div>
        <button
            type="button"
            name="button"
            className={isExpandDetailSearch ? 'arrow button _control active' : 'arrow button _control'}
            onClick={toggleExpandDetailSearch}
          >
          <span className="hide">접기</span>
        </button>
      </div>
      <% } else { %>
      <div className="boxForm"><% tableColumnMultiArray.forEach((rootArray)=> { %>
        <div className="form-table"><% rootArray.forEach((columnInfo)=> { %>
          <div className="<% if (checkedMultiColumn) { %>form-cell wid50<% } else { %>form-cell wid100<% } %>">
            <div className="<%= columnInfo.formGroupClassName %> wid100"><% if (columnInfo.componentType === 'search-input') { %>
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
              /><% } else if(columnInfo.componentType === 'rangepicker'){ %>
              <AppRangeDatePicker
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
                onChange={(value, userId) => {
                  // TODO : value가 object 형이여서 추가 처리가 필요함
                  changeSearchInput('<%= columnInfo.column_name %>', value)
                }}
              /><% } else if(columnInfo.componentType === 'dept-select-input'){ %>
              <AppDeptSelectInput
                label="<%= columnInfo.column_comment %>"
                value={<%= columnInfo.column_name %>}
                onChange={(value, deptCd) => {
                  // TODO : value가 object 형이여서 추가 처리가 필요함
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
            </div>
          </div><% }) %>             
        </div><% }) %>     
        <div className="btn-area">
          <button type="button" name="button" className="btn-sm btn_text btn-darkblue-line">
            조회
          </button>
          <button type="button" name="button" className="btn-sm btn_text btn-darkblue-line">
            초기화
          </button>
        </div> 
      </div>
      <% } %>      
    </>
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
  searchFormGenerateString: searchFormGenerateString
};

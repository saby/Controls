import {resourceRoot} from 'Core/constants';
import * as MemorySourceData from 'Controls-demo/Utils/MemorySourceData';

const AMOUNT_LONG_DATA_ELEMENTS = 100;
const AMOUNT_IDENT_DATA_ELEMENTS = 13;
const DEPARTMENTS_CUR_TAB = 1;
const COMPANIES_CUR_TAB = 2;
const _companies = MemorySourceData.companies;
const _departments = MemorySourceData.departments;
const _departmentsDataLong = _departments.concat(getLongData());
const _departmentsWithCompanies = _companies.concat(_departmentsDataLong);
const _departmentsWithImges = MemorySourceData.departments;
const _departmentsDev = _departments.concat(getIdentData());

_departmentsWithImges.forEach((department: object) => {
   department.photo = resourceRoot + 'Controls-demo/Suggest_new/resources/images/Novikov.png';
});

_departmentsDataLong.forEach((department: object) => {
   department.currentTab = DEPARTMENTS_CUR_TAB;
});

_companies.forEach((companie: object) => {
   companie.currentTab = COMPANIES_CUR_TAB;
});

function getLongData(): object[] {
   const data = [];

   for (let id = 10; id < AMOUNT_LONG_DATA_ELEMENTS; id++) {
      data.push({id, department: 'Разработка', owner: 'Новиков Д.В.', title: 'Разработка'});
   }
   data.push({id: 211, department: 'Очень длинное название отдела очень длинное название отдела Разработка', owner: 'Новиков Д.В.', title: 'Очень длинное название отдела очень длинное название отдела Разработка'});
   return data;
}

function getIdentData(): object[] {
   const data = [];

   for (let id = 10; id < AMOUNT_IDENT_DATA_ELEMENTS; id++) {
      data.push({id, department: 'Разработка', owner: 'Новиков Д.В.', title: 'Разработка' + id});
   }
   return data;
}

export {
   _companies,
   _departments,
   _departmentsWithCompanies,
   _departmentsDataLong,
   _departmentsWithImges,
   _departmentsDev
};

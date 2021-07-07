import {resourceRoot} from 'Core/constants';
import * as MemorySourceData from 'Controls-demo/Utils/MemorySourceData';

const LONG_DATA_AMOUNT = 100;
const IDENT_DATA_AMOUNT = 13;

const _companies = MemorySourceData.companies;
const _departments = MemorySourceData.departments;
const _departmentsDataLong = _departments.concat(getLongData());
const _departmentsWithCompanies = _companies.concat(_departmentsDataLong);
const _departmentsWithImges = MemorySourceData.departments;
const _departmentsDev = _departments.concat(getIdentData());

_departmentsWithImges.forEach((department) => {
   department.photo = resourceRoot + 'Controls-demo/Suggest_new/resources/images/Novikov.png';
});

_departmentsDataLong.forEach((department) => {
   department.currentTab = 1;
});

_companies.forEach((companie) => {
   companie.currentTab = 2;
});

function getLongData(): object[] {
   const data = [];

   for (let id = 10; id < LONG_DATA_AMOUNT; id++) {
      data.push({id, department: 'Разработка', owner: 'Новиков Д.В.', title: 'Разработка'});
   }
   data.push({id: 211, department: 'Очень длинное название отдела очень длинное название отдела Разработка', owner: 'Новиков Д.В.', title: 'Очень длинное название отдела очень длинное название отдела Разработка'});
   return data;
}

function getIdentData(): object[] {
   const data = [];

   for (let id = 10; id < IDENT_DATA_AMOUNT; id++) {
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

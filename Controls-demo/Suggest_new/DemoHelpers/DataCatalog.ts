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
const _treeData =  [
    {
        id: 1, parent: null, 'parent@': true, code: null, price: null, title: 'SATA'
    },
    {
        id: 11, parent: 1, 'parent@': null, code: 'ST1000NC001', price: 2800,
        title: 'Жесткий диск Seagate Original SATA-III 1Tb ST1000NC001 Constellation СS (7200rpm) 64Mb 3.5'
    },
    {
        id: 12, parent: 1, 'parent@': null, code: 'ST1100DX001', price: 3750,
        title: 'Жесткий диск Seagate Original SATA-III 2Tb ST2000DX001 Desktop SкомплSHD (7200rpm) 64Mb 3.5'
    },
    {
        id: 2, parent: null, 'parent@': true, code: null, price: null, title: 'Canon'
    },
    {
        id: 21, parent: 2, 'parent@': null, code: 'FR-11434', price: 49500,
        title: 'Canon EOS 7D Body SATA support'
    },
    {
        id: 22, parent: 2, 'parent@': null, code: 'FR-11434', price: 49500,
        title: 'Canon 6D Body'
    },
    {
        id: 3, parent: null, 'parent@': null, code: 'FT-13352', price: 112360,
        title: 'Canon EOS 5D Mark II Body SATA support'
    }
];

const _translitDepartments = [
    {id: 0, department: 'Hfphf,jnrf', owner: 'Новиков Д.В.', title: 'Hfphf,jnrf'},
    {id: 1, department: 'Разработка Hfphf,jnrf', owner: 'Новиков Д.В.', title: 'Разработка Hfphf,jnrf'},
];

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
   _departmentsDev,
    _treeData,
    _translitDepartments
};

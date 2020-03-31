import * as MemorySourceData from 'Controls-demo/Utils/MemorySourceData';

const _departmentsDataLong = MemorySourceData.departments.concat(getLongData());

const _equipment =  [
   {id: 1, title: 'Samsung', type: 'manufacturer'},
   {id: 2, title: 'TV', type: 'category', parent: 1},
   {id: 3, title: 'Phone', type: 'category', parent: 1},

   {id: 4, title: 'Galaxy S9', type: 'model', parent: 3},
   {id: 5, title: 'Galaxy Note8', type: 'model', parent: 3},
   {id: 6, title: 'Q900R 8K Smart QLED TV 2019', type: 'model', parent: 2},
   {id: 7, title: 'Premium UHD 4K Smart TV RU8000 Series 8', type: 'model', parent: 2}
];
const _companies = [
   {
      id: 'Наша компания',
      title: 'Наша компания',
      city: null,
      description: 'Управленческая структура',
      active: true
   },
   {
      id: 'Все юридические лица',
      title: 'Все юридические лица',
      city: null,
      description: null,
      active: true
   },
   {
      id: 'Инори, ООО',
      title: 'Инори, ООО',
      city: 'г. Ярославль',
      description: null,
      active: true
   },
   {
      id: '"Компания "Тензор" ООО',
      title: '"Компания "Тензор" ООО',
      city: 'г. Ярославль',
      description: null,
      active: true
   },
   {
      id: 'Ромашка, ООО',
      title: 'Ромашка, ООО',
      city: 'г. Москва',
      description: null,
      active: false
   },
   {
      id: 'Сбербанк-Финанс, ООО',
      title: 'Сбербанк-Финанс, ООО',
      city: 'г. Пермь',
      description: null,
      active: true
   },
   {
      id: 'Петросоюз-Континент, ООО',
      title: 'Петросоюз-Континент, ООО',
      city: 'г. Самара',
      description: null,
      active: false
   },
   {
      id: 'Альфа Директ сервис, ОАО',
      title: 'Альфа Директ сервис, ОАО',
      city: 'г. Москва',
      description: null,
      active: true
   },
   {
      id: 'АК "ТРАНСНЕФТЬ", ОАО',
      title: 'АК "ТРАНСНЕФТЬ", ОАО',
      city: 'г. Москва',
      description: null,
      active: false
   },
   {
      id: 'Иванова Зинаида Михайловна, ИП',
      title: 'Иванова Зинаида Михайловна, ИП',
      city: 'г. Яросалвль',
      description: null,
      active: true
   }
];

function getLongData() {
   const data = [];

   for (var id = 10; id < 100; id++) {
      data.push({id: id, department: 'Разработка', owner: 'Новиков Д.В.', title: 'Разработка'});
   }

   return data;
}
export {
   _departmentsDataLong,
   _equipment,
   _companies
}

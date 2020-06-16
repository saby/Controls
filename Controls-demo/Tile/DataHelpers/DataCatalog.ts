import * as explorerImages from 'Controls-demo/Explorer/ExplorerImagesLayout';
import { IItemAction } from 'Controls/itemActions';

interface IData {
   id: number,
   parent: null | number,
   title: string,
   type: string,
   hiddenGroup?: boolean,
   isDocument: Boolean,
   image: string
   width: string | number,
   isShadow: boolean
}

export const Gadgets = {
   getData: (): IData[] => [{
      id: 1,
      parent: null,
      type: null,
      title: 'Сравнение условий конкурентов по ЭДО.xlsx',
      image: explorerImages[4],
      isDocument: true,
      hiddenGroup: true,
      width: 150,
      isShadow: true
   }, {
      id: 2,
      parent: null,
      type: null,
      title: 'Сравнение систем по учету рабочего времени.xlsx',
      image: explorerImages[5],
      isDocument: true,
      hiddenGroup: true,
      width: 200,
      isShadow: false
   }, {
      id: 3,
      parent: null,
      type: null,
      title: 'Конфеты копия',
      image: explorerImages[3],
      isDocument: true,
      width: 300,
      isShadow: true
   }],

   getActions: (): IItemAction[] => [
      {
         id: 1,
         icon: 'icon-PhoneNull',
         title: 'phone',
         showType: 0
      },
      {
         id: 2,
         icon: 'icon-EmptyMessage',
         title: 'message',
         showType: 0
      }
   ],

}

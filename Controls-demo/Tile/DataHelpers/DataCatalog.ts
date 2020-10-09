import * as explorerImages from 'Controls-demo/Explorer/ExplorerImagesLayout';
import { IItemAction } from 'Controls/itemActions';
import {yellow} from 'color-name';

interface IData {
   id: number;
   parent: null | number;
   title: string;
   type: string;
   hiddenGroup?: boolean;
   isDocument: Boolean;
   image: string;
   width: string | number;
   isShadow: boolean;
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
    getPreviewItems: (): IData[] => [
        {
            id: 0,
            parent: null,
            type: null,
            title: 'Конфеты копия',
            image: explorerImages[8],
            titleStyle: 'light',
            'parent@': true,
            additionalText: 'папка с песцом',
            gradientType: 'dark',
            isDocument: true,
            width: 300,
            isShadow: true
        },
        {
        id: 1,
        parent: null,
        type: null,
        title: 'Очень длинное название для проверки многострочного троеточия Очень длинное название для проверки многострочного троеточия Очень длинное название для проверки многострочного троеточия',
        titleStyle: 'light',
        titleLines: 2,
        'parent@': false,
        additionalText: 'песец лист',
        gradientType: 'dark',
        image: explorerImages[8],
        isDocument: true,
        hiddenGroup: true,
        width: 150,
        isShadow: true
    }, {
        id: 2,
        parent: null,
        type: null,
        title: 'Сравнение систем по учету рабочего времени.xlsx',
        image: explorerImages[9],
        isDocument: true,
        hiddenGroup: true,
        titleStyle: 'dark',
        'parent@': false,
        additionalText: 'солнышко',
        gradientType: 'light',
        image: explorerImages[9],
        width: 200,
        isShadow: false
    }, {
        id: 3,
        parent: null,
        type: null,
        title: 'Конфеты копия',
        image: explorerImages[8],
        isDocument: true,
        width: 300,
        isShadow: true
    }, {
        id: 4,
        parent: null,
        type: null,
        title: 'Картинка с умным градиентом',
        image: explorerImages[8],
        titleStyle: 'lite',
        gradientType: 'custom',
        gradientColor: '#E0E0E8',
        isDocument: true,
        width: 300,
        isShadow: true
    }],

    getRichItems: (): IData[] => [
        {
            id: 0,
            parent: null,
            type: null,
            title: 'Конфеты копия',
            image: explorerImages[8],
            'parent@': true,
            additionalText: 'папка с песцом',
            imageViewMode: 'circle',
            imagePosition: 'top',
            gradientType: 'dark',
            isDocument: true,
            width: 300,
            isShadow: true
        },
        {
            id: 1,
            parent: null,
            type: null,
            title: 'Сравнение условий конкурентов по ЭДО.xlsx',
            description: 'Элемент с описанием',
            titleLines: 1,
            imagePosition: 'top',
            imageViewMode: 'rectangle',
            'parent@': false,
            imageHeight: 's',
            image: explorerImages[8],
            isShadow: true
        }, {
            id: 2,
            parent: null,
            type: null,
            title: 'Сравнение условий конкурентов по ЭДО.xlsx',
            description: 'Несмотря на то, что мониторы больших диагоналей становятся всё доступнее, а их разрешение постоянно растёт, иногда возникает задача в ограниченном пространстве уместить много текста. Например, это может понадобиться для мобильной версии сайта или для интерфейса, в котором важно число строк. В подобных случаях имеет смысл обрезать длинные строки текста, оставив только начало предложения. Так мы приведём интерфейс к компактному виду и сократим объём выводимой информации. Само обрезание строк можно делать на стороне сервера с помощью того же PHP, но через CSS это проще, к тому же всегда можно показать текст целиком, например, при наведении на него курсора мыши',
            titleLines: 5,
            'parent@': false,
            imagePosition: 'left',
            imageViewMode: 'ellipse',
            imageHeight: 'm',
            image: explorerImages[8],
            isShadow: true
        }, {
            id: 3,
            parent: null,
            type: null,
            title: 'Сравнение условий конкурентов по ЭДО.xlsx',
            description: 'Несмотря на то, что мониторы больших диагоналей становятся всё доступнее, а их разрешение постоянно растёт, иногда возникает задача в ограниченном пространстве уместить много текста. Например, это может понадобиться для мобильной версии сайта или для интерфейса, в котором важно число строк. В подобных случаях имеет смысл обрезать длинные строки текста, оставив только начало предложения. Так мы приведём интерфейс к компактному виду и сократим объём выводимой информации. Само обрезание строк можно делать на стороне сервера с помощью того же PHP, но через CSS это проще, к тому же всегда можно показать текст целиком, например, при наведении на него курсора мыши',
            titleLines: 5,
            imageViewMode: 'ellipse',
            imagePosition: 'right',
            'parent@': false,
            gradientColor: 'yellow',
            imageHeight: 'l',
            image: explorerImages[8],
            isShadow: true
        }, {
            id: 4,
            parent: null,
            type: null,
            title: 'Сравнение условий конкурентов по ЭДО.xlsx',
            description: 'Несмотря на то, что мониторы больших диагоналей становятся всё доступнее, а их разрешение постоянно растёт, иногда возникает задача в ограниченном пространстве уместить много текста. Например, это может понадобиться для мобильной версии сайта или для интерфейса, в котором важно число строк. В подобных случаях имеет смысл обрезать длинные строки текста, оставив только начало предложения. Так мы приведём интерфейс к компактному виду и сократим объём выводимой информации. Само обрезание строк можно делать на стороне сервера с помощью того же PHP, но через CSS это проще, к тому же всегда можно показать текст целиком, например, при наведении на него курсора мыши',
            titleLines: 3,
            'parent@': false,
            gradientColor: '#E0E0E3',
            imagePosition: 'right',
            imageViewMode: 'none',
            imageHeight: 'l',
            image: explorerImages[8],
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
   ]

};

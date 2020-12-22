import * as explorerImages from 'Controls-demo/Explorer/ExplorerImagesLayout';
import { IItemAction } from 'Controls/itemActions';
import {yellow} from 'color-name';
import Images from 'Controls-demo/Tile/DataHelpers/Images';

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
            title: 'Очень длинное название для проверки многострочного троеточия Очень длинное название для проверки многострочного троеточия Очень длинное название для проверки многострочного троеточия',
            image: explorerImages[8],
            titleStyle: 'light',
            titleLines: 2,
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
            title: 'Очень длинное название для проверки однострочного троеточия Очень длинное название для проверки многострочного троеточия Очень длинное название для проверки многострочного троеточия',
            counter: 110,
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
        id: 2,
        parent: null,
        type: null,
        title: 'Очень длинное название для проверки многострочного троеточия Очень длинное название для проверки многострочного троеточия Очень длинное название для проверки многострочного троеточия',
        titleStyle: 'light',
        titleLines: 2,
        'parent@': false,
        additionalText: 'песец лист',
        imageWidth: 1200,
        imageHeight: 800,
        gradientType: 'dark',
        image: explorerImages[8],
        isDocument: false,
        hiddenGroup: true,
        width: 150,
        isShadow: true
    }, {
        id: 3,
        parent: null,
        type: null,
        title: 'Сравнение систем по учету рабочего времени.xlsx',
        imageWidth: 1200,
        imageHeight: 750,
        image: explorerImages[9],
        isDocument: false,
        hiddenGroup: true,
        titleStyle: 'dark',
        'parent@': false,
        additionalText: 'солнышко',
        gradientType: 'light',
        width: 200,
        isShadow: false
    }, {
        id: 4,
        parent: null,
        type: null,
        title: 'Конфеты копия',
        imageWidth: 1200,
        imageHeight: 800,
        image: explorerImages[8],
        isDocument: true,
        width: 300,
        isShadow: true
    }, {
        id: 5,
        parent: null,
        type: null,
        title: 'Картинка с умным градиентом',
        image: explorerImages[8],
        imageWidth: 1200,
        imageHeight: 800,
        titleStyle: 'dark',
        gradientType: 'custom',
        gradientColor: '#E0E0E8',
        isDocument: true,
        width: 300,
        isShadow: true
    },
    {
        id: 6,
        parent: null,
        type: null,
        title: 'Гепард',
        image: Images.CHEETAH,
        imageWidth: 198,
        imageHeight: 200,
        titleStyle: 'light',
        gradientType: 'dark',
        isDocument: true,
        width: 300,
        isShadow: true
    },
    {
        id: 7,
        parent: null,
        type: null,
        title: 'Мост',
        image: Images.BRIDGE,
        imageWidth: 1200,
        imageHeight: 900,
        titleStyle: 'light',
        gradientType: 'dark',
        gradientColor: '#E0E0E8',
        isDocument: true,
        width: 300,
        isShadow: true
    },
    {
        id: 8,
        parent: null,
        type: null,
        title: 'Машина',
        image: Images.CAR,
        imageWidth: 640,
        imageHeight: 480,
        titleStyle: 'light',
        gradientType: 'dark',
        gradientColor: '#E0E0E8',
        isDocument: false,
        width: 300,
        isShadow: true
    },
    {
        id: 9,
        parent: null,
        type: null,
        title: 'Лев с короной',
        image: Images.LION,
        imageWidth: 201,
        imageHeight: 251,
        titleStyle: 'light',
        gradientType: 'dark',
        gradientColor: '#E0E0E8',
        isDocument: false,
        width: 300,
        isShadow: true
    },
    {
        id: 10,
        parent: null,
        type: null,
        title: 'Лев стоит',
        image: Images.LION_2,
        imageWidth: 184,
        imageHeight: 183,
        titleStyle: 'light',
        gradientType: 'dark',
        gradientColor: '#E0E0E8',
        isDocument: true,
        width: 300,
        isShadow: true
    },
    {
        id: 11,
        parent: null,
        type: null,
        title: 'Просто лев',
        image: Images.LION_3,
        imageWidth: 300,
        imageHeight: 168,
        titleStyle: 'light',
        gradientType: 'dark',
        gradientColor: '#E0E0E8',
        isDocument: true,
        width: 300,
        isShadow: true
    },
    {
        id: 12,
        parent: null,
        type: null,
        title: 'Медведь',
        image: Images.MEDVED,
        imageWidth: 300,
        imageHeight: 168,
        titleStyle: 'light',
        gradientType: 'dark',
        gradientColor: '#E0E0E8',
        isDocument: true,
        width: 300,
        isShadow: true
    }
    ],

    getRichItems: (): IData[] => [
        {
            id: 0,
            parent: null,
            type: null,
            title: 'Конфеты копия',
            image: explorerImages[8],
            'parent@': true,
            additionalText: 'папка с песцом',
            imageProportion: '1:1',
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
            imageProportion: '16:9',
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
            imageProportion: '4:3',
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
            imageProportion: '3:4',
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
            imageProportion: '1:1',
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
   ],
    getPreviewActions: (): IItemAction[] => [
        {
            id: 1,
            icon: 'icon-DownloadNew',
            title: 'download',
            showType: 0
        },
        {
            id: 2,
            icon: 'icon-Signature',
            title: 'signature',
            showType: 0
        },
        {
            id: 3,
            icon: 'icon-Print',
            title: 'print',
            showType: 0
        },
        {
            id: 4,
            icon: 'icon-Link',
            title: 'link',
            showType: 0
        },
        {
            id: 5,
            icon: 'icon-Edit',
            title: 'edit',
            showType: 0
        },
        {
            id: 6,
            icon: 'icon-Copy',
            title: 'copy',
            showType: 0
        },
        {
            id: 7,
            icon: 'icon-Paste',
            title: 'phone',
            showType: 0
        },
        {
            id: 8,
            icon: 'icon-EmptyMessage',
            title: 'message',
            showType: 0
        },
        {
            id: 9,
            icon: 'icon-PhoneNull',
            title: 'phone',
            showType: 0
        }
    ]
};

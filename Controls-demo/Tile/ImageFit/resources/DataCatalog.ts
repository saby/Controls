import Images from 'Controls-demo/Tile/DataHelpers/Images';
export const items = [
    {
        id: 1,
        parent: null,
        'parent@': true,
        title: 'папка',
        discr: '5',
        price: 123
    }, {
        id: 2,
        parent: null,
        'parent@': true,
        title: 'Электонный документооборот в городе Новосибирск за 2020 год',
        discr: '5',
        price: 123
    },
    {
        id: 3,
        parent: null,
        type: null,
        title: 'Речка',
        image: Images.RIVER,
        imageFit: Images.RIVER_FIT,
        imageWidth: 1920,
        imageHeight: 1200,
        width: 200,
        isDocument: true,
        hiddenGroup: true,
        isShadow: true
    },
    {
        id: 4,
        parent: null,
        type: null,
        width: 200,
        title: 'Сравнение систем по учету рабочего времени.xlsx',
        image: Images.BOTTLE,
        imageFit: Images.BOTTLE_FIT,
        isDocument: true,
        hiddenGroup: true,
        imageWidth: 1600,
        imageHeight: 3075,
        isShadow: false
    }, {
        id: 5,
        parent: null,
        type: null,
        title: 'Конфеты копия',
        image: Images.MOUNTANTS,
        imageFit: Images.MOUNTANTS_FIT,
        imageWidth: 2508,
        imageHeight: 542,
        isDocument: true,
        width: 200,
        isShadow: true
    }, {
        id: 6,
        parent: null,
        type: null,
        title: 'Квадрат',
        image: Images.SQUARE,
        imageFit: Images.SQUARE_FIT,
        imageWidth: 150,
        imageHeight: 150,
        isDocument: true,
        width: 200,
        isShadow: true
    }];

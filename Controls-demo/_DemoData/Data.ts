import {BrandsImages} from './images/brands';
import {GadgetsImages} from './images/gadgets';
import Images from "Controls-demo/tileNew/DataHelpers/Images";

export interface IHierarchyData {
    id: number;
    title: string;
    description?: string;
    country?: string;
    rating: string;
    parent: number;
    type: boolean;
    hasChild?: boolean;
    photo?: string;
    modelId?: string;
    size?: string;
    year?: string;
    note?: string;
    hasSubNodes?: boolean;
    characteristics?: object[];
}

const characteristics = [
    [
        {
            icon: 'icon-Actor',
            tooltip: '1 Текст при наведении',
            title: 'Человек'
        },
        {
            icon: 'icon-Bell',
            tooltip: '2 Текст при наведении',
            title: 'Колокол'
        },
        {
            icon: 'icon-Bike',
            tooltip: '3 Текст при наведении',
            title: 'Велосипед'
        },
        {
            icon: 'icon-Admin',
            tooltip: '4 Текст при наведении',
            title: 'Гаечный Ключ'
        },
        {
            icon: 'icon-Android',
            tooltip: '5 Текст при наведении',
            title: 'Андроид'
        },
        {
            icon: 'icon-Attach',
            tooltip: '6 Текст при наведении',
            title: 'Скрепка'
        }
    ],
    [
        {
            icon: 'icon-Actor',
            tooltip: 'Человек'
        },
        {
            icon: 'icon-Bell',
            tooltip: 'Колокол'
        },
        {
            icon: 'icon-Bike',
            tooltip: 'Велосипед'
        },
        {
            icon: 'icon-Love',
            tooltip: 'Сердце'
        }
    ]
];
export const FlatHierarchy = {
    getRichItemsForEditing: (): IHierarchyData[] => [
        {
            id: 1,
            parent: null,
            type: null,
            title: 'Молоко "Кружева" ультрапастеризованное 1 л',
            description: 'Элемент с редактированием по месту',
            imageProportion: '1:1',
            titleLines: 2,
            imagePosition: 'top',
            imageViewMode: 'rectangle',
            'parent@': null,
            imageHeight: 's',
            image: Images.MEDVED,
            isShadow: true,
            price: 250,
            weight: 1
        },
        {
            id: 2,
            parent: null,
            type: null,
            title: 'Мост',
            description: 'Можно задать шаблон редактирования и для футера',
            imageProportion: '1:1',
            titleLines: 2,
            imagePosition: 'top',
            imageViewMode: 'rectangle',
            'parent@': null,
            imageHeight: 's',
            image: Images.BRIDGE,
            isShadow: true,
            price: 250,
            weight: 1000
        },
        {
            id: 3,
            parent: null,
            type: null,
            title: 'Мост',
            description: 'А еще есть возможность сделать тулбар для изменения изображений',
            imageProportion: '1:1',
            titleLines: 2,
            imagePosition: 'top',
            imageViewMode: 'rectangle',
            'parent@': null,
            imageHeight: 's',
            image: Images.BRIDGE,
            isShadow: true,
            price: 550,
            weight: 1500
        }
    ],
    getData(): IHierarchyData[] {
        return [
            {
                id: 1,
                title: 'Apple',
                description: 'Apple (МФА: [ˈæp(ə)l], в переводе с англ. — «яблоко») — американская корпорация, производитель персональных и планшетных компьютеров, аудиоплееров, смартфонов, программного обеспечения. Один из пионеров в области персональных компьютеров[10] и современных многозадачных операционных систем с графическим интерфейсом. Штаб-квартира — в Купертино, штат Калифорния. Благодаря инновационным технологиям и эстетичному дизайну, корпорация Apple создала в индустрии потребительской электроники уникальную репутацию, сравнимую с культом[11]. Является первой американской компанией, чья капитализация превысила 1,044 трлн долларов США. Это произошло во время торгов акциями компании 10 сентября 2018 года[12]. В тот же день компания стала самой дорогой публичной компанией за всю историю, превысив капитализацию предыдущего рекордсмена — компании PetroChina (1,005 трлн долларов в ноябре 2007 года)[13].',
                country: 'США',
                rating: '8.5',
                parent: null,
                type: true,
                hasChild: true,
                hasSubNodes: true,
                photo: BrandsImages.apple,
                characteristics: characteristics[0]
            },
                {
                    id: 11,
                    title: 'Mac',
                    description: 'Mac item description',
                    parent: 1,
                    rating: '9.2',
                    type: true,
                    hasChild: true,
                    photo: GadgetsImages.mac,
                    characteristics: characteristics[1]
                },
                    {
                        id: 111,
                        title: 'MacBook Air',
                        description: 'MacBook Air item description',
                        parent: 11,
                        rating: '9.2',
                        type: null,
                        photo: GadgetsImages.macBookAir
                    },
                {
                    id: 12,
                    title: 'iPad',
                    description: 'iPad item description',
                    parent: 1,
                    rating: '9.2',
                    type: true,
                    hasChild: true,
                    photo: GadgetsImages.iPad,
                    characteristics: characteristics[1]
                },
                {
                    id: 13,
                    title: 'iPhone',
                    description: 'iPhone item description',
                    parent: 1,
                    rating: '9.2',
                    type: true,
                    hasChild: true,
                    photo: GadgetsImages.iPhone,
                    characteristics: characteristics[0]
                },
                {
                    id: 14,
                    title: 'Watch',
                    description: 'Watch item description',
                    parent: 1,
                    rating: '9.2',
                    type: true,
                    hasChild: true,
                    hasSubNodes: true,
                    photo: GadgetsImages.appleWathc
                },
                    {
                        id: 141,
                        title: 'Apple Watch Series 6',
                        description: 'Apple Watch Series 6 item description',
                        rating: '9.5',
                        parent: 14,
                        type: null,
                        photo: BrandsImages.apple
                    },
                    {
                        id: 142,
                        title: 'Apple Watch SE',
                        description: 'Apple Watch SE item description',
                        rating: '8.9',
                        parent: 14,
                        type: null,
                        photo: BrandsImages.apple
                    },
                    {
                        id: 143,
                        title: 'Apple Watch Series 3',
                        description: 'Apple Watch Series 3 item description',
                        rating: '7.6',
                        parent: 14,
                        type: false,
                        photo: BrandsImages.apple
                    },
                    {
                        id: 144,
                        title: 'Apple Watch Nike',
                        description: 'Apple Watch Nike item description',
                        rating: '7.6',
                        parent: 14,
                        type: false,
                        photo: BrandsImages.apple
                    },
                    {
                        id: 145,
                        title: 'Bands',
                        description: 'Bands item description',
                        rating: '7.6',
                        parent: 14,
                        type: false,
                        photo: BrandsImages.apple
                    },
                        {
                            id: 1451,
                            title: 'Solo Loop',
                            description: 'Solo Loop item description',
                            rating: '7.4',
                            parent: 145,
                            type: null,
                            photo: BrandsImages.apple
                        },
                        {
                            id: 1452,
                            title: 'Braided Solo Loop',
                            description: 'Braided Solo Loop item description',
                            rating: '6.8',
                            parent: 145,
                            type: null,
                            photo: BrandsImages.apple
                        },
                        {
                            id: 1453,
                            title: 'Sport Band',
                            description: 'Sport Band item description',
                            rating: '7.1',
                            parent: 145,
                            type: null,
                            photo: BrandsImages.apple
                        },
                {
                    id: 16,
                    title: 'Notebooks',
                    description: 'Notebooks item description',
                    parent: 1,
                    rating: '9.4',
                    type: false,
                    photo: GadgetsImages.macBook
                },
                    {
                        id: 161,
                        title: 'MacBook Pro',
                        modelId: 'MacBookPro 15,4',
                        description: 'MacBookPro 15,4 item description',
                        rating: '7.2',
                        size: '13 дюймов',
                        year: '2019',
                        note: '2 порта Thunderbolt 3',
                        parent: 16,
                        type: null,
                        photo: GadgetsImages.macBook
                    },
                    {
                        id: 162,
                        title: 'MacBook Pro',
                        modelId: 'MacBookPro 15,3',
                        description: 'MacBookPro 15,3 item description',
                        rating: '6.9',
                        size: '15 дюймов',
                        year: '2019',
                        note: '',
                        parent: 16,
                        type: null,
                        photo: GadgetsImages.macBook
                    },
                    {
                        id: 163,
                        title: 'MacBook Pro',
                        modelId: 'MacBookPro 15,2',
                        description: 'MacBookPro 15,2 item description',
                        size: '13 дюймов',
                        rating: '9.1',
                        year: '2019',
                        note: '4 порта Thunderbolt 3',
                        parent: 16,
                        type: null,
                        photo: GadgetsImages.macBook
                    },
                    {
                        id: 164,
                        title: 'MacBook Pro',
                        modelId: 'MacBookPro 14,3',
                        description: 'MacBookPro 14,3 item description',
                        rating: '8.8',
                        size: '15 дюймов',
                        year: '2017',
                        note: '',
                        parent: 16,
                        type: null,
                        photo: GadgetsImages.macBook
                    },
                    {
                        id: 165,
                        title: 'MacBook Pro',
                        modelId: 'MacBookPro 14,2',
                        description: 'MacBookPro 14,2 item description',
                        size: '13 дюймов',
                        rating: '8.5',
                        year: '2017',
                        note: '4 порта Thunderbolt 3',
                        parent: 16,
                        type: null,
                        photo: GadgetsImages.macBook
                    },
                {
                    id: 17,
                    title: 'Magic Mouse 2',
                    description: 'Magic Mouse 2 item description',
                    modelId: 'MM16',
                    rating: '7.2',
                    year: '2016',
                    parent: 1,
                    type: null,
                    photo: GadgetsImages.magicMouse2
                },
            {
                id: 2,
                title: 'Samsung',
                description: 'Samsung Group («Самсунг Груп», кор. 삼성그룹, Samseong Gurub, Samsŏng Gurup) — южнокорейская группа компаний, один из крупнейших чеболей, основанный в 1938 году. На мировом рынке известен как производитель высокотехнологичных компонентов, включая полноцикловое производство интегральных микросхем, телекоммуникационного оборудования, бытовой техники, аудио- и видеоустройств. Главный офис компании расположен в Сувоне.\n' +
                    '\n' +
                    'Слово «Самсунг» (кор. 삼성?, 三星?, более правильная передача слова по нормам практической транскрипции [самсон]) в корейском языке означает «три звезды». Возможна связь такого названия с тремя сыновьями основателя Samsung Ли Бён Чхоля (이병철), младший из которых Ли Гон Хи (иногда его имя пишется Ли Кун Хи — калька с английского: Lee Kun-hee) (이건희) возглавил компанию в 1987 году в нарушение всех восточных традиций наследования, в согласии с которыми старший сын наследует большую часть семейной собственности[1].',
                country: 'Южная Корея',
                rating: '8.0',
                parent: null,
                type: true,
                hasChild: true,
                photo: BrandsImages.samsung
            },
                {
                    id: 21,
                    title: 'Samusng A10',
                    rating: '9.5',
                    parent: 2,
                    type: null
                },
                {
                    id: 22,
                    title: 'Samsung A20',
                    rating: '9.5',
                    parent: 2,
                    type: null
                },
                {
                    id: 23,
                    title: 'Samsung A30',
                    rating: '9.5',
                    parent: 2,
                    type: null
                },
                {
                    id: 24,
                    title: 'Samsung A40',
                    rating: '9.5',
                    parent: 2,
                    type: null
                },
            {
                id: 3,
                title: 'Meizu',
                description: 'Meizu Technology Co., Ltd. (кит. трад. 魅族科技有限公司), или просто «Meizu» (кит. трад. 魅族, пиньинь mèi zú, палл. мэйцзу) — китайская международная компания, выпускающая цифровые электронные устройства.',
                rating: '7.5',
                country: 'КНР',
                parent: null,
                type: true,
                photo: BrandsImages.meizu
            },
            {
                id: 4,
                title: 'Asus',
                description: 'AsusTek Computer Inc. (кит. 華碩電腦股份有限公司 Huáshuò Diànnǎo Gǔfèn Yǒuxiàn Gōngsī; кратко — ASUS (/eɪˈsuːs/[2] или /ɑːˈsuːs/[3] или /æˈsuːs/[4]) — расположенная на Тайване транснациональная компания, специализирующаяся на компьютерной электронике (как комплектующие, так и готовые продукты).\n' +
                    '\n' +
                    'Название торговой марки Asus происходит от слова Pegasus («Пегас»)[2][5].',
                rating: '7.3',
                country: 'Тайвань',
                parent: null,
                type: false,
                photo: BrandsImages.asus
            },
            {
                id: 5,
                title: 'Acer',
                description: 'Acer (/ˈeɪsər/ или /ˈæzər/; кит.: 宏碁股份有限公司; пиньинь: Hóngqi Gǔfèn Yǒuxiàn Gōngsī, букв. Корпорация Хунци) — тайваньская компания по производству компьютерной техники и электроники. Компания занимает 487 место в Fortune Global 500 (2011 год)[3].',
                rating: '7.1',
                country: 'Тайвань',
                parent: null,
                type: false,
                photo: BrandsImages.acer
            }
        ];
    },

    getGridColumns(count?: number): Array<{displayProperty: string, width: string}> {
        const cols = [
            {
                displayProperty: 'title',
                width: ''
            },
            {
                displayProperty: 'rating',
                width: ''
            },
            {
                displayProperty: 'country',
                width: ''
            },
            {
                displayProperty: 'modelId',
                width: ''
            },
            {
                displayProperty: 'size',
                width: ''
            },
            {
                displayProperty: 'year',
                width: ''
            },
            {
                displayProperty: 'note',
                width: ''
            }
        ];

        return cols.slice(0, count || cols.length);
    }
};

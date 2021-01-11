import {BrandsImages} from './images/brands';
import {GadgetsImages} from './images/gadgets';

interface IHierarchyData {
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
}

export const FlatHierarchy = {
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
                photo: BrandsImages.apple
            },
                {
                    id: 11,
                    title: 'Mac',
                    parent: 1,
                    rating: '9.2',
                    type: true,
                    hasChild: true,
                    photo: GadgetsImages.mac
                },
                    {
                        id: 111,
                        title: 'MacBook Air',
                        parent: 11,
                        rating: '9.2',
                        type: null,
                        photo: GadgetsImages.macBookAir
                    },
                {
                    id: 12,
                    title: 'iPad',
                    parent: 1,
                    rating: '9.2',
                    type: true,
                    hasChild: true,
                    photo: GadgetsImages.iPad
                },
                {
                    id: 13,
                    title: 'iPhone',
                    parent: 1,
                    rating: '9.2',
                    type: true,
                    hasChild: true,
                    photo: GadgetsImages.iPhone
                },
                {
                    id: 14,
                    title: 'Watch',
                    parent: 1,
                    rating: '9.2',
                    type: true,
                    hasChild: true,
                    photo: GadgetsImages.appleWathc
                },
                    {
                        id: 141,
                        title: 'Apple Watch Series 6',
                        rating: '9.5',
                        parent: 14,
                        type: null,
                        photo: BrandsImages.apple
                    },
                    {
                        id: 142,
                        title: 'Apple Watch SE',
                        rating: '8.9',
                        parent: 14,
                        type: null,
                        photo: BrandsImages.apple
                    },
                    {
                        id: 143,
                        title: 'Apple Watch Series 3',
                        rating: '7.6',
                        parent: 14,
                        type: false,
                        photo: BrandsImages.apple
                    },
                    {
                        id: 144,
                        title: 'Apple Watch Nike',
                        rating: '7.6',
                        parent: 14,
                        type: false,
                        photo: BrandsImages.apple
                    },
                    {
                        id: 145,
                        title: 'Bands',
                        rating: '7.6',
                        parent: 14,
                        type: false,
                        photo: BrandsImages.apple
                    },
                        {
                            id: 1451,
                            title: 'Solo Loop',
                            rating: '7.4',
                            parent: 145,
                            type: null,
                            photo: BrandsImages.apple
                        },
                        {
                            id: 1452,
                            title: 'Braided Solo Loop',
                            rating: '6.8',
                            parent: 145,
                            type: null,
                            photo: BrandsImages.apple
                        },
                        {
                            id: 1453,
                            title: 'Sport Band',
                            rating: '7.1',
                            parent: 145,
                            type: null,
                            photo: BrandsImages.apple
                        },
                {
                    id: 16,
                    title: 'Notebooks',
                    parent: 1,
                    rating: '9.4',
                    type: false
                },
                    {
                        id: 161,
                        title: 'MacBook Pro',
                        rating: '7.2',
                        modelId: 'MacBookPro15,4',
                        size: '13 дюймов',
                        year: '2019',
                        note: '2 порта Thunderbolt 3',
                        parent: 16,
                        type: null,
                        photo: BrandsImages.apple
                    },
                    {
                        id: 162,
                        title: 'MacBook Pro',
                        modelId: 'MacBookPro15,3',
                        rating: '6.9',
                        size: '15 дюймов',
                        year: '2019',
                        note: '',
                        parent: 16,
                        type: null,
                        photo: BrandsImages.apple
                    },
                    {
                        id: 163,
                        title: 'MacBook Pro',
                        modelId: 'MacBookPro15,2',
                        size: '13 дюймов',
                        rating: '9.1',
                        year: '2019',
                        note: '4 порта Thunderbolt 3',
                        parent: 16,
                        type: null,
                        photo: BrandsImages.apple
                    },
                    {
                        id: 164,
                        title: 'MacBook Pro',
                        modelId: 'MacBookPro14,3',
                        rating: '8.8',
                        size: '15 дюймов',
                        year: '2017',
                        note: '',
                        parent: 16,
                        type: null,
                        photo: BrandsImages.apple
                    },
                    {
                        id: 165,
                        title: 'MacBook Pro',
                        modelId: 'MacBookPro14,2',
                        size: '13 дюймов',
                        rating: '8.5',
                        year: '2017',
                        note: '4 порта Thunderbolt 3',
                        parent: 16,
                        type: null,
                        photo: BrandsImages.apple
                    },
                {
                id: 17,
                title: 'Magic Mouse 2',
                modelId: 'MM16',
                rating: '7.2',
                year: '2016',
                parent: 1,
                type: null
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

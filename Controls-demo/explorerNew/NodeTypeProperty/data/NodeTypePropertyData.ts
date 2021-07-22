import {IGroupNodeColumn} from 'Controls/_treeGrid/interface/IGroupNodeColumn';
import * as PriceColumnTemplate from 'wml!Controls-demo/explorerNew/NodeTypeProperty/resources/PriceColumnTemplate';

export interface IData {
    key: number;
    title: string;
    count: string;
    price: string;
    price1: string;
    price2: string;
    tax: string;
    price3: string;
    type: boolean;
    hasChild: boolean;
    nodeType: string;
    parent?: number;
    groupParent?: number;
}

export const data: IData[] =  [
    {
        key: 1,
        title: 'Товары и материалы',
        count: '5 шт',
        price: '',
        price1: '1168520',
        price2: '',
        tax: '',
        price3: '1218520',
        parent: null,
        type: true,
        hasChild: true,
        nodeType: 'group'
    },
    {
        key: 11,
        title: 'Laptops',
        count: '5 шт',
        price: '368520',
        price1: '368520',
        price2: '',
        tax: '',
        price3: '218520',
        parent: 1,
        type: true,
        hasChild: true,
        nodeType: null
    },
    {
        key: 111,
        title: 'MacBook Pro',
        count: '1 шт',
        price: '111325',
        price1: '111325',
        price2: '',
        tax: '18',
        price3: '121325',
        parent: 11,
        type: null,
        hasChild: true,
        nodeType: null
    },
    {
        key: 112,
        title: 'MacBook Pro 15,3',
        count: '1 шт',
        price: '111325',
        price1: '111325',
        price2: '',
        tax: '18',
        price3: '131363.5',
        parent: 11,
        type: null,
        hasChild: true,
        nodeType: null
    },
    {
        key: 113,
        title: 'MacBook Pro 15,2',
        count: '1 шт',
        price: '115303',
        price1: '115303',
        price2: '',
        tax: '18',
        price3: '136057.54',
        parent: 11,
        type: null,
        hasChild: true,
        nodeType: null
    },
    {
        key: 114,
        title: 'MacBookPro 14,3',
        count: '1 шт',
        price: '112300',
        price1: '112300',
        price2: '',
        tax: '18',
        price3: '132514',
        parent: 11,
        type: null,
        hasChild: true,
        nodeType: null
    },
    {
        key: 115,
        title: 'MacBook Pro 14,2',
        count: '1 шт',
        price: '100455',
        price1: '100455',
        price2: '',
        tax: '18',
        price3: '118536.9',
        parent: 11,
        type: null,
        hasChild: true,
        nodeType: null
    },
    {
        key: 12,
        title: 'Сервер SL2500/4UT8G2',
        count: '1 шт',
        price: '1180657',
        price1: '97700',
        price2: '16587',
        tax: '18',
        price3: '997700',
        parent: 1,
        type: null,
        hasChild: false,
        nodeType: null
    },
    {
        key: 13,
        title: 'ПО Антивирус Dr. Web',
        count: '99 шт',
        price: '997',
        price1: '1260',
        price2: '226',
        tax: '18',
        price3: '126000',
        parent: 1,
        type: null,
        hasChild: false,
        nodeType: null
    },
    {
        key: 14,
        title: 'Конфеты Raffaello 175 гр.',
        count: '27 шт',
        price: '87',
        price1: '99',
        price2: '17',
        tax: '18',
        price3: '1230',
        parent: 1,
        type: null,
        hasChild: false,
        nodeType: null
    },
    {
        key: 15,
        title: 'Устройство хранения USB',
        count: '9 шт',
        price: '116',
        price1: '158',
        price2: '23',
        tax: '18',
        price3: '1488',
        parent: 1,
        type: null,
        hasChild: false,
        nodeType: null
    },
    {
        key: 2,
        title: 'Услуги и работы',
        count: '',
        price: '',
        price1: '700',
        price2: '',
        tax: '',
        price3: '1488',
        parent: null,
        type: true,
        hasChild: true,
        nodeType: 'group'
    },
    {
        key: 21,
        title: 'Подключение интернета',
        count: '2 ч',
        price: '',
        price1: '700',
        price2: '41',
        tax: '18',
        price3: '1400',
        parent: 2,
        type: null,
        hasChild: false,
        nodeType: null
    },
    {
        key: 3,
        title: 'Неисключительные права',
        count: '',
        price: '',
        price1: '1318300',
        price2: '',
        tax: '',
        price3: '1318300',
        parent: null,
        type: true,
        hasChild: true,
        nodeType: 'group'
    },
    {
        key: 32,
        title: 'Права использования "СБИС ЭО-Базовый, Бюджет"',
        count: '1 шт',
        price: '1204500',
        price1: '1304500',
        price2: '197400',
        tax: '18',
        price3: '1304500',
        parent: 3,
        type: null,
        hasChild: false,
        nodeType: null
    },
    {
        key: 33,
        title: 'Права использования аккаунта sbis.ru в течение 1 года',
        count: '1 шт',
        price: '4500',
        price1: '4500',
        price2: '984',
        tax: '18',
        price3: '4500',
        parent: 3,
        type: null,
        hasChild: false,
        nodeType: null
    },
    {
        key: 34,
        title: 'Права использования "СБИС Расширенный аналитический блок"',
        count: '1 шт',
        price: '9800',
        price1: '9800',
        price2: '1447',
        tax: '18',
        price3: '9800',
        parent: 3,
        type: null,
        hasChild: false,
        nodeType: null
    }
];

export const columns: IGroupNodeColumn[] = [
    {
        width: '300px',
        displayProperty: 'title',
        groupNodeConfig: {
            textAlign: 'center'
        }
    },
    {
        width: '100px',
        displayProperty: 'count',
        align: 'right'
    },
    {
        width: '100px',
        displayProperty: 'price',
        align: 'right',
        template: PriceColumnTemplate
    },
    {
        width: '100px',
        displayProperty: 'price1',
        align: 'right',
        template: PriceColumnTemplate
    },
    {
        width: '100px',
        displayProperty: 'price2',
        align: 'right',
        template: PriceColumnTemplate
    },
    {
        width: '50px',
        displayProperty: 'tax',
        align: 'right'
    },
    {
        width: '100px',
        displayProperty: 'price3',
        align: 'right',
        template: PriceColumnTemplate,
        fontSize: 's'
    }
];

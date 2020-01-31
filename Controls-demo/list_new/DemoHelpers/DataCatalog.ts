import {showType} from "../../../Controls/Utils/Toolbar";

const LOREM = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc posuere nulla ex, consectetur lacinia odio blandit sit amet.';

function getFewCategories(): Array<{
    id: number,
    title: string,
    description: string,
    byDemand?: 'Popular' | 'Unpopular' | 'Hit!',
    tplPath?: string,
    clickable?: boolean,
    hovered?: boolean
}> {
    return [
        {
            id: 1,
            title: 'Notebooks',
            description: 'Trusted Reviews ranks all your top laptop and notebook options, whether you want a ...',
            byDemand: 'Popular',
            tplPath: 'wml!Controls-demo/list_new/ItemTemplate/ItemTemplateProperty/itemTemplateNoHighlight',
            clickable: false,
            hovered: false,
            value: 'clickable - false, hovered - false'
        },
        {
            id: 2,
            title: 'Tablets',
            byDemand: 'Unpopular',
            description: 'Tablets are great for playing games, reading, homework, keeping kids entertained in the back seat of the car',
            clickable: true,
            hovered: true,
            value: 'clickable - true, hovered - true'
        },
        {
            id: 3,
            title: 'Laptop computers',
            description: 'Explore PCs and laptops to discover the right device that powers all that you do',
            byDemand: 'Unpopular',
            tplPath: 'wml!Controls-demo/list_new/ItemTemplate/ItemTemplateProperty/itemTemplateWithDescription',
            clickable: false,
            hovered: true,
            value: 'clickable - false, hovered - true'
        },
        {
            id: 4,
            title: 'Apple gadgets',
            description: 'Explore new Apple accessories for a range of Apple products',
            byDemand: 'Hit!',
            tplPath: 'wml!Controls-demo/list_new/ItemTemplate/ItemTemplateProperty/itemTemplateNoHighlight',
            clickable: true,
            hovered: false,
            value: 'clickable - true, hovered - false'
        },
        {
            id: 5,
            title: 'Android gadgets',
            description: 'These 25 clever phone accessories and Android-compatible gadgets',
            byDemand: 'Popular',
            tplPath: 'wml!Controls-demo/list_new/ItemTemplate/ItemTemplateProperty/itemTemplateWithDescription',
            clickable: false,
            hovered: false,
            value: 'clickable - false, hovered - false'
        }
    ];
}

function getGroupedCatalog(): Array<{
    id: number
    title: string
    brand: string
    longBrandName?: string
}> {
    return [
        {
            id: 1,
            title: 'MacBook Pro',
            brand: 'apple'
        },
        {
            id: 2,
            title: 'ASUS X751SA-TY124D',
            brand: 'asus'
        },
        {
            id: 3,
            title: 'HP 250 G5 (W4N28EA)',
            brand: 'hp'
        },
        {
            id: 4,
            title: 'Apple iPad Pro 2016',
            brand: 'apple'
        },
        {
            id: 5,
            title: 'ACER One 10 S1002-15GT',
            brand: 'acer'
        },
        {
            id: 6,
            title: 'ASUS X541SA-XO056D',
            brand: 'asus'
        },
        {
            id: 7,
            title: 'iPhone X Max',
            brand: 'apple'
        },
        {
            id: 8,
            title: 'ASUS Zenbook F-234',
            brand: 'asus',
            longBrandName: 'AsusTek Computer Inc. stylised as ASUSTeK (Public TWSE: 2357 LSE: ASKD), based in Beitou District, Taipei, Taiwan'
        },
        {
            id: 9,
            title: 'ACER Aspire F 15 F5-573G-51Q7',
            brand: 'acer'
        }
    ]
}

function getGroupedCatalogWithHiddenGroup(): Array<{
    id: number
    title: string
    brand?: string
}> {
    return [
        {
            id: 1,
            title: 'WebCam X541SA-XO056D'
        },
        {
            id: 2,
            title: 'MacBook Pro',
            brand: 'apple'
        },
        {
            id: 3,
            title: 'ASUS X751SA-TY124D',
            brand: 'asus'
        },
        {
            id: 4,
            title: 'HP 250 G5 (W4N28EA)',
            brand: 'hp'
        },
        {
            id: 5,
            title: 'Apple iPad Pro 2016',
            brand: 'apple'
        },
        {
            id: 6,
            title: 'KeyBoard 5RTX-zxs',
            brand: 'unknown'
        },
        {
            id: 7,
            title: 'MagicMouse 2',
        },
        {
            id: 8,
            title: 'iPhone X Max',
            brand: 'apple'
        },
        {
            id: 9,
            title: 'ASUS Zenbook F-234',
            brand: 'asus'
        }
    ];
}


function getEditableCatalog(): Array<{
    id: number,
    beforeBeginEditTitle: string,
    beforeEndEditTitle?: string
}> {
    return [
        {
            id: 0,
            beforeBeginEditTitle: 'Стандартное начало редактирования',
            beforeEndEditTitle: 'Стандартное завершение редактирования'
        },
        {
            id: 1,
            beforeBeginEditTitle: 'В строке недоступно редактирование',
            beforeEndEditTitle: 'Редактирование не завершится если поле пустое'
        },
        {
            id: 2,
            beforeBeginEditTitle: 'Редактирование начнется с задержкой. Например, долгая валидация на сервере, 1сек, индикатор не появится',
            beforeEndEditTitle: 'Редактирование завершится после задержки в 1 сек. Например, долгая валидация на сервере, индикатор не появится'

        },
        {
            id: 3,
            beforeBeginEditTitle: 'Редактирование начнется с задержкой. Например, долгая валидация на сервере, 3сек, появится индикатор',
            beforeEndEditTitle: 'Редактирование завершится после задержки в 3 сек. Например, долгая валидация на сервере, появится индикатор'
        },
        {
            id: 4,
            beforeBeginEditTitle: 'Редактирование не начнется, при этом валидация занимает 1 сек.',
            beforeEndEditTitle: 'Редактирование не завершится если поле пустое, при этом валидация занимает 1 сек.'
        }
    ]
}

function getContactsCatalog() {
    return [
        {
            id: 0,
            title: 'What makes every American a typical one is a desire to get a well-paid job that will cover their credit card. A credit card is an indispensable part of life in America. In other words, any American knows that how he or she handles their credit card or cards, either will help them or haunt them for years... re-establish his/her good credit by applying for a secured credit.'
        },
        {
            id: 1,
            title: 'For those who are deep in credit card debt, there are some Credit Services agencies that offer anyone in America both online or telephone, and face-to-face counseling.'
        },
        {
            id: 2,
            title: 'The agencies’ average client makes about $32,000 a year.'
        },
        {
            id: 3,
            title: 'Once debts have been repaid, an American can re-establish his/her good credit by applying for a secured credit card and paying the balance off regularly.'
        }
    ];
}

function getContactsCatalogWithActions() {
    const catalog = getContactsCatalog();

    catalog[0]['itemActions'] = [
        {
            id: 1,
            title: 'Прочитано',
            showType: showType.TOOLBAR,
        },
        {
            id: 2,
            icon: 'icon-PhoneNull',
            title: 'Позвонить',
            showType: showType.MENU_TOOLBAR,
        },
        {
            id: 3,
            icon: 'icon-EmptyMessage',
            title: 'Написать',
            showType: showType.TOOLBAR,
        }
    ];
    catalog[1]['itemActions'] = [];
    catalog[2]['itemActions'] = [
        {
            id: 1,
            icon: 'icon-Chat',
            title: 'Диалог',
            showType: showType.MENU_TOOLBAR,
            parent: 3,
        },
        {
            id: 2,
            icon: 'icon-Email',
            title: 'Email',
            showType: showType.MENU,
            parent: 3,
        },
        {
            id: 3,
            icon: 'icon-Profile',
            title: 'Профиль пользователя',
            showType: showType.MENU,
        }
    ];
    catalog[3]['itemActions'] = [];

    return catalog;
}

interface  IGenerateDataOptions<TEntityData = {}> {
    count: number,
    keyProperty?: string,
    entityTemplate?: Record<string, 'number'|'string'|'lorem'|'lorem_alter'>,
    beforeCreateItemCallback?: (item: TEntityData) => void | false
}

/**
 * Генерирует массив объектов по заданному шаблону {названиеПоля: типПоля}
 * Note! Поддерживается только один уровень вложенности у шаблона объекта.
 *
 * @param {IGenerateDataOptions} cfg
 * @returns {Array<TEntityData extends Record<string, any>>}
 */
function generateData<
    TEntityData extends Record<string, any> = {}
    >(
        {count, entityTemplate = {id: 'number', title: 'string'}, keyProperty = 'id', beforeCreateItemCallback = () => {}}: IGenerateDataOptions<TEntityData>
    ): Array<TEntityData> {

    const items: Array<TEntityData> = [];

    const createItem = (entityTemplate: IGenerateDataOptions["entityTemplate"], forLoremPseudoRandom: number = 0): TEntityData => {
        let item = {};

        Object.keys(entityTemplate).forEach((key) => {
            if (entityTemplate[key] === 'string') {
                item[key] = '';
            } else if (entityTemplate[key] === 'number') {
                item[key] = 0;
            } else if (entityTemplate[key] === 'lorem') {
                item[key] = forLoremPseudoRandom % 3 === 0 ? `${LOREM.slice(0, 110)}.` : (forLoremPseudoRandom % 2 === 0 ? `${LOREM} ${LOREM}` : `${LOREM.slice(0, 50)}.`);
            } else if (entityTemplate[key] === 'lorem_alter') {
                const r = Math.floor(Math.random() * 100) % 100;
                item[key] = r < 50 ? `${LOREM.slice(0, 110)}.` : (r < 70 ? `${LOREM} ${LOREM}` : `${LOREM.slice(0, 50)}.`);
            } else {
                item[key] = entityTemplate[key];
            }
        });

        return <TEntityData>item;
    };

    for (let i = 0; i < count; i++) {
        let item = createItem(entityTemplate, items.length);
        item[keyProperty] = items.length;
        if (beforeCreateItemCallback(item) !== false) {
            items.push(item);
        }
    }

    return items;
}

export {
    getContactsCatalog,
    getContactsCatalogWithActions,
    getFewCategories,
    getGroupedCatalog,
    getGroupedCatalogWithHiddenGroup,
    getEditableCatalog,
    generateData
}

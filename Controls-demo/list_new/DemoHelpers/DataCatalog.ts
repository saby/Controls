import {showType} from 'Controls/toolbars';

const LOREM = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc posuere nulla ex, consectetur lacinia odio blandit sit amet.';

function getFewCategories(): Array<{
    key: number,
    title: string,
    description: string,
    byDemand?: 'Popular' | 'Unpopular' | 'Hit!',
    tplPath?: string,
    cursor?: 'default' | 'pointer',
    checkbox?: boolean
    hovered?: boolean
    value?: string
}> {
    return [
        {
            key: 1,
            title: 'Notebooks',
            description: 'Trusted Reviews ranks all your top laptop and notebook options, whether you want a ...',
            byDemand: 'Popular',
            tplPath: 'wml!Controls-demo/list_new/ItemTemplate/ItemTemplateProperty/itemTemplateNoHighlight',
            cursor: 'default',
            checkbox: false,
            hovered: false,
            value: 'cursor - default, hovered - false'
        },
        {
            key: 2,
            title: 'Tablets',
            byDemand: 'Unpopular',
            description: 'Tablets are great for playing games, reading, homework, keeping kids entertained in the back seat of the car',
            hovered: true,
            checkbox: false,
            value: 'cursor - pointer, hovered - true'
        },
        {
            key: 3,
            title: 'Laptop computers',
            description: 'Explore PCs and laptops to discover the right device that powers all that you do',
            byDemand: 'Unpopular',
            tplPath: 'wml!Controls-demo/list_new/ItemTemplate/ItemTemplateProperty/itemTemplateWithDescription',
            cursor: 'default',
            hovered: true,
            checkbox: false,
            value: 'cursor - default, hovered - true'
        },
        {
            key: 4,
            title: 'Apple gadgets',
            description: 'Explore new Apple accessories for a range of Apple products',
            byDemand: 'Hit!',
            tplPath: 'wml!Controls-demo/list_new/ItemTemplate/ItemTemplateProperty/itemTemplateNoHighlight',
            hovered: false,
            checkbox: false,
            value: 'cursor - pointer, hovered - false'
        },
        {
            key: 5,
            title: 'Android gadgets',
            description: 'These 25 clever phone accessories and Android-compatible gadgets',
            byDemand: 'Popular',
            tplPath: 'wml!Controls-demo/list_new/ItemTemplate/ItemTemplateProperty/itemTemplateWithDescription',
            cursor: 'default',
            hovered: false,
            checkbox: false,
            value: 'cursor - default, hovered - false'
        }
    ];
}
function getDataForComplexScroll(): Array<{key: number, title: string, withList: boolean}> {
    return [
        {
            key: 1,
            title: 'Простой элемент 1',
            withList: false
        },
        {
            key: 2,
            title: 'Простой элемент 2',
            withList: false
        },
        {
            key: 3,
            title: 'Сложный элемент 3',
            withList: true
        },
        {
            key: 4,
            title: 'Простой элемент 4',
            withList: false
        },
        {
            key: 5,
            title: 'Простой элемент 5',
            withList: false
        },
        {
            key: 6,
            title: 'Сложный элемент 6',
            withList: true
        },
        {
            key: 7,
            title: 'Сложный элемент 7',
            withList: true
        },
        {
            key: 8,
            title: 'Сложный элемент 8',
            withList: true
        }
    ]
}
function getCursorData(): Array<{key: number, value: string, cursor?: 'default' | 'pointer', hovered: boolean}> {
    return [
        {
            key: 1,
            value: 'cursor - default, hovered - false',
            cursor: 'default',
            hovered: false
        },
        {
            key: 2,
            value: 'cursor - pointer, hovered - true',
            cursor: 'pointer',
            hovered: true
        },
        {
            key: 3,
            value: 'cursor - default, hovered - true',
            cursor: 'default',
            hovered: true
        },
        {
            key: 4,
            value: 'cursor - pointer, hovered - false',
            cursor: 'pointer',
            hovered: false
        }
    ];
}

function getEditableCatalog(): Array<{
    key: number,
    beforeBeginEditTitle: string,
    beforeEndEditTitle?: string
}> {
    return [
        {
            key: 0,
            beforeBeginEditTitle: 'Стандартное начало редактирования',
            beforeEndEditTitle: 'Стандартное завершение редактирования'
        },
        {
            key: 1,
            beforeBeginEditTitle: 'В строке недоступно редактирование',
            beforeEndEditTitle: 'Редактирование не завершится если поле пустое'
        },
        {
            key: 2,
            beforeBeginEditTitle: 'Редактирование начнется с задержкой. Например, долгая валидация на сервере, 1сек, индикатор не появится',
            beforeEndEditTitle: 'Редактирование завершится после задержки в 1 сек. Например, долгая валидация на сервере, индикатор не появится'

        },
        {
            key: 3,
            beforeBeginEditTitle: 'Редактирование начнется с задержкой. Например, долгая валидация на сервере, 3сек, появится индикатор',
            beforeEndEditTitle: 'Редактирование завершится после задержки в 3 сек. Например, долгая валидация на сервере, появится индикатор'
        },
        {
            key: 4,
            beforeBeginEditTitle: 'Редактирование не начнется, при этом валидация занимает 1 сек.',
            beforeEndEditTitle: 'Редактирование не завершится если поле пустое, при этом валидация занимает 1 сек.'
        }
    ];
}

function getContactsCatalog(): Array<{ key: number, title: string }> {
    return [
        {
            key: 0,
            title: 'What makes every American a typical one is a desire to get' +
                ' a well-paid job that will cover their credit card. A credit card is an' +
                ' indispensable part of life in America. In other words, any American knows' +
                ' that how he or she handles their credit card or cards, either will help them' +
                ' or haunt them for years... re-establish his/her good credit by applying for a secured credit.'
        },
        {
            key: 1,
            title: 'For those who are deep in credit card debt, there are some' +
                ' Credit Services agencies that offer anyone in America both online or' +
                ' telephone, and face-to-face counseling.'
        },
        {
            key: 2,
            title: 'The agencies’ average client makes about $32,000 a year.'
        },
        {
            key: 3,
            title: 'Once debts have been repaid, an American can re-establish his/her good' +
                ' credit by applying for a secured credit card and paying the balance off regularly.'
        }
    ];
}

function getContactsCatalogWithActions(): unknown {
    const catalog = getContactsCatalog();
    // tslint:disable-next-line
    catalog[0]['itemActions'] = [
        {
            id: 1,
            title: 'Прочитано',
            showType: showType.TOOLBAR
        },
        {
            id: 2,
            icon: 'icon-PhoneNull',
            title: 'Позвонить',
            showType: showType.MENU_TOOLBAR
        },
        {
            id: 3,
            icon: 'icon-EmptyMessage',
            title: 'Написать',
            showType: showType.TOOLBAR
        }
    ];
    // tslint:disable-next-line
    catalog[1]['itemActions'] = [];
    // tslint:disable-next-line
    catalog[2]['itemActions'] = [
        {
            id: 1,
            icon: 'icon-Chat',
            title: 'Диалог',
            showType: showType.MENU_TOOLBAR,
            parent: 3
        },
        {
            id: 2,
            icon: 'icon-Email',
            title: 'Email',
            showType: showType.MENU,
            parent: 3
        },
        {
            id: 3,
            icon: 'icon-Profile',
            title: 'Профиль пользователя',
            showType: showType.MENU
        }
    ];
    // tslint:disable-next-line
    catalog[3]['itemActions'] = [];

    return catalog;
}

interface  IGenerateDataOptions<TEntityData = {}> {
    count: number;
    keyProperty?: string;
    entityTemplate?: Record<string, 'number'|'string'|'lorem'|'lorem_alter'>;
    beforeCreateItemCallback?: (item: TEntityData) => void | false;
}

/**
 * Генерирует массив объектов по заданному шаблону {названиеПоля: типПоля}
 * Note! Поддерживается только один уровень вложенности у шаблона объекта.
 *
 * @param {IGenerateDataOptions} cfg
 * @returns {Array<TEntityData extends Record<string, any>>}
 */
function generateData<
    // tslint:disable-next-line
    TEntityData extends Record<string, any> = {}
    >(
        {count, entityTemplate = {key: 'number', title: 'string'},
        keyProperty = 'key',
        // tslint:disable-next-line
        beforeCreateItemCallback = () => {}}: IGenerateDataOptions<TEntityData>
    ): TEntityData[] {

    const items: TEntityData[] = [];

    const createItem = (
      // tslint:disable-next-line
        entityTemplate: IGenerateDataOptions["entityTemplate"],
        forLoremPseudoRandom: number = 0): TEntityData => {
        const item = {};

        Object.keys(entityTemplate).forEach((key) => {
            if (entityTemplate[key] === 'string') {
                item[key] = '';
            } else if (entityTemplate[key] === 'number') {
                item[key] = 0;
            } else if (entityTemplate[key] === 'lorem') {
                // tslint:disable-next-line
                item[key] = forLoremPseudoRandom % 3 === 0 ? `${LOREM.slice(0, 110)}.` : (forLoremPseudoRandom % 2 === 0 ? `${LOREM} ${LOREM}` : `${LOREM.slice(0, 50)}.`);
            } else if (entityTemplate[key] === 'lorem_alter') {
                // tslint:disable-next-line
                const r = Math.floor(Math.random() * 100) % 100;
                // tslint:disable-next-line
                item[key] = r < 50 ? `${LOREM.slice(0, 110)}.` : (r < 70 ? `${LOREM} ${LOREM}` : `${LOREM.slice(0, 50)}.`);
            } else {
                item[key] = entityTemplate[key];
            }
            item[key] = `${items.length + 1}) ${item[key]}`;
        });

        return item as TEntityData;
    };

    for (let i = 0; i < count; i++) {
        const item = createItem(entityTemplate, items.length);
        // tslint:disable-next-line
        item[keyProperty] = items.length;
        if (beforeCreateItemCallback(item) !== false) {
            items.push(item);
        }
    }

    return items;
}
const changeSourceData = (): IChangeSource => ({
    data: [
        {
            key: 1,
            title: 'One'
        }, {
            key: 2,
            title: 'Two'

        }, {
            key: 3,
            title: 'three'

        }, {
            key: 4,
            title: 'Four'

        }, {
            key: 5,
            title: 'Five'

        }, {
            key: 6,
            title: 'Six'

        }, {
            key: 7,
            title: 'Seven'

        }],
    data2: [
        {
            key: 1,
            load: 1,
            title: 1
        }, {
            key: 2,
            load: 2,
            title: 2

        }, {
            key: 3,
            load: 2,
            title: 3

        }, {
            key: 4,
            load: 2,
            title: 4

        }, {
            key: 5,
            load: 2,
            title: 5

        }, {
            key: 6,
            load: 2,
            title: 6

        }, {
            key: 7,
            load: 2,
            title: 7

        }]
});

export {
    getContactsCatalog,
    getContactsCatalogWithActions,
    getFewCategories,
    getCursorData,
    getEditableCatalog,
    generateData,
    getDataForComplexScroll,
    changeSourceData
};

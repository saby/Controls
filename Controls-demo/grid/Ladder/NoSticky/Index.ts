import {constants} from "Env/Env";

function getImages() {
    return {
        dogadkin: constants.resourceRoot + 'Controls-demo/grid/resources/images/dogadkin.png',
        kesareva: constants.resourceRoot + 'Controls-demo/grid/resources/images/kesareva.png',
        korbyt: constants.resourceRoot + 'Controls-demo/grid/resources/images/korbyt.png',
        krainov: constants.resourceRoot + 'Controls-demo/grid/resources/images/krainov.png',
        baturina: constants.resourceRoot + 'Controls-demo/grid/resources/images/baturina.png'
    };
}

import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';

import * as Template from 'wml!Controls-demo/grid/Ladder/NoSticky/NoSticky';
import 'wml!Controls-demo/grid/resources/CellTemplates/LadderTasksPhoto';
import 'wml!Controls-demo/grid/resources/CellTemplates/LadderTasksDescription';
import 'wml!Controls-demo/grid/resources/CellTemplates/LadderTasksReceived';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _selectedKeys: number[] = [];
    protected _columns = [
        {
            template: 'wml!Controls-demo/grid/resources/CellTemplates/LadderTasksPhoto',
            width: '98px',
            stickyProperty: 'photo'
        },
        {
            template: 'wml!Controls-demo/grid/resources/CellTemplates/LadderTasksDescription',
            width: '1fr'
        },
        {
            template: 'wml!Controls-demo/grid/resources/CellTemplates/LadderTasksReceived',
            width: '200px',
            stickyProperty: 'date'
        }
    ];
    protected _ladderProperties: string[] = ['photo', 'date'];

    protected _beforeMount(options?: {}, contexts?: object, receivedState?: void): Promise<void> | void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: [
                {
                    id: 1,
                    message: 'Регламент: Ошибка в разработку. Автор: Дубенец Д.А. Описание: (reg-chrome-presto) 3.18.150 controls - Поехала верстка кнопок когда они задизейблены prestocarry',
                    fullName: 'Крайнов Дмитрий',
                    photo: getImages().krainov,
                    date: '6 мар',
                    state: 'Review кода (нач. отдела)'
                },
                {
                    id: 2,
                    message: 'Регламент: Ошибка в разработку. Автор: Волчихина Л.С. Описание: Отображение колонок. При снятии галки с колонки неверная всплывающая подсказка',
                    fullName: 'Крайнов Дмитрий',
                    photo: getImages().krainov,
                    date: '6 мар',
                    state: 'Review кода (нач. отдела)'
                },
                {
                    id: 3,
                    message: 'Смотри надошибку. Нужно сделать тесты, чтобы так в будущем не разваливалось',
                    fullName: 'Крайнов Дмитрий',
                    photo: getImages().krainov,
                    date: '6 мар',
                    state: 'Выполнение'
                },
                {
                    id: 4,
                    message: 'Регламент: Ошибка в разработку. Автор: Оборевич К.А. Описание: Розница. Замечания к шрифтам в окнах Что сохранить в PDF/Excel и Что напечатать',
                    fullName: 'Крайнов Дмитрий',
                    photo: getImages().krainov,
                    date: '12 ноя',
                    state: 'Review кода (нач. отдела)'
                },
                {
                    id: 5,
                    message: 'Пустая строка при сканировании в упаковку Тест-онлайн adonis1/adonis123 1) Создать документ списания 2) отсканировать в него наименование/открыть РР/+Упаковка 3) Заполнить данные по упаковке/отсканировать еще 2 марки',
                    fullName: 'Корбут Антон',
                    photo: getImages().korbyt,
                    date: '5 мар',
                    state: 'Выполнение'
                },
                {
                    id: 6,
                    message: 'Разобраться с getViewModel - либо наследование, либо создавать модель прямо в TreeControl и передавать в BaseControl, либо ещё какой то вариант придумать.',
                    fullName: 'Кесарева Дарья',
                    photo: getImages().kesareva,
                    date: '12 сен',
                    state: 'Выполнение'
                },
                {
                    id: 7,
                    message: 'Научить reload обновлять табличное представление VDOM с сохранением набранных данных (например загруженных по кнопке "еще"). В данный момент есть deepReload, но он не сохраняет набранные данные.',
                    fullName: 'Кесарева Дарья',
                    photo: getImages().kesareva,
                    date: '12 сен',
                    state: 'Выполнение'
                },
                {
                    id: 8,
                    message: 'Лесенка на VDOM. Перевести алгоритм на предварительный расчет в модели. Сделать демку.',
                    fullName: 'Кесарева Дарья',
                    photo: getImages().kesareva,
                    date: '12 сен',
                    state: 'Выполнение'
                },
                {
                    id: 9,
                    message: 'Прошу сделать возможность отключения: 1) ховера на айтемах  у Controls/List, 2) курсор: поинтер',
                    fullName: 'Кесарева Дарья',
                    photo: getImages().kesareva,
                    date: '12 сен',
                    state: 'Выполнение'
                },
                {
                    id: 10,
                    message: 'через шаблон ячейки должна быть возможность управлять colspan (или rowspan) отдельной ячейки. <ws:partial template="standartCellTemplate" colspan="2"> типа такого если я напишу, то у меня будет ячейка на две колонки',
                    fullName: 'Кесарева Дарья',
                    photo: getImages().kesareva,
                    date: '12 сен',
                    state: 'Выполнение'
                },
                {
                    id: 11,
                    message: 'Не работают хлебные крошки и навигация по' +
                        'ним если идентификатор записи равен 0 Как повторить',
                    fullName: 'Догадкин Владимир',
                    photo: getImages().dogadkin,
                    date: '28 фев',
                    state: 'Выполнение'
                },
                {
                    id: 12,
                    message: 'Не работает collapse в группировке в дереве test-online.sbis.ru сталин/Сталин123',
                    fullName: 'Догадкин Владимир',
                    photo: getImages().dogadkin,
                    date: '26 фев',
                    state: 'Выполнение'
                }
            ]
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

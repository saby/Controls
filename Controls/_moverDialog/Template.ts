import Control = require('Core/Control');
import {IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_moverDialog/Template/Template');
import {Record} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';
import {TColumns} from 'Controls/grid';
import rk = require('i18n!Controls');

interface IMoverDialogTemplate extends IControlOptions {
    displayProperty: string;
    root?: string|number;
    searchParam: string;
    showRoot?: boolean;
    columns: TColumns;
    expandedItems: [];
}

/**
 * Шаблон диалогового окна, используемый в списках при перемещении элементов для выбора целевой папки.
 *
 * @remark
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Controls-demo%2FtreeGrid%2FMover%2FExtended%2FExtendedMoverDialog">демо-пример</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/list-environment/actions/mover-remover/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_moveDialog.less">переменные тем оформления</a>
 *
 * @class Controls/_moverDialog/Template
 * @extends Core/Control
 * @mixes Controls/_interface/IHierarchy
 * @mixes Controls/_interface/IFilterChanged
 * @mixes Controls/_interface/ISource
 * @mixes Controls/_grid/interface/IGridControl
 * @mixes Controls/_tree/interface/ITreeControlOptions
 * @mixes Controls/_list/interface/IList
 * @mixes Controls/_itemActions/interface/IItemActionsOptions
 * @mixes Controls/_explorer/interface/IExplorer
 * @mixes Controls/_interface/INavigation
 * @control
 * @public
 * @author Авраменко А.С.
 * @category List
 */

/**
 * @name Controls/_moverDialog/Template#displayProperty
 * @cfg {String} Имя поля элемента, данные которого используются для правильной работы <a href="/doc/platform/developmentapl/interface-development/controls/bread-crumbs/">Хлебных крошек</a>.
 */

/**
 * @name Controls/_moverDialog/Template#root
 * @cfg {String} Идентификатор корневого узла.
 * @default null
 */

/**
 * @name Controls/_moverDialog/Template#searchParam
 * @cfg {String} Имя поля, по данным которого происходит поиск.
 * @remark
 * Настройка нужна для правильной работы строки поиска.
 * Значение опции передаётся в контроллер поиска {@link Controls/search:Controller}.
 * Подробнее о работе поиска и фильтрации в Wasaby читайте в <a href="/doc/platform/developmentapl/interface-development/controls/list-environment/filter-search/">руководстве разработчика</a>.
 */

/**
 * @name Controls/_moverDialog/Template#showRoot
 * @cfg {Boolean} Разрешить перемещение записей в корень иерархии.
 * @remark
 * - true Отображается кнопка "В корень" над списком. Клик по кнопке перемещает записи в корень иерархии (см. <a href="/materials/Controls-demo/app/Controls-demo%2FOperationsPanel%2FDemo">демо-пример</a>).
 * - false Кнопка скрыта.
 */

/**
 * @event Controls/_moverDialog/Template#sendResult Происходит при выборе раздела для перемещения записей.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} item Раздел, куда перемещаются выбранные записи.
 * @remark
 * Выбор раздела производится кликом по записи, кнопкам "Выбрать" и "В корень" (см. {@link showRoot}).
 * Клик по папке не производит выбора раздела для перемещения.
 * Событие всплываемое (см. <a href="/doc/platform/developmentapl/interface-development/ui-library/events/">Работа с событиями</a>).
 * Событие происходит непосредственно перед событием close.
 * @see close
 */

/**
 * @event Controls/_moverDialog/Template#close Происходит при закрытии диалога перемещения записей.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @remark
 * Событие всплываемое (см. <a href="/doc/platform/developmentapl/interface-development/ui-library/events/">Работа с событиями</a>).
 * Событие происходит непосредственно после события sendResult.
 * @see sendResult
 */

export default class extends Control {
    protected _template: TemplateFunction = template;
    protected _itemActions: any[];
    protected _root: string|number;
    protected _expandedItems: any[];
    private _columns: TColumns;

    protected _beforeMount(options: IMoverDialogTemplate): void {
        this._itemActions = [{
            id: 1,
            title: rk('Выбрать'),
            showType: 2
        }];
        this._root = options.root;
        this._expandedItems = options.expandedItems;

        // TODO: сейчас прикладной программист передает в MoveDialog опцию columns, что плохо, он может повлиять на
        // отображение колонки, а диалог во всех реестрах должен выглядеть одинаково. Нужно убрать возможно передавать
        // конфигурации колонки и дать возможность настривать имя поля, из которого необходимо брать название папок.
        // Выписана задача: https://online.sbis.ru/opendoc.html?guid=aeaff20a-ee07-4d1b-8a9d-2528a269bc91
        this._columns = options.columns.slice();
        this._columns[0].textOverflow = 'ellipsis';
        this._onItemClick = this._onItemClick.bind(this);
        this._itemsFilterMethod = this._itemsFilterMethod.bind(this);
        this._itemActionVisibilityCallback = this._itemActionVisibilityCallback.bind(this);
    }

    protected _itemsFilterMethod(item: Record): boolean {
        let result = true;

        if (item.get) {
            result = this._options.movedItems.indexOf(item.get(this._options.keyProperty)) === -1;
        }

        return result;
    }

    protected _itemActionVisibilityCallback(action: object, item: Record): boolean {
        return item.get(this._options.hasChildrenProperty);
    }

    protected _onItemClick(event: SyntheticEvent<MouseEvent>, item: Record): void {
        if (!item.get(this._options.hasChildrenProperty)) {
            this._applyMove(item);
        }
    }

    protected _onMarkedKeyChanged(event: SyntheticEvent<null>, newKey: string | number | null): void {
        this._notify('markedKeyChanged', [newKey]);
    }

    protected _onItemActionsClick(event: SyntheticEvent<MouseEvent>, action: object, item: Record): void {
        this._applyMove(item);
    }

    protected _applyMove(item: Record): void {
        this._notify('sendResult', [item], {bubbling: true});
        this._notify('close', [], {bubbling: true});
    }

    static _theme: string[] = ['Controls/moverDialog'];

    static getDefaultOptions = (): object => {
        return {
            root: null
        };
    }
}

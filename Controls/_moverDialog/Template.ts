import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {Logger} from 'UI/Utils';
import template = require('wml!Controls/_moverDialog/Template/Template');
import cellTemplate = require('wml!Controls/_moverDialog/Template/CellTemplate');
import {Model} from 'Types/entity';
import {ICrudPlus, QueryWhereExpression} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {SyntheticEvent} from 'Vdom/Vdom';
import rk = require('i18n!Controls');
import {TColumns} from 'Controls/grid';
import {IHierarchy, TKeysSelection} from 'Controls/interface';
import 'css!Controls/moverDialog';

export interface IMoverDialogTemplateOptions extends IControlOptions, IHierarchy {
    displayProperty: string;
    root?: string|number;
    searchParam: string;

    // @deprecated
    showRoot?: boolean;

    rootVisible?: boolean;
    columns: TColumns;
    expandedItems: [];
    movedItems: TKeysSelection;
    source: ICrudPlus;
    keyProperty: string;
    nodeProperty: string;
    parentProperty: string;
    filter?: QueryWhereExpression<unknown>;
    headingCaption?: string;
    rootTitle: string;
    rootLabelVisible?: boolean;
}

/**
 * Шаблон диалогового окна, используемый в списках при перемещении элементов для выбора целевой папки.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2FtreeGrid%2FMover%2FExtended%2FExtendedMoverDialog демо-пример}
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/actions/mover/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_moveDialog.less переменные тем оформления}
 *
 * @class Controls/_moverDialog/Template
 * @extends UI/Base:Control
 * @mixes Controls/interface:IHierarchy
 * @mixes Controls/interface:IFilterChanged
 * @mixes Controls/interface:ISource
 * @mixes Controls/grid:IGridControl
 * @implements Controls/tree:ITreeControl
 * @mixes Controls/list:IList
 * @mixes Controls/itemActions:IItemActions
 * @mixes Controls/explorer:IExplorer
 * @mixes Controls/interface:INavigation
 *
 * @public
 * @author Авраменко А.С.
 */

export default class extends Control<IMoverDialogTemplateOptions> {
    protected _template: TemplateFunction = template;
    protected _itemActions: any[];
    protected _root: string|number;
    protected _expandedItems: any[];
    protected _searchValue: string = '';
    protected _filter: QueryWhereExpression<unknown>;
    private _columns: TColumns;

    protected _beforeMount(options: IMoverDialogTemplateOptions): void {
        this._itemActions = [{
            id: 1,
            title: rk('Выбрать'),
            showType: 2
        }];
        this._root = options.root;
        this._filter = options.filter || {};
        this._expandedItems = options.expandedItems;

        // TODO: сейчас прикладной программист передает в MoveDialog опцию columns, что плохо, он может повлиять на
        // отображение колонки, а диалог во всех реестрах должен выглядеть одинаково. Нужно убрать возможно передавать
        // конфигурации колонки и дать возможность настривать имя поля, из которого необходимо брать название папок.
        // Выписана задача: https://online.sbis.ru/opendoc.html?guid=aeaff20a-ee07-4d1b-8a9d-2528a269bc91
        this._columns = options.columns.slice();
        this._columns[0].textOverflow = 'ellipsis';

        // Пока поддерживаем обе опции
        if (options.showRoot) {
            Logger.error('MoverDialog: Опция showRoot устарела и будет удалена в 5100. Необходимо использовать опцию rootVisible', this);
        }
        if (!options.displayProperty) {
            Logger.warn('MoverDialog: Для корректной работы хлебных крошек необходимо указать опцию displayProperty', this);
        }

        if (options.rootVisible || options.showRoot) {
            if (!options.rootTitle) {
                Logger.error('MoverDialog: Для диалога перемещения необходимо указать опцию rootTitle', this);
            }
            this._columns[0].template = cellTemplate;
            this._columns[0].templateOptions = {
                rootLabelVisible: options.rootLabelVisible !== false
            };
        }

        this._onItemClick = this._onItemClick.bind(this);
        this._itemsFilterMethod = this._itemsFilterMethod.bind(this);
        this._itemActionVisibilityCallback = this._itemActionVisibilityCallback.bind(this);
        this._dataLoadCallback = this._dataLoadCallback.bind(this);
    }

    resetSearch(): void {
        this._searchValue = '';
        this._filter = this._options.filter || {};
    }

    protected _onSearchValueChanged(e: SyntheticEvent, value: string): void {
        if (this._searchValue !== value) {
            this._searchValue = value === undefined || value === null ? '' : value;
        }
    }

    protected _itemsFilterMethod(items: Model | Model[]): boolean {
        let result = true;
        const item = Array.isArray(items) ? items[items.length - 1] : items;

        if (item.get) {
            result = this._options.movedItems.indexOf(item.get(this._options.keyProperty)) === -1;
        }

        return result;
    }

    protected _itemActionVisibilityCallback(action: object, item: Model): boolean {
        return item.get(this._options.hasChildrenProperty);
    }

    protected _onItemClick(event: SyntheticEvent<MouseEvent>, item: Model): void {
        if (item.getKey() === 'root') {
            this._applyMove(this._options.root);

        } else if (!item.get(this._options.hasChildrenProperty)) {
            this._applyMove(item);
        }
    }

    protected _onMarkedKeyChanged(event: SyntheticEvent<null>, newKey: string | number | null): void {
        return this._notify('markedKeyChanged', [newKey]);
    }

    protected _onBeforeMarkedKeyChanged(event: SyntheticEvent<null>, newKey: string | number | null): void {
        return this._notify('beforeMarkedKeyChanged', [newKey]);
    }

    protected _onItemActionsClick(event: SyntheticEvent<MouseEvent>, action: object, item: Model): void {
        this._applyMove(item);
    }

    protected _applyMove(item: Model): void {
        this._notify('sendResult', [item], {bubbling: true});
        this._notify('close', [], {bubbling: true});
    }

    protected _dataLoadCallback(recordSet: RecordSet): void {
        if ((!this._searchValue || this._searchValue.length === 0) &&
            this._root === this._options.root &&
            (this._options.showRoot || this._options.rootVisible)) {
            recordSet.add(new Model({
                keyProperty: recordSet.getKeyProperty(),
                rawData: this._getRootRawData()
            }), 0);
        }
    }

    /**
     * Генерирует запись "В корень"
     * @private
     */
    private _getRootRawData(): {[p: string]: string | number} {
        return {
            [this._options.parentProperty]: this._root || null,
            [this._options.nodeProperty]: null,
            [this._options.keyProperty]: 'root',
            [this._options.displayProperty || 'title']: this._options.rootTitle
        };
    }

    static getDefaultOptions = (): object => {
        return {
            root: null
        };
    }
}
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
 * Подробнее о работе поиска и фильтрации в Wasaby читайте в <a href="/doc/platform/developmentapl/interface-development/controls/list/filter-and-search/">руководстве разработчика</a>.
 */

/**
 * @name Controls/_moverDialog/Template#rootVisible
 * @cfg {Boolean} Разрешить перемещение записей в корень иерархии.
 * @default false
 * @remark
 * - true Отображается кнопка "В корень" над списком. Клик по кнопке перемещает записи в корень иерархии (см. {@link /materials/Controls-demo/app/Controls-demo%2FOperationsPanel%2FDemo демо-пример}).
 * - false Кнопка скрыта.
 */

/**
 * @name Controls/_moverDialog/Template#rootTitle
 * @cfg {String} Заголовок корневой записи.
 */

/**
 * @name Controls/_moverDialog/Template#rootLabelVisible
 * @cfg {Boolean} Флаг, позволяющий включить или отключить пометку "(в корень)"
 * @default true
 */

/**
 * @name Controls/_moverDialog/Template#headingCaption
 * @cfg {String} Заголовок окна перемещения.
 * @default 'Выбор раздела'
 */

/**
 * @event Происходит при выборе раздела для перемещения записей.
 * @name Controls/_moverDialog/Template#sendResult
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} item Раздел, куда перемещаются выбранные записи.
 * @remark
 * Выбор раздела производится кликом по записи, кнопкам "Выбрать" и "В корень" (см. {@link rootVisible}).
 * Клик по папке не производит выбора раздела для перемещения.
 * Событие всплываемое (см. <a href="/doc/platform/developmentapl/interface-development/ui-library/events/">Работа с событиями</a>).
 * Событие происходит непосредственно перед событием {@link close}.
 * @see close
 */

/**
 * @event Происходит при закрытии диалога перемещения записей.
 * @name Controls/_moverDialog/Template#close
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @remark
 * Событие всплываемое (см. <a href="/doc/platform/developmentapl/interface-development/ui-library/events/">Работа с событиями</a>).
 * Событие происходит непосредственно после события sendResult.
 * @see sendResult
 */

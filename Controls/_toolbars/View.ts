import {ICrudPlus, PrefetchProxy} from 'Types/source';
import {SyntheticEvent} from 'Vdom/Vdom';
import {factory, RecordSet} from 'Types/collection';
import {descriptor, Record} from 'Types/entity';

import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {Sticky  as StickyOpener} from 'Controls/popup';
import {Controller as SourceController} from 'Controls/source';
import {IShowType, showType, getMenuItems} from 'Controls/Utils/Toolbar';
import {IStickyPopupOptions, IStickyPosition, IEventHandlers} from 'Controls/popup';

import {
    IHierarchy,
    IHierarchyOptions,
    IIconSize,
    IIconSizeOptions,
    IItemTemplate,
    IItemTemplateOptions
} from 'Controls/interface';

import {IToolbarSourceOptions, default as IToolbarSource} from 'Controls/_toolbars/IToolbarSource';
import {IButtonOptions} from 'Controls/buttons';
import {IGrouped, IGroupedOptions} from 'Controls/dropdown';

import * as template from 'wml!Controls/_toolbars/View';
import * as defaultItemTemplate from 'wml!Controls/_toolbars/ItemTemplate';
import * as ActualAPI from 'Controls/_toolbars/ActualAPI';
import {ButtonTemplate, cssStyleGeneration} from 'Controls/buttons';
import {CrudWrapper} from 'Controls/source';

type TItem = Record;
type TItems = RecordSet<TItem>;
type TypeItem = 'toolButton' | 'icon' | 'link' | 'list';
export type TItemsSpacing = 'medium' | 'big';

export function getButtonTemplateOptionsByItem(item: TItem, toolbarOptions: IControlOptions = {}): IButtonOptions {
    const icon = item.get('icon');
    const style = item.get('buttonStyle');
    const viewMode = item.get('viewMode');

    // todo: https://online.sbis.ru/opendoc.html?guid=244a5058-47c1-4896-a494-318ba2422497
    const size = viewMode === 'functionalButton' ? 's' : 'm';
    const iconSize = viewMode === 'functionalButton' ? 's' : 'm';

    const iconStyle = item.get('iconStyle');
    const transparent = item.get('buttonTransparent');
    const caption = item.get('caption');
    const captionPosition = item.get('captionPosition');
    const readOnly = item.get('readOnly') || toolbarOptions.readOnly;
    const fontColorStyle = item.get('fontColorStyle');
    const contrastBackground = item.get('contrastBackground');
    const cfg: IButtonOptions = {};
    cfg._hoverIcon = true;
    cssStyleGeneration.call(cfg, {
        size,
        icon,
        style,
        viewMode,
        iconStyle,
        iconSize,
        transparent,
        caption,
        captionPosition,
        readOnly,
        fontColorStyle,
        contrastBackground
    });
    cfg.readOnly = readOnly;
    return cfg;
}

export function getButtonTemplate(): TemplateFunction {
    return ButtonTemplate;
}

// Перейти на интерфейс выпадающих списков, когда он появится

export interface IMenuOptions {
    direction: IStickyPosition;
    targetPoint: IStickyPosition;
    eventHandlers: IEventHandlers;
    templateOptions: any;
}

/**
 * Интерфейс опций контрола {@link Controls/toolbars:View}.
 * @interface Controls/_toolbars/IToolbarOptions
 * @public
 * @author Красильников А.С.
 */
export interface IToolbarOptions extends IControlOptions, IHierarchyOptions, IIconSizeOptions, IItemTemplateOptions, IGroupedOptions, IToolbarSourceOptions {
    /**
     * Имя класса, которое будет добавлено к атрибуту class на корневой ноде выпадающего меню.
     */
    popupClassName: string;
    /**
     * Размер расстояния между кнопками.
     * @remark
     * Размер расстояния задается константой из стандартного набора размеров, который определен для текущей темы оформления.
     */
    itemsSpacing: TItemsSpacing;
    /**
     * @name Controls/_toolbars/View#additionalProperty
     * @cfg {String} Имя свойства, содержащего информацию о дополнительном пункте выпадающего меню. Подробное описание <a href="/doc/platform/developmentapl/interface-development/controls/dropdown-menu/item-config/#additional">здесь</a>.
     */
    additionalProperty?: string;
    /**
     * @name Controls/_toolbars/IToolbarOptions#popupFooterTemplate
     * @cfg {String|Function} Шаблон футера дополнительного меню тулбара.
     * @demo Controls-demo/Toolbar/popupFooterTemplate/Index
     */
    popupFooterTemplate?: String | Function;

}

/**
 * Графический контрол, отображаемый в виде панели с размещенными на ней кнопками, клик по которым вызывает соответствующие им команды.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FToolbar%2FToolbarVdom">Демо-пример</a>.
 *
 * @class Controls/_toolbars/View
 * @extends UI/Base:Control
 * @mixes Controls/interface:IHierarchy
 * @mixes Controls/interface:IIconSize
 * @mixes Controls/_toolbars/IToolbarOptions
 * @mixes Controls/_toolbars/IToolbarSource
 * @mixes Controls/interface/IItemTemplate
 *
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Toolbar/ToolbarVdom
 */
class Toolbar extends Control<IToolbarOptions, TItems> implements IHierarchy, IIconSize, IItemTemplate, IGrouped, IToolbarSource {
    /*
     * Used in template
     */
    protected _showType: IShowType = showType;
    protected _needShowMenu: boolean = null;
    protected _fullItemsList: TItems = null;
    protected _items: TItems = null;
    protected _menuItems: TItems = null;
    protected _source: ICrudPlus = null;
    protected _menuSource: ICrudPlus = null;
    protected _nodeProperty: string = null;
    protected _parentProperty: string = null;
    protected _menuOptions: object = null;
    protected _buttonTemplate: TemplateFunction = getButtonTemplate();

    protected _template: TemplateFunction = template;

    _children: {
        menuTarget: HTMLElement,
        menuOpener: StickyOpener
    };

    readonly '[Controls/_interface/IHierarchy]': boolean = true;
    readonly '[Controls/_toolbars/IToolbarSource]': boolean = true;
    readonly '[Controls/_interface/IIconSize]': boolean = true;
    readonly '[Controls/_interface/IItemTemplate]': boolean = true;
    readonly '[Controls/_dropdown/interface/IGrouped]': boolean = true;

    constructor(...args) {
        super(args);

        this._resultHandler = this._resultHandler.bind(this);
        this._closeHandler = this._closeHandler.bind(this);
    }

    private _getMenuConfig(): IStickyPopupOptions {
        const options = this._options;
        return {
            className: `${options.popupClassName} controls-Toolbar__popup__list_theme-${options.theme}`,
            templateOptions: {
                source: this._menuSource,
                iconSize: options.iconSize,
                keyProperty: options.keyProperty,
                nodeProperty: options.nodeProperty,
                parentProperty: options.parentProperty,
                groupTemplate: options.groupTemplate,
                groupProperty: options.groupProperty,
                groupingKeyCallback: options.groupingKeyCallback,
                additionalProperty: options.additionalProperty,
                itemTemplateProperty: options.itemTemplateProperty,
                footerContentTemplate: options.popupFooterTemplate
            },
            target: this._children.menuTarget
        };
    }

    private _getMenuConfigByItem(item: TItem): IStickyPopupOptions {
        const options = this._options;
        let source = this._source;
        const root = item.get(options.keyProperty);

        // Если запись для выпадающего списка еще не были загружены, то отдаем оригинальный источник вместо prefetchProxy
        if (this._items.getIndexByValue(options.parentProperty, root) === -1) {
            source = options.source;
        }
        return {
            opener: this,
            className: `controls-Toolbar__popup__${Toolbar._typeItem(item)}_theme-${options.theme} ${Toolbar._menuItemClassName(item)}`,
            targetPoint: {
                vertical: 'top',
                horizontal: 'left'
            },
            direction: {
                horizontal: 'right'
            },
            templateOptions: {
                source,
                root,
                groupTemplate: options.groupTemplate,
                groupProperty: options.groupProperty,
                groupingKeyCallback: options.groupingKeyCallback,
                keyProperty: options.keyProperty,
                parentProperty: options.parentProperty,
                nodeProperty: options.nodeProperty,
                iconSize: options.iconSize,
                itemTemplateProperty: options.itemTemplateProperty,
                showHeader: item.get('showHeader'),
                closeButtonVisibility: !item.get('showHeader'),
                headConfig: {
                    icon: item.get('icon'),
                    caption: item.get('title'),
                    iconSize: item.get('iconSize'),
                    iconStyle: item.get('iconStyle')
                }
            }
        };
    }

    private _getMenuOptions(): IMenuOptions {
        return {
            direction: {
                horizontal: 'left'
            },
            targetPoint: {
                vertical: 'top',
                horizontal: 'right'
            },
            eventHandlers: {
                onResult: this._resultHandler,
                onClose: this._closeHandler
            },
            templateOptions: {
                closeButtonVisibility: true
            }
        };
    }

    private _setState(options: IToolbarOptions): void {
        this._nodeProperty = options.nodeProperty;
        this._parentProperty = options.parentProperty;
    }

    private _createPrefetchProxy(source: ICrudPlus, items: TItems): ICrudPlus {
        return new PrefetchProxy({
            target: source,
            data: {
                query: items
            }
        });
    }

    private _setStateByItems(items: TItems, source: ICrudPlus): void {
        this._fullItemsList = items;
        /**
         * TODO: Можно удалить после выполнения https://online.sbis.ru/opendoc.html?guid=fe8e0736-7002-4a5f-b782-ea14e8bfb9be
         */
        const actualItems = ActualAPI.items(items);

        const menuItems = Toolbar._calcMenuItems(actualItems);

        this._items = actualItems;
        this._menuItems = menuItems;
        this._source = this._createPrefetchProxy(source, actualItems);
        this._menuSource = this._createPrefetchProxy(source, menuItems);
        this._needShowMenu = Boolean(menuItems && menuItems.getCount());
    }

    private _setStateBySource(source: ICrudPlus): Promise<TItems> {
        return Toolbar._loadItems(source).then((items) => {
            this._setStateByItems(items, source);

            return items;
        });
    }

    private _needChangeState(newOptions: IToolbarOptions): boolean {
        const currentOptions = this._options;

        return [
            'keyProperty',
            'parentProperty',
            'nodeProperty',
            'popupClassName'
        ].some((optionName: string) => currentOptions[optionName] !== newOptions[optionName]);
    }

    private _hasSourceChanged(newSource?: ICrudPlus) {
        const currentSource = this._options.source;

        return newSource && currentSource !== newSource;
    }

    private _openMenu(config): void {
        this._children.menuOpener.open(config, this);
    }

    protected _beforeMount(options: IToolbarOptions, context: {}, receivedItems?: TItems): Promise<TItems> {
        this._setState(options);
        this._menuOptions = this._getMenuOptions();

        if (receivedItems) {
            this._setStateByItems(receivedItems, options.source);
        } else if (options.source) {
            return this._setStateBySource(options.source);
        }
    }

    protected _beforeUpdate(newOptions: IToolbarOptions): void {
        if (this._needChangeState(newOptions)) {
            this._setState(newOptions);
        }
        if (this._hasSourceChanged(newOptions.source)) {
            this._setStateBySource(newOptions.source);
        }
    }

    protected _resultHandler(action, data): void {
        if (action === 'itemClick') {
            const item = data;
            this._notify('itemClick', [item]);

            /**
             * menuOpener may not exist because toolbar can be closed by toolbar parent in item click handler
             */
            if (this._children.menuOpener && !item.get(this._nodeProperty)) {
                this._children.menuOpener.close();
            }
        }
    }

    protected _closeHandler(): void {
        this._notify('menuClosed', [], {bubbling: true});
        this._setStateByItems(this._fullItemsList, this._options.source);
    }

    protected _itemClickHandler(event: SyntheticEvent<MouseEvent>, item: TItem): void {
        const readOnly: boolean = item.get('readOnly') || this._options.readOnly;

        if (readOnly) {
            event.stopPropagation();
            return;
        }

        if (item.get(this._nodeProperty)) {
            this._openMenu(Object.assign(this._getMenuConfigByItem(item), {
                target: event.currentTarget
            }));

            /**
             * TODO нотифай событий menuOpened и menuClosed нужен для работы механизма корректного закрытия превьювера переделать
             * по задаче https://online.sbis.ru/opendoc.html?guid=76ed6751-9f8c-43d7-b305-bde84c1e8cd7
             */
            this._notify('menuOpened', [], {bubbling: true});
        }

        this._notify('itemClick', [item, event.nativeEvent]);
        event.stopPropagation();
    }

    protected _getTemplateByItem(item: TItem): TemplateFunction {
        const selfItemTemplate: TemplateFunction = item.get(this._options.itemTemplateProperty);

        if (selfItemTemplate) {
            return selfItemTemplate;
        }

        return this._options.itemTemplate;
    }

    protected _getButtonTemplateOptionsByItem(item: TItem): IButtonOptions {
        return getButtonTemplateOptionsByItem(item, this._options);
    }

    protected _showMenu(event: SyntheticEvent<UIEvent>): void {
        if (!this._options.readOnly) {
            this._notify('menuOpened', [], {bubbling: true});
            this._openMenu(this._getMenuConfig());
        }
        /**
         * Stop bubbling of 'click' after opening the menu.
         * Nobody should have to catch the 'click'', if toolbar handled it.
         * For example, list can catch this event and generate 'itemClick'.
         */
        event.stopPropagation();
    }

    /**
     * Used in template
     */
    protected _isShowToolbar(item: TItem, parentProperty: string): boolean {
        const itemShowType = item.get('showType');

        if (itemShowType === showType.MENU) {
            return false;
        }
        const itemHasParentProperty = item.has(parentProperty) && item.get(parentProperty) !== null;

        if (itemHasParentProperty) {
            return itemShowType === showType.MENU_TOOLBAR;
        }

        return true;
    }

    static _theme: string[] = ['Controls/buttons', 'Controls/Classes', 'Controls/toolbars'];

    private static _typeItem(item: TItem): TypeItem {
        if (item.get('icon')) {
            return 'icon';
        }
        if (item.get('viewMode') === 'toolButton') {
            return 'toolButton';
        }

        return 'link';
    }

    private static _menuItemClassName(item: TItem): string {
        const menuClassName = item.get('popupClassName');

        if (menuClassName) {
            return menuClassName;
        }

        return '';
    }

    private static _loadItems(source: ICrudPlus): Promise<TItems> {
        const crudWrapper = new CrudWrapper({source});

        return crudWrapper.query({});
    }

    private static _calcMenuItems(items: TItems): TItems {
        return getMenuItems<TItem>(items).value(factory.recordSet, {
            adapter: items.getAdapter(),
            keyProperty: items.getKeyProperty(),
            format: items.getFormat()
        });
    }

    static getDefaultOptions() {
        return {
            /**
             * @name Controls/_toolbars/View#popupClassName
             * @default ''
             */
            popupClassName: '',
            /**
             * @name Controls/_toolbars/View#itemsSpacing
             * @default 'medium'
             */
            itemsSpacing: 'medium',
            iconSize: 'm',
            itemTemplate: defaultItemTemplate
        };
    }

    static getOptionTypes() {
        return {
            popupClassName: descriptor(String),
            itemsSpacing: descriptor(String).oneOf([
                'medium',
                'big'
            ])
        };
    }
}

/**
 * @event Controls/_toolbars/View#itemClick Происходит при клике по элементу.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Record} item Элемент, по которому производим клик.
 * @example
 * TMPL:
 * <pre>
 *    <Controls.toolbars:View on:itemClick="onToolbarItemClick()" />
 * </pre>
 * JS:
 * <pre>
 *    onToolbarItemClick: function(e, selectedItem) {
 *       var itemId = selectedItem.get('id');
 *       switch (itemId) {
 *          case 'remove':
 *             this._removeItems();
 *             break;
 *          case 'move':
 *             this._moveItems();
 *             break;
 *    }
 * </pre>
 */

export default Toolbar;

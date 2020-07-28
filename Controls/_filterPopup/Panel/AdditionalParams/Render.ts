import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {Collection, CollectionItem, GroupItem} from 'Controls/display';
import Clone = require('Core/core-clone');
import * as template from 'wml!Controls/_filterPopup/Panel/AdditionalParams/Render/Render';
import * as itemTemplate from 'wml!Controls/_filterPopup/Panel/AdditionalParams/Render/resources/ItemTemplate';
import * as groupTemplate from 'wml!Controls/_filterPopup/Panel/AdditionalParams/Render/resources/GroupTemplate';
import {IFilterItem} from 'Controls/filter';

interface IAdditionalRenderOptions extends IControlOptions {
    columnProperty: string;
    groupProperty: string;
    keyProperty: string;
    source: IFilterItem[];
}

/**
 * @class Controls/_filterPopup/Panel/AdditionalParams/Render
 * @extends UI/Base:Control
 * @control
 * @public
 * @author Михайлов С.Е
 */

/**
 * @name Controls/_filterPopup/Panel/AdditionalParams/Render#source
 * @cfg {Array<Controls/_filter/View/interface/IFilterView/FilterItem.typedef>} Коллекция элементов для отображения.
 */

/**
 * @name Controls/_filterPopup/Panel/AdditionalParams/Render#keyProperty
 * @cfg {string} Имя свойства, содержащего идентификатор элемента коллекции
 */

/**
 * @name Controls/_filterPopup/Panel/AdditionalParams/Render#groupProperty
 * @cfg {string} Имя свойства, содержащего идентификатор группы элемента списка.
 */

export default class AdditionalParamsRender extends Control<IAdditionalRenderOptions> {
    protected _template: TemplateFunction = template;
    protected _collection: Collection<IFilterItem> =  null;
    protected _itemTemplate: TemplateFunction = itemTemplate;
    protected _groupTemplate: TemplateFunction = groupTemplate;

    private _getCollection(options: IAdditionalRenderOptions): Collection<IFilterItem> {
        const items = Clone(options.source);
        return new Collection({
            keyProperty: options.keyProperty,
            collection: items,
            group: options.groupProperty ? (item): string => {
                return item[options.groupProperty];
            } : null
        });
    }

    protected _beforeMount(options: IAdditionalRenderOptions): void {
        this._collection = this._getCollection(options);
    }

    protected _isCurrentColumn(
        item: CollectionItem<IFilterItem>,
        collection: Collection<IFilterItem>,
        columnProperty: string,
        currentColumn: string): boolean {
        let column;
        if (item instanceof GroupItem) {
            column = collection.getNext(item).getContents()[columnProperty];
        } else {
            column = item.getContents()[columnProperty];
        }
        return column === currentColumn;
    }

    protected _isGroup(collectionItem: CollectionItem<IFilterItem> | GroupItem<IFilterItem>): boolean {
        return collectionItem instanceof GroupItem;
    }

    protected _beforeUpdate(options: IAdditionalRenderOptions): void {
        if (this._options.source !== options.source) {
            this._collection = this._getCollection(options);
        }
    }

    protected _clickSeparatorHandler(): void {
        this._notify('arrowClick', []);
    }

    protected _propertyChanged(event: Event, item: IFilterItem, property: string, value: any): void {
        this._notify('propertyChanged', [item, property, value]);
    }

    static _theme: string[] = ['Controls/filterPopup'];
}

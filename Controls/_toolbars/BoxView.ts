import {ICrudPlus} from 'Types/source';
import { SyntheticEvent } from 'UICommon/Events';
import {RecordSet} from 'Types/collection';
import {Record} from 'Types/entity';
import 'css!Controls/toolbars';
import 'css!Controls/buttons';
import 'css!Controls/CommonClasses';

import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {
    getButtonTemplate, hasSourceChanged,
    getSimpleButtonTemplateOptionsByItem, getTemplateByItem, loadItems
} from 'Controls/_toolbars/Util';

import {
    IHierarchyOptions, IIconSizeOptions,
    IItemTemplate, IItemTemplateOptions
} from 'Controls/interface';
import {IToolbarSourceOptions, default as IToolbarSource} from 'Controls/_toolbars/IToolbarSource';
import * as template from 'wml!Controls/_toolbars/BoxView/BoxView';
import * as defaultItemTemplate from 'wml!Controls/_toolbars/BoxView/ItemTemplate';
import {IButtonOptions} from 'Controls/buttons';

type TItem = Record;
type TItems = RecordSet<TItem>;

/**
 * Интерфейс опций контрола {@link Controls/toolbars:BoxView}.
 * @interface Controls/_toolbars/IToolbarBox
 * @author Красильников А.С.
 * @public
 */
export interface IToolbarBoxOptions extends IControlOptions, IHierarchyOptions, IIconSizeOptions,
    IItemTemplateOptions, IToolbarSourceOptions {
}

/**
 * Графический контрол, отображаемый в виде панели с размещенными на ней кнопками, клик по которым вызывает соответствующие им команды.
 *
 * @class Controls/_toolbars/BoxView
 * @extends UI/Base:Control
 * @implements Controls/interface:ISeparatorVisible
 * @implements Controls/interface/IItemTemplate
 * @implements Controls/toolbars:IToolbarSource
 * @demo Controls-demo/Toolbar/BoxView/Index
 *
 * @author Красильников А.С.
 * @public
 */

/**
 * @name Controls/_toolbars/BoxView#separatorVisible
 * @demo Controls-demo/Toolbar/BoxView/SeparatorVisible/Index
 */

class ToolbarBox extends Control<IToolbarBoxOptions, TItems> implements IItemTemplate, IToolbarSource {
    protected _items: TItems = null;
    protected _source: ICrudPlus = null;

    protected _template: TemplateFunction = template;
    protected _buttonTemplate: TemplateFunction = getButtonTemplate();

    readonly '[Controls/_toolbars/IToolbarSource]': boolean = true;
    readonly '[Controls/_interface/IItemTemplate]': boolean = true;

    private _setStateByItems(items: TItems): void {
        this._items = items;
    }

    protected _getSimpleButtonTemplateOptionsByItem(item: TItem): IButtonOptions {
        return getSimpleButtonTemplateOptionsByItem(item, this._options);
    }

    protected _beforeMount(options: IToolbarBoxOptions, context: {}, receivedItems?: TItems): Promise<TItems> {
        if (receivedItems) {
            this._setStateByItems(receivedItems);
        } else if (options.source) {
            return this.setStateBySource(options.source);
        }
    }

    protected _beforeUpdate(newOptions: IToolbarBoxOptions): void {
        if (hasSourceChanged(newOptions.source, this._options.source)) {
            this.setStateBySource(newOptions.source);
        }
    }

    protected _itemClickHandler(event: SyntheticEvent<MouseEvent>, item: TItem): void {
        const readOnly: boolean = item.get('readOnly') || this._options.readOnly;

        if (readOnly) {
            event.stopPropagation();
            return;
        }
        this._notify('itemClick', [item, event.nativeEvent]);
        event.stopPropagation();
    }

    protected setStateBySource(source: ICrudPlus): Promise<TItems> {
        return loadItems(source).then((items) => {
            this._setStateByItems(items);
            return items;
        });
    }

    protected _getTemplateByItem(item: TItem): TemplateFunction {
        return getTemplateByItem(item, this._options);
    }

    static getDefaultOptions(): object {
        return {
            iconSize: 's',
            separatorVisible: true,
            itemTemplate: defaultItemTemplate
        };
    }

}

Object.defineProperty(ToolbarBox, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return ToolbarBox.getDefaultOptions();
   }
});

export default ToolbarBox;

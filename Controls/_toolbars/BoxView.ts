import {ICrudPlus} from 'Types/source';
import {SyntheticEvent} from 'Vdom/Vdom';
import {RecordSet} from 'Types/collection';
import {Record} from 'Types/entity';

import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {CrudWrapper} from 'Controls/dataSource';

import {
    IHierarchyOptions, IIconSizeOptions,
    IItemTemplate, IItemTemplateOptions,
} from 'Controls/interface';
import {IToolbarSourceOptions, default as IToolbarSource} from 'Controls/_toolbars/IToolbarSource';
import * as template from 'wml!Controls/_toolbars/BoxView/BoxView';
import * as defaultItemTemplate from 'wml!Controls/_toolbars/BoxView/ItemTemplate';
import {ButtonTemplate, IButtonOptions, cssStyleGeneration} from 'Controls/buttons';

type TItem = Record;
type TItems = RecordSet<TItem>;

// todo: избавиться в этом компоне
export function getButtonTemplateOptionsByItem(item: TItem, toolbarOptions: IControlOptions = {}): IButtonOptions {
    const icon = item.get('icon');
    const style = item.get('buttonStyle');
    const viewMode = item.get('viewMode');

    const size = item.get('iconSize') || toolbarOptions.iconSize;
    const iconSize = item.get('iconSize') || toolbarOptions.iconSize;

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

/**
 * Интерфейс опций контрола {@link Controls/toolbars:BoxView}.
 * @interface Controls/_toolbars/IToolbarBoxOptions
 * @author Красильников А.С.
 */
export interface IToolbarBoxOptions extends IControlOptions, IHierarchyOptions, IIconSizeOptions,
    IItemTemplateOptions, IToolbarSourceOptions {
}

/**
 * Графический контрол, отображаемый в виде панели с размещенными на ней кнопками, клик по которым вызывает соответствующие им команды.
 *
 * @class Controls/_toolbars:BoxView
 * @extends UI/Base:Control
 * @mixes Controls/interface/IItemTemplate
 * @mixes Controls/_toolbars/IToolbarSource
 *
 * @author Красильников А.С.
 */
class ToolbarBox extends Control<IToolbarBoxOptions, TItems> implements IItemTemplate, IToolbarSource {
    protected _items: TItems = null;
    protected _source: ICrudPlus = null;

    protected _template: TemplateFunction = template;
    protected _buttonTemplate: TemplateFunction = getButtonTemplate();

    readonly '[Controls/_toolbars/IToolbarSource]': boolean = true;
    readonly '[Controls/_interface/IItemTemplate]': boolean = true;

    private _setStateByItems(items: TItems, source: ICrudPlus): void {
        this._items = items;
    }

    private _setStateBySource(source: ICrudPlus): Promise<TItems> {
        return ToolbarBox._loadItems(source).then((items) => {
            this._setStateByItems(items, source);

            return items;
        });
    }

    protected _getButtonTemplateOptionsByItem(item: TItem): IButtonOptions {
        return getButtonTemplateOptionsByItem(item, this._options);
    }

    private _hasSourceChanged(newSource?: ICrudPlus) {
        const currentSource = this._options.source;
        return newSource && currentSource !== newSource;
    }

    protected _beforeMount(options: IToolbarBoxOptions, context: {}, receivedItems?: TItems): Promise<TItems> {
        if (receivedItems) {
            this._setStateByItems(receivedItems, options.source);
        } else if (options.source) {
            return this._setStateBySource(options.source);
        }
    }

    protected _beforeUpdate(newOptions: IToolbarBoxOptions): void {
        if (this._hasSourceChanged(newOptions.source)) {
            this._setStateBySource(newOptions.source);
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

    protected _getTemplateByItem(item: TItem): TemplateFunction {
        const selfItemTemplate: TemplateFunction = item.get(this._options.itemTemplateProperty);

        if (selfItemTemplate) {
            return selfItemTemplate;
        }

        return this._options.itemTemplate;
    }

    static _theme: string[] = ['Controls/buttons', 'Controls/Classes', 'Controls/toolbars'];

    private static _loadItems(source: ICrudPlus): Promise<TItems> {
        const crudWrapper = new CrudWrapper({source});
        return crudWrapper.query({});
    }

    static getDefaultOptions() {
        return {
            iconSize: 's',
            itemTemplate: defaultItemTemplate
        };
    }

}

export default ToolbarBox;

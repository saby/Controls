import {TemplateFunction, IControlOptions, Control} from 'UI/Base';
import * as template from 'wml!Controls/_propertyGrid/GridRender/Render';
import * as groupTemplate from 'wml!Controls/_propertyGrid/Render/resources/groupTemplate';
import * as itemTemplate from 'wml!Controls/_propertyGrid/Render/resources/itemTemplate';
import * as toggleEditorsTemplate from 'wml!Controls/_propertyGrid/Render/resources/toggleEditorsGroupTemplate';
import {default as PropertyGridItem } from './PropertyGridCollectionItem';
import PropertyGridCollection from './PropertyGridCollection';
import {detection} from 'Env/Env';
import {Model} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';

interface IColumnOptions {
    width: string;
    compatibleWidth: string;
}
interface IPropertyGridGridRenderOptions extends IControlOptions {
    listModel?: PropertyGridCollection<PropertyGridItem<Model>>;
    groupTemplate: TemplateFunction;
    itemTemplate: TemplateFunction;
}

export default class IPropertyGridRender extends Control<IPropertyGridGridRenderOptions> {
    protected _template: TemplateFunction = template;
    protected _toggleEditorsTemplate: TemplateFunction = toggleEditorsTemplate;

    protected _beforeMount(options: IPropertyGridGridRenderOptions): void {
        this._getItemStyles = this._getItemStyles.bind(this);
    }

    protected _getColumnsWidth(captionTemplateOptions: IColumnOptions, editorTemplateOptions: IColumnOptions): string {
        const isIE = detection.isIE;
        const width = {
            compatibleCaption: captionTemplateOptions?.compatibleWidth || '50%',
            compatibleEditor: editorTemplateOptions?.compatibleWidth || '50%',
            caption: captionTemplateOptions?.width || '50%',
            editor: editorTemplateOptions?.width || '50%'
        };
        return isIE ? `-ms-grid-columns: ${width.compatibleCaption} ${width.compatibleEditor}` :
            `grid-template-columns: ${width.caption} ${width.editor}`;
    }

    protected _getItemStyles(item: PropertyGridItem<Model>, columnIndex: number, colspan?: boolean): string {
        const itemIndex = this._options.listModel.getIndex(item);
        if (colspan) {
            return `-ms-grid-column: 1;
                    -ms-grid-column-span: 2;
                    grid-column-start: 1;
                    grid-column-end: 3;
                    grid-row: ${itemIndex + 1};
                    -ms-grid-row: ${itemIndex + 1}`;
        }
        return `grid-column: ${columnIndex};
                grid-row: ${itemIndex + 1};
                -ms-grid-column: ${columnIndex};
                -ms-grid-row: ${itemIndex + 1};`;
    }

    protected _propertyValueChanged(e: SyntheticEvent<Event>, item: Model, value: Record<string, any>): void {
        e.stopPropagation();
        this._notify('propertyValueChanged', [item, value]);
    }

    protected _mouseEnterHandler(e: SyntheticEvent<Event>, item: PropertyGridItem<Model>): void {
        this._notify('hoveredItemChanged', [item]);
    }

    protected _mouseLeaveHandler(e: SyntheticEvent<Event>, item: PropertyGridItem<Model>): void {
        this._notify('hoveredItemChanged', [null]);
    }

    protected _toggleEditor(event: SyntheticEvent, item: Model, value: boolean): void {
        this._notify('toggleEditor', [item, value]);
    }

    protected _handleMenuActionMouseEnter(): void {
        //
    }
    protected _handleMenuActionMouseLeave(): void {
        //
    }

    protected _onItemActionMouseDown(e: SyntheticEvent<MouseEvent>,
                                     action: unknown,
                                     item: PropertyGridItem<Model>): void {
        e.stopPropagation();
        this._notify('itemActionMouseDown', [item, action, e]);
    }

    protected _onItemActionClick(e: SyntheticEvent<MouseEvent>): void {
        e.stopPropagation();
    }

    protected _itemClick(e: SyntheticEvent<MouseEvent>, item: PropertyGridItem<Model>): void {
        if (item['[Controls/_display/GroupItem]']) {
            this._notify('groupClick', [item, e]);
        } else {
            this._notify('itemClick', [item, e]);
        }
    }

    static getDefaultOptions = (): IPropertyGridGridRenderOptions => {
        return {
            groupTemplate,
            itemTemplate
        };
    }
}

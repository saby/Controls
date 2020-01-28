import tmplNotify = require('Controls/Utils/tmplNotify');
import {IRenderOptions} from 'Controls/listRender';
import {Control, TemplateFunction} from 'UI/Base';
import {IMenuOptions} from 'Controls/interface';
import {RecordSet} from 'Types/collection';
import {Tree, TreeItem} from 'Controls/display';
import * as itemTemplate from 'wml!Controls/_menu/Render/itemTemplate';
import ViewTemplate = require('wml!Controls/_menu/Render/Render');
import {Model} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';
import {factory} from 'Types/chain';

interface IMenuRenderOptions extends IMenuOptions, IRenderOptions {
}

class MenuRender extends Control<IMenuRenderOptions> {
    protected _template: TemplateFunction = ViewTemplate;
    protected _proxyEvent: Function = tmplNotify;

    protected _beforeMount(options: IMenuRenderOptions, context: object, receivedState: RecordSet): void {
        this.setListModelOptions(options);
    }

    protected _beforeUpdate(newOptions: IMenuRenderOptions): void {
        if (newOptions.listModel !== this._options.listModel) {
            this.setListModelOptions(newOptions);
        }
    }

    protected _itemMouseEnter(event: SyntheticEvent<MouseEvent>, item: TreeItem): void {
        this._notify('itemMouseEnter', [item, event.target, event.nativeEvent]);
    }

    protected _isEmptyItem(itemData) {
        return this._options.emptyText && itemData.getContents().getId() === this._options.emptyKey;
    }

    protected _getClassList(itemData): string {
        const item = itemData.getContents();
        let classes = itemData.getContentClasses();
        classes += ' controls-Menu__row_state_' + (item.get('readOnly')  ? 'readOnly' : 'default') + '_theme-' + this._options.theme;
        if (this._isEmptyItem(itemData)) {
            classes += ' controls-Menu__emptyItem_theme-' + this._options.theme;
        }
        if (item.get('pinned') === true && !itemData.hasParent) {
            classes += ' controls-Menu__row_pinned';
        }
        return classes;
    }

    private setListModelOptions(options: IMenuRenderOptions) {
        options.listModel.setItemsSpacings({
            top: 'null',
            left: this.getLeftSpacing(options),
            right: this.getRightSpacing(options)
        });
        if (options.emptyText) {
            this.addEmptyItem(options.listModel, options);
        }
    }

    private addEmptyItem(listModel: Tree, options: IMenuRenderOptions): void {
        let data = {};
        data[options.keyProperty] = options.emptyKey;
        data[options.displayProperty] = options.emptyText;
        listModel.getCollection().prepend([new Model({
            keyProperty: options.keyProperty,
            rawData: data
        })]);
    }

    private getLeftSpacing(options: IMenuRenderOptions): string {
        let leftSpacing = 'l';
        if (options.leftSpacing) {
            leftSpacing = options.leftSpacing;
        } else if (options.multiSelect) {
            leftSpacing = 'null';
        }
        return leftSpacing;
    }

    private getRightSpacing(options: IMenuRenderOptions): string {
        let rightSpacing = 'l';
        if (!options.rightSpacing) {
            factory(options.listModel.getItems()).each((item) => {
                if (item.getContents().get(options.nodeProperty)) {
                    rightSpacing = 'menu-expander';
                }
            });
        } else {
            rightSpacing = options.rightSpacing;
        }
        return rightSpacing;
    }

    static _theme: string[] = ['Controls/menu'];

    static getDefaultOptions(): object {
        return {
            itemTemplate
        };
    }
}

export default MenuRender;

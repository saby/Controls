import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {Memory} from 'Types/source';
import * as template from 'wml!Controls-demo/PropertyGrid/BasePg/ItemPaddingEditor';

export interface IOptionsValues {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

export interface IItemPaddingEditorOptions extends IControlOptions {
    value: IOptionsValues;
}

export default class ItemPaddingEditor extends Control<IItemPaddingEditorOptions> {
    protected _template: TemplateFunction = template;
    protected _left: number = null;
    protected _right: number = null;
    protected _top: number = null;
    protected _bottom: number = null;
    protected _topBottomSource: Memory;
    protected _leftRightSource: Memory;

    protected _beforeMount(cfg: IItemPaddingEditorOptions): void {

        this._topBottomSource = new Memory({
            data: [
                {id: 'null', title: 'null'},
                {id: 's', title: 's'}
            ],
            keyProperty: 'id'
        });

        this._leftRightSource = new Memory({
            data: [
                {id: 'null', title: 'null'},
                {id: 'xs', title: 'xs'},
                {id: 's', title: 's'},
                {id: 'm', title: 'm'},
                {id: 'l', title: 'l'},
                {id: 'xl', title: 'xl'},
                {id: 'xxl', title: 'xxl'}
            ],
            keyProperty: 'id'
        });

        this._left = cfg.value.left;
        this._right = cfg.value.right;
        this._top = cfg.value.top;
        this._bottom = cfg.value.bottom;
    }

    protected _onValueChanged(): void {
        this._notify('valueChanged', [{
            left: this._left,
            right: this._right,
            top: this._top,
            bottom: this._bottom
        }]);
    }
}

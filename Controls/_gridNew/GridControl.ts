import {TemplateFunction} from 'UI/Base';
import {ListControl} from 'Controls/list';
import * as Template from 'wml!Controls/_gridNew/GridControl/GridControl';
import { GridLayoutUtil } from 'Controls/grid';

export default class Grid extends ListControl {
    protected _template: TemplateFunction = Template;
    private _isFullGridSupport: boolean;

    protected _beforeMount(): void {
        this._isFullGridSupport = GridLayoutUtil.isFullGridSupport();
    }
}

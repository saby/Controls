import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Footer/SwitchFooter/SwitchFooter';
import * as FooterCellTemplate from 'wml!Controls-demo/gridNew/Footer/SwitchFooter/FooterCell';
import * as FooterTemplate from 'wml!Controls-demo/gridNew/Footer/SwitchFooter/FooterTemplate';
import { IColumn } from 'Controls/grid';
import { Countries } from 'Controls-demo/gridNew/DemoHelpers/Data/Countries';
import {Memory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = Countries.getColumns().slice(0, 4);
    protected _footer: Array<{ template: TemplateFunction }>;
    protected _footerTemplate: TemplateFunction;
    protected _toggleFooterCaption: string = 'Выключен';

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Countries.getData().slice(0, 4)
        });
    }

    _updateColumns(): void {
        this._columns = [...this._columns];
    }

    _toggleFooter(): void {
        switch (this._toggleFooterCaption) {
            case 'Выключен':
                this._toggleFooterCaption = 'Задан строкой';
                this._footer = undefined;
                this._footerTemplate = FooterTemplate;
                break;
            case 'Задан строкой':
                this._toggleFooterCaption = 'Задан по колонкам';
                this._footer = this._columns.map(() => ({ template: FooterCellTemplate }));
                this._footerTemplate = undefined;
                break;
            case 'Задан по колонкам':
                this._toggleFooterCaption = 'Снова задан строкой';
                this._footer = undefined;
                this._footerTemplate = FooterTemplate;
                break;
            case 'Снова задан строкой':
                this._toggleFooterCaption = 'Выключен';
                this._footer = undefined;
                this._footerTemplate = undefined;
                break;
        }
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

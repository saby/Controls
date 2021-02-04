import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_popupTemplate/Dialog/DialogHeader');
import 'css!Controls/popupTemplate';

class Header extends Control<IControlOptions> {
    //TODO: will be fixed by https://online.sbis.ru/opendoc.html?guid=33010df1-501e-4874-a02c-a5f45394a661
    protected _template: TemplateFunction = template;

    protected close(): void {
        this._notify('close', [], {bubbling: true});
    }
}

export default Header;

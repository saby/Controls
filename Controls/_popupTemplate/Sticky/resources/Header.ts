import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_popupTemplate/Sticky/resources/Header');

class Header extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    /**
     * Закрыть всплывающее окно
     * @function Controls/_popupTemplate/Sticky#close
     */
    close():void {
        this._notify('close', [], {bubbling: true});
    }
    static _theme: string[] = ['Controls/popupTemplate'];
}
export default Header;

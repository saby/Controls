import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_popupTemplate/Sticky/Template/Header';
import 'css!Controls/popupTemplate';

class Header extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    /**
     * Закрыть всплывающее окно
     * @function Controls/_popupTemplate/Sticky#close
     */
    close(): void {
        this._notify('close', [], {bubbling: true});
    }
}
export default Header;

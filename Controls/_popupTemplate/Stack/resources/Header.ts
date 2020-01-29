import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_popupTemplate/Stack/resources/Header');
import {IStackTemplateOptions} from '../../Stack';

class Header extends Control<IControlOptions> {
    //TODO: will be fixed by https://online.sbis.ru/opendoc.html?guid=33010df1-501e-4874-a02c-a5f45394a661
    protected _template: TemplateFunction = template;
    /**
     * Закрыть всплывающее окно
     * @function Controls/_popupTemplate/Stack#close
     */
    close(): void {
        this._notify('close', [], {bubbling: true});
    }
    changeMaximizedState(): void {
        /**
         * @event maximized
         * Occurs when you click the expand / collapse button of the panels.
         */
        const maximized = this._calculateMaximized(this._options);
        this._notify('maximized', [!maximized], {bubbling: true});
    }
    _calculateMaximized(options: IStackTemplateOptions): Boolean {
        // TODO: https://online.sbis.ru/opendoc.html?guid=256679aa-fac2-4d95-8915-d25f5d59b1ca
        if (!options.stackMinimizedWidth && options.stackMinWidth && options.stackMaxWidth) {
            const middle = (options.stackMinWidth + options.stackMaxWidth) / 2;
            return options.stackWidth - middle > 0;
        }
        return options.maximized;
    }
    static _theme: string[] = ['Controls/popupTemplate'];
}
export default Header;

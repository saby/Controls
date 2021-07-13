import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_popupTemplate/Stack/Template/Header/Header';
import {IStackTemplateOptions} from 'Controls/_popupTemplate/Stack/Template/Stack';
import 'css!Controls/popupTemplate';

class Header extends Control<IStackTemplateOptions> {
    protected _template: TemplateFunction = template;
    /**
     * Закрыть всплывающее окно
     * @function Controls/_popupTemplate/Stack#close
     */
    changeMaximizedState(): void {
        /**
         * @event maximized
         * Occurs when you click the expand / collapse button of the panels.
         */
        const maximized = Header._calculateMaximized(this._options);
        this._notify('maximized', [!maximized], {bubbling: true});
    }
    private static _calculateMaximized(options: IStackTemplateOptions): Boolean {
        if (!options.stackMinimizedWidth && options.stackMinWidth && options.stackMaxWidth) {
            const middle = (options.stackMinWidth + options.stackMaxWidth) / 2;
            return options.stackWidth - middle > 0;
        }
        return options.maximized;
    }
}
export default Header;

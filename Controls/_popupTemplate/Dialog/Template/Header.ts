import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_popupTemplate/Dialog/Template/Header';
import {SyntheticEvent} from 'Vdom/Vdom';
import 'css!Controls/popupTemplate';

class Header extends Control<IControlOptions> {
    // TODO: will be fixed by https://online.sbis.ru/opendoc.html?guid=33010df1-501e-4874-a02c-a5f45394a661
    protected _template: TemplateFunction = template;

    protected _headingMousedownHandler(e: SyntheticEvent<MouseEvent>): void {
        // Помечаю событиие обработанным, чтобы Dialog не обрабатывал начало драга.
        // Стопать нельзя, т.к. есть необходимость у пользователя выделять заголовок.
        e.nativeEvent.processed = true;
    }

    protected close(): void {
        this._notify('close', [], {bubbling: true});
    }
}

export default Header;

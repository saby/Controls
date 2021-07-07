import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_tile/itemActions/Menu/Menu';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Memory} from 'Types/source';

/**
 * Опции контрола, отображающего опции над записью в виде меню
 */
export interface ITileMenuActionsOptions extends IControlOptions {
    source: Memory;
    previewWidth: number;
    previewHeight: number;
    additionalText: string;
    title: string;
}

/**
 * Контрол, отображающий опции над записью в виде меню
 */
export default class extends Control <ITileMenuActionsOptions> {
    protected _template: TemplateFunction = template;
    protected _sendResult(
        event: SyntheticEvent<MouseEvent>,
        action: string,
        data: unknown,
        nativeEvent: SyntheticEvent<MouseEvent>
    ): void {
        this._notify('sendResult', [action, data, nativeEvent], {bubbling: true});
    }
}

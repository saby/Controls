import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_tile/ItemActions/Menu/Menu';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Memory} from 'Types/source';

export interface ITileMenuActionsOptions extends IControlOptions{
    source: Memory;
    previewWidth: number;
    previewHeight: number;
    additionalText: string;
    title: string;
}

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

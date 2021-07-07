import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_popupTemplate/Stack/Template/RightPanel/RightPanel';
import {Controller as ManagerController} from 'Controls/popup';
import 'css!Controls/popupTemplate';

export default class RightPanel extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _rightBottomTemplate: string;

    protected _beforeMount(): void {
        this._rightBottomTemplate = ManagerController.getRightPanelBottomTemplate();
    }

    protected _close(): void {
        this._notify('close', [], {bubbling: true});
    }
}

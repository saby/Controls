import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as controlTemplate from 'wml!Controls-demo/PopupTemplate/Infobox/WithScroll/WithScroll';
import * as template from 'wml!Controls-demo/PopupTemplate/Infobox/WithScroll/template';
import {StickyOpener} from 'Controls/popup';

export default class extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _sticky: StickyOpener = new StickyOpener();

    _openSticky() {
        this._sticky.open({
            template,
            opener: this._children.dialogButton,
            target: this._children.dialogButton,
            direction: {
                vertical: 'top',
                horizontal: 'right'
            },
            targetPoint: {
                vertical: 'top',
                horizontal: 'left'
            },
            closeOnOutsideClick: true
        });
    }

    static _styles: string[] = ['Controls-demo/InfoBox/resources/InfoboxButtonHelp', 'Controls-demo/Controls-demo'];
}

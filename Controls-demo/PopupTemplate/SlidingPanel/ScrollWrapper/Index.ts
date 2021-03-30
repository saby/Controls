import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/PopupTemplate/SlidingPanel/ScrollWrapper/Index/Index');
import PopupTemplate from 'Controls-demo/PopupTemplate/SlidingPanel/ScrollWrapper/PopupTemplate/PopupTemplate';
import {SlidingPanelOpener} from 'Controls/popup';

class Index extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _popupTemplate: Function = PopupTemplate;
    private _dialogOpener: SlidingPanelOpener;

    protected _openSlidingPanelHandler(event: Event, isInsideRestrictive: boolean): void {
        if (!this._dialogOpener) {
            this._dialogOpener = new SlidingPanelOpener();
        }
        this._dialogOpener.open({
            template: 'Controls-demo/PopupTemplate/SlidingPanel/ScrollWrapper/PopupTemplate/PopupTemplate',
            opener: this,
            slidingPanelOptions: {
                minHeight: 300,
                maxHeight: 800
            }
        });
    }
    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default Index;

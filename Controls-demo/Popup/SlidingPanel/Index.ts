import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Popup/SlidingPanel/Index/Index');
import {SlidingPanelOpener} from 'Controls/popup';
import {Memory} from 'Types/source';

class Index extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _minHeight: number = 300;
    protected _maxHeight: number = 700;
    protected _position: string[] = ['bottom'];
    protected _desktopWidth: number = 900;
    protected _modal: boolean = false;
    protected _positionSource: Memory = new Memory({
        keyProperty: 'id',
        data: [
            {id: 'top'},
            {id: 'bottom'}
        ]
    });
    private _dialogOpener: SlidingPanelOpener;

    protected _afterMount(options?: IControlOptions, contexts?: any): void {
        this._dialogOpener = new SlidingPanelOpener();
    }
    protected _openSlidingPanelHandler(event: Event, isInsideRestrictive: boolean): void {
        this._dialogOpener.open({
            template: 'Controls-demo/Popup/SlidingPanel/PopupTemplate',
            opener: this,
            modal: this._modal,
            position: this._position[0],
            slidingPanelSizes: {
                minHeight: this._minHeight,
                maxHeight: this._maxHeight
            },
            dialogSizes: {
                width: this._desktopWidth
            }
        });
    }
    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Popup/SlidingPanel/Index/Index'];
}
export default Index;

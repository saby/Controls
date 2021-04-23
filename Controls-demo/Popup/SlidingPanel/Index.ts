import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Popup/SlidingPanel/Index/Index');
import {SlidingPanelOpener} from 'Controls/popup';
import {Memory} from 'Types/source';
import {detection} from 'Env/Env';
import {SyntheticEvent} from 'UI/Vdom';

class Index extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _isMobile: boolean = true;
    protected _originIsMobile: boolean;
    protected _minHeight: number = 300;
    protected _maxHeight: number = 700;
    protected _position: string[] = ['bottom'];
    protected _desktopMode: string[] = ['stack'];
    protected _desktopWidth: number = 900;
    protected _modal: boolean = false;
    protected _desktopModeSource: Memory = new Memory({
        keyProperty: 'id',
        data: [
            {id: 'stack'},
            {id: 'dialog'}
        ]
    });
    protected _positionSource: Memory = new Memory({
        keyProperty: 'id',
        data: [
            {id: 'top'},
            {id: 'bottom'}
        ]
    });
    private _dialogOpener: SlidingPanelOpener;

    protected _beforeMount(): void {
        this._originIsMobile = detection.isPhone;
        // По умолчанию показываем версию для мобилки
        detection.isPhone = this._isMobile;
    }
    protected _afterMount(): void {
        this._dialogOpener = new SlidingPanelOpener();
    }
    protected _beforeUnmount(): void {
        // На случай если в демках появится SPA, чтобы не поломать другие демки
        detection.isPhone = this._originIsMobile;
    }
    protected _isMobileChanged(event: SyntheticEvent, value: boolean): void {
        this._isMobile = value;
        detection.isPhone = false;
    }

    protected _selectedModeChanged(): void {
        this._dialogOpener = new SlidingPanelOpener();
    }

    protected _openSlidingPanelHandler(event: Event, isInsideRestrictive: boolean): void {
        this._dialogOpener.open({
            template: 'Controls-demo/Popup/SlidingPanel/PopupTemplate',
            opener: this,
            modal: this._modal,
            desktopMode: this._desktopMode[0],
            slidingPanelOptions: {
                minHeight: this._minHeight,
                maxHeight: this._maxHeight,
                position: this._position[0]
            },
            dialogOptions: {
                width: this._desktopWidth
            }
        });
    }
    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Popup/SlidingPanel/Index/Index'];
}
export default Index;

import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/PopupTemplate/SlidingPanel/Index/Index');
import {detection} from 'Env/Env';
import { SyntheticEvent } from 'UI/Vdom';

class Index extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _isMobile: boolean = true;
    protected _originIsMobile: boolean;
    protected _slidingPanelOptions: object = {
        position: 'bottom',
        desktopMode: 'dialog'
    };
    protected _beforeMount(): void {
        this._originIsMobile = detection.isPhone;
        // По умолчанию показываем версию для мобилки
        detection.isPhone = this._isMobile;
    }
    protected _beforeUnmount(): void {
        // На случай если в демках появится SPA, чтобы не поломать другие демки
        detection.isPhone = this._originIsMobile;
    }
    protected _isMobileChanged(event: SyntheticEvent, value: boolean): void {
        this._isMobile = value;
        this._slidingPanelOptions = {...this._slidingPanelOptions};
        detection.isPhone = value;
    }
    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/PopupTemplate/SlidingPanel/Index/Index'];
}

export default Index;

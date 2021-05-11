import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Scroll/Container/Stretchable/Template');
import {RegisterClass} from 'Controls/event';
import { SyntheticEvent } from 'UICommon/Events';

export default class ContainerBaseDemo extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _expanded: boolean = false;

    private _resizeRegister: RegisterClass;

    _beforeMount(): void {
        this._resizeRegister = new RegisterClass({register: 'controlResize'});
    }

    _beforeUnmount(): void {
        this._resizeRegister.destroy();
    }

    _afterRender(): void {
        this._startResizeRegister();
    }

    private _startResizeRegister(event?: SyntheticEvent): void {
        const eventCfg = {
            type: 'controlResize',
            target: this,
            _bubbling: false
        };
        const customEvent = new SyntheticEvent(null, eventCfg);
        this._resizeRegister.start(customEvent);
    }

    _registerHandler(event, registerType, component, callback, config): void {
        this._resizeRegister.register(event, registerType, component, callback, config);
    }

    _unregisterHandler(event, registerType, component, config): void {
        this._resizeRegister.unregister(event, registerType, component, config);
    }

    _expandContainer(): void {
        this._expanded = !this._expanded;
    }

    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Scroll/Container/Stretchable/Style'];
}

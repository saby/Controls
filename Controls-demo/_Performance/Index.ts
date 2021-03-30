import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/_Performance/Template');
import {getControlsList} from './controlsList';
import {Memory} from 'Types/source';
import 'css!Controls-demo/Controls-demo';

class Performance extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _controlsSource: Memory;
    protected _curControlKeys: string[] = [];
    protected _chosenControl: string = null;
    protected _displayedControl: string = null;

    protected _beforeMount(options?: IControlOptions, contexts?: object, receivedState?: void): Promise<void> | void {
        return getControlsList().then((controlsList) => {
            this._controlsSource = new Memory({
                data: controlsList,
                keyProperty: 'id'
            });
        });
    }

    protected _curControlChanged(e: Event, keys: string[]): void {
        this._curControlKeys = keys;
        this._chosenControl = keys[0];
        this._displayedControl = null;
    }

    protected _createControl(): void {
        this._displayedControl = this._chosenControl;
    }

    protected _destroyControl(): void {
        this._displayedControl = null;
    }

    protected _recreateControl(): void {
        this._displayedControl = null;
        setTimeout(() => {
            this._displayedControl = this._chosenControl
        }, 300);
    }
}
export default Performance;

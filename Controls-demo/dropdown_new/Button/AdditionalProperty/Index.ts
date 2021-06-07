import {Control, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/dropdown_new/Button/AdditionalProperty/Index');
import {Memory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'key',
            data: [
                { key: 1, title: 'Add', icon: 'icon-Bell' },
                { key: 2, title: 'Vacation', icon: 'icon-Vacation'},
                { key: 3, title: 'Time off', icon: 'icon-SelfVacation' },
                { key: 4, title: 'Hospital', icon: 'icon-Sick' },
                { key: 5, title: 'Business trip', icon: 'icon-statusDeparted' },
                { key: 6, title: 'Task', icon: 'icon-TFTask', additional: true },
                { key: 7, title: 'Incident', icon: 'icon-Alert', additional: true },
                { key: 8, title: 'Outfit', icon: 'icon-PermittedBuyers', additional: true },
                { key: 9, title: 'Project', icon: 'icon-Document', additional: true },
                { key: 10, title: 'Check', icon: 'icon-Statistics', additional: true },
                { key: 11, title: 'Meeting', icon: 'icon-Groups', additional: true },
                { key: 12, title: 'Treaties', icon: 'icon-Report', additional: true }
            ]
        });
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

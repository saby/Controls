import {Control, TemplateFunction} from 'UI/Base';
import Template = require('wml!Controls-demo/SwitchableArea/DemoSwitchableArea');
import asyncItem = require('wml!Controls-demo/SwitchableArea/resources/contentAsync');
import secondContent = require('wml!Controls-demo/SwitchableArea/resources/contentDop');


export default class SwitchableArea extends Control {
    protected _template: TemplateFunction = Template;
    protected _items: any = {};
    protected _demoSelectedKey: string = '0';

    protected _beforeMount(): void {
        this._items = [
            {
                key: '0',
                itemTemplate: asyncItem,
                templateOptions: {
                    number: 1,
                    additionalOptions: true
                }
            },
            {
                key: '1',
                itemTemplate: asyncItem,
                templateOptions: {
                    number: 2
                }
            },
            {
                key: '2'
            }
        ];
    }

    clickHandler(event: object, idButton: string): void {
        this._demoSelectedKey = idButton;
        if (idButton === '2') {
            this._items = [
                {
                    key: '0',
                    itemTemplate: secondContent,
                    templateOptions: {
                        number: 1
                    }
                },
                {
                    key: '1',
                    itemTemplate: secondContent,
                    templateOptions: {
                        number: 2
                    }
                },
                {
                    key: '2',
                    itemTemplate: secondContent,
                    templateOptions: {
                        number: 3
                    }
                }
            ];
        }
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

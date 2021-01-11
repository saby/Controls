import {Control, TemplateFunction} from "UI/Base";
import {Memory} from 'Types/source';
import controlTemplate = require('wml!Controls-demo/LookupNew/Input/ShowSelector/Index');
import selectorTemplate = require('Controls-demo/Lookup/FlatListSelector/FlatListSelector');
import {SyntheticEvent} from 'Vdom/Vdom';
import {StickyOpener} from 'Controls/popup';
import {COMPANIES} from 'Controls-demo/LookupNew/resources/DataStorage';

export default class extends Control {
    protected _selectedKeys: string[] = [];
    protected _value: string = '';
    protected _template: TemplateFunction = controlTemplate;
    protected _selectorTemplate: TemplateFunction = null;
    protected _source: Memory;
    protected _navigation: object;
    protected _stickyOpener: StickyOpener;
    protected _lookupMode: string = 'Меню';

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'id',
            data: COMPANIES
        });

        this._navigation = {
            source: 'page',
            view: 'page',
            sourceConfig: {
                pageSize: 2,
                page: 0,
                hasMore: false
            }
        };

        this._selectorTemplate = {
            templateName: selectorTemplate,
            templateOptions: {
                headingCaption: 'Выберите организацию'
            },
            popupOptions: {
                width: 500
            }
        };
    }

    protected _beforeUnmount(): void {
        if (this._stickyOpener) {
            this._stickyOpener.destroy();
        }
    }

    protected _handleShowSelector(event: SyntheticEvent, lookupEvent: SyntheticEvent): boolean {
        if (lookupEvent && this._lookupMode === 'Меню') {
            this._stickyOpener = new StickyOpener();
            this._stickyOpener.open({
                template: 'Controls/menu:Popup',
                opener: this,
                target: event.currentTarget,
                templateOptions: {
                    source: new Memory({
                        keyProperty: 'id',
                        data: [
                            {id: 1, title: 'Сотрудники'},
                            {id: 2, title: 'Отделы'}
                        ]
                    })
                },
                targetPoint: {
                    vertical: 'top',
                    horizontal: 'right'
                },
                closeOnOutsideClick: true
            });
            return false;
        }
    }

    protected _handleToggleButtonClick(): void {
        this._lookupMode = this._lookupMode === 'Меню' ? 'Окно выбора' : 'Меню';
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

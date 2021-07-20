import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_propertyGrid/TabbedView/TabbedView';

import {Memory} from 'Types/source';

import {IPropertyGridOptions} from './IPropertyGrid';
import TabsController, {ISwitchableAreaItem} from './TabbedView/TabsController';

export interface IOptions extends IPropertyGridOptions {
    tabProperty: string;
}

/**
 * Контрол, который позволяет пользователям просматривать и редактировать свойства объекта с возможностью группировки по вкладкам
 * @author Герасимов А.М.
 * @public
 * @implements Controls/propertyGrid:IPropertyGrid
 * @demo Controls-demo/PropertyGridNew/TabbedView/Index
 * @extends UI/Base:Control
 */
export default class TabbedView extends Control<IOptions> {
    protected _template: TemplateFunction = template;

    private _tabsController: TabsController;

    protected _tabsSource: Memory;
    protected _switchableAreaItems: ISwitchableAreaItem[];

    protected _selectedKey: string;

    protected _beforeMount(options: IOptions): void {
        this._tabsController = new TabsController(options);
        this._applyNewStateFromController();
    }

    protected _beforeUpdate(options: IOptions): void {
        if (this._tabsController.updateOptions(options)) {
            this._applyNewStateFromController();
        }
    }

    protected _applyNewStateFromController(): void {
        this._tabsSource = this._tabsController.getTabsSource();
        this._switchableAreaItems = this._tabsController.getSwitchableAreaItems();

        this._selectedKey = this._switchableAreaItems[0].key;
    }

    protected _handleObjectChange(_: Event, obj: object): void {
        this._notify('editingObjectChanged', [obj]);
    }

    static get defaultProps(): Partial<IOptions> {
        return {
            tabProperty: 'tab'
        };
    }
}

/**
 * @name Controls/_propertyGrid/TabbedView#tabProperty
 * @cfg {string} Имя свойства, содержащего идентификатор таба элемента редактора свойств.
 * @demo Controls-demo/PropertyGridNew/TabbedView/Index
 */

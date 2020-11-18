import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_scroll/VirtualScrollContainer/VirtualScrollContainer');
import {RegisterUtil, UnregisterUtil} from 'Controls/event';

/**
 * @class Controls/_scroll/VirtualScrollContainer
 * @author Красильников А.С.
 * @see Controls/_scroll/Container
 * @public
 */

class  VirtualScrollContainer extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    protected _isContentVisible: boolean = true;

    protected _afterMount(): void {
        RegisterUtil(this, 'virtualNavigation', this._onVirtualNavigationChanged);
    }

    private _onVirtualNavigationChanged(enabled: boolean): void {
        this._isContentVisible = !enabled;
    }

    protected protected _beforeUnmount() {
        UnregisterUtil(this, 'virtualNavigation');
    }
}

export default VirtualScrollContainer;

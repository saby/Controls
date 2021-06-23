import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_scroll/VirtualScrollContainer/VirtualScrollContainer');
import {RegisterUtil, UnregisterUtil} from 'Controls/event';

export interface IVirtualScrollContainerOptions extends IControlOptions {
    /**
     * @name Controls/_scroll/VirtualScrollContainer#position
     * @cfg {String} Положение контрола в контейнере
     * @variant top Сверху. Контент виден, если видно начало списка, иначе скрыт.
     * @variant bottom Снизу. Контент виден, если виден конец списка, иначе скрыт.
     * @default top
     */
    position: 'top' | 'bottom';
}

/**
 * Контейнер, используемый для поддержки виртуальной прокрутки при наличии дополнительных контролов в {@link Controls/scroll:Container}.
 * Подробнее об использовании читайте {@link /doc/platform/developmentapl/interface-development/controls/list/performance-optimization/virtual-scroll/#container здесь}.
 * @author Красильников А.С.
 * @see Controls/_scroll/Container
 * @public
 * @example
 * <pre class="brush: html; highlight: [3,7]">
 * <!-- WML -->
 * <Controls.scroll:Container>
 *    <Controls.scroll:VirtualScrollContainer>
 *       <Controls.buttons:Button
 *          viewMode="link"
 *          caption="Контент, расположенный над списком"/>
 *    </Controls.scroll:VirtualScrollContainer>
 *    <Controls.list:View
 *       source="{{_viewSource}}"
 *       navigation="{{_navigation}}">
 *       <ws:virtualScrollConfig pageSize="{{100}}"/>
 *    </Controls.list:View>
 * </Controls.scroll:Container>
 * </pre>
 */
class  VirtualScrollContainer extends Control<IVirtualScrollContainerOptions> {
    protected _template: TemplateFunction = template;
    protected _options: IVirtualScrollContainerOptions;
    protected _isContentVisible: boolean = true;

    protected _afterMount(): void {
        RegisterUtil(this, 'virtualNavigation', this._onVirtualNavigationChanged.bind(this));
    }

    private _onVirtualNavigationChanged(position: 'top' | 'bottom', enabled: boolean): void {
        if (position === this._options.position) {
            this._isContentVisible = !enabled;
        }
    }

    protected _beforeUnmount(): void {
        UnregisterUtil(this, 'virtualNavigation');
    }

    static getDefaultOptions(): object {
        return {
            position: 'top'
        };
    }
}

Object.defineProperty(VirtualScrollContainer, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return VirtualScrollContainer.getDefaultOptions();
    }
});

export default VirtualScrollContainer;

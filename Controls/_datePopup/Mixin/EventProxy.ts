/**
 * An mixin that allows the component to proxy events from models and internal controls.
 * @class Controls/_datePopup/Mixin/EventProxy
 * @private
 * @author Красильников А.С.
 */

const Mixin = {

    /**
     * Проксирует событие из компонента
     * @protected
     */
    _proxyEvent: (event: Event): void => {
        this._notify(event.type, Array.prototype.slice.call(arguments, 1));
    }
};

export default Mixin;

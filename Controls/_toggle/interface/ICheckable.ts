export interface ICheckableOptions {
   value?: boolean;
}

/**
 * Интерфейс переключателя.
 *
 * @interface Controls/_toggle/interface/ICheckable
 * @public
 * @author Красильников А.С.
 */

/*
 * Interface for 2-position control.
 *
 * @interface Controls/_toggle/interface/ICheckable
 * @public
 * @author Красильников А.С.
 */
export interface ICheckable {
   readonly '[Controls/_toggle/interface/ICheckable]': boolean;
}
/**
 * @name Controls/_toggle/interface/ICheckable#value
 * @cfg {boolean} Текущее состояние.
 */

/*
 * @name Controls/_toggle/interface/ICheckable#value
 * @cfg {boolean} Current state.
 */

/**
 * @event Происходит при изменении значения.
 * @name Controls/_toggle/interface/ICheckable#valueChanged
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {boolean} value Новое значение.
 */

/*
 * @event Occurs when value changes.
 * @name Controls/_toggle/interface/ICheckable#valueChanged
 * @param {UICommon/Events:SyntheticEvent} eventObject The event descriptor.
 * @param {boolean} value New value.
 */

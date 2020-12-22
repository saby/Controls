export interface IDateConstructorOptions {
   dateConstructor?: Function;
}

/**
 * Интерфейс для контролов которые возвращают даты. Позволяет задать конструктор для создания дат.
 *
 * @noshow
 * @author Красильников А.С.
 */

export default interface IDateConstructor {
   readonly '[Controls/_interface/IDateConstructor]': boolean;
}
/**
 * @name Controls/_interface/IDateConstructor#dateConstructor
 * @cfg {Function} Конструктор который будет использоваться при создании объектов дат и времени.
 * @default undefined
 */

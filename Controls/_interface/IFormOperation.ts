/**
 * Интерфейс для контролов, которые реагируют на события формы редактирования записи.
 *
 * @interface Controls/_interface/IFormOperation
 * @public
 * @author Красильников А.С.
 */

export default interface IFormOperation {
    save: Function;
    cancel: Function;
    isDestroyed: Function;
}

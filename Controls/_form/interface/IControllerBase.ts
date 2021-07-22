import {IControlOptions} from 'UI/Base';
import {Record} from 'Types/entity';

/**
 * Интерфейс для котрола, реализующего функционал редактирования записи.
 * @interface Controls/form:IControllerBase
 * @public
 * @author Красильников А.С.
 */
export default interface IControllerBase extends IControlOptions {
    /**
     * @name Controls/form:IControllerBase#record
     * @cfg {Types/entity:Model} Запись, по данным которой будет инициализирован диалог редактирования.
     */
    record: Record;
    /**
     * @name Controls/form:IControllerBase#confirmationShowingCallback
     * @cfg {Function} Функция, которая определяет должно ли показаться окно с подтверждением сохранения/не сохранения измененных данных при закрытии диалога редактирования записи. Необходимо для случаев, когда есть измененные данные, не связанные с рекордом.
     * @remark
     * Если из функции возвращается true, тогда окно покажется, а если false - нет.
     */
    confirmationShowingCallback?: Function;
    /**
     * @name Controls/form:IControllerBase#keyProperty
     * @cfg {String} Имя свойства элемента, однозначно идентифицирующего элемент коллекции.
     */
    keyProperty?: string;
}

/**
 * Вызывает сохранение записи (завершение всех редактирований по месту, валидация).
 * @function Controls/form:IControllerBase#update
 * @param {Controls/form:IFormController/UpdateConfig.typedef} config Параметр сохранения.
 */

/**
 * Запускает процесс валидации.
 * @function Controls/form:IControllerBase#validate
 * @return {Core/Deferred} Deferred Результата валидации.
 */

/**
 * @event Происходит, когда запись обновлена успешно (валидация прошла успешно, редактирование по месту завершилось).
 * @name Controls/form:IControllerBase#updateSuccessed
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} record Редактируемая запись.
 * @see updatefailed
 */

/**
 * @event Происходит при ошибке валидации.
 * @name Controls/form:IControllerBase#validationFailed
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Array} validationFailed Результаты валидации.
 * @see validationSuccessed
 */

/**
 * @event Происходит при отсутствии ошибок валидации.
 * @name Controls/form:IControllerBase#validationSuccessed
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @see validationFailed
 */
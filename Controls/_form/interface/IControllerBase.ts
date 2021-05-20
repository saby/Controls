import {IControlOptions} from 'UI/Base';
import {Record} from 'Types/entity';
/**
 * Интерфейс для котрола реализующего функционал редактирования записи.
 *
 * @interface Controls/_form/interface/IControllerBase
 * @public
 * @author Красильников А.С.
 */

/**
 * @name Controls/_form/interface/IControllerBase#record
 * @cfg {Types/entity:Model} Устанавливает запись, по данным которой будет инициализирован диалог редактирования.
 */

/**
 * @name Controls/_form/interface/IControllerBase#keyProperty
 * @cfg {String} Имя свойства элемента, однозначно идентифицирующего элемент коллекции.
 */

/**
 * @name Controls/_form/interface/IControllerBase#confirmationShowingCallback
 * @cfg {Function} Функция, которая определяет должно ли показаться окно с подтверждением сохранения/не сохранения измененных данных при закрытии диалога редактирования записи. Необходимо для случаев, когда есть измененные данные, не связанные с рекордом.
 * @returns {Boolean} true - окно покажется. false - нет.
 */

/**
 * Вызывает сохранение записи(завершение всех редактирований по месту, валидация).
 * @function Controls/_form/interface/IControllerBase#update
 * @param {UpdateConfig} config Параметр сохранения.
 */

/**
 * Запускает процесс валидации.
 * @function Controls/_form/interface/IControllerBase#validate
 * @returns {Core/Deferred} Deferred результата валидации.
 */
/**
 * @event Происходит, когда запись обновлена успешно.(валидация прошла успешно, редактирование по месту завершилось)
 * @name Controls/_form/interface/IControllerBase#updatesuccessed
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} record Редактируемая запись.
 * @see updatefailed
 */

export default interface IControllerBase extends IControlOptions {
    record: Record;
    confirmationShowingCallback?: Function;
    keyProperty?: string;
}

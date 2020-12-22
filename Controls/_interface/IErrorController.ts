import dataSource = require('Controls/dataSource');
export interface IErrorControllerOptions {
   errorController?: dataSource.error.Controller;
}

/**
 * Интерфейс контролов, использующих источники данных и обрабатывающих ошибки от сервисов через {@link Controls/dataSource:error.Controller error-controller}.
 *
 * Подробнее читайте {@link /doc/platform/developmentapl/interface-development/pattern-and-practice/handling-errors/ здесь}.
 * @public
 * @author Заляев А.В
 */

/*
 * Interface for components that use data source and processing errors with {@link Controls/dataSource:error.Controller error-controller}.
 *
 * @public
 * @author Санников К.А.
 */ 
export default interface IErrorController {
   readonly '[Controls/_interface/IErrorController]': boolean;
}
/**
 * @name Controls/_interface/IErrorController#errorController
 * @cfg {Controls/dataSource:error.Controller} Модуль для выбора обработчика ошибки и формирования объекта с данными для шаблона ошибки.
 * @remark
 * Более подробно об обработке ошибок вы можете почитать {@link /doc/platform/developmentapl/interface-development/pattern-and-practice/handling-errors/ в статье}.
 * @example
 * <pre class="brush: js">
 * //...
 * constructor(opt) {
 *     super(opt);
 *     let handler = ({ error, mode }) => {
 *         if (error.code == 423) {
 *             return {
 *                 template: LockedErrorTemplate,
 *                 options: {
 *                     // ...
 *                 }
 *             }
 *         }
 *     };
 *     this._errorController = new ErrorController({
 *         handlers: [handler]
 *     });
 * }
 * //..
 * </pre>
 * <pre class="brush: html">
 * <Controls.list:View errorController="{{ _errorController }}"/>
 * </pre>
 */


/**
 * Created by rn.kondakov on 18.10.2018.
 */
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {SyntheticEvent} from 'Vdom/Vdom';
import template = require('./Markup/resources/template');
import * as linkDecorateUtils from './Markup/resources/linkDecorateUtils'
import {delay} from 'Types/function';


   /**
    * Создает контрол по данным в json-массиве.
    *
    * @class Controls/_decorator/Markup
    * @extends Core/Control
    * @category Decorator
    * @author Кондаков Р.Н.
    * @public
    */

   /*
    * Builds a control by data in Json array.
    *
    * @class Controls/_decorator/Markup
    * @extends Core/Control
    * @category Decorator
    * @author Кондаков Р.Н.
    * @public
    */

   /**
    * @name Controls/_decorator/Markup#value
    * @cfg {Array} Json-массив на основе JsonML.
    */

   /*
    * @name Controls/_decorator/Markup#value
    * @cfg {Array} Json array, based on JsonML.
    */

   /**
    * @name Controls/_decorator/Markup#tagResolver
    * @cfg {Function} Инструмент для изменения данных в формате Json перед сборкой, если это необходимо. Применяется к каждому узлу.
    * @remark
    * Аргументы функции:
    * <ol>
    *    <li>value - Json-узел для изменения.</li>
    *    <li>parent - Json-узел, родитель "value".</li>
    *    <li>resolverParams - Внешние данные для tagResolver из опции resolverParams.</li>
    * </ol>
    * Функция должна возвращать допустимый JsonML.
    * Если возвращаемое значение не равно (!= = ) исходному узлу, функция не будет применяться к дочерним элементам нового значения.
    * Примечание: функция не должна изменять исходное значение.
    *
    * @example
    * {@link Controls/_decorator/Markup/resolvers/highlight}
    * {@link Controls/_decorator/Markup/resolvers/linkDecorate}
    */

   /*
    * @name Controls/_decorator/Markup#tagResolver
    * @cfg {Function} Tool to change Json before build, if it need. Applies to every node.
    * @remark
    * Function Arguments:
    * <ol>
    *    <li>value - Json node to resolve.</li>
    *    <li>parent - Json node, a parent of "value" argument.</li>
    *    <li>resolverParams - Object, outer data for tagResolver from resolverParams option.</li>
    * </ol>
    * The function should return valid JsonML. If the return value is not equals (!==) to the origin node,
    * function will not apply to children of the new value.
    * Note: Function should not change origin value.
    *
    * @example
    * {@link Controls/_decorator/Markup/resolvers/highlight}
    * {@link Controls/_decorator/Markup/resolvers/linkDecorate}
    */

   /**
    * @name Controls/_decorator/Markup#resolverParams
    * @cfg {Object} Внешние данные для tagResolver.
    */

   /*
    * @name Controls/_decorator/Markup#resolverParams
    * @cfg {Object} Outer data for tagResolver.
    */


   /**
    * @typedef {Object}
    * @name ValidHtml
    * @property {Object} validNodes Набор тегов, которые будут вставляться версткой. Формат: {tagName: true, ...}. Набор по умолчанию расположен в модуле  <a href='https://git.sbis.ru/sbis/ws/blob/498360abc1272395be3b26ec388afb688bc9e200/WS.Core/core/validHtml.js'>Core/validHtml</a>.
    * @property {Object} validAttributes Набор разрешенных атрибутов, которые попадут в результат. Формат: {attributeName: true, ...}. Набор по умолчанию расположен в модуле  <a href='https://git.sbis.ru/sbis/ws/blob/498360abc1272395be3b26ec388afb688bc9e200/WS.Core/core/validHtml.js'>Core/validHtml</a>.
    */

   /**
    * @name Controls/_decorator/Markup#validHtml
    * @cfg {ValidHtml} Опция для переопределения разрешённых тегов и атрибутов. Набор по умолчанию расположен в модуле  <a href='https://git.sbis.ru/sbis/ws/blob/498360abc1272395be3b26ec388afb688bc9e200/WS.Core/core/validHtml.js'>Core/validHtml</a>.
    */

   class MarkupDecorator extends Control<IControlOptions> {
      _template: TemplateFunction = template;

      _contextMenuHandler(event: SyntheticEvent<MouseEvent>): void {
         if (event.target.tagName.toLowerCase() === 'a') {
            // Для ссылок требуется браузерное контекстное меню.
            event.stopImmediatePropagation();
         }
      }

      _copyHandler(event: SyntheticEvent<ClipboardEvent>): void {
         const decoratedLinkNodes = event.currentTarget.getElementsByClassName(linkDecorateUtils.getClasses().link);
         Array.prototype.forEach.call(decoratedLinkNodes, (decoratedLink) => {
            const decoratedLinkImage = decoratedLink.getElementsByTagName('img')[0];
            const span = document.createElement('span');
            span.innerHTML = decoratedLink.href;

            // Если заменить картинки на спан с текстом ссылки во время перехвата и вернуть обратно асинхронно,
            // то в ворд вставятся ссылки, не меняя при этом страницу внешне.
            decoratedLink.replaceChild(span, decoratedLinkImage);
            delay(() => {
               decoratedLink.replaceChild(decoratedLinkImage, span);
            });
         });
      }

      static _theme = ['Controls/decorator'];
   }

   export default MarkupDecorator;

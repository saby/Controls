import { clearNeedDecorateGlobals, needDecorate, getDecoratedLink } from '../resources/linkDecorateUtils';

/**
 * Модуль с функцией замены общей ссылки на декорированную ссылку, если это необходимо.
 * @remark
 * Распознаватель тегов для {@link Controls/decorator:Markup}.
 * Модуль содержит функцию, которая позволяет преобразовать обычную ссылку в декорированную.
 * Декорация ссылки выполняется через <a href="/doc/platform/developmentapl/middleware/link-decorator/">Сервис декорирования ссылок</a>.
 * Функция предназначена для использования в контроле {@link Controls/decorator:Markup} в опции {@link /docs/js/Controls/decorator/Markup/options/tagResolver/ tagResolver}.
 * @example
 * <pre class="brush: xml">
 * <!-- WML -->
 * <Controls.decorator:Markup value="{{ _json }}" tagResolver="{{ _tagResolver }}" />
 * </pre>
 * <pre class="brush: js">
 * // JavaScript
 * define("MyControl", ["UI/Base", "wml!MyControl", "Controls/decorator"], 
 * function(Base, template, decorator) {
 *    var ModuleClass = Base.Control.extend({
 *       _template: template,
 *       _tagResolver: decorator.linkDecorate
 *       _json:
 *          [
 *             [
 *                ["p", 
 *                   &#160;
 *                   // Ссылка, подходящая для декорирования, сразу в json
 *                   ["a",
 *                      {"href": "https://ya.ru"},
 *                      "https://ya.ru"
 *                   ]
 *                ],
 *                ["p", 
 *                   &#160;
 *                   // Ссылка, не подходящая для декорирования, сразу в json
 *                   ["a",
 *                      {"href": "http://www.google.com"},
 *                      "www.google.com"
 *                   ]
 *                ],
 *                ["pre", 
 *                   &#160;
 *                   // Не подходящая и подходящая ссылки прямо в plain/text строке, 
 *                   //положенной в тег pre для отображения переноса строки \n
 *                   "     www.google.com\nhttps://ya.ru"
 *                ]
 *             ]
 *          ]
 *       });
 *   return ModuleClass;
 * });
 * </pre>
 * 
 * Результат:
 * 
 * <pre class="brush: html">
 * <div>
 *    <p>
 *       <span class="...">
 *          <a class="..." href="https://ya.ru">
 *             <img class="..." src=".." alt="https://ya.ru"></img>
 *          </a>
 *       </span>
 *    </p>
 *    <p>
 *       <a href="http://www.google.com">www.google.com</a>
 *    </p>
 *    <pre>
 *       <a href="http://www.google.com">www.google.com</a>
 *       <span class="...">
 *          <a class="..." href="https://ya.ru">
 *             <img class="..." src="..." alt="https://ya.ru"></img>
 *          </a>
 *       </span>
 *    </pre>
 * </div>
 * </pre>
 * @class Controls/_decorator/Markup/resolvers/linkDecorate
 * @public
 * @author Угриновский Н.В.
 */

/*
 *
 * Module with a function to replace common link on decorated link, if it needs.
 * Tag resolver for {@link Controls/decorator:Markup}.
 *
 * @class Controls/_decorator/Markup/resolvers/linkDecorate
 * @public
 * @author Угриновский Н.В.
 */
export default function linkDecorate(value, parent) {
    if (!parent) {
        clearNeedDecorateGlobals();
    }
    let result;
    if (needDecorate(value, parent)) {
        result = getDecoratedLink(value);
    } else {
        result = value;
    }
    return result;
};

import {Control} from 'UI/Base';
/**
 * Модуль возвращает функцию, которая проверяет, является ли класс наследником 'UI/Base:Control'.
 *
 * <h2>Аргументы функции</h2>
 *
 * Прототип класса компонента.
 *
 * <h2>Критерий проверки</h2>
 *
 * Класс унаследован от Core/Control.
 *
 * <h2>Возвращает</h2>
 *
 * * true - класс унаследован от Core/Control.
 * * false - класс не унаследован от Core/Control.
 *
 * <h2>Пример использования</h2>
 * <pre>
 * require(['Controls/buttons:Button', 'SBIS3.CONTROLS/Button', 'Controls/Utils/isVDOMTemplate'], function(VDOMButton, WS3Button, isVDOMTemplate) {
 *
 *   // true
 *   isVDOMTemplate(VDOMButton);
 *
 *   // false
 *   isVDOMTemplate(WS3Button);
 * });
 * </pre>
 *
 * @class Controls/Utils/isVDOMTemplate
 * @public
 * @author Красильников А.С.
 */

export function isVDOMTemplate(templateClass: Control): boolean {
    // на VDOM классах есть св-во _template.
    // Если его нет, но есть stable или isDataArray, значит это функция от tmpl файла
    const isVDOM = templateClass && (
        (templateClass.prototype && templateClass.prototype._template) ||
        templateClass.stable || templateClass.isDataArray);
    return !!isVDOM;
}

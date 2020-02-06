import Control = require('Core/Control');
import template = require('wml!Controls/_moverDialog/BaseTemplate/BaseTemplate');

/**
 * Базовый шаблон диалогового окна, используемый в списках при перемещении элементов для выбора целевой папки.
 * @control
 * @public
 * @class Controls/_moverDialog/BaseTemplate
 * @author Авраменко А.С.
 * @category List
 */

/**
 * @name Controls/_moverDialog/BaseTemplate#headerContentTemplate
 * @cfg {function|String} Контент, располагающийся между заголовком и крестиком закрытия.
 */

/**
 * @name Controls/_moverDialog/BaseTemplate#bodyContentTemplate
 * @cfg {function|String} Основной контент шаблона, располагается под headerContentTemplate.
 */
const
    BaseTemplate = Control.extend({
        _template: template
    });
BaseTemplate._theme = ['Controls/_moverDialog/BaseTemplate/BaseTemplate'];

export default BaseTemplate;

import Control = require('Core/Control');
import template = require('wml!Controls/_moverDialog/BaseTemplate/BaseTemplate');

/**
 * Базовый шаблон диалогового окна, используемый в списках при перемещении элементов для выбора целевой папки.
 * 
 * @remark
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_moveDialog.less">переменные тем оформления</a>
 * 
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

BaseTemplate._theme = ['Controls/moverDialog'];

export default BaseTemplate;

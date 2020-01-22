import Control = require('Core/Control');
import template = require('wml!Controls/_search/Misspell/Container');

/**
 * Контрол-контейнер для {@link Controls/list:Container}, который обеспечивает загрузку и отображение {@link Controls/search:Misspell}, если поиск был произведён в неправильной раскладке.
 * @remark
 * Подробнее об организации поиска и фильтрации в реестре читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list-environment/filter-search/ здесь}.
 * Подробнее о классификации контролов Wasaby и схеме их взаимодействия читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list-environment/component-kinds/ здесь}.
 * @class Controls/_search/Misspell/Container
 * @extends Core/Control
 * @control
 * @public
 * @author Крайнов Д.О.
 */
export = Control.extend({
   _template: template,

   /**
    * @name Controls/_search/Misspell/Container#misspellClass
    * @cfg {String} Класс, который будет установлен на подсказку изменения раскладки.
    * @example
    * <pre class="brush: html">
    * <Controls.search:MisspellContainer misspellClass="demoMisspellClass">
    * ...
    * </Controls.search:MisspellContainer>
    * </pre>
    */

   _misspellClick: function () {
      this._notify('misspellCaptionClick', [], {bubbling: true});
   }
});


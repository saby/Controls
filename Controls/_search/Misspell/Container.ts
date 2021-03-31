import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_search/Misspell/Container';

/**
 * Контрол-контейнер для {@link Controls/list:Container}, который обеспечивает загрузку и отображение {@link Controls/search:Misspell}, если поиск был произведён в неправильной раскладке.
 * @remark
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/filter-and-search/ руководство разработчика по организации поиска и фильтрации в реестре}
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/filter-and-search/component-kinds/ руководство разработчика по классификации контролов Wasaby и схеме их взаимодействия}
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_search.less переменные тем оформления}
 * 
 * @class Controls/_search/Misspell/Container
 * @extends UI/Base:Control
 * 
 * @public
 * @author Крайнов Д.О.
 */

export default class MisspellContainer extends Control<IControlOptions> {
   protected _template: TemplateFunction = template;

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

   protected _misspellClick(): void {
      this._notify('misspellCaptionClick', [], {bubbling: true});
   }
}

import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {ICaption} from 'Controls/interface';
import template = require('wml!Controls/_search/Misspell');
import 'css!Controls/search';

/**
  * Контрол, отображающий подсказку, если в запросе при поиске найдена и исправлена опечатка.
  *
  * @remark
  * Полезные ссылки:
  * * {@link /doc/platform/developmentapl/interface-development/controls/list/filter-and-search/ руководство разработчика по организации поиска и фильтрации в реестре}
  * * {@link /doc/platform/developmentapl/interface-development/controls/list/filter-and-search/component-kinds/ руководство разработчика по классификации контролов Wasaby и схеме их взаимодействия}
  * * {@link https://github.com/saby/wasaby-controls/blob/691ea993b54186e06053160a2c88d66fb629f4ed/Controls-default-theme/variables/_search.less переменные тем оформления}
  * * {@link /doc/platform/developmentapl/interface-development/controls/list/filter-and-search/search/change-layout/ Поиск со сменой раскладки}
  * 
  * @class Controls/_search/Misspell
  * @mixes Controls/interface:ICaption
  * @extends UI/Base:Control
  *
  * @public
  * @author Крайнов Д.О.
  */
/*
 * //TODO KONGO A control that displays a tooltip if misspell was in search text was found.
 * @class Controls/_search/Misspell
 * @mixes Controls/interface:ICaption
 * @extends UI/Base:Control
 *
 * @public
 * @author Крайнов Д.О.
 */

class Misspell extends Control<IControlOptions & ICaption> implements ICaption{
   protected _template: TemplateFunction = template;

   readonly '[Controls/_interface/ICaption]': true;
}

export default Misspell;

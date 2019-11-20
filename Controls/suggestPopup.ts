/**
 * Библиотека контролов, которые реализуют содержимое подсказки, отображающейся при вводе текста.
 * @library Controls/suggestPopup
 * @includes ListContainer Controls/_suggestPopup/List
 * @includes FooterTemplate Controls/suggestPopup:FooterTemplate
 * @public
 * @author Крайнов Д.О.
 */

/*
 * suggestPopup library
 * @library Controls/suggestPopup
 * @includes ListContainer Controls/_suggestPopup/List
 * @includes FooterTemplate Controls/suggestPopup:FooterTemplate
 * @public
 * @author Крайнов Д.О.
 */ 

import ListContainer = require('Controls/_suggestPopup/List');
import FooterTemplate = require('wml!Controls/_suggestPopup/footer');
import SuggestTemplate = require('wml!Controls/_suggestPopup/suggestTemplate');

import _ListWrapper = require('Controls/_suggestPopup/_ListWrapper');
import Dialog = require('Controls/_suggestPopup/Dialog');

export {default as __PopupLayer} from './_suggestPopup/Layer/__PopupLayer';
export {default as __ContentLayer} from './_suggestPopup/Layer/__ContentLayer';

export {
   ListContainer,
   FooterTemplate,
   SuggestTemplate,

   _ListWrapper,
   Dialog
};

/**
 * Шаблон, используемый по умолчанию для построения подвала автодополнения.
 * Шаблон имеет два параметра: 
 * <ul>
 *  <li>showSelectorButtonTemplate - шаблон кнопки "Показать всё"</li>
 *  <li>showMoreButtonTemplate - шаблон кнопки "Ещё"</li>
 * </ul> 
 * 
 * @class Controls/suggestPopup:FooterTemplate
 * @author Герасимов А.М.
 */


/**
 * Библиотека контролов, которые реализуют содержимое автодополнения, отображающееся при вводе текста.
 * @remark
 * Автодополнение можно настроить в следующих контролах:
 *
 * * {@link /doc/platform/developmentapl/interface-development/controls/input-elements/input/ Поле ввода с автодополнением}
 * * {@link /doc/platform/developmentapl/interface-development/controls/input-elements/directory/lookup/ Поле выбора}
 * @library
 * @includes ListContainer Controls/suggestPopup:ListContainer
 * @includes FooterTemplate Controls/suggestPopup:FooterTemplate
 * @includes SuggestTemplate Controls/suggestPopup:SuggestTemplate
 * @public
 * @author Крайнов Д.О.
 */

/*
 * suggestPopup library
 * @library
 * @includes ListContainer Controls/suggestPopup:ListContainer
 * @includes FooterTemplate Controls/suggestPopup:FooterTemplate
 * @includes SuggestTemplate Controls/suggestPopup:SuggestTemplate
 * @public
 * @author Крайнов Д.О.
 */

import ListContainer = require('wml!Controls/_suggestPopup/WrappedList');
import FooterTemplate = require('wml!Controls/_suggestPopup/footer');
import SuggestTemplate = require('wml!Controls/_suggestPopup/suggestTemplate');
import EmptyTemplate = require('wml!Controls/_suggestPopup/resource/empty');

import Dialog = require('Controls/_suggestPopup/Dialog');

export {default as LoadService} from './_suggestPopup/LoadService';
export {default as __PopupLayer} from './_suggestPopup/Layer/__PopupLayer';
export {default as __ContentLayer} from './_suggestPopup/Layer/__ContentLayer';
export {default as _ListWrapper} from 'Controls/_suggestPopup/_ListWrapper';

export {
   ListContainer,
   FooterTemplate,
   SuggestTemplate,
   EmptyTemplate,
   Dialog
};

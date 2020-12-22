/**
 * Библиотека контролов, которые служат для задания набора шаблонов, из которых в каждый момент времени может отображаться только один, с возможностью переключения между этими шаблонами.
 * @library Controls/tabs
 * @public
 * @author Крайнов Д.О.
 */

/*
 * tabs library
 * @library Controls/tabs
 * @public
 * @author Крайнов Д.О.
 */

export {default as Buttons, ITabsTemplate, ITabsTemplateOptions} from 'Controls/_tabs/Buttons';
export {default as AdaptiveButtons, ITabsAdaptiveButtonsOptions} from 'Controls/_tabs/AdaptiveButtons';
export {ITabsButtons, ITabsButtonsOptions} from 'Controls/_tabs/interface/ITabsButtons';

import buttonsItemTemplate = require('wml!Controls/_tabs/Buttons/ItemTemplate');

export {
   buttonsItemTemplate
};

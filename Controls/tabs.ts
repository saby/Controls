/**
 * Библиотека контролов, которые служат для задания набора шаблонов, из которых в каждый момент времени может отображаться только один, с возможностью переключения между этими шаблонами.
 * @library Controls/tabs
 * @includes Buttons Controls/_tabs/Buttons
 * @includes ITabsButtons Controls/_tabs/interface/ITabsButtons
 * @public
 * @author Крайнов Д.О.
 */

/*
 * tabs library
 * @library Controls/tabs
 * @includes Buttons Controls/_tabs/Buttons
 * @includes ITabsButtons Controls/_tabs/interface/ITabsButtons
 * @public
 * @author Крайнов Д.О.
 */

export {default as Buttons} from 'Controls/_tabs/Buttons';
export {default as AdaptiveButtons} from 'Controls/_tabs/AdaptiveButtons';
export {ITabsButtons, ITabsButtonsOptions} from 'Controls/_tabs/interface/ITabsButtons';
export {IAdaptiveTabs, IAdaptiveTabsOptions} from 'Controls/_tabs/interface/IAdaptiveTabs';
import buttonsItemTemplate = require('wml!Controls/_tabs/Buttons/ItemTemplate');

export {
   buttonsItemTemplate
};

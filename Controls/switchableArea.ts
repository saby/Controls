/**
 * Библиотека контролов, которые реализуют область с возможностью переключения контента.
 * @library Controls/switchableArea
 * @includes View Controls/_switchableArea/View
 * @includes itemTemplate wml!Controls/_switchableArea/resource/itemTemplate
 * @public
 * @author Крайнов Д.О.
 */

/*
 * switchableArea library
 * @library Controls/switchableArea
 * @includes View Controls/_switchableArea/View
 * @includes itemTemplate wml!Controls/_switchableArea/resource/itemTemplate
 * @public
 * @author Крайнов Д.О.
 */

import itemTemplate from 'Controls/_switchableArea/ItemTpl';

export {default as View, ISwitchableOptions} from './_switchableArea/View';

export {
   itemTemplate
};

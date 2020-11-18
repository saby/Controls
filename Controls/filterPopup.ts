/**
 * Библиотека контролов, которые реализуют панель фильтрации и её содержимое.
 * @library Controls/filterPopup
 * @public
 * @author Крайнов Д.О.
 */

/*
 * filterPopup library
 * @library Controls/filterPopup
 * @public
 * @author Крайнов Д.О.
 */

import Panel = require('Controls/_filterPopup/Panel');
import DetailPanel = require('Controls/_filterPopup/DetailPanel');
import SimplePanel = require('Controls/_filterPopup/SimplePanel');
import SimplePanelItemTemplate = require('wml!Controls/_filterPopup/SimplePanel/itemTemplate');
import SimplePanelEmptyItemTemplate = require('wml!Controls/_filterPopup/SimplePanel/_List/emptyItemTemplate');
import SimplePanelHierarchyItemTemplate = require('wml!Controls/_filterPopup/SimplePanel/_HierarchyList/hierarchyItemTemplate');
import Select = require('Controls/_filterPopup/Panel/Select');
import Lookup = require('Controls/_filterPopup/Panel/Lookup');
import _List = require('Controls/_filterPopup/SimplePanel/_List');
import _HierarchyList = require('Controls/_filterPopup/SimplePanel/_HierarchyList');
import * as SelectItemTemplate from 'wml!Controls/_filterPopup/Panel/Select/ItemTemplate';

import _FilterPanelWrapper = require('Controls/_filterPopup/Panel/Wrapper/_FilterPanelWrapper');

export {default as HierarchyLookup} from 'Controls/_filterPopup/Panel/HierarchyLookup';
export {default as _EditDialog} from 'Controls/_filterPopup/History/_EditDialog';
export {default as Link} from 'Controls/_filterPopup/Panel/Link';
export {default as Text} from 'Controls/_filterPopup/Panel/Text';
export {default as Dropdown} from 'Controls/_filterPopup/Panel/Dropdown';
export {default as AdditionalPanelTemplate} from 'Controls/_filterPopup/Panel/AdditionalParams/Render';

export {default as IFilterButton} from 'Controls/_filterPopup/interface/IFilterPanel';

export {
   Panel,
   DetailPanel,
   SimplePanel,
   SimplePanelItemTemplate,
   SimplePanelEmptyItemTemplate,
   SimplePanelHierarchyItemTemplate,
   Select,
   SelectItemTemplate,
   Lookup,
   _List,
   _HierarchyList,

   _FilterPanelWrapper
};

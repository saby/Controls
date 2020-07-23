/**
 * Библиотека контролов, которые реализуют панель фильтрации и её содержимое.
 * @library Controls/filterPopup
 * @includes Panel Controls/_filterPopup/Panel
 * @includes DetailPanel Controls/_filterPopup/DetailPanel
 * @includes SimplePanel Controls/_filterPopup/SimplePanel
 * @includes SimplePanelEmptyItemTemplate Controls/_filterPopup/SimplePanel/_List/emptyItemTemplate
 * @includes SimplePanelHierarchyItemTemplate Controls/_filterPopup/SimplePanel/_HierarchyList/hierarchyItemTemplate
 * @includes Link Controls/_filterPopup/Panel/Link
 * @includes Select Controls/_filterPopup/Panel/Select
 * @includes Dropdown Controls/_filterPopup/Panel/Dropdown
 * @includes Text Controls/_filterPopup/Panel/Text
 * @includes Lookup Controls/_filterPopup/Panel/Lookup
 * @includes HierarchyLookup Controls/_filterPopup/Panel/HierarchyLookup
 * @public
 * @author Крайнов Д.О.
 */

/*
 * filterPopup library
 * @library Controls/filterPopup
 * @includes Panel Controls/_filterPopup/Panel
 * @includes DetailPanel Controls/_filterPopup/DetailPanel
 * @includes SimplePanel Controls/_filterPopup/SimplePanel
 * @includes SimplePanelEmptyItemTemplate Controls/_filterPopup/SimplePanel/_List/emptyItemTemplate
 * @includes Link Controls/_filterPopup/Panel/Link
 * @includes Select Controls/_filterPopup/Panel/Select
 * @includes Dropdown Controls/_filterPopup/Panel/Dropdown
 * @includes Text Controls/_filterPopup/Panel/Text
 * @includes Lookup Controls/_filterPopup/Panel/Lookup
 * @includes HierarchyLookup Controls/_filterPopup/Panel/HierarchyLookup
 * @includes AdditionalPanelTemplate Controls/_filterPopup/Panel/AdditionalParams/Render
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

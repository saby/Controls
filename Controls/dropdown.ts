/**
 * Библиотека контролов, которые служат для отображения элемента коллекции или выбора элемента из выпадающего окна.
 * @library
 * @includes ItemTemplate Controls/dropdown:ItemTemplate
 * @includes HeaderTemplate Controls/dropdown:HeaderTemplate
 * @includes GroupTemplate Controls/dropdown:GroupTemplate
 * @includes IFooterTemplate Controls/_dropdown/interface/IFooterTemplate
 * @includes IHeaderTemplate Controls/_dropdown/interface/IHeaderTemplate
 * @includes inputDefaultContentTemplate Controls/dropdown:inputDefaultContentTemplate
 * @includes IIconSize Controls/_dropdown/interface/IIconSize
 * @includes IButton Controls/dropdown:IButton
 * @public
 * @author Крайнов Д.О.
 */

/*
 * dropdown library
 * @library
 * @includes ItemTemplate Controls/dropdown:ItemTemplate
 * @includes HeaderTemplate Controls/dropdown:HeaderTemplate
 * @includes GroupTemplate Controls/dropdown:GroupTemplate
 * @includes IFooterTemplate Controls/_dropdown/interface/IFooterTemplate
 * @includes IHeaderTemplate Controls/_dropdown/interface/IHeaderTemplate
 * @includes inputDefaultContentTemplate wml!Controls/_dropdown/Selector/resources/defaultContentTemplate
 * @includes IIconSize Controls/_dropdown/interface/IIconSize
 * @includes IButton Controls/dropdown:IButton
 * @public
 * @author Крайнов Д.О.
 */

import {default as Button, IButtonOptions} from 'Controls/_dropdown/Button';
import {default as _Controller} from 'Controls/_dropdown/_Controller';
import Combobox = require('Controls/_dropdown/ComboBox');
import ItemTemplate = require('wml!Controls/_dropdown/itemTemplate');
import GroupTemplate = require('wml!Controls/_dropdown/GroupTemplate');
import HeaderTemplate = require('wml!Controls/_dropdown/HeaderTemplate');

import MenuUtils = require('Controls/_dropdown/Button/MenuUtils');
import dropdownHistoryUtils = require('Controls/_dropdown/dropdownHistoryUtils');
import inputDefaultContentTemplate = require('wml!Controls/_dropdown/Selector/resources/defaultContentTemplate');
import defaultContentTemplateWithIcon = require('wml!Controls/_dropdown/Selector/resources/defaultContentTemplateWithIcon');

export {default as IGrouped, IGroupedOptions} from 'Controls/_dropdown/interface/IGrouped';
export {default as IBaseDropdown} from 'Controls/_dropdown/interface/IBaseDropdown';
export {default as Selector} from 'Controls/_dropdown/Selector';
export {default as Toggle} from 'Controls/_dropdown/Toggle';

export {
    Button,
    IButtonOptions,
    _Controller,
    Combobox,
    ItemTemplate,
    GroupTemplate,
    HeaderTemplate,

    MenuUtils,
    dropdownHistoryUtils,
    inputDefaultContentTemplate,
    defaultContentTemplateWithIcon
};

/**
 * Библиотека контролов, которые служат для отображения элемента коллекции или выбора элемента из выпадающего окна.
 * @library Controls/dropdown
 * @includes ItemTemplate Controls/_dropdown/interface/ItemTemplate
 * @includes HeaderTemplate Controls/_dropdown/interface/HeaderTemplate
 * @includes GroupTemplate Controls/_dropdown/interface/GroupTemplate
 * @includes IDropdownSource Controls/_dropdown/interface/IDropdownSource
 * @includes IFooterTemplate Controls/_dropdown/interface/IFooterTemplate
 * @includes IGrouped Controls/_dropdown/interface/IGrouped
 * @includes IHeaderTemplate Controls/_dropdown/interface/IHeaderTemplate
 * @includes inputDefaultContentTemplate Controls/_dropdown/interface/inputDefaultContentTemplate
 * @includes IIconSize Controls/_dropdown/interface/IIconSize
 * @public
 * @author Крайнов Д.О.
 */

/*
 * dropdown library
 * @library Controls/dropdown
 * @includes ItemTemplate Controls/_dropdown/interface/ItemTemplate
 * @includes HeaderTemplate Controls/_dropdown/interface/HeaderTemplate
 * @includes GroupTemplate Controls/_dropdown/interface/GroupTemplate
 * @includes IDropdownSource Controls/_dropdown/interface/IDropdownSource
 * @includes IFooterTemplate Controls/_dropdown/interface/IFooterTemplate
 * @includes IGrouped Controls/_dropdown/interface/IGrouped
 * @includes IHeaderTemplate Controls/_dropdown/interface/IHeaderTemplate
 * @includes inputDefaultContentTemplate Controls/_dropdown/interface/inputDefaultContentTemplate
 * @includes IIconSize Controls/_dropdown/interface/IIconSize
 * @public
 * @author Крайнов Д.О.
 */

import {default as Button} from 'Controls/_dropdown/Button';
import {default as Input} from 'Controls/_dropdown/Input';
import {default as _Controller} from 'Controls/_dropdown/_Controller';
import Combobox = require('Controls/_dropdown/ComboBox');
import ItemTemplate = require('wml!Controls/_dropdown/itemTemplate');
import GroupTemplate = require('wml!Controls/_dropdown/GroupTemplate');
import HeaderTemplate = require('wml!Controls/_dropdown/HeaderTemplate');

import MenuUtils = require('Controls/_dropdown/Button/MenuUtils');
import dropdownHistoryUtils = require('Controls/_dropdown/dropdownHistoryUtils');
import inputDefaultContentTemplate = require('wml!Controls/_dropdown/Input/resources/defaultContentTemplate');
import defaultContentTemplateWithIcon = require('wml!Controls/_dropdown/Input/resources/defaultContentTemplateWithIcon');

export {default as IGrouped, IGroupedOptions} from 'Controls/_dropdown/interface/IGrouped';
export {default as IDropdownSource} from 'Controls/_dropdown/interface/IDropdownSource';

export {default as IDropdownSource} from 'Controls/_dropdown/interface/IDropdownSource';
export {default as IFooterTemplate} from 'Controls/_dropdown/interface/IFooterTemplate';
export {default as IHeaderTemplate} from 'Controls/_dropdown/interface/IHeaderTemplate';
export {default as IIconSize} from 'Controls/_dropdown/interface/IIconSize';

export {
    Button,
    Input,
    _Controller,
    Combobox,
    ItemTemplate,
    GroupTemplate,
    HeaderTemplate,

    MenuUtils,
    dropdownHistoryUtils,
    inputDefaultContentTemplate,
    defaultContentTemplateWithIcon
}

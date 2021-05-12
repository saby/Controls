import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_filterPanelPopup/Stack';
import { SyntheticEvent } from 'UICommon/Events';
import 'css!Controls/filterPanelPopup';

/**
 * Шаблон стекового окна для панели фильтра.
 * @class Controls/_filterPanelPopup/Stack
 * @extends UI/Base:Control
 * @author Мельникова Е.А.
 *
 * @public
 */

/**
 * @name Controls/_filterPanelPopup/Stack#bodyContentTemplate
 * @cfg {TemplateFunction} Шаблон окна панели фильтров.
 */

export default class Stack extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    protected _collapsedGroupsChanged(event: SyntheticEvent, collapsedFilters: string[] | number[]): void {
        this._notify('sendResult', [{action: 'collapsedFiltersChanged', collapsedFilters}], {bubbling: true});
    }

    protected _filterAppliedHandler(event: SyntheticEvent): void {
        this._notify('close', [], {bubbling: true});
    }
}

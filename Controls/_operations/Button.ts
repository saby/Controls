import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {IExpandableOptions, IExpandable} from 'Controls/interface';
import ButtonTemplate = require('wml!Controls/_operations/Button/Button');
export interface IOperationsButtonOptions extends IControlOptions, IExpandableOptions {
}

/**
 * Контрол-кнопка, использующийся для показа и скрытия панели действий {@link Controls/operations:Panel}.
 * Подробное описание и инструкцию по найстройке читайте <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list-environment/operations/'>здесь</a>.
 *
 * @class Controls/_operations/Button
 * @extends Core/Control
 * @implements Controls/_interface/IExpandable
 * @control
 * @author Авраменко А.С.
 * @public
 *
 * @css @width_OperationsButton Width of the button.
 * @css @height_OperationsButton Height of the button.
 * @css @thickness_OperationsButton-separator Thickness of the separator between the button and the rest of the content.
 * @css @height_OperationsButton-separator Height of the separator between the button and the rest of the content.
 * @css @color_OperationsButton-icon Color of the icon.
 * @css @color_OperationsButton-icon_hovered Color of the hovered icon.
 * @css @color_OperationsButton-icon_active Color of the active icon.
 * @css @color_OperationsButton-separator Color of the separator between the button and the rest of the content.
 * @css @font-size_OpконфerationsButton-icon Font size of the icon.
 * @css @font-family_OperationsButton-icon Font family of the icon.
 */

/*
 * Control for changing the extensibility of the "Controls/_operations/Panel".
 * The detailed description and instructions on how to configure the control you can read <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/operations/'>here</a>.
 *
 * @class Controls/_operations/Button
 * @extends Core/Control
 * @implements Controls/_interface/IExpandable
 * @control
 * @author Авраменко А.С.
 * @public
 *
 * @css @width_OperationsButton Width of the button.
 * @css @height_OperationsButton Height of the button.
 * @css @thickness_OperationsButton-separator Thickness of the separator between the button and the rest of the content.
 * @css @height_OperationsButton-separator Height of the separator between the button and the rest of the content.
 * @css @color_OperationsButton-icon Color of the icon.
 * @css @color_OperationsButton-icon_hovered Color of the hovered icon.
 * @css @color_OperationsButton-icon_active Color of the active icon.
 * @css @color_OperationsButton-separator Color of the separator between the button and the rest of the content.
 * @css @font-size_OperationsButton-icon Font size of the icon.
 * @css @font-family_OperationsButton-icon Font family of the icon.
 */

class OperationsButton extends Control<IOperationsButtonOptions> implements IExpandable {
   '[Controls/_toggle/interface/IExpandable]': true;
   // TODO https://online.sbis.ru/opendoc.html?guid=0e449eff-bd1e-4b59-8a48-5038e45cab22
   protected _template: TemplateFunction = ButtonTemplate;

   protected _onClick(): void {
      if (!this._options.readOnly) {
         this._notify('expandedChanged', [!this._options.expanded]);
      }
   }
   static _theme: string[] = ['Controls/operations'];
}
export default OperationsButton;

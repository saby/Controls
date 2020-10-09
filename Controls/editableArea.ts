/**
 * Библиотека контролов, которые служат для отображения данных с возможностью редактирования.
 * @library Controls/editableArea
 * @includes View Controls/_editableArea/View
 * @includes Base Controls/_editableArea/Templates/Editors/Base
 * @includes DateTime Controls/_editableArea/Templates/Editors/DateTime
 * @includes IView Controls/_editableArea/interface/IView
 * @public
 * @author Крайнов Д.О.
 */

/*
 * editableArea library
 * @library Controls/editableArea
 * @includes View Controls/_editableArea/View
 * @includes Base Controls/_editableArea/Templates/Editors/Base
 * @includes DateTime Controls/_editableArea/Templates/Editors/DateTime
 * @public
 * @author Крайнов Д.О.
 */

export {default as View} from './_editableArea/View';
export {default as Base} from './_editableArea/Templates/Editors/Base';
export {default as DateTime} from './_editableArea/Templates/Editors/DateTime';
export {default as Buttons} from './_editableArea/Templates/Buttons';
export {IView, IViewOptions} from './_editableArea/interface/IView';

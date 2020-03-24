import Control = require('Core/Control');
import template = require('wml!Controls/_editableArea/Templates/Editors/Base/Base');
import 'css!theme?Controls/editableArea';

'use strict';

/**
 * Базовый шаблон редактирования полей ввода. Имитирует стили {@link Controls/input:Text Text}.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FEditableArea%2FEditableArea">Демо-пример</a>.
 *
 * @class Controls/_editableArea/Templates/Editors/Base
 * @extends Core/Control
 * @author Авраменко А.С.
 * @public
 * @see Controls/_editableArea/Templates/Editors/DateTime
 *
 * @demo Controls-demo/EditableArea/EditableArea
 */

/*
 * Base template for editing of input fields. Mimicks styles of {@link Controls/input:Text Text}.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FEditableArea%2FEditableArea">Demo</a>.
 *
 * @class Controls/_editableArea/Templates/Editors/Base
 * @extends Core/Control
 * @author Авраменко А.С.
 * @public
 * @see Controls/_editableArea/Templates/Editors/DateTime
 */

var Base = Control.extend({
   _template: template,

   _prepareValueForEditor: function (value) {
      return value;
   },

   _editorValueChangeHandler: function (event, value) {
      this._notify('valueChanged', [value]);
   }
});

export default Base;

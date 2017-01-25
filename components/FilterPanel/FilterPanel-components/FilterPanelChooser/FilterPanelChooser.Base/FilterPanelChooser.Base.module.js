define('js!SBIS3.CONTROLS.FilterPanelChooser.Base', [
    'js!SBIS3.CORE.CompoundControl',
    'js!SBIS3.CONTROLS.IFilterItem',
    'tmpl!SBIS3.CONTROLS.FilterPanelChooser.Base'
], function(CompoundControl, IFilterItem, dotTplFn) {

    'use strict';

    /**
     * Базовый класс для редакторов, которые применяют для панели фильтрации (см. {@link SBIS3.CONTROLS.OperationsPanel/FilterPanelItem.typedef FilterPanelItem}). Реализует выборку идентификаторов.
     * <br/>
     * От данного класса созданы следующие платформенные редакторы:
     * <ul>
     *     <li>{@link SBIS3.CONTROLS.FilterPanelChooser.List} - редактор в виде списка {@link SBIS3.CONTROLS.ListView};</li>
     *     <li>{@link SBIS3.CONTROLS.FilterPanelChooser.DictionaryList} - редактор в виде списка {@link SBIS3.CONTROLS.ListView} с возможность выбора записей из справочника;</li>
     *     <li>{@link SBIS3.CONTROLS.FilterPanelChooser.FavoritesList} - редактор в виде списка {@link SBIS3.CONTROLS.ListView} с возможность выбора записей из справочника и добавлением записей в избранное;</li>
     *     <li>{@link SBIS3.CONTROLS.FilterPanelChooser.FieldLink} - редактор в виде поля связи {@link SBIS3.CONTROLS.FieldLink};</li>
     *     <li>{@link SBIS3.CONTROLS.FilterPanelChooser.RadioGroup} - редактор в виде группы радиокнопок {@link SBIS3.CONTROLS.RadioGroup}.</li>
     * </ul>
     * <br/>
     * При создании пользовательского редактора, вам следует наследоваться от этого класса.
     * @class SBIS3.CONTROLS.FilterPanelChooser.Base
     * @extends SBIS3.CONTROLS.CompoundControl
     * @author Сухоручкин Андрей Сергеевич
     *
     * @mixes SBIS3.CONTROLS.IFilterItem
     */

    var FilterPanelChooserBase = CompoundControl.extend([IFilterItem], /** @lends SBIS3.CONTROLS.FilterPanelChooser.Base.prototype */ {
        _dotTplFn: dotTplFn,
        $protected: {
            _options: {
                _chooserTemplate: undefined,
                /**
                 * @cfg {Object} Конфигурация компонента, используемого для выборки данных
                 */
                properties: {
                },
                /**
                 * @cfg {Array.<Number>} Устанавливает набор идентификаторов элементов, которые будут выбраны для фильтра.
                 * @see setValue
                 * @see getValue
                 */
                value: []
            }
        },

        getValue: function() {
            return this._options.value;
        },

        setValue: function(value) {
            this._updateTextValue();
            this._options.value = value;
            this._notifyOnPropertyChanged('value');
        },

        _updateTextValue: function() {
        },

        getTextValue: function() {
            return this._options.textValue;
        },

        setTextValue: function(textValue) {
            if (textValue !== this._options.textValue) {
                this._options.textValue = textValue;
                this._notifyOnPropertyChanged('textValue');
            }
        }

    });

    return FilterPanelChooserBase;

});

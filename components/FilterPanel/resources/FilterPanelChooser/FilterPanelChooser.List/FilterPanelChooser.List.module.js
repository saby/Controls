define('js!SBIS3.CONTROLS.FilterPanelChooser.List', [
    'js!SBIS3.CONTROLS.FilterPanelChooser.Base',
    'Core/core-instance',
    'Core/core-functions',
    'Core/CommandDispatcher',
    'Core/helpers/collection-helpers',
    'tmpl!SBIS3.CONTROLS.FilterPanelChooser.List',
    'tmpl!SBIS3.CONTROLS.FilterPanelChooser.List/resources/ItemTpl',
    'tmpl!SBIS3.CONTROLS.FilterPanelChooser.List/resources/FilterPanelChooserList',
    'tmpl!SBIS3.CONTROLS.FilterPanelChooser.List/resources/FilterPanelChooserListFooter',
    'js!SBIS3.CONTROLS.Link',
    'js!SBIS3.CONTROLS.ListView'
], function(FilterPanelChooserBase, cInstance, cFunctions, CommandDispatcher, colHelpers, dotTplFn, itemTpl, chooserTpl, footerTpl) {
    var
        showFullList = false,
        getRecordsForRedraw = function(projection, cfg) {
            var records = cfg._getRecordsForRedrawSt.apply(this, arguments);
            if (showFullList === false) {
                records = records.slice(0, 3);
            }
            return records;
        },
        itemsSortMethod = function(first, second) {
            return second.collectionItem.get('count') - first.collectionItem.get('count');
        };
    'use strict';

    /**
     * @author Крайнов Дмитрий Олегович
     * @class SBIS3.CONTROLS.FilterPanelChooser.List
     * @extends SBIS3.CONTROLS.FilterPanelChooserBase
     */

    var FilterPanelChooserList = FilterPanelChooserBase.extend( /** @lends SBIS3.CONTROLS.FilterPanelChooser.List.prototype */ {
        _dotTplFn: dotTplFn,
        $protected: {
            _options: {
                _itemTpl: itemTpl,
                _getRecordsForRedraw: getRecordsForRedraw,
                _itemsSortMethod: itemsSortMethod,
                chooserTemplate: chooserTpl,
                afterChooserWrapper: footerTpl,
                /**
                 * @cfg {String} Текст отображаемый на кнопке, по которой отображаются все записи.
                 **/
                captionFullList: 'Все',
                /**
                 * @cfg {String} Поле записи, в котором лежит количественное значения наименования.
                 **/
                countField: 'count'
            },
            _listView: undefined
        },

        $constructor: function() {
            CommandDispatcher.declareCommand(this, 'showFullList', this._toggleFullState.bind(this));
        },

        init: function() {
            var listView;
            FilterPanelChooserList.superclass.init.apply(this, arguments);
            listView = this._getListView();
            listView._checkClickByTap = false;
            listView.subscribe('onItemClick', this._elemClickHandler.bind(this));
        },

        setValue: function(value) {
            this._setValue(value);
            this._updateView(value);
        },

        /*Определяем приватный _setValue, который зовёт setValue суперкласса (который меняет только данные), т.к. к изменению
          данных может приводить изменение визуального состояния, и в таком случае если звать setValue суперкласса
          мы заново будем проставлять визуальное состояние, которое уже находится в правильном состояние*/
        _setValue: function(value) {
            FilterPanelChooserList.superclass.setValue.apply(this, arguments);
        },

        _updateView: function(value) {
            this._getListView().setSelectedKeys(value);
        },

        _updateTextValue: function() {
            var
                self = this,
                textValue = '',
                viewItems = this._getListView().getItems();
            colHelpers.forEach(this._options.value, function(id, idx) {
                textValue += self._getItemTextByItemId(viewItems, id) + (idx < self._options.value.length - 1 ? ', ' : '');
            });
            this.setTextValue(textValue);
        },

        _getItemTextByItemId: function(items, id) {
            return items.getRecordById(id).get(this._options.displayField);
        },

        _elemClickHandler: function(e, id) {
            this._getListView().toggleItemsSelection([id]);
            this._updateValue();
        },

        _updateValue: function() {
            this._setValue(cFunctions.clone(this._getListView().getSelectedKeys()));
        },

        _toggleFullState: function(toggle) {
            showFullList = toggle;
            this._getListView().redraw();
            //Скрываем кнопку если показываются все записи (toggle = true) или показываем не все записи, но их меньше 4
            this._getAllButton().toggle(!(toggle || this._options.items.getCount() < 4));
        },

        _getAllButton: function() {
            if (!this._allButton) {
                this._allButton = this.getChildControlByName('controls-FilterPanelChooser__allButton');
            }
            return this._allButton;
        },

        _getListView: function() {
            if (!this._listView) {
                this._listView = this.getChildControlByName('controls-FilterPanelChooser__ListView');
            }
            return this._listView;
        }
    });
    return FilterPanelChooserList;

});

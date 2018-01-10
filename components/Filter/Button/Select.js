/**
 * Created by as.krasilnikov on 22.11.2016.
 */
define('SBIS3.CONTROLS/Filter/Button/Select',
    [
       'Lib/Control/CompoundControl/CompoundControl',
       'tmpl!SBIS3.CONTROLS/Filter/Button/Select/FilterSelect',
       'tmpl!SBIS3.CONTROLS/Filter/Button/Select/FilterSelectItem',
       'SBIS3.CONTROLS/Mixins/ItemsControlMixin',
       'SBIS3.CONTROLS/Mixins/Clickable',
       'SBIS3.CONTROLS/Link'
    ], function(CompoundControl, dotTplFn, itemTpl, ItemsControlMixin) {
       'use strict';

       /**
        * Компонент, позволяющий выбрать одно из предложенных значений.
        * Используется на панели {@link SBIS3.CONTROLS/Filter/Button}:
        * @remark
        * Чтобы настроить сброс фильтра по крестику, необходимо в структуре фильтра для свойства value указать значение аттрибута nonexistent равным null
        * <pre>
        *     <opts name="filterStructure" type="array">
        *     ...
        *        <opts>
        *           ....
        *           <opt name="value" bind="filter/filterSelect" nonexistent="null"></opt>
        *        </opts>
        *     </opts>
        * </pre>
        * @class SBIS3.CONTROLS/Filter/Button/Select
        * @extends Lib/Control/CompoundControl/CompoundControl
        * @mixes SBIS3.CONTROLS/Mixins/ItemsControlMixin
        * @author Красильников А.С.
        * @control
        * @public
        */

       var FilterSelect = CompoundControl.extend([ItemsControlMixin], /** @lends SBIS3.CONTROLS/Filter/Button/Select.prototype */ {
          _dotTplFn: dotTplFn,
          $protected: {
             _options: {
                itemTpl: itemTpl,
                /**
                 * @cfg {boolean} Инвертированное значение опции visible.
                 * Если значение false - компонент отображается, если значение true - компонент скрыт.
                 * @see setInvertedVisible
                 * @see getInvertedVisible
                 */
                invertedVisible: false,
                /**
                 * @cfg {*} Выбранное значение
                 * @see getFilterValue
                 */
                filterValue: null
             }
          },

          init: function(){
             FilterSelect.superclass.init.apply(this, arguments);
             var itemsInstances = this.getItemsInstances();
             for (var instance in itemsInstances){
                if (itemsInstances.hasOwnProperty(instance)){
                   itemsInstances[instance].subscribe('onActivated', this._onActivatedHandler.bind(this));
                }
             }
          },

          _modifyOptions: function() {
             var opts = FilterSelect.superclass._modifyOptions.apply(this, arguments);
             /* Если invertedVisible выставлена, то компонент должен быть скрыт */
             if(opts.invertedVisible) {
                opts.visible = false;
             }
             return opts;
          },

          _onActivatedHandler: function(eventObject, e){
             if (!!this._options.command) {
                var args = [this._options.command].concat(this._options.commandArgs);
                this.sendCommand.apply(this, args);
             }
             var target = $(e.target).closest('[data-hash]'),
                 model = this._getItemsProjection().getByHash(target.data('hash')).getContents();
             this._setFilterValue(model.get(this._options.idProperty));
          },

          _setFilterValue: function(value) {
             this._options.filterValue = value;
             this._notifyOnPropertyChanged('filterValue');
          },

          setInvertedVisible: function(invertedVisible) {
             this._options.invertedVisible = invertedVisible;
             this.toggle(!invertedVisible);
             this._notifyOnSizeChanged(this);
             this._notifyOnPropertyChanged('invertedVisible');
          },

          getInvertedVisible: function() {
             return this._options.invertedVisible
          }
       });

       return FilterSelect;
    });
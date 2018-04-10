define('SBIS3.CONTROLS/Menu/SBISHistoryController', [
    'Core/Abstract',
    'WS.Data/Source/SbisService',
    'WS.Data/Chain',
    'WS.Data/Entity/Model',
    'WS.Data/Collection/RecordSet',
    'WS.Data/Collection/Factory/RecordSet',
    'WS.Data/Adapter/Sbis',
    'Core/core-clone',
    'SBIS3.CONTROLS/Utils/InformationPopupManager',
    'Core/helpers/Array/uniq'
], function (cAbstract, SbisService, Chain, Model, RecordSet, recordSetFactory, SbisAdapter, coreClone, InformationPopupManager, uniqArray) {

    'use strict';

    var _private = {
        getOriginId: function (id) {
            id = (id + '').replace('pinned-', '').replace('recent-', '').replace('frequent-', '');
            return id;
        },

        getHistoryDataSource: function (self) {
            if (!self._historyDataSource) {
                self._historyDataSource = new SbisService({
                    adapter: 'adapter.json',
                    endpoint: {
                        address: '/input-history/service/',
                        contract: 'InputHistory'
                    }
                });
            }
            return self._historyDataSource;
        },

        addProperty: function (self, record, name, type, defaultValue) {
            if (record.getFormat().getFieldIndex(name) === -1) {
                record.addField({
                    name: name,
                    type: type,
                    defaultValue: defaultValue
                });
            }
        },

        getEmptyHistoryRecord: function (self, format) {
            var newFormat = !Array.isArray(format) ? format.clone() : coreClone(format);

            return new RecordSet({
                format: newFormat,
                adapter: new SbisAdapter(),
                idProperty: self.getOriginalIdProperty()
            });
        },

        filterFrequent: function (self) {
            var myself = this,
                id;

            // из популярных убираем запиненые
            return Chain(self._frequent).filter(function (item) {
                id = myself.getOriginId(item.getId());
                return !self._pinned.getRecordById('pinned-' + id);
            }).value(recordSetFactory, {
                adapter: new SbisAdapter(),
                idProperty: 'historyId',
                format: self._options.oldItems.getFormat().clone()
            });
        },

        filterRecent: function (self) {
            var myself = this,
                id;

            // убираем из последних выбранных запиненые и популярные пункты
            return Chain(self._recent).filter(function (item) {
                id = myself.getOriginId(item.getId());
                return !(self._pinned.getRecordById('pinned-' + id) || self._filteredFrequent.getRecordById('frequent-' + id));
            }).value(recordSetFactory, {
                adapter: new SbisAdapter(),
                idProperty: 'historyId',
                format: self._options.oldItems.getFormat().clone()
            });
        },

        fillPinned: function (self, historyItems) {
            var myself = this,
                id, oldElement;

            self._pinned.forEach(function (item) {
                id = myself.getOriginId(item.getId());
                oldElement = self._options.oldItems.getRecordById(id);

                if (oldElement && !oldElement.get(self._options.parentProperty) && (!self._options.subContainers || !self._options.subContainers[oldElement.getId()])) {
                    oldElement.set('visible', false);
                }

                if (item.get(self._options.parentProperty)) {
                    item.set(self._options.parentProperty, null);
                }

                item.set('visible', true);
                item.set('pinned', true);
                oldElement.set('pinned', true);
                self._count++;
            });

            historyItems.append(self._pinned);
        },

        fillRecent: function (self, filteredRecent) {
            var myself = this,
                items = new RecordSet({
                    adapter: new SbisAdapter(),
                    idProperty: 'historyId',
                    format: self._options.oldItems.getFormat().clone()
                }),
                i = 0,
                id, oldElement, item, newItem;

            while (self._count < 10 && i < filteredRecent.getCount() && i < self._options.maxCountRecent) {
                item = filteredRecent.at(i);
                id = myself.getOriginId(item.getId());
                oldElement = self._options.oldItems.getRecordById(id);

                // скрываем старый элемент только в том случае если он не находится в подменю и у него нет детей
                if (oldElement && !oldElement.get(self._options.parentProperty) && (!self._options.subContainers || !self._options.subContainers[oldElement.getId()])) {
                    oldElement.set('visible', false);
                }
                newItem = new Model({
                    rawData: item.getRawData(),
                    adapter: item.getAdapter()
                });

                if (newItem.get(self._options.parentProperty)) {
                    newItem.set(self._options.parentProperty, null);
                }
                newItem.set('visible', true);
                items.add(newItem);

                self._count++;
                i++;
            }
            return items;
        },

        fillFrequent: function (self, filteredFrequent) {
            var myself = this,
                // количество популярных равно:
                // максимальное количество истории - количество закрепленных - количество недавних(максимум 3)
                countRecent = self._recent.getCount(),
                maxLength = 10 - self._pinned.getCount() - (countRecent > 3 ? 3 : countRecent),
                i = 0,
                items = new RecordSet({
                    adapter: new SbisAdapter(),
                    idProperty: 'historyId',
                    format: self._options.oldItems.getFormat().clone()
                }),
                id, oldElement, item, newItem;

            while (self._count < 10 && i < filteredFrequent.getCount() && i < 7 && i < maxLength) {
                item = filteredFrequent.at(i);
                id = myself.getOriginId(item.getId());
                oldElement = self._options.oldItems.getRecordById(id);

                if (oldElement && !oldElement.get(self._options.parentProperty) && (!self._options.subContainers || !self._options.subContainers[oldElement.getId()])) {
                    oldElement.set('visible', false);
                }

                newItem = new Model({
                    rawData: item.getRawData(),
                    adapter: item.getAdapter()
                });

                if (newItem.get(self._options.parentProperty)) {
                    newItem.set(self._options.parentProperty, null);
                }

                newItem.set('visible', true);
                items.add(newItem);

                self._count++;
                i++;
            }
            return items;
        },

        getFrequent: function (self) {
            var frequentItems = new RecordSet({
                    adapter: new SbisAdapter(),
                    idProperty: 'historyId',
                    format: self._options.oldItems.getFormat().clone()
            }),
                items = [];

            items = _private.filterFrequent(self);
            if (self._options.frequent && items.getCount()) {
                frequentItems = _private.fillFrequent(self, items);
            }
            return frequentItems;
        },

        getRecent: function (self) {
            var recentItems = new RecordSet({
                    adapter: new SbisAdapter(),
                    idProperty: 'historyId',
                    format: self._options.oldItems.getFormat().clone()
                }),
                items = [];

            items = _private.filterRecent(self);
            if (items.getCount()) {
                recentItems = _private.fillRecent(self, items);
            }
            return recentItems;
        },

        processHistory: function (self) {
            var processedItems = new RecordSet({
                    adapter: new SbisAdapter(),
                    idProperty: 'historyId',
                    model: self._options.oldItems.getModel(),
                    metaData: self._options.oldItems.getMetaData && self._options.oldItems.getMetaData()
                }),
                needToDrawSeparate = false,
                itemCount = 0,
                indexLastHistoryItem = null,
                displayProperty = self._options.displayProperty,
                config = {
                    adapter: new SbisAdapter(),
                    idProperty: self._options.oldItems.getIdProperty(),
                    format: self._options.oldItems.getFormat().clone()
                },
                firstName, secondName,
                isHistoryFull, recentItems, countOfVisible, isInternalItem;

            self._count = 0;
            self._options.oldItems.forEach(function (element) {
                element.set('visible', true);
            });

            // запиненые отображаются всегда
            if (self._options.pinned) {
                _private.fillPinned(self, processedItems);
            }

            self._filteredFrequent = _private.getFrequent(self);
            // сортируем по алфавиту популярные записи
            self._filteredFrequent = Chain(self._filteredFrequent).sort(function (first, second) {
                firstName = first.get(displayProperty);
                secondName = second.get(displayProperty);

                return (firstName < secondName) ? -1 : (firstName > secondName) ? 1 : 0;
            }).value(recordSetFactory, config);

            recentItems = _private.getRecent(self);

            processedItems.append(self._filteredFrequent);
            processedItems.append(recentItems);
            if (processedItems.getCount()) {
                indexLastHistoryItem = processedItems.getCount() - 1;
            }
            processedItems.append(self._options.oldItems);

            // скрываем лишние
            if (processedItems.getCount() > 11 && self._options.additionalProperty) {
                countOfVisible = 0;
                // пробегаемся по всем элементам и показываем только первые 10 видимых элементов, остальные скрываем
                processedItems.forEach(function (item) {
                    isInternalItem = self._options.parentProperty && item.get(self._options.parentProperty);

                    if (countOfVisible < 10) {
                        if (item.get('visible') && !isInternalItem) {
                            countOfVisible++;
                        }
                    } else {
                        if (!isInternalItem && item.get('visible')) {
                            item.set(self._options.additionalProperty, true);
                        }
                    }
                });
                // в истории меню максимум может быть 10 элементов,
                // если меню полностью заполнено, то отображать разделитель в свернутом состоянии не нужно
                isHistoryFull = processedItems.at(9).get('historyItem');
                if (self._container) {
                    self._container.toggleClass('controls-SbisMenu-fullHistory', isHistoryFull);
                }
            }

            // нужно проверять только в случае, когда есть история
            if(indexLastHistoryItem !== null) {
                // если в истории находятся все элементы меню, то показывать разделитель не нужно
                // это может произойти, если меню без подуровней и все элементы запинены
                while (itemCount < self._options.oldItems.getCount() && !needToDrawSeparate) {
                    if (self._options.oldItems.at(itemCount).get('visible') ||
                        (self._options.parentProperty && self._options.oldItems.at(itemCount).get(self._options.parentProperty))) {
                        needToDrawSeparate = true;
                    }
                    itemCount++;
                }

                if (needToDrawSeparate) {
                    processedItems.at(indexLastHistoryItem).set('groupSeparator', true);
                }
            }

            return processedItems;
        },
        /**
         * Создает пункты истории по id.
         * @param {Object} self
         * @param {Array} items
         * @param {RecordSet} recordSet
         * @param {RecordSet} sourceItems Набор элементов по которым будет заполняться рекорд. Параметр необязательный.
         */
        fillHistoryRecord: function(self, items, recordSet, sourceItems){
            var oldItem, newItem;

            sourceItems = sourceItems || self._options.oldItems;
            items.forEach(function(id){
                oldItem = sourceItems.getRecordById(id);
                if(oldItem){
                    newItem = new Model({
                        rawData: oldItem.getRawData(),
                        adapter: oldItem.getAdapter(),
                        format: oldItem.getFormat()
                    });
                    recordSet.add(newItem);
                }
            });
        },

        processPinnedItem: function(self, origId, pinItem){
            var myself = this,
                pinned = null,
                newItem, oldItem;

            if (!pinItem.get('pinned')) {
                if(self._pinned && self._pinned.getCount() < 10) {
                    newItem = new Model({
                        rawData: pinItem.getRawData(),
                        adapter: pinItem.getAdapter(),
                        format: pinItem.getFormat()
                    });
                    if (self._options.parentProperty) {
                        newItem.set(self._options.parentProperty, null);
                    }
                    newItem.set('historyItem', true);
                    newItem.set('historyId', 'pinned-' + origId);
                    newItem.set('groupSeparator', false);
                    newItem.set(self._options.additionalProperty, false);
                    self._pinned.add(newItem);
                    self._pinned.setIdProperty('historyId');
                    pinItem.set('visible', false);
                    pinned = true;
                }else {
                    InformationPopupManager.showNotification({
                        caption: 'Невозможно закрепить более 10 пунктов',
                        status: 'error'
                    });
                }
            } else {
                // получаем старый id и восстанавливаем видимость пункта меню
                self._pinned = Chain(self._pinned).filter(function (element) {
                    return myself.getOriginId(element.getId()) !== origId;
                }).value(recordSetFactory, {
                    adapter: new SbisAdapter(),
                    idProperty: 'historyId',
                    format: self._options.oldItems.getFormat().clone()
                });

                oldItem = self._options.oldItems.getRecordById(origId);
                oldItem.set('visible', true);
                oldItem.set('pinned', false);

                pinned = false;
            }
            return pinned;
        }
    };

    /**
     * <h2>Блок истории</h2>
     *
     * В блок истории входят следующие пункты меню:
     *
     * <ul>
     *    <li>
     *        <b>Последние действия пользователя</b>.<br/>
     *        К таким пунктам относятся последние выбранные пользователем, исключая часто используемые и закрепленные.<br/>
     *        Отображаются всегда, когда задана опция <a href="/docs/js/SBIS3/CONTROLS/Menu/SbisMenu/options/historyId/">historyId</a>.<br/>
     *        Единовременно может быть отображено не более 3 таких пунктов.
     *    </li>
     *    <li>
     *        <b>Популярные (часто используемые)</b>.<br/>
     *        Для каждого пользователя отображается собственный набор популярных пунктов меню.<br/>
     *        Оценка популярности формируется на основе количества раз, когда пункт был выбран.<br/>
     *        Собираемая статистика хранится в БД <a href="/doc/platform/developmentapl/middleware/input-history-service/">Сервиса истории выбора</a>.<br/>
     *        Популярные пункты меню сортируются в алфавитном порядке.<br/>
     *        Единовременно может быть отображено не более 7 пунктов меню.<br/>
     *        Отображение пунктов задаётся в опции <a href="/docs/js/SBIS3/CONTROLS/Menu/SbisMenu/options/frequent/">frequent</a>.
     *    </li>
     *    <li>
     *        <b>Закреплённые</b>.<br/>
     *        Для каждого пользователя отображается собственный набор закреплённых пунктов меню.<br/>
     *        Данные о таких пунктах хранятся в БД <a href="/doc/platform/developmentapl/middleware/input-history-service/">Сервиса истории выбора</a>.<br/>
     *        При закреплении ещё одного пункта он добавляется ниже ранее закреплённых пунктов.<br/>
     *        Пункты стилизованы в полужирном начертании.<br/>
     *        Количество таких пунктов не ограничено.<br/>
     *        Отображение пунктов задаётся в опции <a href="/docs/js/SBIS3/CONTROLS/Menu/SbisMenu/options/pinned/">pinned</a>.
     *        <br/><br/>
     *        Добавление пунктов в число закреплённых сначала происходит за счёт числа "популярных", а потом - "последних действий пользователя". Пример:
     *        <pre>
     *        10 пунктов = 7 популярных + 3 последних действий пользователя
     *        10 пунктов = 2 закрепленных + 5 популярных + 3 последних действий пользователя
     *        10 пунктов = 9 закрепленных + 1 последних действий пользователя
     *        более 10 пунктов = только закреплённые пункты меню
     *        </pre>
     *    </li>
     * </ul>
     *
     * @class SBIS3.CONTROLS/Menu/SBISHistoryController
     * @author Романов В.С.
     * @extends Core/Abstract
     * @public
     * @category Buttons
     */

    var SBISHistoryController = cAbstract.extend(/** @lends SBIS3.CONTROLS/Menu/SbisMenu.prototype */ {
        $protected: {
            _options: {
                /**
                 * @cfg {String} Идентификатор истории ввода.
                 * @remark
                 * Используется <a href="/doc/platform/developmentapl/middleware/input-history-service/">Сервисом истории выбора</a> для сохранения данных о выборе пользователя.
                 * Благодаря этой настройке в кнопке "Меню с историей" будут отображены последние выбранные пункты меню, количество которых единовременно не может быть более 3.
                 * Идентификатор должен быть уникальным в рамках всего приложения. Он должен описывать ту функциональную область, в которой применяется.
                 * Пример: ИсходящийПлатеж, КоррИсх, Веха, Смета, Проекта
                 */
                historyId: null,
                /**
                 * @cfg {Boolean} Отображать ли закреплённые пункты меню в блоке истории.
                 * @remark
                 * Для каждого пользователя отображается собственный набор закреплённых пунктов меню.
                 * Данные о таких пунктах хранятся в БД <a href="/doc/platform/developmentapl/middleware/input-history-service/">Сервиса истории выбора</a>.
                 * При закреплении ещё одного пункта он добавляется ниже ранее закреплённых пунктов.
                 * Пункты стилизованы в полужирном начертании.
                 * Количество таких пунктов не ограничено.
                 */
                pinned: false,
                /**
                 * @cfg {Boolean} Отображать ли популярные (часто выбираемые) пункты меню в блоке истории.
                 * @remark
                 * Для каждого пользователя отображается собственный набор популярных пунктов меню.
                 * Оценка популярности формируется на основе количества раз, когда пункт был выбран.
                 * Собираемая статистика хранится в БД <a href="/doc/platform/developmentapl/middleware/input-history-service/">Сервиса истории выбора</a>.
                 * Популярные пункты меню сортируются в алфавитном порядке.
                 * Единовременно может быть отображено не более 7 пунктов меню.
                 */
                frequent: false,
                additionalProperty: 'additional',
                displayProperty: null,
                maxCountRecent: 3,
                oldItems: null,
                subContainers: null,
                parentProperty: null
            },
            _historyDataSource: null,
            _historyDeferred: null,
            _pinned: null,
            _frequent: null,
            _recent: null,
            _oldItems: null,
            _filteredFrequent: null,
            _needToRedrawHistory: false,
            _count: 0,
            _originalIdProperty: null
        },

        $constructor: function() {
          if(this._options.oldItems) {
              this._originalIdProperty = this._options.oldItems.getIdProperty();
          }
        },

        /**
         * Добавляет элемент в сервис истории
         * @param id - идентификатор элемента
         * @private
         */
        addToHistory: function (id) {
            var self = this;

            _private.getHistoryDataSource(self).call(typeof id === 'string' ? 'Add' : 'AddInt', {
                history_id: self._options.historyId,
                id: id,
                history_context: null
            });
        },

        getOriginalIdProperty: function () {
            return this._originalIdProperty;
        },

        /**
         * Устанавливает пин элемента
         * @param id - идентификатор элемента
         * @private
         */
        setPin: function (id, pin) {
            var self = this;

            _private.getHistoryDataSource(self).call(typeof id === 'string' ? 'SetPin' : 'SetIntPin', {
                history_id: self._options.historyId,
                id: id,
                history_context: null,
                pin: pin
            });
        },

        // public
        getUnionIndexesList: function () {
            return _private.getHistoryDataSource(this).call('UnionIndexesList', {
                params: {
                    historyId: this._options.historyId,
                    pinned: {
                        count: this._options.pinned ? 10 : 0
                    },
                    frequent: {
                        count: this._options.frequent ? 7 : 0
                    },
                    recent: {
                        count: 10
                    }
                }
            });
        },

        // public
        initRecordSet: function () {
            var format = this._options.oldItems.getFormat();

            this._pinned = _private.getEmptyHistoryRecord(this, format);
            this._recent = _private.getEmptyHistoryRecord(this, format);
            this._frequent = _private.getEmptyHistoryRecord(this, format);
        },

        // public
        prepareHistoryData: function () {
            this.prepareRecordSet(this._options.oldItems, '', false);
            this.prepareRecordSet(this._pinned, 'pinned-', true);
            this.prepareRecordSet(this._recent, 'recent-', true);
            this.prepareRecordSet(this._frequent, 'frequent-', true);
        },

        prepareRecordSet: function (record, idPrefix, history) {
            _private.addProperty(this, record, 'visible', 'boolean', true);
            _private.addProperty(this, record, 'pinned', 'boolean', false);
            _private.addProperty(this, record, 'historyItem', 'boolean', history);
            _private.addProperty(this, record, 'historyId', 'string', 'id');
            _private.addProperty(this, record, 'groupSeparator', 'boolean', false);
            if (this._options.additionalProperty === 'additional') {
                _private.addProperty(this, record, 'additional', 'boolean', false);
            }

            record.forEach(function (item) {
                item.set('historyId', idPrefix + item.getId());
            });

            record.setIdProperty('historyId');
        },
        /**
         * Установить сырой набор данных.
         * Создает рекорды и заполняет данными на основе идентификаторов записей.
         * @param {dataSet} data
         */
        parseHistoryData: function(data){
            var rows = data && data.getRow();

            if(this._options.pinned instanceof Array){
                _private.fillHistoryRecord(this, this._options.pinned, this._pinned);
            }else if (this._options.pinned && rows && rows.get('pinned')) {
                _private.fillHistoryRecord(this, rows.get('pinned'), this._pinned);
            }

            if (rows && rows.get('recent')) {
                _private.fillHistoryRecord(this, rows.get('recent'), this._recent);
            }

            if(this._options.frequent instanceof Array){
                _private.fillHistoryRecord(this, this._options.frequent, this._frequent);
            }else if (this._options.frequent && rows && rows.get('frequent')) {
                _private.fillHistoryRecord(this, rows.get('frequent'), this._frequent);
            }
        },

        /**
         * Установить готовый набор данных
         * @param {DataSet} data
         */
        setHistoryDataFromRecord: function (items, data) {
            var rows = data && data.getRow();

            this.initRecordSet();

            if (this._options.pinned ) {
                _private.fillHistoryRecord(this, this._options.pinned, this._pinned, items);
            }
            if (rows && rows.get('recent')) {
                _private.fillHistoryRecord(this, rows.get('recent'), this._recent, items);
            }
            if (this._options.frequent) {
                _private.fillHistoryRecord(this, this._options.frequent, this._frequent, items);
            }
        },

        prepareHistory: function () {
            // возвращаем набор пунктов и проставляем в родителе
            return _private.processHistory(this);
        },

        // Переключает состояние пункта прикреплен/откреплен
        togglePinnedItem: function (origId, item) {
            var pinned;

            pinned = _private.processPinnedItem(this, origId, item);
            if(pinned !== null) {
                this.setPin(origId, pinned);
            }
        },

        // Получить оригинальный id
        getOriginId: function (id) {
            return _private.getOriginId(id);
        },

        /**
         * Возвращает недавно выбранные пункты.
         * @param {Array} items
         * @see recent
         */
        getRecent: function () {
          return this._recent;
        },


        /**
         * Установить популярные пункты.
         * @param {Array} items
         * @see frequent
         * @see getFrequnet
         */
        setFrequnet: function(frequents) {
            this._frequent = _private.getEmptyHistoryRecord(this, coreClone(this._options.oldItems.getFormat()));
            _private.fillHistoryRecord(this, frequents, this._frequent);
        },
        /**
         * Возвращает recordSet состоящий из популярных пунктов
         * @see frequent
         * @see setFrequnet
         */
        getFrequent: function () {
            return this._frequent;
        },
        /**
         * Установить прикрепленные пункты.
         * @param {Array} items
         * @see pinned
         * @see getPinned
         */
        setPinned: function(items) {
            this._pinned = _private.getEmptyHistoryRecord(this, coreClone(this._options.oldItems.getFormat()));
            _private.fillHistoryRecord(this, items, this._pinned);
        },
        /**
         * Возвращает recordSet состоящий из популярных пунктов
         * @see pinned
         * @see setPinned
         */
        getPinned: function() {
            return this._pinned;
        },

        /**
         * Добавляет пункт в конец в истории.
         * @param {String} origId
         * @param {Record} newItem
         * @see recent
         */
        addToRecent: function (origId, newItem) {
            var self = this,
                records;

            this._recent = Chain(this._recent).filter(function (element) {
                return self.getOriginId(element.getId()) !== origId;
            }).value(recordSetFactory, {
                adapter: new SbisAdapter(),
                idProperty: 'historyId',
                format: this._options.oldItems.getFormat().clone()
            });

            if (this._options.parentProperty) {
                newItem.set(this._options.parentProperty, null);
            }
            if (this._options.parentProperty) {
                newItem.set('historyItem', true);
            }
            newItem.set('pinned', false);
            newItem.set('groupSeparator', false);
            newItem.set('historyId', 'recent-' + origId);
            if(this._options.additionalProperty) {
                newItem.set(this._options.additionalProperty, false);
            }
            records = new RecordSet({
                format: this._options.oldItems.getFormat(),
                adapter: new SbisAdapter()
            });
            records.add(newItem);
            this._recent.prepend(records);
            this._pinned.setIdProperty('historyId');
        },

        getIndexesList: function (data) {
            var rows = data && data.getRow(),
                pinned = rows && rows.get('pinned'),
                frequent = rows && rows.get('frequent'),
                recent = rows && rows.get('recent'),
                indexes = [].concat(pinned || []).concat(frequent || []).concat(recent || []);

            return uniqArray(indexes);
        },

        destroy: function() {
            this._historyDataSource = undefined;
            this._historyDeferred = undefined;
            this._pinned = undefined;
            this._frequent = undefined;
            this._recent = undefined;
            this._oldItems = undefined;
            this._filteredFrequent = undefined;
        }
    });

    SBISHistoryController._private = _private;

    return SBISHistoryController;

});
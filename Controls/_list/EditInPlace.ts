import Control = require('Core/Control');
import template = require('wml!Controls/_list/EditInPlace/EditInPlace');
import Deferred = require('Core/Deferred');
import entity = require('Types/entity');
import getWidthUtil = require('Controls/Utils/getWidth');
import hasHorizontalScrollUtil = require('Controls/Utils/hasHorizontalScroll');
import {editing as constEditing} from 'Controls/Constants';
import { error as dataSourceError } from 'Controls/dataSource';
import editAfterRedraw from 'Controls/Utils/editAfterRedraw';

let displayLib: typeof import('Controls/display');

enum PendingInputRenderState {
    Null,
    PendingRender,
    Rendering
}

var
    typographyStyles = [
        'fontFamily',
        'fontSize',
        'fontWeight',
        'fontStyle',
        'letterSpacing',
        'textTransform',
        'wordSpacing',
        'textIndent'
    ],
    _private = {
        beginEdit: function (self, options, isAdd) {
            var result = self._notify('beforeBeginEdit', [options, !!isAdd]);
            if (!isAdd) {
                self._originalItem = options.item;
            }
            return _private.processBeforeBeginEditResult(self, options, result, isAdd);
        },

        afterBeginEdit: function (self, options, isAdd) {
            self._editingItem = options.item.clone();
            self._editingItem.acceptChanges();
            self._setEditingItemData(self._editingItem, self._options.listModel, self._options);
            self._notify('afterBeginEdit', [self._editingItem, isAdd]);
            return options;
        },

        processBeforeBeginEditResult: function (self, options, eventResult, isAdd) {
            var result;

            if (eventResult === constEditing.CANCEL) {
                result = Deferred.success({cancelled: true});
            } else {
                _private.registerPending(self);
                if (eventResult && eventResult.addBoth) {
                    var id = self._notify('showIndicator', [{}], {bubbling: true});
                    eventResult.addBoth(function (defResult) {
                        self._notify('hideIndicator', [id], {bubbling: true});
                        return defResult;
                    });
                    result = eventResult;
                } else if ((eventResult && eventResult.item instanceof entity.Record) || (options && options.item instanceof entity.Record)) {
                    result = Deferred.success(eventResult || options);
                } else if (isAdd) {
                    result = _private.createModel(self, eventResult || options);
                }
            }
            return result;
        },

        endItemEdit(self, commit: boolean) {
            // Чтобы при первом старте редактирования не летели лишние события
            if (!self._editingItem) {
                return Deferred.success();
            }

            if (self._endEditDeferred) {
                return self._endEditDeferred;
            }

            var eventResult = self._notify('beforeEndEdit', [
                self._editingItem,
                commit,
                self._isAdd
            ]);
            if (eventResult && eventResult.addBoth) {
                var id = self._notify('showIndicator', [{}], { bubbling: true });
                self._endEditDeferred = eventResult;
                return eventResult.addBoth(function(resultOfDeferred) {
                    self._notify('hideIndicator', [id], { bubbling: true });

                    if (resultOfDeferred === constEditing.CANCEL) {
                        self._endEditDeferred = null;
                        return Deferred.success({ cancelled: true });
                    }

                    return Deferred.success(resultOfDeferred).addBoth(function(res) {
                        self._endEditDeferred = null;
                        _private.afterEndEdit(self, commit);
                        return res;
                    });
                });
            } else {
                if (eventResult === constEditing.CANCEL) {
                    return Deferred.success({ cancelled: true });
                }
                return _private.updateModel(self, commit).addCallback(function() {
                    return Deferred.success().addCallback(function() {
                        _private.afterEndEdit(self, commit);
                    });
                });
            }
        },

        afterEndEdit: function(self, commit) {
            const afterEndEditArgs = [self._isAdd ? self._editingItem : self._originalItem, self._isAdd];

            // При редактировании по месту маркер появляется только если в списке больше одной записи.
            // https://online.sbis.ru/opendoc.html?guid=e3ccd952-cbb1-4587-89b8-a8d78500ba90
            if (self._isAdd && commit && self._options.listModel.getCount() > 1) {
                self._options.listModel.setMarkedKey(self._editingItem.getId());
            }
            if (self._options.useNewModel) {
                self._options.listModel.getCollection().acceptChanges();
            } else {
                self._options.listModel.acceptChanges();
            }
            _private.resetVariables(self);
            if (!self._destroyed) {
                self._setEditingItemData(null, self._options.listModel, self._options);
            }

            // Нотифицировать о событии "После завершения редактирования" нужно после очистки editingItemData,
            // т.к. все остальные контролы проверяют наличие запущенного редактирования именно по ней.
            // Нотификация до очистки приводит к проблемам. Например, в обработчике события afterEndEdit ожидается,
            // что завершено редактирование и можно позвать перезагрузку списка для обновления результатов каждой строки.
            // Однако сам список считает что редактирование еще активно и падает при перезагрузке.
            self._notify('afterEndEdit', afterEndEditArgs);
        },

        createModel: function (self, options) {
            return self._options.source.create().addCallbacks(function (item) {
                options.item = item;
                return options;
            }, (error: Error) => {
                return _private.processError(self, error);
            });
        },

        updateModel: function (self, commit) {
            if (commit && (self._isAdd || self._editingItem.isChanged())) {
                if (self._options.source) {
                    //
                    return self._options.source.update(self._editingItem).addCallbacks(function () {
                        _private.acceptChanges(self);
                    }, (error: Error) => {
                        self._isCommitInProcess = false;
                        return _private.processError(self, error);
                    });

                }
                _private.acceptChanges(self);
            }

            return Deferred.success();
        },

        processError(self/*: EditInPlace*/, error: Error) {
            /*
             * в detail сейчас в многих местах редактирования по месту приходит текст из запроса
             * Не будем его отображать
             * TODO Убрать после закрытия задачи по написанию документа по правильному формированию текстов ошибок
             *  https://online.sbis.ru/doc/c8ff58ac-e6f7-4f0e-877a-e9cbbe661139
             */
            delete error.details;

            return self.__errorController.process({
                error,
                theme: self._options.theme,
                mode: dataSourceError.Mode.dialog
            }).then((errorConfig: dataSourceError.ViewConfig) => {
                self._children.errorContainer.show(errorConfig);
                return Promise.reject(error);
            });
        },

        acceptChanges: function (self) {
            if (self._isAdd) {
                if (self._options.useNewModel) {
                    self._options.listModel.getCollection().append([self._editingItem]);
                } else {
                    self._options.listModel.appendItems([self._editingItem]);
                }
            } else {
                self._originalItem.merge(self._editingItem);
            }
        },

        resetVariables: function (self) {
            if (self._editingItem) {
                self._editingItem.unsubscribe('onPropertyChange', self._resetValidation);
                self._options.listModel.unsubscribe('onCollectionChange', self._updateIndex);
            }
            if (self._pendingDeferred && !self._pendingDeferred.isReady()) {
                self._pendingDeferred.callback();
            }
            self._pendingDeferred = null;
            self._originalItem = null;
            self._editingItem = null;
            self._isAdd = null;
        },

        validate: function (self) {
            return self._children.formController.submit();
        },

        hasParentInItems: function (item, listModel) {
            // TODO No parents in new model for now for now
            if (!listModel['[Controls/_display/Collection']) {
                return !!listModel._options.parentProperty && listModel.getItemById(item.get(listModel._options.parentProperty));
            }
        },

        editNextRow: function (self, editNextRow: boolean, addAnyway: boolean = false) {
            const index = _private.getEditingItemIndex(self, self._editingItem, self._options.listModel);
            const editingConfig = self._options.editingConfig || {};

            if (editNextRow) {
                if (!self._isAdd && _private.getNext(self._editingItem, index, self._options.listModel)) {
                    self.beginEdit({
                        item: _private.getNext(self._editingItem, index, self._options.listModel)
                    });
                } else if (addAnyway || editingConfig.autoAdd) {
                    self.beginAdd();
                } else {
                    self.commitEdit();
                }
            } else if (_private.getPrevious(self._editingItem, index, self._options.listModel)) {
                self.beginEdit({
                    item: _private.getPrevious(self._editingItem, index, self._options.listModel)
                });
            } else {
                self.commitEdit();
            }
        },

        getNext: function (editingItem, index, listModel) {
            var
                offset = 1,
                result,
                parentId,
                parentIndex,
                count;

            if (_private.hasParentInItems(editingItem, listModel)) {
                parentId = editingItem.get(listModel._options.parentProperty);
                parentIndex = listModel.getIndexBySourceItem(listModel.getItemById(parentId, listModel._options.keyProperty).getContents());
                count = parentIndex + listModel.getChildren(parentId).length + 1;
            } else {
                count = listModel.getCount();
            }

            while (index + offset < count) {
                result = listModel.at(index + offset).getContents();
                if (result instanceof entity.Record) {
                    return result;
                }
                offset++;
            }
        },

        getPrevious: function (editingItem, index, listModel) {
            var
                offset = -1,
                result,
                parentId,
                parentIndex,
                count;

            if (_private.hasParentInItems(editingItem, listModel)) {
                parentId = editingItem.get(listModel._options.parentProperty);
                parentIndex = listModel.getIndexBySourceItem(listModel.getItemById(parentId, listModel._options.keyProperty).getContents());
                count = parentIndex + 1;
            } else {
                count = 0;
            }

            while (index + offset >= count) {
                result = listModel.at(index + offset).getContents();
                if (result instanceof entity.Record) {
                    return result;
                }
                offset--;
            }
        },

        getEditingItemIndex: function (self, editingItem, listModel, defaultIndex) {
            var
                index = defaultIndex !== undefined ? defaultIndex : listModel.getCount(),
                originalItem,
                parentId,
                parentIndex;
            const groupProperty = listModel.getGroupProperty();

            // TODO no hasParentInItems for new model at the moment
            if (self._options.useNewModel) {
                originalItem = listModel.getItemBySourceKey(editingItem.get(listModel.getKeyProperty()));
            } else {
                originalItem = listModel.getItemById(editingItem.get(listModel._options.keyProperty), listModel._options.keyProperty);
            }

            if (originalItem) {
                index = listModel.getIndexBySourceItem(originalItem.getContents());
            } else if (_private.hasParentInItems(editingItem, listModel)) {
                parentId = editingItem.get(listModel._options.parentProperty);
                parentIndex = listModel.getIndexBySourceItem(listModel.getItemById(parentId, listModel._options.keyProperty).getContents());
                index = parentIndex + (defaultIndex !== undefined ? defaultIndex : listModel.getDisplayChildrenCount(parentId)) + 1;
            } else if (listModel._options.groupingKeyCallback || groupProperty) {
                const groupId = groupProperty ? editingItem.get(groupProperty) : listModel._options.groupingKeyCallback(editingItem);
                const isAddInTop = self._options.editingConfig && self._options.editingConfig.addPosition === 'top';
                index = _private.getItemIndexWithGrouping(listModel.getDisplay(), groupId, isAddInTop);
            }

            return index;
        },

        getSequentialEditing: function (newOptions) {
            // TODO: опция editingConfig.sequentialEditing по умолчанию должна быть true. Но она находится внутри объекта,
            // а при вызове getDefaultOptions объекты не мержатся. Нужно либо на стороне ws делать мерж объектов, либо
            // делать 5 опций на списке, либо вот такой костыль:
            if (newOptions.editingConfig && typeof newOptions.editingConfig.sequentialEditing !== 'undefined') {
                return newOptions.editingConfig.sequentialEditing;
            }
            return true;
        },

        getAddPosition: function(options) {
            return options.editingConfig && options.editingConfig.addPosition === 'top' &&
                   !options.editingConfig.autoAdd ? 0 : undefined;
        },

        beginEditCallback(self, newOptions) {
            if (newOptions && newOptions.cancelled) {
                return Deferred.success({cancelled: true});
            }
            return _private.afterBeginEdit(self, newOptions);
        },
        registerPending(self): void {
            if (!self._pendingDeferred || self._pendingDeferred.isReady()) {
                self._pendingDeferred = new Deferred();
            }
            self._notify('registerPending', [self._pendingDeferred, {
                onPendingFail: self._onPendingFail
            }], {bubbling: true});
        },
        getItemIndexWithGrouping(display, groupId, isAddInTop): number {
            /*
            * Если добавление идет в существующуюю группу, то добавляем ей в начало или в конец.
            * Если добавление идет в несуществующую группу, то добавляем в начало или в конец списка.
            *   При добавлении в начало - добавляем ее действительно первой, до всех групп. Сделать это просто
            *   выставлением индекса нельзя, в силу организации шаблонов: добавляемая запись рисуется под другой записью,
            *   поэтому рисуем его над первой группой в Controls/_list/resources/For.wml:47
            *
            *   При добавлении в конец индекс будет на один больше последнего элемента списка / группы.
            *   Controls/_list/resources/ItemOutput.wml:31
            *   TODO: Возможно, стоит всегда выставлять индекс записи рядом с которой выводим добавляемую запись, а,
            *    над или под ней выводить, решать через editingConfig.addPosition
            * */
            let index = 0;
            if (display.getCount()) {
                const groupItems = display.getGroupItems(groupId);
                if (typeof groupId === 'undefined' || groupItems.length === 0) {
                    if (!isAddInTop) {
                        index = display.getIndex(display.getLast()) + 1;
                    }
                } else {
                    index = display.getIndex(groupItems[isAddInTop ? 0 : groupItems.length - 1]) + (isAddInTop ? 0 : 1);
                }
            }
            return index;
        }
    };

/**
 * @class Controls/_list/EditInPlace
 * @extends Core/Control
 * @mixes Controls/interface/IEditableList
 * @implements Controls/_interface/IErrorController
 * @author Авраменко А.С.
 * @private
 */

var EditInPlace = Control.extend(/** @lends Controls/_list/EditInPlace.prototype */{
    _template: template,
    _isAdd: null,
    _originalItem: null,
    _editingItem: null,
    _endEditDeferred: null,
    _pendingDeferred: null,


    constructor: function (options = {}) {
        EditInPlace.superclass.constructor.apply(this, arguments);
        this._resetValidation = function () {
            /**
             * We should manually trigger update of the list, otherwise only inputs with validators are gonna get updated.
             */
            this._forceUpdate();

            /**
             * Validation doesn't reset if the value was changed without user input, so we have to reset it here.
             * Ideally, validation should take value through options and reset automagically.
             * TODO: https://online.sbis.ru/opendoc.html?guid=951f6762-8e37-4182-a7fc-3104a35ce27a
             */
            this._children.formController.setValidationResult();
        }.bind(this);
        this._onPendingFail = this._onPendingFail.bind(this);
        this._updateIndex = this._updateIndex.bind(this);
        this.__errorController = options.errorController || new dataSourceError.Controller({});
    },

    _beforeMount: function (newOptions) {
        if (newOptions.editingConfig) {
            if (newOptions.editingConfig.item) {
                this._editingItem = newOptions.editingConfig.item;
                this._setEditingItemData(this._editingItem, newOptions.listModel, newOptions);
                if (!this._isAdd) {
                    if (newOptions.useNewModel) {
                        this._originalItem = newOptions.listModel.getItemBySourceKey(this._editingItem.get(newOptions.listModel.getKeyProperty())).getContents();
                    } else {
                        this._originalItem = newOptions.listModel.getItemById(this._editingItem.get(newOptions.listModel._options.keyProperty), newOptions.listModel._options.keyProperty).getContents();
                    }
                }
            }
        }
        if (newOptions.useNewModel) {
            displayLib = require('Controls/display');
        }
        this._sequentialEditing = _private.getSequentialEditing(newOptions);
    },

    _afterMount(): void {
        // Пендинг регистрируется через событие, которые нельзя генерировать до полного построения контрола.
        if (this._editingItem) {
            _private.registerPending(this);
        }
    },

    beginEdit(options): Promise<{ cancelled: true } | { item: entity.Record } | void> {
        var self = this;
        if (this._editingItem && !this._editingItem.isChanged()) {
            return this.cancelEdit().addCallback(() => {
                return _private.beginEdit(self, options).addCallback((newOptions) => {
                    return _private.beginEditCallback(self, newOptions);
                });
            });
        }

        if (!this._editingItem || !this._editingItem.isEqual(options.item)) {
            return this.commitEdit().addCallback((res) => {
                if (res && res.validationFailed) {
                    return Deferred.success();
                }
                return _private.beginEdit(self, options).addCallback((newOptions) => {
                    return _private.beginEditCallback(self, newOptions);
                });
            });
        } else {
            return Promise.resolve();
        }
    },

    beginAdd: function (options) {
        var self = this;
        return this.commitEdit().addCallback(function (res) {
            if (res && res.validationFailed) {
                return Deferred.success();
            }
            return _private.beginEdit(self, options || {}, true).addCallback(function (newOptions) {
                if (newOptions && newOptions.cancelled) {
                    return Deferred.success({cancelled: true});
                }
                return _private.afterBeginEdit(self, newOptions, true);
            });
        });
    },

    commitEdit: function () {
        var self = this;

        if (self._endEditDeferred) {
            return self._endEditDeferred;
        }

        if (!self._isCommitInProcess) {
            self._isCommitInProcess = true;
            self._commitPromise = _private.validate(this).addCallback(function(result) {
                for (var key in result) {
                    if (result.hasOwnProperty(key) && result[key]) {
                        self._isCommitInProcess = false;
                        return Deferred.success({validationFailed: true});
                    }
                }
                return _private.endItemEdit(self, true).addCallback((result) => {
                    self._isCommitInProcess = false;
                    return Deferred.success({validationFailed: result && result.cancelled});
                });
            });
        }

        return self._commitPromise;
    },

    cancelEdit: function () {
        const self = this;
        return this._isCommitInProcess ? this._commitPromise.addBoth(() => {
            return _private.endItemEdit(self, false);
        }) : _private.endItemEdit(this, false);
    },

    _onKeyDown: function (e, nativeEvent) {
        switch (nativeEvent.keyCode) {
            case 13: // Enter
                // Если таблица находится в другой таблице, событие из внутренней таблицы не должно всплывать до внешней
                e.stopPropagation();
                if (this._isAdd) {
                    editAfterRedraw(this, _private.editNextRow.bind(_private, this, true, !!this._options.editingConfig && !!this._options.editingConfig.autoAddByApplyButton));
                } else if (this._options.editingConfig && !this._sequentialEditing) {
                    editAfterRedraw(this, this.commitEdit.bind(this));
                } else {
                    editAfterRedraw(this, _private.editNextRow.bind(_private, this, true));
                }
                break;
            case 27: // Esc
                // Если таблица находится в другой таблице, событие из внутренней таблицы не должно всплывать до внешней
                e.stopPropagation();
                this.cancelEdit();
                break;
        }
    },

    _onItemClick: function (e, record, originalEvent) {
        const self = this;
        if (this._options.editingConfig && this._options.editingConfig.editOnClick && !this._options.readOnly && originalEvent.type === 'click') {
            if (originalEvent.target.closest('.js-controls-ListView__notEditable')) {
                this.commitEdit();
            } else {
                this.beginEdit({
                    item: record
                }).addCallback((result) => {
                   if (result && !result.cancelled) {
                       // TODO KINGO. Заполняем информацию по клику только если редактирование по месту запустилось,
                       // т.к. только в таком случае нужно восстанавливать курсор по координатам клика (в _afterUpdate).
                       self._clickItemInfo = {
                           clientX: originalEvent.nativeEvent.clientX,
                           clientY: originalEvent.nativeEvent.clientY,
                           item: record
                       };

                       // После старта редактирования нужно установить фокус на поле ввода, каретку под курсор.
                       // Старт редактирования может быть асинхронным (если из события beforeBeginEdit вернулся Promise)
                       // и колбек отстреляет после EditInPlace._afterUpdate.
                       // Необходимо запустить еще одно обновление, в котором гарантировано будет отрисовано поле ввода.
                       // Именно в этом обновлении можно проставлять фокус и каретку.
                       // Не должно и не будет работать в случае, если внутри шаблона редактора поле ввода вставляется
                       // через Controls.Container.Async.
                       self._pendingInputRenderState = PendingInputRenderState.PendingRender;
                       self._forceUpdate();
                   }
                });
                // The click should not bubble over the editing controller to ensure correct control works.
                // e.c., a click can be processed by the selection controller, which should not occur when starting editing in place.
                // https://online.sbis.ru/opendoc.html?guid=b3254c65-596b-4f89-af0f-c160217ce7a3
                e.stopPropagation();
            }
        }
    },

    _beforeUpdate: function (newOptions) {
        this._sequentialEditing = _private.getSequentialEditing(newOptions);
        if (this._editingItemData) {
            if (this._options.multiSelectVisibility !== newOptions.multiSelectVisibility) {
                this._setEditingItemData(this._editingItemData.item, newOptions.listModel, newOptions);
            }
        }

        if (this._pendingInputRenderState === PendingInputRenderState.PendingRender) {
            // Запустилась синхронизация, по завершению которой будет отрисовано поле ввода
            this._pendingInputRenderState = PendingInputRenderState.Rendering;
        }
    },

    _afterUpdate: function () {
        var target, fakeElement, targetStyle, offset, currentWidth, previousWidth, lastLetterWidth, hasHorizontalScroll;

        // Выставляем каретку и активируем поле только после начала редактирования и гарантированной отрисовке полей ввода.
        if (this._clickItemInfo && this._clickItemInfo.item === this._originalItem && this._pendingInputRenderState === PendingInputRenderState.Rendering) {
            target = document.elementFromPoint(this._clickItemInfo.clientX, this._clickItemInfo.clientY);
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                fakeElement = document.createElement('div');
                fakeElement.innerText = '';

                targetStyle = getComputedStyle(target);
                hasHorizontalScroll = hasHorizontalScrollUtil(target);

                /*
                 Если элемент выравнивается по правому краю, но при этом влезает весь текст, то нужно рассчитывать положение
                 курсора от правого края input'а, т.к. перед текстом может быть свободное место. Во всех остальных случаях
                 нужно рассчитывать от левого края, т.к. текст гарантированно прижат к нему.
                 */
                if (targetStyle.textAlign === 'right' && !hasHorizontalScroll) {
                    offset = target.getBoundingClientRect().right - this._clickItemInfo.clientX;
                } else {
                    offset = this._clickItemInfo.clientX - target.getBoundingClientRect().left;
                }
                typographyStyles.forEach(function (prop) {
                    fakeElement.style[prop] = targetStyle[prop];
                });

                for (var i = 0; i < target.value.length; i++) {
                    currentWidth = getWidthUtil.getWidth(fakeElement);
                    if (currentWidth > offset) {
                        break;
                    }
                    if (targetStyle.textAlign === 'right' && !hasHorizontalScroll) {
                        fakeElement.innerText = target.value.slice(target.value.length - 1 - i);
                    } else {
                        fakeElement.innerText += target.value[i];
                    }
                    previousWidth = currentWidth;
                }

                /**
                 * When editing starts, EditingRow calls this.activate() to focus first focusable element.
                 * But if a user has clicked on an editable field, we can do better - we can set caret exactly
                 * where the user has clicked. But before moving the caret we should manually focus the right field.
                 */
                target.focus();

                lastLetterWidth = currentWidth - previousWidth;
                if (targetStyle.textAlign === 'right' && !hasHorizontalScroll) {
                    if (currentWidth - offset < lastLetterWidth / 2) {
                        target.setSelectionRange(target.value.length - i, target.value.length - i);
                    } else {
                        target.setSelectionRange(target.value.length - i + 1, target.value.length - i + 1);
                    }
                } else if (currentWidth - offset < lastLetterWidth / 2) {
                    target.setSelectionRange(i, i);
                } else {
                    target.setSelectionRange(i - 1, i - 1);
                }

                target.scrollLeft = 0;
            }
            this._clickItemInfo = null;
            this._pendingInputRenderState = PendingInputRenderState.Null;
        }
    },

    _setEditingItemData: function (item, listModel, options) {
        if (!item) {
            if (options.useNewModel) {
                displayLib.EditInPlaceController.endEdit(listModel);
            } else {
                listModel._setEditingItemData(null);
            }
            this._editingItemData = null;
            return;
        }

        /**
         * This code exists because there's no way to declaratively change editing item, so the users are forced to write something like this:
         * editingItem.set('field', 'value').
         */
        this._editingItem.subscribe('onPropertyChange', this._resetValidation);

        let editingItemProjection;
        if (options.useNewModel) {
            editingItemProjection = listModel.getItemBySourceKey(this._editingItem.get(listModel.getKeyProperty()));
        } else {
            editingItemProjection = listModel.getItemById(this._editingItem.get(listModel._options.keyProperty), listModel._options.keyProperty);
        }

        if (!editingItemProjection) {
            this._isAdd = true;
            if (options.useNewModel) {
                editingItemProjection = listModel.createItem(item);
            } else {
                editingItemProjection = listModel._prepareDisplayItemForAdd(item);
            }
        }

        if (options.useNewModel) {
            displayLib.EditInPlaceController.beginEdit(listModel, item.getId(), item);
        } else {
            this._editingItemData = listModel.getItemDataByItem(editingItemProjection);

            // TODO Make sure all of this is available in the new model
            if (this._isAdd && _private.hasParentInItems(this._editingItem, listModel)) {
                this._editingItemData.level = listModel.getItemById(item.get(this._editingItemData.parentProperty)).getLevel() + 1;
            }

            this._editingItemData.isEditing = true;
            this._editingItemData.item = this._editingItem;
            if (this._isAdd) {
                this._editingItemData.isAdd = this._isAdd;
                this._editingItemData.index = _private.getEditingItemIndex(this, item, listModel, _private.getAddPosition(options));
                this._editingItemData.addPosition = options.editingConfig && options.editingConfig.addPosition;
                this._editingItemData.drawActions = options.editingConfig && options.editingConfig.toolbarVisibility;
            }

            listModel._setEditingItemData(this._editingItemData);
        }

        listModel.subscribe('onCollectionChange', this._updateIndex);
    },

    commitAndMoveNextRow(): void {
        /*
        * Стандартное поведение. При нажатии "Галки" в операциях над записью, возможно два варианта дальнейшего поведения:
        * 1) если сохраняется уже существующая запись, то она просто сохраняется, курсор остается на строке, редактирование закрывается.
        * 2) если сохраняется только что добавленная запись, то происходит ее сохранение и (при editingConfig.autoAddByApplyButton=true) начинается добавление новой.
        * */
        if (this._isAdd) {
            _private.editNextRow(this, true, !!this._options.editingConfig && !!this._options.editingConfig.autoAddByApplyButton);
        } else {
            this.commitEdit();
        }
    },

    _updateIndex() {
        // TODO How to do this in new model
       if (this._isAdd) {
          /**
           * If an item gets added to the list during editing we should update index of editing item to preserve its position.
           */
          this._editingItemData.index = _private.getEditingItemIndex(this, this._editingItem, this._options.listModel, _private.getAddPosition(this._options));
       }
    },

    _onRowDeactivated: function (e, eventOptions) {
        if (eventOptions.isTabPressed) {
            editAfterRedraw(this, _private.editNextRow.bind(_private, this, !eventOptions.isShiftKey));
        }
        e.stopPropagation();
    },

    _onPendingFail(shouldSave: boolean, pendingDeferred: Promise<boolean>): void {
        const cancelPending = () => this._notify('cancelFinishingPending', [], {bubbling: true});

        if (!(this._options.task1178703576 && !shouldSave) && this._editingItem && this._editingItem.isChanged()) {
            return this.commitEdit().addCallback((result = {}) => {
                if (result.validationFailed) {
                    cancelPending();
                }
                return result;
            }).addErrback(() => {
                cancelPending();
            });
        } else {
            return this.cancelEdit();
        }
    },

    _beforeUnmount: function () {
        this._commitPromise = null;
        _private.resetVariables(this);
    }
});

EditInPlace._private = _private;
EditInPlace._theme = ['Controls/list']

export = EditInPlace;

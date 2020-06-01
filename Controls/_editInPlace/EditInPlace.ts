import Control = require('View/Base');
import Deferred = require('Core/Deferred');
import entity = require('Types/entity');
import getWidthUtil = require('Controls/Utils/getWidth');
import hasHorizontalScrollUtil = require('Controls/Utils/hasHorizontalScroll');
import {editing as constEditing} from 'Controls/Constants';
import {error as dataSourceError} from 'Controls/dataSource';
import {default as EditInPlaceController} from './Controller';
import FileAttachModel from 'File/_attach/Model';
import {Model} from 'Types/entity';
import {Collection as ViewModel} from '../display';
import {SyntheticEvent} from 'Vdom/Vdom';

enum PendingInputRenderState {
    Null,
    PendingRender,
    Rendering
}

const typographyStyles = [
    'fontFamily',
    'fontSize',
    'fontWeight',
    'fontStyle',
    'letterSpacing',
    'textTransform',
    'wordSpacing',
    'textIndent'
];
const _private = {
    beginEdit(self: EditInPlace, options: IEditingConfig, isAdd?: boolean): Promise<any> {
        const result = self._notify('beforeBeginEdit', [options, !!isAdd]);
        if (!isAdd) {
            self._originalItem = options.item;
        }
        return _private.processBeforeBeginEditResult(self, options, result, isAdd);
    },

    afterBeginEdit(self: EditInPlace, options: IEditingConfig, isAdd: boolean): IEditingConfig {
        self._editingItem = options.item.clone();
        self._editingItem.acceptChanges();
        self._setEditingItemData(self._editingItem, self._options);
        self._notify('afterBeginEdit', [self._editingItem, isAdd]);
        return options;
    },

    processBeforeBeginEditResult(self: EditInPlace, options: IEditingConfig, eventResult: any, isAdd: boolean): Promise<any> {
        let result;

        if (eventResult === constEditing.CANCEL) {
            result = Promise.resolve({cancelled: true});
        } else {
            if (eventResult && eventResult.finally) {
                self._showIndicator();
                eventResult.finally((defResult) => {
                    self._hideIndicator();
                    return defResult;
                });
                result = eventResult;
            } else if (
                (eventResult && eventResult.item instanceof entity.Record) ||
                (options && options.item instanceof entity.Record)
            ) {
                result = Promise.resolve(eventResult || options);
            } else if (isAdd) {
                self._showIndicator();
                result = _private.createModel(self, eventResult || options).finally((createModelResult) => {
                    self._hideIndicator();
                    return createModelResult;
                });
            }
        }
        return result;
    },

    endItemEdit(self: EditInPlace, commit: boolean) {
        // Чтобы при первом старте редактирования не летели лишние события
        if (!self._editingItem) {
            return Promise.resolve();
        }

        if (self._endEditDeferred) {
            return self._endEditDeferred;
        }

        const eventResult = self._notify('beforeEndEdit', [
            self._editingItem,
            commit,
            self._isAdd
        ]);
        if (eventResult && eventResult.finally) {
            self._showIndicator();
            self._endEditDeferred = eventResult;
            return eventResult.catch((error) => {
                // Отменяем сохранение, оставляем редактирование открытым, если промис сохранения завершился с
                // ошибкой (провалена валидация на сервере)
                self._endEditDeferred = null;
                self._hideIndicator();
                return constEditing.CANCEL;
            }).then((resultOfDeferred) => {
                self._hideIndicator();

                if (resultOfDeferred === constEditing.CANCEL) {
                    self._endEditDeferred = null;
                    return Promise.resolve({cancelled: true});
                }

                return Promise.resolve(resultOfDeferred).finally((res) => {
                    self._endEditDeferred = null;
                    _private.afterEndEdit(self, commit);
                    return res;
                });
            });
        } else {
            if (eventResult === constEditing.CANCEL) {
                return Promise.resolve({cancelled: true});
            }
            // Если обновление данных на БЛ затягивается, должен появиться индикатор загрузки.
            self._showIndicator();
            return _private.updateModel(self, commit).finally((result) => {
                self._hideIndicator();
                return result;
            }).then(
                () => {
                    return _private.afterEndEdit(self, commit);
                },
                (error) => {
                    return Promise.resolve({cancelled: true});
                }
            );
        }
    },

    afterEndEdit(self: EditInPlace, commit: boolean): void {
        const afterEndEditArgs = [self._isAdd ? self._editingItem : self._originalItem, self._isAdd];

        // При редактировании по месту маркер появляется только если в списке больше одной записи.
        // https://online.sbis.ru/opendoc.html?guid=e3ccd952-cbb1-4587-89b8-a8d78500ba90
        if (self._isAdd && commit && self._listModel.getCount() > 1) {
            // TODO переделать на marker.Controller, когда этот контрол будет переводиться в контроллер
            self._listModel.setMarkedKey(self._editingItem.getId());
        }
        if (self._options.useNewModel) {
            self._listModel.getCollection().acceptChanges();
        } else {
            self._listModel.acceptChanges();
        }
        _private.resetVariables(self);
        if (!self._destroyed) {
            self._setEditingItemData(null, self._listModel, self._options);
        }

        // Нотифицировать о событии "После завершения редактирования" нужно после очистки editingItemData,
        // т.к. все остальные контролы проверяют наличие запущенного редактирования именно по ней.
        // Нотификация до очистки приводит к проблемам. Например, в обработчике события afterEndEdit ожидается,
        // что завершено редактирование и можно позвать перезагрузку списка для обновления результатов каждой строки.
        // Однако сам список считает что редактирование еще активно и падает при перезагрузке.
        self._notify('afterEndEdit', afterEndEditArgs);
    },

    createModel(self: EditInPlace, options) {
        return self._options.source.create().then((item) => {
            options.item = item;
            return options;
        }).catch((error: Error) => {
            return _private.processError(self, error);
        });
    },

    updateModel(self: EditInPlace, commit) {
        if (commit && (self._isAdd || self._editingItem.isChanged())) {
            if (self._options.source) {
                return self._options.source.update(self._editingItem).then(() => {
                    _private.acceptChanges(self);
                }).catch((error: Error) => {
                    self._isCommitInProcess = false;
                    return _private.processError(self, error);
                });

            }
            _private.acceptChanges(self);
        }

        return Deferred.success();
    },

    processError(self: EditInPlace, error: Error): Promise<Error> {
        /*
         * в detail сейчас в многих местах редактирования по месту приходит текст из запроса
         * Не будем его отображать
         * TODO Убрать после закрытия задачи по написанию документа по правильному формированию текстов ошибок
         *  https://online.sbis.ru/doc/c8ff58ac-e6f7-4f0e-877a-e9cbbe661139
         */
        delete error.details;

        return self._errorController.process({
            error,
            theme: self._options.theme,
            mode: dataSourceError.Mode.dialog
        }).then((errorConfig: dataSourceError.ViewConfig) => {
            self._children.errorContainer.show(errorConfig);
            return Promise.reject(error);
        });
    },

    acceptChanges(self: EditInPlace): void {
        if (self._isAdd) {
            if (self._options.useNewModel) {
                self._listModel.getCollection().append([self._editingItem]);
            } else {
                self._listModel.appendItems([self._editingItem]);
            }
        } else {
            self._originalItem.merge(self._editingItem);
        }
    },

    resetVariables(self) {
        if (self._editingItem) {
            self._editingItem.unsubscribe('onPropertyChange', self._resetValidation);
            self._listModel.unsubscribe('onCollectionChange', self._updateIndex);
        }
        self._originalItem = null;
        self._editingItem = null;
        self._isAdd = null;
    },

    validate(self) {
        return self._formController.submit();
    },

    hasParentInItems(item, listModel) {
        // TODO No parents in new model for now for now
        if (!listModel['[Controls/_display/Collection']) {
            return !!listModel._options.parentProperty && listModel.getItemById(item.get(listModel._options.parentProperty));
        }
    },

    editNextRow(self: EditInPlace, editNextRow: boolean, addAnyway: boolean = false) {
        const index = _private.getEditingItemIndex(self, self._editingItem, self._listModel);
        const editingConfig = self._options.editingConfig || {};

        if (editNextRow) {
            if (!self._isAdd && _private.getNext(self._editingItem, index, self._listModel)) {
                self.beginEdit({
                    item: _private.getNext(self._editingItem, index, self._listModel)
                });
            } else if (addAnyway || editingConfig.autoAdd) {
                self.beginAdd();
            } else {
                self.commitEdit();
            }
        } else if (_private.getPrevious(self._editingItem, index, self._listModel)) {
            self.beginEdit({
                item: _private.getPrevious(self._editingItem, index, self._listModel)
            });
        } else {
            self.commitEdit();
        }
    },

    getNext(editingItem, index, listModel) {
        let
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

    getPrevious(editingItem, index, listModel) {
        let
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

    getEditingItemIndex(self: EditInPlace, editingItem: Model, listModel: ViewModel<Model>, defaultIndex: Number|undefined): Number {
        let index = defaultIndex !== undefined ? defaultIndex : listModel.getCount();
        let originalItem;
        let parentId;
        let parentIndex;
        const groupProperty = listModel.getGroupProperty();

        // TODO no hasParentInItems for new model at the moment
        if (self._options.useNewModel) {
            originalItem = listModel.getItemBySourceKey(editingItem.get(listModel.getKeyProperty()));
        } else {
            originalItem = listModel.getItemById(
                editingItem.get(listModel._options.keyProperty),
                listModel._options.keyProperty
            );
        }

        if (originalItem) {
            index = listModel.getIndexByKey(originalItem.getContents().getKey());
        } else if (_private.hasParentInItems(editingItem, listModel)) {
            parentId = editingItem.get(listModel._options.parentProperty);
            parentIndex = listModel.getIndexByKey(
                listModel.getItemById(
                    parentId,
                    listModel._options.keyProperty
                ).getContents().getKey()
            );
            index = parentIndex + (defaultIndex !== undefined ? defaultIndex : listModel.getDisplayChildrenCount(parentId)) + 1;
        } else if (listModel._options.groupingKeyCallback || groupProperty) {
            const groupId = groupProperty ? editingItem.get(groupProperty) : listModel._options.groupingKeyCallback(editingItem);
            const isAddInTop = self._options.editingConfig && self._options.editingConfig.addPosition === 'top';
            index = _private.getItemIndexWithGrouping(listModel.getDisplay(), groupId, isAddInTop);
        }

        return index;
    },

    getSequentialEditing(newOptions: IEditingOptions): boolean {
        // TODO: опция editingConfig.sequentialEditing по умолчанию должна быть true. Но она находится внутри объекта,
        // а при вызове getDefaultOptions объекты не мержатся. Нужно либо на стороне ws делать мерж объектов, либо
        // делать 5 опций на списке, либо вот такой костыль:
        if (newOptions.editingConfig && typeof newOptions.editingConfig.sequentialEditing !== 'undefined') {
            return newOptions.editingConfig.sequentialEditing;
        }
        return true;
    },

    getAddPosition(options) {
        return options.editingConfig && options.editingConfig.addPosition === 'top' &&
        !options.editingConfig.autoAdd ? 0 : undefined;
    },

    beginEditCallback(self: EditInPlace, newOptions): IEditingConfig {
        if (newOptions && newOptions.cancelled) {
            return Deferred.success({cancelled: true});
        }
        return _private.afterBeginEdit(self, newOptions);
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

export interface IEditingConfig {
    item?: Model;
    sequentialEditing?: boolean;
    autoAddByApplyButton?: boolean;
    editOnClick?: boolean;
    autoAdd?: boolean;
    addPosition?: String;
}

export interface IEditingOptions {
    editingConfig: IEditingConfig;
    keyProperty: String|Number;
    errorController: typeof dataSourceError;
    listModel: ViewModel<Model>;
    readOnly?: boolean;
    useNewModel?: boolean;
    multiSelectVisibility?: boolean;
    notify?: any;
    forceUpdate: any;
    listView: any;
    source: any;
}

/**
 * @class Controls/_list/EditInPlace
 * @extends Core/Control
 * @mixes Controls/interface/IEditableList
 * @implements Controls/_interface/IErrorController
 * @author Авраменко А.С.
 * @private
 */

export default class EditInPlace {
    _isAdd: boolean;
    _originalItem: Model;
    _editingItem: Model;
    _endEditDeferred: null;
    _loadingIndicatorId: null;
    _errorController: typeof dataSourceError;
    _commitPromise: Promise<any>;
    _options: IEditingOptions;
    _formController: any;
    _sequentialEditing: boolean;
    _editingItemData: any;
    _clickItemInfo: any;
    _pendingInputRenderState: any;
    _isCommitInProcess: boolean;
    _listModel: ViewModel<Model>;

    constructor(options: IEditingOptions) {
        this._updateIndex = this._updateIndex.bind(this);
        this._errorController = options.errorController || new dataSourceError.Controller({});
        this._options = options;
        this._listModel = options.listModel;
        this._resetValidation = this._resetValidation.bind(this);
        // options.listControl.subscribe('itemClick', this._onItemClick.bind(this));
        // options.listControl.subscribe('rowDeactivated', this._onRowDeactivated.bind(this));
        // options.listControl.subscribe('editingRowKeyDow', this._onRowDeactivated.bind(this));
    }

    _notify(name: string, args?: any, params?: any): any {
        return this._options.notify(name, args, params);
    }

    beforeMount(newOptions: any, listModel: ViewModel<Model>, formController: any): void {
        if (newOptions.editingConfig) {
            this._listModel = listModel;
            this._formController = formController;
            if (newOptions.editingConfig.item) {
                this._editingItem = newOptions.editingConfig.item;
                this._setEditingItemData(this._editingItem, newOptions);
                if (!this._isAdd) {
                    if (newOptions.useNewModel) {
                        this._originalItem = this._listModel.getItemBySourceKey(
                            this._editingItem.get(this._listModel.getKeyProperty())
                        ).getContents();
                    } else {
                        this._originalItem = this._listModel.getItemById(
                            this._editingItem.get(this._listModel._options.keyProperty),
                            this._listModel._options.keyProperty
                        ).getContents();
                    }
                }
            }
        }
        this._sequentialEditing = _private.getSequentialEditing(newOptions);
    }

    afterMount(): void {
        this._notify('registerFormOperation', [{
            save: this._formOperationHandler.bind(this, true),
            cancel: this._formOperationHandler.bind(this, false),
            isDestroyed: () => this._options.listView.isDestroyed()
        }], {bubbling: true});
    }

    _formOperationHandler(shouldSave: boolean): void {
        if (shouldSave && this._editingItem?.isChanged()) {
            return this.commitEdit();
        } else {
            return this.cancelEdit();
        }
    }

    beginEdit(options: IEditingConfig): Promise<{ cancelled: true } | { item: entity.Record } | void> {
        const self = this;
        if (this._editingItem && !this._editingItem.isChanged()) {
            return this.cancelEdit().then(() => {
                return _private.beginEdit(self, options).then((newOptions) => {
                    return _private.beginEditCallback(self, newOptions);
                });
            });
        }

        if (!this._editingItem || !this._editingItem.isEqual(options.item)) {
            return this.commitEdit().then((res) => {
                if (res && res.validationFailed) {
                    return Deferred.success();
                }
                return _private.beginEdit(self, options).then((newOptions) => {
                    return _private.beginEditCallback(self, newOptions);
                });
            });
        } else {
            return Promise.resolve();
        }
    }

    beginAdd(options?: IEditingConfig): Promise<any> {
        const self = this;
        return this.commitEdit().then((res) => {
            if (res && res.validationFailed) {
                return Deferred.success();
            }
            return _private.beginEdit(self, options || {}, true).then((newOptions) => {
                if (newOptions && newOptions.cancelled) {
                    return Deferred.success({cancelled: true});
                }
                return _private.afterBeginEdit(self, newOptions, true);
            });
        });
    }

    commitEdit(): Promise<any> {
        const self = this;

        if (self._endEditDeferred) {
            return self._endEditDeferred;
        }

        if (!self._isCommitInProcess) {
            self._isCommitInProcess = true;
            self._commitPromise = _private.validate(this).then((result) => {
                for (const key in result) {
                    if (result.hasOwnProperty(key) && result[key]) {
                        self._isCommitInProcess = false;
                        return Deferred.success({validationFailed: true});
                    }
                }
                return _private.endItemEdit(self, true).then((result) => {
                    self._isCommitInProcess = false;
                    return Deferred.success({validationFailed: result && result.cancelled});
                });
            });
        }

        return self._commitPromise;
    }

    cancelEdit(): Promise<any>|Boolean {
        const self = this;
        return this._isCommitInProcess ? this._commitPromise.finally(() => {
            return _private.endItemEdit(self, false);
        }) : _private.endItemEdit(this, false);
    }

    onKeyDown(e: SyntheticEvent<KeyboardEvent>, nativeEvent: KeyboardEvent): void {
        switch (nativeEvent.keyCode) {
            case 13: // Enter
                // Если таблица находится в другой таблице, событие из внутренней таблицы не должно всплывать до внешней
                e.stopPropagation();
                if (this._isAdd) {
                    _private.editNextRow(
                        this,
                        true,
                        !!this._options.editingConfig && !!this._options.editingConfig.autoAddByApplyButton
                    );
                } else if (this._options.editingConfig && !this._sequentialEditing) {
                    this.commitEdit();
                } else {
                    _private.editNextRow(this, true);
                }
                break;
            case 27: // Esc
                // Если таблица находится в другой таблице, событие из внутренней таблицы не должно всплывать до внешней
                e.stopPropagation();
                this.cancelEdit();
                break;
        }
    }

    onItemClick(
        e: SyntheticEvent<MouseEvent>,
        item: Model,
        originalEvent: MouseEvent
    ): void {
        const self = this;

        if (
            this._options.editingConfig &&
            this._options.editingConfig.editOnClick &&
            !this._options.readOnly &&
            originalEvent.type === 'click'
        ) {
            if (originalEvent.target.closest('.js-controls-ListView__notEditable')) {
                this.commitEdit();
            } else {
                this.beginEdit({
                    item
                }).then((result) => {
                    if (result && !result.cancelled) {
                        // TODO KINGO. Заполняем информацию по клику только если редактирование по месту запустилось,
                        // т.к. только в таком случае нужно восстанавливать курсор по координатам клика
                        // (в _afterUpdate).
                        self._clickItemInfo = {
                            clientX: originalEvent.nativeEvent.clientX,
                            clientY: originalEvent.nativeEvent.clientY,
                            item
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
    }

    beforeUpdate(newOptions: any, listModel: ViewModel<Model>, formController: any): void {
        this._sequentialEditing = _private.getSequentialEditing(newOptions);
        this._listModel = listModel;
        this._formController = formController;
        if (this._editingItemData) {
            if (this._options.multiSelectVisibility !== newOptions.multiSelectVisibility) {
                this._setEditingItemData(this._editingItemData.item, newOptions);
            }
        }

        if (this._pendingInputRenderState === PendingInputRenderState.PendingRender) {
            // Запустилась синхронизация, по завершению которой будет отрисовано поле ввода
            this._pendingInputRenderState = PendingInputRenderState.Rendering;
        }
    }

    afterUpdate(): void {
        let target, fakeElement, targetStyle, offset, currentWidth, previousWidth, lastLetterWidth, hasHorizontalScroll;

        // Выставляем каретку и активируем поле только после начала редактирования
        // и гарантированной отрисовке полей ввода.
        if (this._clickItemInfo &&
            this._clickItemInfo.item === this._originalItem &&
            this._pendingInputRenderState === PendingInputRenderState.Rendering
        ) {
            target = document.elementFromPoint(this._clickItemInfo.clientX, this._clickItemInfo.clientY);
            if ((target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
                // Выполняем корректировку выделения только в случае пустого выделения
                // (учитываем опцию selectOnClick для input-контролов).
                // https://online.sbis.ru/opendoc.html?guid=904a460a-02da-46a7-bb61-5e0ed2dc4375
                && target.selectionStart === target.selectionEnd) {
                fakeElement = document.createElement('div');
                fakeElement.innerText = '';

                targetStyle = getComputedStyle(target);
                hasHorizontalScroll = hasHorizontalScrollUtil(target);

                /*
                 Если элемент выравнивается по правому краю, но при этом влезает весь текст, то нужно рассчитывать
                 положение курсора от правого края input'а, т.к. перед текстом может быть свободное место.
                 Во всех остальных случаях нужно рассчитывать от левого края, т.к. текст гарантированно прижат к нему.
                 */
                if (targetStyle.textAlign === 'right' && !hasHorizontalScroll) {
                    offset = target.getBoundingClientRect().right - this._clickItemInfo.clientX;
                } else {
                    offset = this._clickItemInfo.clientX - target.getBoundingClientRect().left;
                }
                typographyStyles.forEach((prop) => {
                    fakeElement.style[prop] = targetStyle[prop];
                });
                let i = 0;
                for (; i < target.value.length; i++) {
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
    }

    _setEditingItemData(item: Model, options: any): void {
        if (!item) {
            if (options.useNewModel) {
                EditInPlaceController.endEdit(this._listModel);
            } else {
                this._listModel._setEditingItemData(null);
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
            editingItemProjection = this._listModel.getItemBySourceKey(
                this._editingItem.get(this._listModel.getKeyProperty())
            );
        } else {
            editingItemProjection = this._listModel.getItemById(
                this._editingItem.get(this._listModel._options.keyProperty),
                this._listModel._options.keyProperty
            );
        }

        if (!editingItemProjection) {
            this._isAdd = true;
            if (options.useNewModel) {
                editingItemProjection = this._listModel.createItem(item);
            } else {
                editingItemProjection = this._listModel._prepareDisplayItemForAdd(item);
            }
        }

        if (options.useNewModel) {
            EditInPlaceController.beginEdit(this._listModel, item.getId(), item);
        } else {
            this._editingItemData = this._listModel.getItemDataByItem(editingItemProjection);

            // TODO Make sure all of this is available in the new model
            if (this._isAdd && _private.hasParentInItems(this._editingItem, this._listModel)) {
                this._editingItemData.level = this._listModel.getItemById(
                    item.get(this._editingItemData.parentProperty)
                ).getLevel() + 1;
            }

            this._editingItemData.isEditing = true;
            this._editingItemData.item = this._editingItem;
            if (this._isAdd) {
                this._editingItemData.isAdd = this._isAdd;
                this._editingItemData.index = _private.getEditingItemIndex(
                    this,
                    item,
                    this._listModel,
                    _private.getAddPosition(options)
                );
                this._editingItemData.addPosition = options.editingConfig && options.editingConfig.addPosition;
                this._editingItemData.drawActions = options.editingConfig && options.editingConfig.toolbarVisibility;
            }

            this._listModel._setEditingItemData(this._editingItemData);
        }

        this._listModel.subscribe('onCollectionChange', this._updateIndex);
    }

    commitAndMoveNextRow(): void {
        /*
        * Стандартное поведение. При нажатии "Галки" в операциях над записью, возможно два варианта дальнейшего поведения:
        * 1) если сохраняется уже существующая запись, то она просто сохраняется, курсор остается на строке, редактирование закрывается.
        * 2) если сохраняется только что добавленная запись, то происходит ее сохранение и (при editingConfig.autoAddByApplyButton=true) начинается добавление новой.
        * */
        if (this._isAdd) {
            _private.editNextRow(this,
                true,
                !!this._options.editingConfig && !!this._options.editingConfig.autoAddByApplyButton
            );
        } else {
            this.commitEdit();
        }
    }

    _updateIndex(): void {
        // TODO How to do this in new model
        if (this._isAdd) {
            /**
             * If an item gets aed to the list during editing we should update index of editing item to preserve its position.
             */
            this._editingItemData.index = _private.getEditingItemIndex(
                this,
                this._editingItem,
                this._listModel,
                _private.getAddPosition(this._options)
            );
        }
    }

    _onRowDeactivated(e, eventOptions: any): void {
        if (eventOptions.isTabPressed) {
            _private.editNextRow(this, !eventOptions.isShiftKey);
        }
        e.stopPropagation();
    }

    _showIndicator(): void {
        this._loadingIndicatorId = this._notify('showIndicator', [{}], {bubbling: true});
    }

    _hideIndicator(): void {
        this._notify('hideIndicator', [this._loadingIndicatorId], {bubbling: true});
        this._loadingIndicatorId = null;
    }

    reset(): void {
        this._commitPromise = null;
        _private.resetVariables(this);
    }

    _resetValidation(): void {
        /**
         * We should manually trigger update of the list, otherwise only inputs with validators are gonna get updated.
         */
        this._forceUpdate();

        /**
         * Validation doesn't reset if the value was changed without user input, so we have to reset it here.
         * Ideally, validation should take value through options and reset automagically.
         * TODO: https://online.sbis.ru/opendoc.html?guid=951f6762-8e37-4182-a7fc-3104a35ce27a
         */
        this._formController.setValidationResult();
    }

    _forceUpdate(): void {
        this._options.forceUpdate();
    }

    static _theme: string[];
}

// @ts-ignore
EditInPlace._private = _private;
EditInPlace._theme = ['Controls/list'];

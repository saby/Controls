import entity = require('Types/entity');
import getWidthUtil = require('Controls/Utils/getWidth');
import hasHorizontalScrollUtil = require('Controls/Utils/hasHorizontalScroll');
import {editing as constEditing} from 'Controls/Constants';
import {error as dataSourceError} from 'Controls/dataSource';
import {Model} from 'Types/entity';
import {Collection as ViewModel} from '../display';
import {SyntheticEvent} from 'Vdom/Vdom';

let displayLib: typeof import('Controls/display');

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
    beginEdit(self: EditInPlace, options: IEditingConfig, isAdd?: boolean): Promise<IEditingConfig> {
        const result = self._notify('beforeBeginEdit', [options, !!isAdd]);
        if (!isAdd) {
            self._originalItem = options.item;
        }
        return _private.processBeforeBeginEditResult(self, options, result, isAdd);
    },

    afterBeginEdit(self: EditInPlace, options: IEditingConfig, isAdd?: boolean): IEditingConfig {
        self._editingItem = options.item.clone();
        self._editingItem.acceptChanges();
        self._setEditingItemData(self._editingItem);
        self._notify('afterBeginEdit', [self._editingItem, isAdd]);
        self._options.updateItemActions();
        return options;
    },

    processBeforeBeginEditResult(
        self: EditInPlace,
        options: IEditingConfig,
        eventResult: any,
        isAdd: boolean
    ): Promise<IEditingConfig> {
        let result;

        if (eventResult === constEditing.CANCEL) {
            result = Promise.resolve({cancelled: true});
        } else {
            if (eventResult && eventResult.finally) {
                let indicatorId = self._showIndicator();
                result = eventResult.then((defResult) => {
                    if (defResult === constEditing.CANCEL) {
                        return {cancelled: true};
                    }
                    return defResult;
                }).catch(() => ({cancelled: true})).finally(() => {
                    self._hideIndicator(indicatorId);
                });
            } else if (
                (eventResult && eventResult.item instanceof entity.Record) ||
                (options && options.item instanceof entity.Record)
            ) {
                result = Promise.resolve(eventResult || options);
            } else if (isAdd) {
                let indicatorId = self._showIndicator();
                result = _private.createModel(self, eventResult || options).finally(() => {
                    self._hideIndicator(indicatorId);
                });
            }
        }
        return result;
    },

    endItemEdit(self: EditInPlace, commit: boolean): Promise<any> {
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
            let indicatorId = self._showIndicator();
            self._endEditDeferred = eventResult;
            return eventResult.catch((error) => {
                // Отменяем сохранение, оставляем редактирование открытым, если промис сохранения завершился с
                // ошибкой (провалена валидация на сервере)
                self._endEditDeferred = null;
                self._hideIndicator(indicatorId);
                return constEditing.CANCEL;
            }).then((resultOfDeferred) => {
                self._hideIndicator(indicatorId);

                if (resultOfDeferred === constEditing.CANCEL) {
                    self._endEditDeferred = null;
                    return Promise.resolve({cancelled: true});
                }
                const both = (res) => {
                    self._endEditDeferred = null;
                    _private.afterEndEdit(self, commit);
                    return res;
                };
                return Promise.resolve(resultOfDeferred).then(both).catch(both);
            });
        } else {
            if (eventResult === constEditing.CANCEL) {
                return Promise.resolve({cancelled: true});
            }
            // Если обновление данных на БЛ затягивается, должен появиться индикатор загрузки.
            let indicatorId = self._showIndicator();
            return _private.updateModel(self, commit).finally(() => {
                self._hideIndicator(indicatorId);
            }).then(() => {
                return _private.afterEndEdit(self, commit);
            }).catch(() => {
                return Promise.resolve({cancelled: true});
            });
        }
    },

    afterEndEdit(self: EditInPlace, commit: boolean): void {
        const afterEndEditArgs = [self._isAdd ? self._editingItem : self._originalItem, self._isAdd];

        // При редактировании по месту маркер появляется только если в списке больше одной записи.
        // https://online.sbis.ru/opendoc.html?guid=e3ccd952-cbb1-4587-89b8-a8d78500ba90
        if (self._isAdd && commit && self._options.listViewModel.getCount() > 1) {
            // TODO переделать на marker.Controller, когда этот контрол будет переводиться в контроллер
            self._options.listViewModel.setMarkedKey(self._editingItem.getId());
        }
        if (self._options.useNewModel) {
            self._options.listViewModel.getCollection().acceptChanges();
        } else {
            self._options.listViewModel.acceptChanges();
        }
        _private.resetVariables(self);
        self._setEditingItemData(null);
        // Нотифицировать о событии "После завершения редактирования" нужно после очистки editingItemData,
        // т.к. все остальные контролы проверяют наличие запущенного редактирования именно по ней.
        // Нотификация до очистки приводит к проблемам. Например, в обработчике события afterEndEdit ожидается,
        // что завершено редактирование и можно позвать перезагрузку списка для обновления результатов каждой строки.
        // Однако сам список считает что редактирование еще активно и падает при перезагрузке.
        self._notify('afterEndEdit', afterEndEditArgs);
        self._options.updateItemActions();
    },

    createModel(self: EditInPlace, options: IEditingConfig): Promise<IEditingConfig> {
        return self.getSource().create().then((item) => {
            options.item = item;
            return options;
        }).catch((error: Error) => {
            return _private.processError(self, error);
        });
    },

    updateModel(self: EditInPlace, commit: boolean): Promise<void|Error> {
        if (commit && (self._isAdd || self._editingItem.isChanged())) {
            if (self.getSource()) {
                return self.getSource().update(self._editingItem).then(() => {
                    _private.acceptChanges(self);
                }).catch((error: Error) => {
                    self._isCommitInProcess = false;
                    return _private.processError(self, error);
                });

            }
            _private.acceptChanges(self);
        }

        return Promise.resolve();
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
            self._errorController.show(errorConfig);
            return Promise.reject(error);
        });
    },

    acceptChanges(self: EditInPlace): void {
        if (self._isAdd) {
            if (self._options.useNewModel) {
                self._options.listViewModel.getCollection().append([self._editingItem]);
            } else {
                self._options.listViewModel.appendItems([self._editingItem]);
            }
        } else {
            self._originalItem.merge(self._editingItem);
        }
    },

    resetVariables(self: EditInPlace): void {
        if (self._editingItem) {
            self._editingItem.unsubscribe('onPropertyChange', self._resetValidation);
            self._options.listViewModel.unsubscribe('onCollectionChange', self._updateIndex);
        }
        self._originalItem = null;
        self._editingItem = null;
        self._isAdd = null;
    },

    validate(self: EditInPlace): Promise<any> {
        return self._formController.submit();
    },

    hasParentInItems(item: Model, listViewModel: any): boolean|void {
        // TODO No parents in new model for now for now
        if (!listViewModel['[Controls/_display/Collection']) {
            // @ts-ignore
            return (!!listViewModel._options.parentProperty &&
                // @ts-ignore
                listViewModel.getItemById(item.get(listViewModel._options.parentProperty)));
        }
    },

    editNextRow(self: EditInPlace, editNextRow: boolean, addAnyway: boolean = false): Promise<any> {
        const index = _private.getEditingItemIndex(self, self._editingItem, self._options.listViewModel);
        const editingConfig = self._options.editingConfig || {};

        if (editNextRow) {
            if (!self._isAdd && _private.getNext(self._editingItem, index, self._options.listViewModel)) {
                return self.beginEdit({
                    item: _private.getNext(self._editingItem, index, self._options.listViewModel) as Model
                });
            } else if (addAnyway || editingConfig.autoAdd) {
                return self.beginAdd();
            } else {
                return self.commitEdit();
            }
        } else if (_private.getPrevious(self._editingItem, index, self._options.listViewModel)) {
            return self.beginEdit({
                item: _private.getPrevious(self._editingItem, index, self._options.listViewModel)
            });
        } else {
            return self.commitEdit();
        }
    },

    getNext(editingItem: Model, index: number, listViewModel: any): Model {
        let offset = 1;
        let result;
        let parentId;
        let parentIndex;
        let count;

        if (_private.hasParentInItems(editingItem, listViewModel)) {
            // @ts-ignore
            parentId = editingItem.get(listViewModel._options.parentProperty);
            parentIndex = listViewModel.getIndexBySourceItem(
                // @ts-ignore
                listViewModel.getItemById(parentId, listViewModel._options.keyProperty).getContents()
            );
            // @ts-ignore
            count = parentIndex + listViewModel.getChildren(parentId).length + 1;
        } else {
            count = listViewModel.getCount();
        }

        while (index + offset < count) {
            result = listViewModel.at(index + offset).getContents();
            if (result instanceof entity.Record) {
                return result as Model;
            }
            offset++;
        }
    },

    getPrevious(editingItem: Model, index: number, listViewModel: any): Model {
        let offset = -1;
        let result;
        let parentId;
        let parentIndex;
        let count;

        if (_private.hasParentInItems(editingItem, listViewModel)) {
            // @ts-ignore
            parentId = editingItem.get(listViewModel._options.parentProperty);
            parentIndex = listViewModel.getIndexBySourceItem(
                // @ts-ignore
                listViewModel.getItemById(parentId, listViewModel._options.keyProperty
            ).getContents());
            count = parentIndex + 1;
        } else {
            count = 0;
        }

        while (index + offset >= count) {
            result = listViewModel.at(index + offset).getContents();
            if (result instanceof entity.Record) {
                return result as Model;
            }
            offset--;
        }
    },

    getEditingItemIndex(
        self: EditInPlace,
        editingItem: Model,
        listViewModel: any,
        defaultIndex?: number|undefined
    ): number {
        let index = defaultIndex !== undefined ? defaultIndex : listViewModel.getCount();
        let originalItem;
        let parentId;
        let parentIndex;
        const groupProperty = listViewModel.getGroupProperty();

        // TODO no hasParentInItems for new model at the moment
        if (self._options.useNewModel) {
            originalItem = listViewModel.getItemBySourceKey(editingItem.get(listViewModel.getKeyProperty()));
        } else {
            originalItem = listViewModel.getItemById(
                editingItem.get(listViewModel._options.keyProperty),
                listViewModel._options.keyProperty
            );
        }

        if (originalItem) {
            index = listViewModel.getIndexByKey(originalItem.getContents().getKey());
        } else if (_private.hasParentInItems(editingItem, listViewModel)) {
            parentId = editingItem.get(listViewModel._options.parentProperty);
            parentIndex = listViewModel.getIndexByKey(
                listViewModel.getItemById(
                    parentId,
                    listViewModel._options.keyProperty
                ).getContents().getKey()
            );
            index = parentIndex + (
                defaultIndex !== undefined ? defaultIndex : listViewModel.getDisplayChildrenCount(parentId)
            ) + 1;
        } else if (listViewModel._options.groupingKeyCallback || groupProperty) {
            const groupId = groupProperty ?
                editingItem.get(groupProperty) :
                listViewModel._options.groupingKeyCallback(editingItem);
            const isAddInTop = self._options.editingConfig && self._options.editingConfig.addPosition === 'top';
            index = _private.getItemIndexWithGrouping(listViewModel.getDisplay(), groupId, isAddInTop);
        }

        return index;
    },

    getSequentialEditing(editingConfig: IEditingConfig): boolean {
        // TODO: опция editingConfig.sequentialEditing по умолчанию должна быть true. Но она находится внутри объекта,
        // а при вызове getDefaultOptions объекты не мержатся. Нужно либо на стороне ws делать мерж объектов, либо
        // делать 5 опций на списке, либо вот такой костыль:
        if (editingConfig && typeof editingConfig.sequentialEditing !== 'undefined') {
            return editingConfig.sequentialEditing;
        }
        return true;
    },

    getAddPosition(editingConfig: IEditingConfig): 0 | undefined {
        return editingConfig && editingConfig.addPosition === 'top' && !editingConfig.autoAdd ? 0 : undefined;
    },

    beginEditCallback(self: EditInPlace, newOptions: IEditingConfig): Promise<IEditingConfig> {
        if (newOptions && newOptions.cancelled) {
            return Promise.resolve({cancelled: true});
        }
        return _private.afterBeginEdit(self, newOptions);
    },

    getItemIndexWithGrouping(display: ViewModel<Model>, groupId: string, isAddInTop: boolean): number {
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
    toolbarVisibility?: boolean;
    cancelled?: boolean;
}

export interface IEditingOptions {
    source: any;
    editingConfig?: IEditingConfig;
    keyProperty?: String|number;
    errorController?: typeof dataSourceError;
    listViewModel?: any;
    readOnly?: boolean;
    useNewModel?: boolean;
    multiSelectVisibility?: boolean;
    notify?: any;
    forceUpdate?: Function;
    listView?: any;
    updateItemActions: Function;
    isDestroyed: Function;
    theme: String;
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
    _errorController: any;
    _commitPromise: Promise<any>;
    _options: IEditingOptions;
    _formController: any;
    _sequentialEditing: boolean;
    _editingItemData: any;
    _clickItemInfo: any;
    _pendingInputRenderState: any;
    _isCommitInProcess: boolean;
    _listViewModel: any;
    _loadingIndicatorParams: {
        id: number,
        _globalId: string;
    };

    constructor(options: IEditingOptions = { } as IEditingOptions) {
        this._updateIndex = this._updateIndex.bind(this);
        this._errorController = options.errorController || new dataSourceError.Controller({});
        this._options = options;
        this._resetValidation = this._resetValidation.bind(this);
        this._loadingIndicatorParams = {
            id: 0,
            _globalId: null
        }
    }

    _notify(name: string, args?: any, params?: any): any {
        return this._options.notify(name, args, params);
    }

    createEditingData(
        editingConfig: IEditingConfig,
        listViewModel: any,
        useNewModel: boolean,
        source: any
    ): void {
        if (editingConfig && listViewModel) {
            this._options.listViewModel = listViewModel;
            this._options.editingConfig = editingConfig;
            this._options.useNewModel = useNewModel;
            this._options.source = source;
            if (editingConfig.item) {
                this._editingItem = editingConfig.item;
                this._setEditingItemData(this._editingItem);
                if (!this._isAdd) {
                    if (useNewModel) {
                        this._originalItem = listViewModel.getItemBySourceKey(
                            this._editingItem.get(listViewModel.getKeyProperty())
                        ).getContents();
                    } else {
                        this._originalItem = listViewModel.getItemById(
                            this._editingItem.get(listViewModel._options.keyProperty),
                            listViewModel._options.keyProperty
                        ).getContents();
                    }
                }
            }
        }
        if (useNewModel) {
            displayLib = require('Controls/display');
        }
        this._sequentialEditing = _private.getSequentialEditing(editingConfig);
    }

    registerFormOperation(formController: any): void {
        if (formController && this._formController !== formController) {
            this._formController = formController;
            this._notify('registerFormOperation', [{
                save: this._formOperationHandler.bind(this, true),
                cancel: this._formOperationHandler.bind(this, false),
                isDestroyed: () => this._options.isDestroyed()
            }], {bubbling: true});
        }
    }

    updateViewModel(listViewModel: any): void {
        this._options.listViewModel = listViewModel;
    }

    _formOperationHandler(shouldSave: boolean): Promise<any> {
        if (shouldSave && this._editingItem?.isChanged()) {
            return this.commitEdit();
        } else {
            return this.cancelEdit();
        }
    }

    beginEdit(options: IEditingConfig): Promise<{ cancelled: true } | IEditingConfig> {
        const self = this;
        if (this._editingItem && !this._editingItem.isChanged()) {
            return this.cancelEdit().then(() => {
                return _private.beginEdit(self, options);
            }).then((newOptions) => {
                return _private.beginEditCallback(self, newOptions);
            });
        }

        if (!this._editingItem || !this._editingItem.isEqual(options.item)) {
            return this.commitEdit().then((res) => {
                if (res && res.validationFailed) {
                    return Promise.resolve();
                }
                return _private.beginEdit(self, options).then((newOptions: IEditingConfig) => {
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
                return Promise.resolve();
            }
            return _private.beginEdit(self, options || {}, true).then((newOptions) => {
                if (newOptions && newOptions.cancelled) {
                    return Promise.resolve({cancelled: true});
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
                        return Promise.resolve({validationFailed: true});
                    }
                }
                return _private.endItemEdit(self, true).then((result) => {
                    self._isCommitInProcess = false;
                    return Promise.resolve({validationFailed: result && result.cancelled});
                });
            });
        }

        return self._commitPromise;
    }

    cancelEdit(): Promise<any> {
        const self = this;
        const both = () => {
            return _private.endItemEdit(self, false);
        };
        return this._isCommitInProcess ? this._commitPromise.then(both).catch(both) : _private.endItemEdit(this, false);
    }

    editNextRow(): Promise<any> {
        if (this._isAdd) {
            return _private.editNextRow(
                this,
                true,
                !!this._options.editingConfig && !!this._options.editingConfig.autoAddByApplyButton
            );
        } else if (this._options.editingConfig && !this._sequentialEditing) {
            return this.commitEdit();
        } else {
            return _private.editNextRow(this, true);
        }
    }

    beginEditByClick(e: SyntheticEvent<MouseEvent>, item: Model, originalEvent: MouseEvent): Promise<any> {
        let result;
        if (
            this._options.editingConfig &&
            this._options.editingConfig.editOnClick &&
            !this._options.readOnly &&
            originalEvent.type === 'click' &&
            //событие onclick при даблкике срабатвает два раза, второй раз там item из редактирования по месту
            this._editingItem !== item
        ) {
            if (originalEvent.target.closest('.js-controls-ListView__notEditable')) {
                result = this.commitEdit();
            } else {
                result = this.beginEdit({
                    item
                }).then((result) => {
                    if (result && !result.cancelled) {
                        // TODO KINGO. Заполняем информацию по клику только если редактирование по месту запустилось,
                        // т.к. только в таком случае нужно восстанавливать курсор по координатам клика
                        // (в _afterUpdate).
                        this._clickItemInfo = {
                            clientX: originalEvent.nativeEvent.clientX,
                            clientY: originalEvent.nativeEvent.clientY,
                            item
                        };

                        this._pendingInputRenderState = PendingInputRenderState.PendingRender;

                        // После старта редактирования нужно установить фокус на поле ввода, каретку под курсор.
                        // Старт редактирования может быть асинхронным (если из события beforeBeginEdit вернулся Promise)
                        // и колбек отстреляет после EditInPlace._afterUpdate.
                        // Необходимо запустить еще одно обновление, в котором гарантировано будет отрисовано поле ввода.
                        // Именно в этом обновлении можно проставлять фокус и каретку.
                        // Не должно и не будет работать в случае, если внутри шаблона редактора поле ввода вставляется
                        // через Controls.Container.Async.
                        this._forceUpdate();
                    }
                    return result;
                });
                // The click should not bubble over the editing controller to ensure correct control works.
                // e.c., a click can be processed by the selection controller, which should not occur when starting
                // editing in place.
                // https://online.sbis.ru/opendoc.html?guid=b3254c65-596b-4f89-af0f-c160217ce7a3
                e.stopPropagation();
            }
        }
        return result;
    }

    updateEditingData(options: IEditingOptions): void {
        const hasMultiSelectChanged = this._options.multiSelectVisibility !== options.multiSelectVisibility;
        this._updateOptions(options);
        if (!this._options.readOnly) {
            this._sequentialEditing = _private.getSequentialEditing(options.editingConfig);
            if (this._editingItemData &&
                (
                    hasMultiSelectChanged ||
                    this._options.listViewModel.getEditingItemData() !== this._editingItemData
                )
            ) {
                this._setEditingItemData(this._editingItemData.item);
            }

            if (this._pendingInputRenderState === PendingInputRenderState.PendingRender) {
                // Запустилась синхронизация, по завершению которой будет отрисовано поле ввода
                this._pendingInputRenderState = PendingInputRenderState.Rendering;
            }
        } else if(this._editingItemData) {
            this._setEditingItemData(null);
        }
    }

    prepareHtmlInput(): void {
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

    _setEditingItemData(item: Model): void {
        const listViewModel = this._options.listViewModel;
        const editingConfig = this._options.editingConfig;
        const useNewModel =  this._options.useNewModel;
        if (!item) {
            listViewModel.setEditing(false);
            if (useNewModel) {
                displayLib.EditInPlaceController.endEdit(listViewModel);
            } else {
                listViewModel._setEditingItemData(null);
            }
            listViewModel.unsubscribe('onCollectionChange', this._updateIndex);
            this._editingItemData = null;
            this._editingItem = null;
            return;
        }

        /**
         * This code exists because there's no way to declaratively change editing item, so the users are forced to write something like this:
         * editingItem.set('field', 'value').
         */
        if (this._editingItem && this._editingItem.subscribe) {
            this._editingItem.subscribe('onPropertyChange', this._resetValidation);
        }

        let editingItemProjection;
        if (useNewModel) {
            editingItemProjection = listViewModel.getItemBySourceKey(
                this._editingItem.get(listViewModel.getKeyProperty())
            );
        } else  {
            editingItemProjection = listViewModel.getItemById(
                this._editingItem.get(listViewModel._options.keyProperty),
                listViewModel._options.keyProperty
            );
        }

        if (!editingItemProjection) {
            this._isAdd = true;
            if (useNewModel) {
                editingItemProjection = listViewModel.createItem(item);
            } else {
                editingItemProjection = listViewModel._prepareDisplayItemForAdd(item);
            }
        }

        listViewModel.setEditing(true);
        if (useNewModel) {
            displayLib.EditInPlaceController.beginEdit(listViewModel, item.getId(), item);
        } else {
            this._editingItemData = listViewModel.getItemDataByItem(editingItemProjection);
            this._editingItemData.isEditing = true;
            // TODO Make sure all of this is available in the new model
            if (this._isAdd && _private.hasParentInItems(this._editingItem, listViewModel)) {
                this._editingItemData.level = listViewModel.getItemById(
                    item.get(this._editingItemData.parentProperty)
                ).getLevel() + 1;
            }

            this._editingItemData.item = this._editingItem;
            if (this._isAdd) {
                this._editingItemData.isAdd = this._isAdd;
                this._editingItemData.index = _private.getEditingItemIndex(
                    this,
                    item,
                    listViewModel,
                    _private.getAddPosition(editingConfig)
                );
                this._editingItemData.addPosition = editingConfig && editingConfig.addPosition;
                this._editingItemData.drawActions = editingConfig && editingConfig.toolbarVisibility;
            }

            listViewModel._setEditingItemData(this._editingItemData, useNewModel);
        }

        listViewModel.subscribe('onCollectionChange', this._updateIndex);
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
                this._options.listViewModel,
                _private.getAddPosition(this._options.editingConfig)
            );
        }
    }

    onRowDeactivated(e: SyntheticEvent, eventOptions: any): void {
        if (eventOptions.isTabPressed) {
            _private.editNextRow(this, !eventOptions.isShiftKey);
        }
        e.stopPropagation();
    }

    _showIndicator(): number {
        // Редактирование по месту использует глобальный индикатор загрузки.
        // Если какая либо операция вызвала индикатор и до его закрытия произошла еще одна операция
        // нуждающаяся в индикаторе, не нужно скрывать прошлый и показывать новый, т.к. будет моргание индикатора.
        // Неправильная схема: +1 => -1 => +2 => -2.
        // Правильная схема: +1 => +2 (проигнорировано) => -1 (проигнорировано) => -2 (закрыли 1, вместо 2).
        // Правильным решением будет использовать прошлый. В таком случае, он будет скрыт когда завершится последняя
        // длительная операция.
        if (!this._loadingIndicatorParams.id) {
            this._loadingIndicatorParams._globalId = this._notify('showIndicator', [{}], {bubbling: true});
        }
        return ++this._loadingIndicatorParams.id;
    }

    _hideIndicator(id: number): void {
        // Скрываем индикатор, если завершилась последняя операция, вызвавшая показ индикатора.
        // Более подробное описание в методе EditInPlace._showIndicator.
        if (id === this._loadingIndicatorParams.id) {
            this._notify('hideIndicator', [this._loadingIndicatorParams._globalId], {bubbling: true});
            this._loadingIndicatorParams.id = 0;
            this._loadingIndicatorParams._globalId = null;
        }
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

    getSource(): any {
        return this._options.source;
    }

    shouldShowToolbar(): boolean {
        return !!this._options.editingConfig.toolbarVisibility;
    }

    getEditingItemData(): any {
        return this._editingItemData;
    }

    _updateOptions(options: IEditingOptions): void {
        Object.keys(this._options).forEach((name) => {
            if (options.hasOwnProperty(name)) {
                this._options[name] = options[name];
            }
        });
    }

    static _theme: string[];
}

// @ts-ignore
EditInPlace._private = _private;
EditInPlace._theme = ['Controls/list'];

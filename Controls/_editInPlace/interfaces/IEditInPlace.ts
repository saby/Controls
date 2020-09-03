import {ICollectionEditor, ICollectionEditorOptions} from './ICollectionEditor';
import {TEditableCollectionItem, TEditableItemContents, CONSTANTS} from '../Types';

/**
 * Контроллер занимается запуском и завершением редактирования в коллекции, последовательным
 * редактированием с решением сохранять и изменения в предыдущем.
 * Чтобы удовлетворить все выставленные требования, в контроллере необходимы функции обратного вызова.
 * Только они могут позволить вынести логику редактирования по месту в отдельный контроллер.
 * При последовательном редактировании сначала завершается предыдущее редактирование с отменой или с
 * применением изменений. Это большой кусок логики, который не может прото так висеть в BaseControl.
 * При этом колбеки позволяют встроить любую другую логику, например стрельбу событиями,
 * валидацию, без правки редактирования по месту.
 */
export interface IEditInPlaceOptions extends ICollectionEditorOptions {
    onBeforeBeginEdit: (contents?: TEditableItemContents) => Promise<void | CONSTANTS.CANCEL | TEditableItemContents>;
    onAfterBeginEdit: (contents?: TEditableItemContents) => void;

    onBeforeEndEdit: (contents?: TEditableItemContents) => Promise<void | CONSTANTS.CANCEL>;
    onAfterEndEdit: (contents?: TEditableItemContents) => void;

    sequentialEditing?: boolean;
    autoAdd?: boolean;
}

export interface IEditInPlace extends ICollectionEditor {
    /**
     * Начинает редактирование элемента с указанным контентом.
     * Если подходящего элемента нет или он не был передан, элемент будет создан и начнется его добавление.
     */
    beginEdit(contents?: TEditableItemContents): Promise<TEditableCollectionItem | {cancelled: true}>;

    /**
     * Завершает добавление / редактирование элемента.
     * Редактирование можно завершить с применением внесенных изменений или с отменой.
     */
    endEdit(commit: boolean): Promise<TEditableCollectionItem | {cancelled: true}>;

    /**
     * Продолжает редактирование с автозавершением предыдущего.
     * Может продолжить редактирование/добавление до или после текущего.
     * Также, может запустить на редактирование/добавление переданный элемент.
     */
    beginEditNext(target: 'previous' | 'next' | TEditableItemContents): Promise<TEditableCollectionItem | {cancelled: true}>;
}

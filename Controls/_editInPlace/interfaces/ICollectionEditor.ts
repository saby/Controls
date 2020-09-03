import {TEditableItemContents, TEditableCollection} from '../Types';

export interface ICollectionEditorOptions {
    collection: TEditableCollection;
    addPosition?: 'begin' | 'end';
}

export interface ICollectionEditor {

    /**
     * Нужен чтобы без лишних движений узнавать извне идет сейчас редактирование или добавление.
     */
    isAdd(): boolean;
    isEditing(): boolean;

    /**
     * Обновить опции контроллера.
     */
    updateOptions(options: ICollectionEditorOptions): void;

    /**
     * Начинает редактирование элемента с указанным контентом.
     * Если подходящего элемента нет или он не был передан, элемент будет создан и начнется его добавление.
     */
    beginEdit(contents?: TEditableItemContents): void;

    /**
     * Завершает добавление / редактирование элемента.
     * Редактирование можно завершить с применением внесенных изменений или с отменой.
     */
    endEdit(commit: boolean): void;
}

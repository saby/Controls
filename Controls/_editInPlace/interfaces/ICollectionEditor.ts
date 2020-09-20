import {Record} from 'Types/entity';
import {TEditableCollection} from './Types';

export interface ICollectionEditorOptions {
    collection: TEditableCollection;
    addPosition?: 'begin' | 'end';
}

export interface ICollectionEditor {

    /**
     * Обновить опции контроллера.
     */
    // updateOptions(options: ICollectionEditorOptions): void;

    /**
     * Запускает редактирование элемента коллекции с указанным контентом.
     */
    edit(contents: Record): void;

    /**
     * Добавляет элемент с указанным контентом в коллекцию и запускает его редактирование.
     */
    add(contents: Record): void;

    /**
     * Завершает добавление / редактирование элемента с применением изменений.
     */
    commit(): void;

    /**
     * Завершает добавление / редактирование элемента с отменой изменений.
     */
    cancel(): void;
}

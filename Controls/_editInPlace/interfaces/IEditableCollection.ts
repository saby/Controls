import { Record } from 'Types/entity';
import { TEditableCollectionItem } from './Types';

export interface IEditableCollection {
    // Устанавливает редактируем элемент в коллекцию и дает ей понимание,
    // добавить этот элемент или будет редактироваться существующий
    setEditing(contents: TEditableCollectionItem, isAdd: boolean, addPosition?: 'begin' | 'end'): void;

    // Получить элемент коллекции по элементу данных, нужно для определения, добавляется ли элемент
    getItemBySourceItem(contents: Record): TEditableCollectionItem | undefined;

    // Получить редактируемый элемент. Нужно для событий, совместимости с функционалом старого EIP, да и вцелом
    getEditingItem(): TEditableCollectionItem;
}

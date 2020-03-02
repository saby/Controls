import { Collection } from 'Controls/display';
import { Rpc, PrefetchProxy } from 'Types/source';
// @ts-ignore
import { ListViewModel } from 'Controls/list';
import { relation } from 'Types/entity';
import { TKeySelection as TKey, ISelectionObject as ISelection} from 'Controls/interface/';

/**
 * Интерфейс базового класс стратегий выбора
 */
// параметры hierarchyRelation и keyProperty нужен для поддержки старой модели, с полным переходом на новую они уйдут
interface ISelectionStrategy {
   select(selection: ISelection, keys: TKeys, model?: Collection|ListViewModel, hierarchyRelation?: relation.Hierarchy): ISelection;
   unSelect(selection: ISelection, keys: TKeys, model?: Collection|ListViewModel, hierarchyRelation?: relation.Hierarchy): ISelection;
   getCount(selection: ISelection, model: Collection|ListViewModel, limit: number, hierarchyRelation?: relation.Hierarchy): number|null;
   getSelectionForModel(selection: ISelection, model: Collection|ListViewModel, limit?: number, keyProperty?: string, hierarchyRelation?: relation.Hierarchy): Map<TKey, boolean|null>;
   isAllSelected(selection: ISelection, folderId: Tkey, model?: Collection|ListViewModel, hierarchyRelation?: relation.Hierarchy): boolean;
}

export default ISelectionStrategy;

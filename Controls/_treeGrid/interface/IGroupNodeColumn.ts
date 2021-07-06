import {IColumn} from 'Controls/grid';
import {IBaseGroupTemplate} from 'Controls/baseList';

/**
 * Интерфейс колонки списка с иерархической группировкой.
 * @interface Controls/_treeGrid/interface/IGroupNodeColumn
 *
 * @public
 * @author Аверкиев П.А.
 */
export interface IGroupNodeColumn extends IColumn {
    /**
     * Конфигурация шаблона группы для текущей колонки
     * @description
     * Если конфигурация указана, то для узлов, у которых в {@link Controls/_treeGrid/interface/ITreeGrid#nodeTypeProperty nodeTypeProperty} содержится значение 'group',
     * содержимое колонки будет выведено с использованием шаблона группы.
     * Если конфигурация не указана, то содержимое колонки будет выведено с использовыаанием шаблона, переданного в
     * параметре {@link Controls/grid:IColumn#template template}.
     * В конфигурации поддерживаются все свойства шаблона группы.
     * @example
     *
     * В следующем примере показана конфигурация, которая позволит отобразить узел в виде группы.
     *
     * <pre class="brush: js">
     * class MyControl extends Control<IControlOptions> {
     *
     *     protected _source = new Memory({
     *         keyProperty: 'id',
     *         data: [{
     *             id: 1,
     *             parent: null,
     *             type: true,
     *             nodeType: 'group',
     *             title: 'I am group'
     *         },
     *         {
     *             id: 10,
     *             parent: 1,
     *             type: null,
     *             nodeType: null,
     *             title: 'I am leaf'
     *         }]
     *     })
     *
     *     protected _columns: IGroupNodeColumn[] = [
     *         {
     *             displayProperty: 'title',
     *             groupNodeConfig: {
     *                 textAlign: 'center'
     *             }
     *         }
     *     ]
     * }
     * </pre>
     */
    groupNodeConfig?: IBaseGroupTemplate;
}

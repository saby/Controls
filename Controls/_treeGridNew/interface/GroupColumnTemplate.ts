/**
 * Шаблон, который используется для отображения ячейки заголовка группы в {@link Controls/treeGridNew:View дереве} и {@link Controls/explorer:View иерархическом проводнике}.
 *
 * @class Controls/_treeGridNew/interface/GroupColumnTemplate
 * @mixes Controls/list:IBaseGroupTemplate
 * @author Аверкиев П.А.
 * @remark
 * Шаблон Controls/treeGridNew:GroupColumnTemplate можно использовать для отображения узла дерева в виде заголовка группы. Это может потребоваться в двух случаях:
 * 1) Необходимо отобразить итоги по таблице в строке заголовка группы.
 * 2) Необходимо подгружать данные группы по кнопке "Ещё".
 *
 * В обоих случаях работа с узлом-группой должна быть реализована через {@link Controls/grid:IColumn#template шаблон колонки}.
 * Прикладной программист указывает у списка в опции {@link Controls/_treeGridNew/interface/ITreeGrid#nodeTypeProperty nodeTypeProperty} имя свойства, которое отвечает за отображение узла в виде группы.
 * Для узлов, которые необходимо будет отобразить в виде групп, в этом поле должно лежать значение ‘group’. При любых других значениях запись будет отображена по обычным правилам на основе nodeProperty.
 *
 * Необходимо учесть, что применение данного типа группировки записей не совместимо с обычной группировкой, которая настраивается через groupProperty. Их нельзя использовать вместе.
 *
 * В {@link Controls/grid:IColumn#template шаблон колонки} платформа передаёт item, который реализует интерфейс {@link Controls/display:IGroupNode}.
 * При помощи метода isGroupNode() можно определить, что текущий item является узлом-группой.
 *
 * Для первого случая существует два основных варианта использования шаблона Controls/treeGridNew:GroupColumnTemplate.
 *  Вариант 1. Текст заголовка группы выровнен автоматически по центру заголовка:
 *  В этом случае необходимо использовать Controls/treeGridNew:GroupColumnTemplate только в первом столбце.
 *
 *  В {@link Controls/_grid/interface/IGridControl#colspanCallback colspanCallback} для первого столбца группы необходимо вернуть количество колонок, которое он должен занимать.
 *  В опции {@link Controls/grid:IColumn#template template} шаблона колонки добавить условие, позволяющее выбрать на основе item.isGroupNode() шаблон колонки: {@link Controls/gridNew:ColumnTemplate} или Controls/treeGridNew:GroupColumnTemplate.
 *  В шаблон Controls/treeGridNew:GroupColumnTemplate передать необходимые опции (Полностью соответствуют {@link Controls/list:IBaseGroupTemplate}).
 *
 *  Вариант 2. Текст заголовка группы необходимо выровнять относительно столбца
 *  В этом случае необходимо использовать Controls/treeGridNew:GroupColumnTemplate в первом и следующем (с учётом colspan) столбце. Это необходимо для того, чтобы слева и справа от текста ,выровненного относительно колонки были отрисованы разделители.
 *
 *  В {@link Controls/_grid/interface/IGridControl#colspanCallback colspanCallback} для первого столбца группы необходимо вернуть количество колонок, которое должна занимать только его левая часть вместе с текстом и экспандером.
 *  В опции {@link Controls/grid:IColumn#template template} шаблона колонки добавить условие, позволяющее выбрать на основе item.isGroupNode() шаблон колонки: {@link Controls/gridNew:ColumnTemplate} или Controls/treeGridNew:GroupColumnTemplate.
 *  Для первого столбца передать в шаблон Controls/treeGridNew:GroupColumnTemplate textAlign=right, и другие необходимые опции (Полностью соответствуют {@link Controls/list:IBaseGroupTemplate}).
 *  Для следующего (с учётом colspan) столбца передать в шаблон Controls/treeGridNew:GroupColumnTemplate textVisible=false.
 *  Замечание: В этом случае порядок стобцов играет важное значение. В случае, если в первом и следующем за ним столбцах будет скрыт текст, то между разделителями будет присутствовать пустое место.
 *
 * @example
 *
 * В следующем примере показано, как отобразить узел в виде группы.
 *
 * <pre class="brush: js">
 * class MyControl extends Control<IControlOptions> {
 *     protected _colspanCallback(item: Model, column, columnIndex: number, isEditing: boolean): TColspanCallbackResult {
 *         if (item.get(NODE_TYPE_PROPERTY) === 'group' && columnIndex === 0) {
 *             return 2;
 *         }
 *         return 1;
 *     }
 * }
 * </pre>
 *
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.treeGridNew:View
 *    colspanCallback={{_colspanCallback}}
 *    nodeTypeProperty="customNodeType">
 *    <ws:columns>
 *       <ws:Array>
 *           <ws:Object displayProperty="title" width="300px">
 *               <ws:template>
 *                   <ws:if data="{{ template.item.isGroupNode() }}">
 *                       <ws:partial template="Controls/treeGridNew:GroupColumnTemplate"/>
 *                   </ws:if>
 *                   <ws:else>
 *                       <ws:partial template="Controls/gridNew:ColumnTemplate"/>
 *                   </ws:else>
 *               </ws:template>
 *           </ws:Object>
 *           <ws:Object displayProperty="date" width="150px"/>
 *           <ws:Object displayProperty="name" width="150px"/>
 *           <ws:Object displayProperty="price" width="150px"/>
 *           <ws:Object displayProperty="tax" width="150px"/>
 *       </ws:Array>
 *   </ws:columns>
 * </Controls.treeGridNew:View>
 * </pre>
 *
 * В следующем примере показано, как в шаблоне настроить выравнивание текста заголовка группы относительно колонки
 *
 * <pre class="brush: js">
 * class MyControl extends Control<IControlOptions> {
 *     protected _colspanCallback(item: Model, column, columnIndex: number, isEditing: boolean): TColspanCallbackResult {
 *         if (item.get(NODE_TYPE_PROPERTY) === 'group' && columnIndex === 0) {
 *             return 2;
 *         }
 *         return 1;
 *     }
 * }
 * </pre>
 *
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.treeGridNew:View
 *    colspanCallback={{_colspanCallback}}
 *    nodeTypeProperty="customNodeType">
 *    <ws:columns>
 *       <ws:Array>
 *           <ws:Object displayProperty="title" width="300px">
 *               <ws:template>
 *                   <ws:if data="{{ template.item.isGroupNode() }}">
 *                       <ws:partial template="Controls/treeGridNew:GroupColumnTemplate"
 *                                   textAlign="right"/>
 *                   </ws:if>
 *                   <ws:else>
 *                       <ws:partial template="Controls/gridNew:ColumnTemplate"/>
 *                   </ws:else>
 *               </ws:template>
 *           </ws:Object>
 *           <ws:Object displayProperty="date" width="150px"/>
 *           <ws:Object displayProperty="name" width="150px">
 *               <ws:template>
 *                   <ws:if data="{{ template.item.isGroupNode() }}">
 *                       <ws:partial template="Controls/treeGridNew:GroupColumnTemplate"
 *                                   textVisible="{{false}}"/>
 *                   </ws:if>
 *                   <ws:else>
 *                       <ws:partial template="Controls/gridNew:ColumnTemplate"/>
 *                   </ws:else>
 *               </ws:template>
 *           </ws:Object>
 *           <ws:Object displayProperty="price" width="150px"/>
 *           <ws:Object displayProperty="tax" width="150px"/>
 *       </ws:Array>
 *   </ws:columns>
 * </Controls.treeGridNew:View>
 * </pre>
 * @public
 */

export interface IHierarchyOptions {
    nodeProperty?: string;
    parentProperty?: string;
}

/**
 * Интерфейс иерархических списков.
 *
 * @interface Controls/_interface/IHierarchy
 * @public
 * @author Авраменко А.С.
 */

/*
 * Interface for hierarchical lists.
 *
 * @interface Controls/_interface/IHierarchy
 * @public
 * @author Авраменко А.С.
 */
export default interface IHierarchy {
    readonly '[Controls/_interface/IHierarchy]': boolean;
}

/**
 * @name Controls/_interface/IHierarchy#nodeProperty
 * @cfg {String} Имя свойства, содержащего информацию о {@link /doc/platform/developmentapl/service-development/bd-development/vocabl/tabl/relations/#hierarchy типе элемента} (лист, узел, скрытый узел).
 * @example
 * В данном примере элемент с id: 4 является родителем для элементов с id: 5, 6, 7.
 * TMPL:
 * <pre>
 *    <Controls.treeGrid:View
 *       keyProperty="id"
 *       source="{{_source}}"
 *       parentProperty="parent"
 *       nodeProperty="parent@"/>
 * </pre>
 * JS:
 * <pre>
 *    this._source = new Memory({
 *       data: [
 *           { id: 1, title: 'Task in development', parent: null, 'parent@': false },
 *           { id: 2, title: 'Error in development', parent: null, 'parent@': false },
 *           { id: 3, title: 'Application', parent: null, 'parent@': false },
 *           { id: 4, title: 'Assignment', parent: null, 'parent@': true },
 *           { id: 5, title: 'Assignment for accounting', parent: 4, 'parent@': false },
 *           { id: 6, title: 'Assignment for delivery', parent: 4, 'parent@': false },
 *           { id: 7, title: 'Assignment for logisticians', parent: 4, 'parent@': false }
 *       ],
 *       keyProperty: 'id'
 *    });
 * </pre>
 */

/*
 * @name Controls/_interface/IHierarchy#nodeProperty
 * @cfg {String} Имя свойства, содержащего информацию о типе элемента (лист, узел, скрытый узел).
 * @example
 * In this example, item with id: 4 is parent for items with id: 5, 6, 7.
 * TMPL:
 * <pre>
 *    <Controls.treeGrid:View
 *       keyProperty="id"
 *       source="{{_source}}"
 *       parentProperty="parent"
 *       nodeProperty="parent@"/>
 * </pre>
 * JS:
 * <pre>
 *    this._source = new Memory({
 *       data: [
 *           { id: 1, title: 'Task in development', parent: null, 'parent@': false },
 *           { id: 2, title: 'Error in development', parent: null, 'parent@': false },
 *           { id: 3, title: 'Application', parent: null, 'parent@': false },
 *           { id: 4, title: 'Assignment', parent: null, 'parent@': true },
 *           { id: 5, title: 'Assignment for accounting', parent: 4, 'parent@': false },
 *           { id: 6, title: 'Assignment for delivery', parent: 4, 'parent@': false },
 *           { id: 7, title: 'Assignment for logisticians', parent: 4, 'parent@': false }
 *       ],
 *       keyProperty: 'id'
 *    });
 * </pre>
 */

/**
 * @name Controls/_interface/IHierarchy#parentProperty
 * @cfg {String} Имя свойства, содержащего информацию о родительском узле элемента.
 * @example
 * В данном примере элемент с id: 4 является родителем для элементов с id: 5, 6, 7.
 * TMPL:
 * <pre>
 *    <Controls.treeGrid:View
 *       keyProperty="id"
 *       source="{{_source}}"
 *       parentProperty="parent"
 *       nodeProperty="parent@"/>
 * </pre>
 * JS:
 * <pre>
 *    this._source = new Memory({
 *       data: [
 *           { id: 1, title: 'Task in development', parent: null, 'parent@': false },
 *           { id: 2, title: 'Error in development', parent: null, 'parent@': false },
 *           { id: 3, title: 'Application', parent: null, 'parent@': false },
 *           { id: 4, title: 'Assignment', parent: null, 'parent@': true },
 *           { id: 5, title: 'Assignment for accounting', parent: 4, 'parent@': false },
 *           { id: 6, title: 'Assignment for delivery', parent: 4, 'parent@': false },
 *           { id: 7, title: 'Assignment for logisticians', parent: 4, 'parent@': false }
 *       ],
 *       keyProperty: 'id'
 *    });
 * </pre>
 */

/*
 * @name Controls/_interface/IHierarchy#parentProperty
 * @cfg {String} Name of the field that contains information about parent node.
 * @example
 * In this example, item with id: 4 is parent for items with id: 5, 6, 7.
 * TMPL:
 * <pre>
 *    <Controls.treeGrid:View
 *       keyProperty="id"
 *       source="{{_source}}"
 *       parentProperty="parent"
 *       nodeProperty="parent@"/>
 * </pre>
 * JS:
 * <pre>
 *    this._source = new Memory({
 *       data: [
 *           { id: 1, title: 'Task in development', parent: null, 'parent@': false },
 *           { id: 2, title: 'Error in development', parent: null, 'parent@': false },
 *           { id: 3, title: 'Application', parent: null, 'parent@': false },
 *           { id: 4, title: 'Assignment', parent: null, 'parent@': true },
 *           { id: 5, title: 'Assignment for accounting', parent: 4, 'parent@': false },
 *           { id: 6, title: 'Assignment for delivery', parent: 4, 'parent@': false },
 *           { id: 7, title: 'Assignment for logisticians', parent: 4, 'parent@': false }
 *       ],
 *       keyProperty: 'id'
 *    });
 * </pre>
 */


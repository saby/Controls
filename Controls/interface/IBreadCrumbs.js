/* eslint-disable */
define('Controls/interface/IBreadCrumbs', [
], function() {

   /**
    * Интерфейс для хлебных крошек.
    *
    * @interface Controls/interface/IBreadCrumbs
    * @public
    * @author Авраменко А.С.
    */

   /*
    * Interface for breadcrumbs.
    *
    * @interface Controls/interface/IBreadCrumbs
    * @public
    * @author Авраменко А.С.
    */

   /**
    * @name Controls/interface/IBreadCrumbs#items
    * @cfg {Array.<Record>} Массив хлебных крошек.
    */

   /*
    * @name Controls/interface/IBreadCrumbs#items
    * @cfg {Array.<Object>} Array of breadcrumbs to draw.
    */

   /**
    * @name Controls/interface/IBreadCrumbs#keyProperty
    * @cfg {String} Имя свойства, содержащего информацию об идентификаторе текущей строки.
    */

   /*
    * @name Controls/interface/IBreadCrumbs#keyProperty
    * @cfg {String} Name of the item property that uniquely identifies collection item.
    */

   /**
    * @name Controls/interface/IBreadCrumbs#parentProperty
    * @cfg {String} Имя свойства, содержащего сведения о родительском узле.
    */

   /*
    * @name Controls/interface/IBreadCrumbs#parentProperty
    * @cfg {String} Name of the field that contains information about parent node.
    */

   /**
    * @name Controls/interface/IBreadCrumbs#displayProperty
    * @cfg {String} Имя свойства элемента, содержимое которого будет отображаться.
    * @default title
    */

   /*
    * @name Controls/interface/IBreadCrumbs#displayProperty
    * @cfg {String} Name of the item property which content will be displayed.
    * @default title
    */

   /**
    * @event Controls/interface/IBreadCrumbs#itemClick Происходит после клика по хлебным крошкам.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {String} itemId Ключ элемента, по которому произвели клик.
    */

   /*
    * @event Controls/interface/IBreadCrumbs#itemClick Happens after clicking on breadcrumb.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
    * @param {String} itemId Key of the clicked item.
    */

});

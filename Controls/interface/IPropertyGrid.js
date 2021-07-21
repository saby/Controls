/* eslint-disable */
define('Controls/interface/IPropertyGrid', [
], function() {

   /**
    * Интерфейс для просмотра и редактирования свойств объекта.
    * @interface Controls/interface/IPropertyGrid
    * @public
    * @author Герасимов А.М.
    */

   /*
    * Provides a user interface for browsing and editing the properties of an object.
    * @interface Controls/interface/IPropertyGrid
    * @public
    * @author Герасимов А.М.
    */

   /**
    * @typedef {Object} Controls/interface/IPropertyGrid/PropertyGridItems
    * @property {*} value Текущее значение свойства.
    * @property {*} resetValue Значение свойства при сбросе.
    */

   /*
    * @typedef {Object} PropertyGridItems
    * @property {*} value Current property value.
    * @property {*} resetValue Property value for reset.
    */

   /**
    * @name Controls/interface/IPropertyGrid#items
    * @cfg {Controls/interface/IPropertyGrid/PropertyGridItems.typedef} Свойства для редактирования или отображения.
    */

   /*
    * @name Controls/interface/IPropertyGrid#items
    * @cfg {Controls/interface/IPropertyGrid/PropertyGridItems.typedef} Properties for editing or showing.
    */

});

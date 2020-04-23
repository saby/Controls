define("Controls-demo/PropertyGridNew/PropertyGrid",
   [
      "Core/Control",
      "wml!Controls-demo/PropertyGridNew/PropertyGrid",

      'Types/collection',
   ],
   function(Control, template, collection) {
      "use strict";

      var PropertyGrid = Control.extend({
         _template: template,
         _styles: ['Controls-demo/PropertyGridNew/PropertyGrid'],

         _beforeMount: function() {

            this._editingObject = {
               description: 'This is http://mysite.com',
               tileView: true,
               showBackgroundImage: true,
               siteUrl: "http://mysite.com",
               videoSource: "http://youtube.com/video",
               backgroundType: new collection.Enum({
                  dictionary: ['Фоновое изображение', 'Заливка цветом'],
                  index: 0
               })
            };

            this._source = [
               {
                  name: 'description',
                  caption: 'Описание',
                  editorOptions: {
                     minLines: 3
                  },
                  editorClass: 'controls-demo-pg-text-editor',
                  group: 'text',
                  type: 'text'
               },
               {
                  name: "tileView",
                  caption: "Список плиткой",
                  group: "boolean"
               },
               {
                  name: "showBackgroundImage",
                  caption: "Показывать изображение",
                  group: "boolean"
               },
               {
                  caption: "URL",
                  name: "siteUrl",
                  group: "string"
               },
               {
                  caption: "Источник видео",
                  name: "videoSource",
                  group: "string"
               },
               {
                  caption: 'Тип фона',
                  name: 'backgroundType',
                  group: 'enum',
                  editorClass: 'controls-demo-pg-enum-editor'
               },
            ];

            this._editingObjectString = JSON.stringify(this._editingObject, null, 4);
         },

         _editingObjectChanged: function(event, object) {
            this._editingObjectString = JSON.stringify(object, null, 4);
         },
      });

      return PropertyGrid;
   });

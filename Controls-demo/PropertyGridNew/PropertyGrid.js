define('Controls-demo/PropertyGridNew/PropertyGrid',
   [
      'UI/Base',
      'wml!Controls-demo/PropertyGridNew/PropertyGrid',

      'Types/collection',
   ],
   function(Base, template, collection) {
      'use strict';

      var PropertyGrid = Base.Control.extend({
         _template: template,

         _beforeMount: function() {
            this._editingObject = {
               description: 'This is http://mysite.com',
               tileView: true,
               showBackgroundImage: true,
               siteUrl: 'http://mysite.com',
               videoSource: 'http://youtube.com/video',
               backgroundType: new collection.Enum({
                  dictionary: ['Фоновое изображение', 'Заливка цветом'],
                  index: 0
               }),
               alignment: new collection.Enum({
                  dictionary: ['left', 'right', 'center', 'justify'],
                  index: 0
               }),
               decoration: [true, true, false, true],
               count: 750
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
                  name: 'tileView',
                  caption: 'Список плиткой',
                  group: 'boolean'
               },
               {
                  name: 'showBackgroundImage',
                  caption: 'Показывать изображение',
                  group: 'boolean'
               },
               {
                  caption: 'URL',
                  name: 'siteUrl',
                  group: 'string'
               },
               {
                  caption: 'Источник видео',
                  name: 'videoSource',
                  group: 'string'
               },
               {
                  caption: 'Тип фона',
                  name: 'backgroundType',
                  group: 'enum',
                  editorClass: 'controls-demo-pg-enum-editor'
               },
               {
                  name: 'alignment',
                  caption: 'Выравнивание',
                  editorTemplateName: 'Controls/propertyGrid:FlatEnumEditor',
                  group: 'flatEnum',
                  editorOptions: {
                     buttons: [{
                        id: 'left',
                        icon: 'icon-AlignmentLeft',
                        tooltip: 'По левому краю'
                     }, {
                        id: 'center',
                        icon: 'icon-AlignmentCenter',
                        tooltip: 'По центру'
                     }, {
                        id: 'right',
                        icon: 'icon-AlignmentRight',
                        tooltip: 'По правому краю'
                     }, {
                        id: 'justify',
                        icon: 'icon-AlignmentWidth',
                        tooltip: 'По ширине'
                     }]
                  }
               },
               {
                  name: 'decoration',
                  caption: 'Насыщенность и стиль',
                  group: 'booleanGroup',
                  editorTemplateName: 'Controls/propertyGrid:BooleanGroupEditor',
                  editorOptions: {
                     buttons: [{
                        id: 0,
                        tooltip: 'Полужирный',
                        icon: 'icon-Bold'
                     }, {
                        id: 1,
                        tooltip: 'Курсив',
                        icon: 'icon-Italic'
                     }, {
                        id: 2,
                        tooltip: 'Подчеркнутый',
                        icon: 'icon-Underline'
                     }, {
                        id: 3,
                        tooltip: 'Зачёркнутый',
                        icon: 'icon-Stroked'
                     }]
                  }
               },
               {
                  name: 'count',
                  caption: 'Количество',
                  group: 'number',
                  editorOptions: {
                     inputConfig: {
                        useGrouping: false,
                        showEmptyDecimals: false,
                        integersLength: 4,
                        precision: 0,
                        onlyPositive: true
                     }
                  }
               }
            ];

            this._editingObjectString = JSON.stringify(this._editingObject, null, 4);
         },

         _editingObjectChanged: function(event, object) {
            this._editingObjectString = JSON.stringify(object, null, 4);
         },
      });

      PropertyGrid._styles = ['Controls-demo/PropertyGridNew/PropertyGrid'];

      return PropertyGrid;
   });

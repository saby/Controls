import buttonLib = require('Controls/buttons');

   function getIconSize(options) {
      const sizes = ['small', 'medium', 'large'];
      let iconSize;
      if (options.iconSize) {
         switch (options.iconSize) {
            case 's':
               iconSize = sizes[0];
               break;
            case 'm':
               iconSize = sizes[1];
               break;
            case 'l':
               iconSize = sizes[2];
               break;
         }
      } else {
         sizes.forEach(function (size) {
            if (options.icon.indexOf('icon-' + size) !== -1) {
               iconSize = size;
            }
         });
      }
      return iconSize;
   }

   function cssStyleGeneration(options) {
      const currentButtonClass = options.originalOptions ? {} :
          buttonLib.ActualApi.styleToViewMode(options.style);

      // для каждого размера вызывающего элемента создаем класс, который выравнивает popup через margin.
      let offsetClassName = 'controls-MenuButton_' + (currentButtonClass.viewMode || options.viewMode);

      if ((!options.icon || options.viewMode === 'toolButton' || options.viewMode === 'functionalButton')) {
         const currentHeight = options.originalOptions ? options.inlineHeight :
             buttonLib.ActualApi.actualHeight(options.size, options.inlineHeight, options.viewMode) || options.size;
         offsetClassName += ('__' + currentHeight);

      } else if (options.icon) {
         // у кнопки типа 'Ссылка' высота вызывающего элемента зависит от размера иконки,
         // поэтому необходимо это учесть при сдвиге
         offsetClassName += '_iconSize-' + (getIconSize(options) || 'medium');
      }
      offsetClassName += ((!options.headerTemplate && !options.showHeader) ? '_duplicate' : '') + '_popup';
      return offsetClassName;
   }

   export = {
      cssStyleGeneration
   };

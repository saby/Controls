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
      // для каждого размера вызывающего элемента создаем класс, который выравнивает popup через margin.
      let offsetClassName = 'controls-MenuButton_' + options.viewMode;

      if (!options.icon || options.viewMode === 'toolButton' || options.viewMode === 'onlinePageHeader'
          || options.viewMode === 'functionalButton' || options.viewMode === 'linkButton') {
         const currentHeight = options.inlineHeight || options.fontSize;
         offsetClassName += ('__' + currentHeight);

      } else if (options.icon) {
         // у кнопки типа 'Ссылка' высота вызывающего элемента зависит от размера иконки,
         // поэтому необходимо это учесть при сдвиге
         offsetClassName += '_iconSize-' + (getIconSize(options) || 'medium');
      }
      // FIXME https://online.sbis.ru/opendoc.html?guid=d4a7b33b-51ab-4390-9052-4fbfca343fbb
      if (options.viewMode === 'toolButton' && options.icon) {
         offsetClassName += '_iconSize-' + (getIconSize(options) || 'medium');
      }
      if (!options.headerTemplate && !options.showHeader && options.viewMode === 'link') {
         offsetClassName += '_duplicate';
      }
      offsetClassName += '_popup';
      return offsetClassName;
   }

   export = {
      cssStyleGeneration
   };

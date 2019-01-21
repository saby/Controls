import * as IoC from 'Core/IoC';

const deprecatedClassesOfButton = {
   iconButtonBordered: {
      style: 'secondary',
      type: 'toolButton'
   },

   linkMain: {
      style: 'secondary',
      type: 'link'
   },
   linkMain2: {
      style: 'info',
      type: 'link'
   },
   linkMain3: {
      style: 'info',
      type: 'link'
   },
   linkAdditional: {
      style: 'info',
      type: 'link'
   },
   linkAdditional2: {
      style: 'default',
      type: 'link'
   },

   linkAdditional3: {
      style: 'danger',
      type: 'link'
   },

   linkAdditional4: {
      style: 'success',
      type: 'link'
   },

   linkAdditional5: {
      style: 'magic',
      type: 'link'
   },

   buttonPrimary: {
      style: 'primary',
      type: 'button'
   },

   buttonDefault: {
      style: 'secondary',
      type: 'button'
   },

   buttonAdd: {
      style: 'primary',
      type: 'button'
   }
};

interface ButtonClass {
   viewMode: string;
   style: string;
   buttonAdd: boolean;
}

export default {
   /**
    * Получить текущий стиль кнопки
    * @param {String} style
    * @returns {ButtonClass}
    */
   getCurrentButtonClass: function (style) {
      const currentButtonClass: ButtonClass = {
         viewMode: '',
         style: '',
         buttonAdd: false
      };
      if (deprecatedClassesOfButton.hasOwnProperty(style)) {
         currentButtonClass.viewMode = deprecatedClassesOfButton[style].type;
         currentButtonClass.style = deprecatedClassesOfButton[style].style;
         if (style === 'linkMain2' || style === 'linkMain3') {
            IoC.resolve('ILogger').warn('Button', 'Используются устаревшие стили. Используйте компонент Controls/Label c опцией underline: hovered и fixed');
         } else if (style === 'buttonAdd') {
            currentButtonClass.buttonAdd = true;
            IoC.resolve('ILogger').warn('Button', 'Используются устаревшие стили. Используйте опцию iconStyle в различных значениях для изменения по наведению');
         } else {
            IoC.resolve('ILogger').warn('Button', 'Используются устаревшие стили. Используйте опции: viewMode = ' + currentButtonClass.viewMode + ', style = ' + currentButtonClass.style);
         }
      }
      return currentButtonClass;
   }
};

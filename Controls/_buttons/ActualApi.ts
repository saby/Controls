import {Logger} from 'UI/Utils';
import {constants} from 'Env/Env';

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
const _iconRegExp: RegExp = new RegExp('icon-(large|small|medium|default|16|24|32)\\b');

interface IButtonClass {
   viewMode: string;
   style: string;
   buttonAdd: boolean;
}

interface IViewModeAndContrast {
   viewMode?: string;
   contrast?: boolean;
}

interface IViewModeAndHeight {
   height: string;
   viewMode: string;
}

const ActualApi = {
   /**
    * Получить текущий стиль кнопки
    * @param {String} style
    * @returns {ButtonClass}
    */
   styleToViewMode(style: string): IButtonClass {
      const currentButtonClass: IButtonClass = {
         viewMode: '',
         style: '',
         buttonAdd: false
      };
      if (deprecatedClassesOfButton.hasOwnProperty(style)) {
          Logger.warn('Button: Используются устаревшие стили (style = ' + style + ')');
         currentButtonClass.viewMode = deprecatedClassesOfButton[style].type;
         currentButtonClass.style = deprecatedClassesOfButton[style].style;
         if (style === 'linkMain2' || style === 'linkMain3') {
             Logger.warn('Button: Используются устаревшие стили. Используйте компонент Controls/Label c опцией underline: hovered и fixed');
         } else if (style === 'buttonAdd') {
            currentButtonClass.buttonAdd = true;
             Logger.warn('Button: Используются устаревшие стили. Используйте опцию iconStyle в различных значениях для изменения по наведению');
         } else {
             Logger.warn('Button: Используются устаревшие стили. Используйте опции: viewMode = ' + currentButtonClass.viewMode + ', style = ' + currentButtonClass.style);
         }
      }
      return currentButtonClass;
   },
   /**
    * Перевести iconStyle из старых обозначений в новые.
    * @param {String} iconStyle
    * @param {String} warnFlag
    * @returns {Object}
    */
   iconStyleTransformation(iconStyle: string, warnFlag: boolean): string {
      let newIconStyle;
      switch (iconStyle) {
         case 'attention':
            newIconStyle = 'warning';
            if (warnFlag) {
                Logger.warn('Button: Используется устаревшее значение опции iconStyle. Используйте значение warning вместо attention');
            }
            break;
         case 'done':
            newIconStyle = 'success';
            if (warnFlag) {
                Logger.warn('Button: Используется устаревшее значение опции iconStyle. Используйте значение success виесто done');
            }
            break;
         case 'error':
            newIconStyle = 'danger';
            if (warnFlag) {
                Logger.warn('Button: Используется устаревшее значение опции iconStyle. Используйте значение danger вместо error');
            }
            break;
         default:
            newIconStyle = iconStyle;
            break;
      }
      return newIconStyle;
   },

   // TODO: убрать когда полностью откажемся от поддержки задавания цвета в опции иконки. icon: icon-error, icon-done и т.д.
   // TODO: https://online.sbis.ru/opendoc.html?guid=05bbeb41-d353-4675-9f73-6bfc654a5f00
   iconColorFromOptIconToIconStyle: function (icon) {
      const iconStyleFromIconOpt = /icon-[eadhp][a-z]+/.exec(icon);
      let newIconStyle = '';
      if (iconStyleFromIconOpt) {
         newIconStyle = iconStyleFromIconOpt[0].replace('icon-', '');

         // не будем возвращать primary так как он эквивалентен secondary, который будет по умолчанию. этим избавляемся
         // от коллизии с тем что iconStyle primary есть и в старом варианте и в новом, но их значения не эквивалентны
         return (newIconStyle === 'primary' ? '' : newIconStyle);
      }
      return '';
   },
   itemsSetOldIconStyle: function(items) {
      items.forEach((item) => {
         if (item.get('icon') && !item.get('iconStyle')) {
            const newIconStyle = this.iconColorFromOptIconToIconStyle(item.get('icon'));
            if (newIconStyle) {
               item.set('iconStyle', newIconStyle);
            }
         }
      });
   },
   contrastBackground(options, hasMsg: boolean = false): boolean {
      if (typeof options.contrastBackground !== 'undefined') {
         return options.contrastBackground;
      } else {
         if (typeof options.transparent !== 'undefined') {
            if (hasMsg && constants.isBrowserPlatform) {
               Logger.error('Используется устаревшая опция transparent". ' +
                   `нужно использовать contrastBackground="${!options.transparent}" ` +
                   'https://online.sbis.ru/news/1e959ad8-7553-4e56-8627-b08d80305422.');
            }
            return !options.transparent;
         } else {
            return false;
         }
      }
   },
   buttonStyle(calcStyle: string, optionStyle: string, optionButtonStyle: string, optionReadonly: boolean, hasMsg: boolean = false): string {
      if (optionReadonly) {
         return 'readonly';
      } else if (optionButtonStyle) {
         return optionButtonStyle;
      } else {
         if (optionStyle && hasMsg && constants.isBrowserPlatform) {
            Logger.error('Используется устаревшая опция style". ' +
                `нужно использовать buttonStyle="${optionStyle}" ` +
                'https://online.sbis.ru/news/1e959ad8-7553-4e56-8627-b08d80305422.');
         }
         if (calcStyle) {
            return calcStyle;
         } else {
            if (typeof optionStyle !== 'undefined') {
               return optionStyle;
            } else {
               return 'secondary';
            }
         }
      }
   },
   fontColorStyle(calcStyle: string, calcViewMode: string, optionFontColorStyle: string): string {
      if (optionFontColorStyle) {
         return optionFontColorStyle;
      } else {
         // для ссылок старое значение опции style влияло на цвет текста
         if (calcViewMode === 'link') {
            switch (calcStyle) {
               case 'primary': return 'link';
               case 'success': return 'success';
               case 'danger': return 'danger';
               case 'warning': return 'warning';
               case 'info': return 'unaccented';
               case 'secondary': return 'link';
               case 'default': return 'default';
               case undefined: return 'link';
            }
         }
      }
   },
   iconSize(iconSize: string, icon: string): string {
      if (iconSize) {
         return iconSize;
      } else {
         if (_iconRegExp.exec(icon)) {
            switch (RegExp.$1) {
               case '16': return 's';
               case '24': return 'm';
               case '32': return 'l';
               case 'small': return 's';
               case 'medium': return 'm';
               case 'large': return 'l';
               default: return '';
            }
         } else {
            return 'm';
         }
      }
   },
   iconStyle(iconStyle: string, icon: string, readonly: boolean, buttonAdd: boolean): string {
      if (readonly) {
         return 'readonly';
      } else if (buttonAdd) {
         return 'default';
      } else {
         if (iconStyle) {
            return this.iconStyleTransformation(iconStyle, true);
         } else {
            return this.iconStyleTransformation(this.iconColorFromOptIconToIconStyle(icon));
         }
      }
   },
   fontSize(options: unknown, hasMsg: boolean = false): string {
      if (options.fontSize) {
         return options.fontSize;
      } else {
         if (typeof(options.size) !== 'undefined') {
            let result;
            if (options.viewMode === 'button') {
               // кнопки l размера имеют шрифт xl в теме
               if (options.size === 'l') {
                  result = 'xl';
               } else {
                  result = 'm';
               }
            } else if (options.viewMode === 'link'){
               // для ссылок все сложнее
               switch (options.size) {
                  case 's':
                     result = 'xs';
                     break;
                  case 'l':
                     result = 'l';
                     break;
                  case 'xl':
                     result = '3xl';
                     break;
               }
            }
            if (hasMsg && constants.isBrowserPlatform) {
               Logger.error('Используется устаревшая опция size". ' +
                   `нужно использовать fontSize="${result}" ` +
                   'https://online.sbis.ru/news/1e959ad8-7553-4e56-8627-b08d80305422.');
            }
            return result || 'm';
         } else {
            return 'm'
         }
      }
   },

   viewMode(calcViewMode: string, optViewMode: string): IViewModeAndContrast {
      let resViewMode: string;
      let resContrast: boolean;
      resViewMode = calcViewMode ? calcViewMode : optViewMode;

      if (resViewMode === 'transparentQuickButton' || resViewMode === 'quickButton') {
         resContrast = resViewMode !== 'transparentQuickButton';
         resViewMode = 'toolButton';
         Logger.warn('Button: В кнопке используется viewMode = quickButton, transparentQuickButton используйте значение опции viewMode toolButton и опцию contrastBackground');
      }

      return {
         viewMode: resViewMode,
         contrast: resContrast
      };
   },

   actualHeight(optionSize: string, optionHeight: string, viewMode: string, hasMsg: boolean = false): string {
      if (optionHeight) {
         return optionHeight;
      } else {
         let height = 'default';
         if (viewMode === 'button') {
            switch (optionSize) {
               case 's': height = 'default'; break;
               case 'm': height = 'm'; break;
               case 'l': height = '2xl'; break;
               default: height = 'default';
            }
         } else if (viewMode === 'toolButton' || viewMode === 'pushButton' || viewMode === 'functionalButton') {
            switch (optionSize) {
               case 's': height = 'default'; break;
               case 'm': height = 'l'; break;
               case 'l': height = 'xl'; break;
               default: height = 'l';
            }
         } else {
            height = undefined;
         }
         if (hasMsg && optionSize && constants.isBrowserPlatform) {
            Logger.error('Используется устаревшая опция size". ' +
                `нужно использовать inlineHeight="${height}" ` +
                'https://online.sbis.ru/news/1e959ad8-7553-4e56-8627-b08d80305422.');
         }
         return height;
      }
   },

   actualLinkButton(viewMode: string, height: string): IViewModeAndHeight {
      return {
         viewMode: 'link',
         height: height ? height : 'default'
      };
   }
};
export default ActualApi;

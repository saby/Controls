import {TemplateFunction} from 'UI/Base';

type TComparator = (field1, field2) => boolean;

// todo: removed by task https://online.sbis.ru/opendoc.html?guid=728d200e-ff93-4701-832c-93aad5600ced
function isEqual(obj1: unknown[], obj2: unknown[], fieldsOptions: Record<string, TComparator>) {
   if ((!obj1 && obj2) || (obj1 && !obj2)) {
      return false;
   }
   if (!obj1 && !obj2) {
      return true;
   }
   if (obj1.length !== obj2.length) {
      return false;
   }
   for (var i = 0; i < obj1.length; i++) {
      const props = [];
      for (const field1 in obj1[i]) {
         props.push(field1);
      }
      for (const field2 in obj2[i]) {
         if (props.indexOf(field2) === -1) {
            props.push(field2);
         }
      }
      for (const j of props) {
         const shouldSkip = fieldsOptions[j] instanceof Function ? fieldsOptions[j](obj1[i][j], obj2[i][j]) === true : false;
         if ((!shouldSkip || !(obj1[i][j] instanceof Object)) && (obj1[i].hasOwnProperty(j) || obj2[i].hasOwnProperty(j))) {
            if (obj1[i][j] !== obj2[i][j]) {
                return false;
            }
         }
      }
   }
   return true;
}

// Рекурсивное сравнивание двух объектов.
// В отличае от функции выше isEqual работает с любым объектом вглубь.
// TODO: Удалить по задаче https://online.sbis.ru/opendoc.html?guid=728d200e-ff93-4701-832c-93aad5600ced
// Добавлено по https://online.sbis.ru/opendoc.html?guid=41146435-3ab8-4b73-98da-584808a4d980
function isEqualObjects(x, y, comparators: Record<string, (x, y) => boolean> = {}) {
      if ( x === y ) return true;

      if ( ! ( x instanceof Object ) || ! ( y instanceof Object ) ) return false;

      if ( x.constructor !== y.constructor ) return false;

      for ( var p in x ) {
         if ( ! x.hasOwnProperty( p ) ) continue;

         if ( ! y.hasOwnProperty( p ) ) return false;

         if (p in comparators) {
            if(comparators[p](x[p], y[p]) === false) {
               return false;
            }
         } else {
            if ( x[ p ] === y[ p ] ) continue;

            if ( typeof( x[ p ] ) !== "object" ) return false;

            if ( !isEqualObjects( x[ p ],  y[ p ] ) ) return false;
         }
      }

      for ( p in y ) {
         if ( y.hasOwnProperty( p ) && ! x.hasOwnProperty( p ) ) return false;
      }
      return true;
}

/**
 * Сравнивает две шаблонные опции Wasaby шаблона. Проверяет все опции, от которых зависит шаблон, аналогично проверке синхронизатора.
 * @param oldTemplate Стары
 * @param newTemplate
 * @param flatComparator
 */
function isEqualTemplates(oldTemplate: TemplateFunction, newTemplate: TemplateFunction, flatComparator?: (oldValue, newValue) => boolean): boolean {
   // @ts-ignore
   const isWasabyTemplate = (tmpl) => tmpl instanceof Array && tmpl.isWasabyTemplate;

   const isOldOptionIsTemplate = isWasabyTemplate(oldTemplate);
   const isNewOptionIsTemplate = isWasabyTemplate(newTemplate);

   if (isOldOptionIsTemplate !== isNewOptionIsTemplate) {
      return false;
   } else if (!isOldOptionIsTemplate) {
      if (flatComparator) {
         return flatComparator(oldTemplate, newTemplate);
      } else {
         return oldTemplate === newTemplate
      }
   } else {
      if (oldTemplate.length !== newTemplate.length) {
         return false;
      }
      for (let tmplIndex = 0; tmplIndex < oldTemplate.length; tmplIndex++) {
         const oldInternalKeys = Object.keys(oldTemplate[tmplIndex].internal);
         const newInternalKeys = Object.keys(newTemplate[tmplIndex].internal);
         if (oldInternalKeys.length !== newInternalKeys.length) {
            return false;
         }

         for (let dcvIndex = 0; dcvIndex < oldInternalKeys.length; dcvIndex++) {
            if (!isEqualTemplates(
                oldTemplate[tmplIndex].internal[oldInternalKeys[dcvIndex]],
                newTemplate[tmplIndex].internal[newInternalKeys[dcvIndex]]
            )) {
               return false;
            }
         }

         return true;
      }
   }
}

/**
 * Функция выполняет глубокое сравнивание двух объектов, пропуская поля с заданными названиями.
 * @param obj1 Первый сравниваемый объект
 * @param obj2 Второй сравниваемый объект
 * @param fieldsOptions Объект с названиями полей, которые не должны учавствовать в сравнении.
 */
function isEqualWithSkip(obj1: object, obj2: object, fieldsOptions?: Record<string, true>) {
   const _fieldsOptions = {};
   if (fieldsOptions) {
      Object.keys(fieldsOptions).forEach((key) => {
         _fieldsOptions[key] = () => true;
      })
   }

   return isEqual(obj1, obj2, _fieldsOptions)
}

export {
   isEqual,
   isEqualWithSkip,
   isEqualTemplates,
   isEqualObjects
};

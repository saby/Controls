import {descriptor} from 'Types/entity';

export function getOptionTypes() {
   return {
      displayProperty: descriptor(String).required(),
      searchParam: descriptor(String).required()
   };
};

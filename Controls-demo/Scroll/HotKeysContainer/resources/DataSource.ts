function getData(limit: number): Array<{
   id: number,
   title: string,
   description: string,
   byDemand?: 'Popular' | 'Unpopular' | 'Hit!',
   tplPath?: string,
   cursor?: 'default' | 'pointer',
   hovered?: boolean
   value?: string
}> {
   const resultArray = [];
   for (let index = 0; index < limit; index++) {
      resultArray.push(
         {
            id: index,
            title: `Элемент ${index}`,
            description: `Элемент ${index}`,
            hovered: false,
            value: 'cursor - default, hovered - false'
         });
   }
   return resultArray;
}

export {
   getData
};

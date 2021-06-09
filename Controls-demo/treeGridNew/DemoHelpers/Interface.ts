export interface IData {
   key: number;
   parent?: null | number;
   'parent@'?: null | Boolean;
   title: string;
   Раздел?: null | number;
   'Раздел@'?: null | boolean;
   Раздел$?: null | boolean;
   hasChild?: boolean;
   rating?: number | string;
   country?: string;
   type?: boolean | null;
   photo?: string;
   modelId?: string;
   size?: string;
   year?: string;
   note?: string;
   nodeType?: boolean | null;
   subtask?: boolean;
}

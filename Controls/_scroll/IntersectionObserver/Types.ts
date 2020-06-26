import {IControlOptions} from "UI/Base";

export interface IIntersectionObserverObject {
   instId: string;
   observerName: string;
   element: HTMLElement;
   threshold: number[];
   rootMargin: string;
   data: any;
   handler: Function
}

export interface IIntersectionObserverOptions {
   observerName: string;
   threshold: number[];
   rootMargin: string;
}

export interface IEdgeIntersectionObserverOptions extends IControlOptions {
    topOffset: number;
    bottomOffset: number;
}
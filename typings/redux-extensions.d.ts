import * as Redux from 'redux';

declare module 'redux' {
  export interface Middleware<T=any> {
    <S>(api: MiddlewareAPI<S>): (next: Dispatch<S>) => Dispatch<S>;
    (api: MiddlewareAPI<T>): (next: Dispatch<T>) => Dispatch<T>;
  }
}

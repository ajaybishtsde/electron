import * as React from 'react';

declare module 'react' {
    interface DOMAttributes<T> {
        onClick?: React.EventHandler<React.TouchEvent<T>>;
    }
}
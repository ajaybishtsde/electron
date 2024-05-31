/* tslint:disable no-unused-expression */
import { expect } from 'chai';

import { toUri } from './host';

describe('./host', () => {
    it('toUri adds ryver.com', () => {
        expect(toUri('sample')).to.eq('https://sample.ryver.com/');
    });
});

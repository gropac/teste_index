const { obterMaxMin } = require('../utils');

describe('obterMaxMin', () => {
    test('returns {max: 0, min: 0} for empty array', () => {
        expect(obterMaxMin([])).toEqual({ max: 0, min: 0 });
    });

    test('returns {max: 0, min: 0} for array with only nulls and NaNs', () => {
        expect(obterMaxMin([null, NaN, null])).toEqual({ max: 0, min: 0 });
    });

    test('calculates min and max correctly for typical arrays', () => {
        expect(obterMaxMin([10, 20, 30])).toEqual({ max: 30, min: 10 });
        expect(obterMaxMin([-5, 0, 5])).toEqual({ max: 5, min: -5 });
        expect(obterMaxMin([1.5, 2.5, 3.5])).toEqual({ max: 3.5, min: 1.5 });
    });

    test('ignores nulls and NaNs in typical arrays', () => {
        expect(obterMaxMin([10, null, 20, NaN, 30])).toEqual({ max: 30, min: 10 });
    });
});

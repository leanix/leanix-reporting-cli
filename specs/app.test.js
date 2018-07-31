const {defaults} = require('jest-config');
console.log(defaults);

const app = require('../lib/app');
console.log(app);

test('can perform quick maths', () => {
    expect(2 + 2 - 1).toBe(3);
});
var rollup = require('rollup');
var babel = require('rollup-plugin-babel');
var nodeResolver = require('rollup-plugin-node-resolve');
var commonjs = require('rollup-plugin-commonjs');

var fs = require('fs');

rollup.rollup({
    entry: '../src/coach.js',
    plugins: [
        babel({
            exclude: '../node_modules/**',
            runtimeHelpers: true,
        }),
        commonjs(),
        nodeResolver({ jsnext: true, main: true }),
    ],
}).then(function writeToUMD(bundle) {
    console.log('Writing transplied lib to ../build/coach.js');
    var result = bundle.generate({
        format: 'umd',
        moduleName: 'coach',
    });
    fs.writeFileSync('../build/coach.js', result.code);
}).catch(function error(err) {
    console.log(err);
});

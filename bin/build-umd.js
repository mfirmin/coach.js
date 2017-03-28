var rollup = require('rollup');
var babel = require('rollup-plugin-babel');
var nodeResolver = require('rollup-plugin-node-resolve');
var commonjs = require('rollup-plugin-commonjs');

var fs = require('fs');

var builtins = require('rollup-plugin-node-builtins');

rollup.rollup({
    entry: '../src/coach.js',
    plugins: [
        babel({
            exclude: [
                '../node_modules/**',
                '../src/lib/ammo.js',
                '../src/lib/three.min.js',
                '../src/lib/graham_scan.min.js',
                '../src/lib/jquery-2.1.4.min.js',
            ],
            runtimeHelpers: true,
        }),
        builtins(),
        commonjs({
            include: [
                '../src/lib/ammo.js',
                '../src/lib/three.min.js',
                '../src/lib/graham_scan.min.js',
                '../src/lib/jquery-2.1.4.min.js',
            ],
            ignoreGlobal: false,
            sourceMap: false,
        }),
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

'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (contents) {
    var ts = require('typescript');
    if (!ts) throw new Error('cannot find typescript compiler. check if \'typescript\' node module is installed.');    
    var processed = ts.transpileModule(contents, {
        compilerOptions: {
            "jsx": "react",
            "target": "es2016",
            "module": "esnext",
            "moduleResolution": "node",
            "experimentalDecorators": true,
            "emitDecoratorMetadata": true,
            "rootDir": "src",        
            "baseUrl": "src",
            "outDir": "out",        
            "sourceMap": true,
            "skipLibCheck": true,
            "importHelpers": true,        
            "allowUnreachableCode": true,
            "noImplicitUseStrict": true,
            "allowSyntheticDefaultImports": true,
            "suppressImplicitAnyIndexErrors": true,
            "forceConsistentCasingInFileNames": true,        
            "lib": [
                "dom",
                "es2015",
                "es2016",
                "es2017"
            ],
            "paths": {
                "@log": ["log"],
                "@modules/*": ["modules/*"]
            } 
        }
    });
    if (processed && processed.outputText) {
        console.log('>>> processed');
        // console.log(processed.outputText);
        return processed.outputText;
    }
    return '';
};

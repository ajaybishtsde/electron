/*
var path = require('path'),
    fs = require('fs-plus'),
    _ = require('underscore'),
    legalEagle = require('legal-eagle');

var TEMPLATE = fs.readFileSync(path.resolve(__dirname, 'resources/license.ejs'), {encoding: 'utf8'});   

// for use when `legal-eagle` cannot resolve a license
var OVERRIDES = {

};

// `legal-eagle` simply picks the first license if more than one are available, this is to force a license (please comment with justification).
var FORCE = {
    'ua-parser-js@0.7.10': { // chosen https://github.com/faisalman/ua-parser-js/issues/1#issuecomment-148337873
        repository: "git+https://github.com/faisalman/ua-parser-js",
        license: "MIT",
        source: "package.json"
    }
};

module.exports = function(grunt) {
    grunt.registerTask('create-license-file', 'Create LICENSE', function() {  
        var done = this.async();      
        var pkg = grunt.config.get('pkg'),
            npmPackages = _.omit(_.assign({}, pkg.dependencies, pkg.devDependencies), 'yggdrasil'),
            omitSourceText = false;                

        Promise.all(_.map(npmPackages, function(npmPackageVersion, npmPackage) {
            return new Promise(function(resolve, reject) {
                grunt.verbose.ok('Scanning package ' + npmPackage + ' for licenses.');
                legalEagle({path: path.resolve(__dirname, '../../node_modules', npmPackage), omitPermissive: false, overrides: OVERRIDES}, function(err, summary) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(summary);
                    }
                });
            });
        })).then(function(results) {          
            var licenses = _.assign(_.reduce(results, function(licenses, result) {                
                return _.assign(licenses, result);
            }, {}), FORCE);            
            var dependencies = _.map(licenses, function(license, name) {
                license = omitSourceText ? _.omit(license, 'sourceText') : license;
                return _.assign({name: name}, license);
            });            
            fs.writeFileSync(path.resolve(__dirname, '../../stage/LICENSE'), _.template(TEMPLATE)({
                dependencies: dependencies
            }));
            done();
        }).catch(function(err) {
            grunt.log.error('Creating LICENSE did not work!');
            grunt.log.error(err);
            done();
        });        
    });
}*/
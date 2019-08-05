/**
 * System configuration for Angular 2 samples
 * Adjust as necessary for your application needs.
 */
(function(global) {
  // map tells the System loader where to look for things
  var map = {
    'app':                        'dist', // 'dist',
    '@angular':                   'node_modules/@angular',
    'rxjs':                       'node_modules/rxjs',
    "ng2-bootstrap":              "node_modules/ng2-bootstrap",
    "moment":                     "node_modules/moment",
    "ng2-inline-editor":          "node_modules/ng2-inline-editor",
    "ng2-charts":                 "node_modules/ng2-charts",
    'angular2-in-memory-web-api': 'npm:angular2-in-memory-web-api',
    'angular2-cookie':            'npm:angular2-cookie',
    'angular2-notifications':     'node_modules/angular2-notifications'
  };
  // packages tells the System loader how to load when no filename and/or no extension
  var packages = {
    'rxjs':                                 { defaultExtension: 'js' },
    "ng2-bootstrap":                        { main:"bundles/ng2-bootstrap.umd.js", defaultExtension:"js", formart:"cjs"},
    "moment":                               { main:"moment.js", defaultExtensio:"js"},
    "ng2-inline-editor":                    { main:"ng2-inline-editor.umd.js", defaultExtension:"js", formart:"cjs"},
    "ng2-charts":                           { main:"bundles/ng2-charts.umd.js", defaultExtension:"js", formart:"cjs"},
    'angular2-in-memory-web-api':           {main: './index.js',defaultExtension: 'js'},
    'angular2-cookie':                      {main: './core.js',defaultExtension: 'js'},
    'angular2-notifications':               { main: './dist/index.js', defaultExtension: 'js'}
  };
  var ngPackageNames = [
    'common',
    'compiler',
    'core',
    'forms',
    'http',
    'platform-browser',
    'platform-browser-dynamic',
    'router'
  ];
  // Individual files (~300 requests):
  function packIndex(pkgName) {
    packages['@angular/'+pkgName] = { main: 'index.js', defaultExtension: 'js' };
  }
  // Bundled (~40 requests):
  function packUmd(pkgName) {
    packages['@angular/'+pkgName] = { main: '/bundles/' + pkgName + '.umd.js', defaultExtension: 'js' };
  }
  // Most environments should use UMD; some (Karma) need the individual index files
  var setPackageConfig = System.packageWithIndex ? packIndex : packUmd;
  // Add package entries for angular packages
  ngPackageNames.forEach(setPackageConfig);
  var config = {
    map: map,
    packages: packages
  };
  System.config(config);
})(this);

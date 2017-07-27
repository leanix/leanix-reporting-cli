// Import css declarations for the report
import './assets/main.css';

// Importing '@leanix/reporting' makes the `lx` object globally available
// IMPORTANT: Make sure lodash (window._) and jQuery (window.$) are globally available,
// as they are required by @leanix/reporting. E.g via webpack.ProvidePlugin
import '@leanix/reporting';

// We have declared our report class in a seperate file and import it here
import { Report } from './report';

// We have to call init() in order to tell the reporting framework
// that we want to start initializing our report.
// `init()` returns a promise that will be resolved as soon as the initialization has finished
lx.init()
.then(function (setup) {
  // After initalization has finished we receive a `setup` object with
  // information from LeanIX that we can use for our report.

  // Now we create our report object with the setup and create a config object.
  var report = new Report(setup);
  var config = report.createConfig();

  // With the config object, we call `lx.ready()` in order to tell the framework
  // that our report is ready to receive data.
  lx.ready(config);
});

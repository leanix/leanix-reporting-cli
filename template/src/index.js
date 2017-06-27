import '@leanix/reporting';
import factSheetMapper from './fact-sheet-mapper';

lx.init()
.then(function (setup) {
  console.log('Setup: ', setup);
  var config = {
    facets: [{
      key: 'main',
      fixedFactSheetType: 'Application',
      attributes: ['displayName', 'release', 'description', 'name'],
      callback: function (data) {
        var html = data.map(factSheetMapper).join('');
        document.getElementById('report').innerHTML = html;
      }
    }]
  };
  lx.ready(config);
});

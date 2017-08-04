import $ from 'jquery';
import factSheetMapper from './fact-sheet-mapper';

const ID_SORTING_DROPDOWN = 'SORTING_DROPDOWN';
const ID_SORTING_BY_NAME = 'SORTING_BY_NAME';
const ID_SORTING_BY_COUNT = 'SORTING_BY_COUNT';

/**
 * The logic for our report is contained in this class.
 * We have create several functions to split up the logic, which increases maintainability.
 */
export class Report {

  constructor(setup) {
    this.setup = setup;
    this.sorting = ID_SORTING_BY_NAME;
  }

  /**
   * Creates a configuration object according to the reporting frameworks specification (see: TODO).
   */
  createConfig() {
    return {
      menuActions: {
        customDropdowns: this.createDropdownConfig()
      },
      facets: [{
        key: 'main',
        attributes: ['displayName', 'type', 'description'],
        callback: function (data) {
          this.data = data;
          this.groups = _.groupBy(data, 'type');
          this.render();
        }.bind(this)
      }]
    };
  }

  render() {
    var fsTypes = _.keys(this.groups).sort(this.getSortComparer());
    var html = '<table>';
    for (var i = 0; i < fsTypes.length; i++) {
      html += this.getHtmlForFsTypeBar(fsTypes[i])
    }
    html += '</table>';
    html += '<div id="clickOutput"></div>';

    document.getElementById('report').innerHTML = html;

    $('.bar').on('click', (event) => {
      this.handleBarClick(event);
    });
  }

  createDropdownConfig() {
    return [{
      id: ID_SORTING_DROPDOWN,
      name: 'SORT',
      entries: [
        {
          id: ID_SORTING_BY_NAME,
          name: 'By Name',
          callback: () => {
            this.sorting = ID_SORTING_BY_NAME;
          this.render();
          }
        },
        {
          id: ID_SORTING_BY_COUNT,
          name: 'By Count',
          callback: () => {
            this.sorting = ID_SORTING_BY_COUNT;
            this.render();
          }
        }
      ]
    }];
  }

  getSortComparer() {
    if (this.sorting === ID_SORTING_BY_NAME) {
      return (a, b) => a > b;
    } else if (this.sorting === ID_SORTING_BY_COUNT) {
      return (a, b) => this.groups[a].length < this.groups[b].length;
    }
  }

  getHtmlForFsTypeBar(type) {
    var fsVm = _.find(this.setup.settings.viewModel.factSheets, { type });
    var groupCount = this.groups[type].length;
    var width = groupCount / this.data.length * 100;
    var barStyles = `width: ${width}%; background-color: ${fsVm.bgColor};`;
    return `
    <tr>
      <td>
        ${type} (${groupCount})
      </td>
      <td>
        <div class="bar" data-type="${type}" style="${barStyles}"></div>
      </td>
    </tr>`;
  }

  handleBarClick(event) {
    var clickedType = $(event.target).attr('data-type');
    var factSheets = this.groups[clickedType];
    var fsHtml = factSheets.map(factSheetMapper).join('');
    document.getElementById('clickOutput').innerHTML = `<h4>${clickedType}</h4>${fsHtml}`;
  }

}

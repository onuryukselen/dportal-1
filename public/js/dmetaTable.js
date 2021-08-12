/* eslint-disable */
import axios from 'axios';
import {
  cleanSpecChar,
  prepareDmetaData,
  tsvCsvDatatablePrep,
  dmetaOutDatatablePrep
} from './jsfuncs';
import { prepareBarGraph } from './chartjs';
import { prepareBreadcrumb } from './breadcrumb';
import { prepareSidebar } from './sidebar';
// GLOBAL SCOPE
let $s = {
  configs: [],
  project: {},
  data: { sample: {}, file: {}, server: {}, run: {}, out: {} },
  outCollections: [],
  DTObj: {}
};
export const getDmetaColumns = () => {
  return $s;
};

const ajaxCall = async (method, url) => {
  console.log(method, url);
  try {
    const res = await axios({
      method,
      url
    });
    return res.data.data.data;
  } catch (err) {
    //console.log(err);
    return '';
  }
};

// Config for Dmeta table
// Main columns for table
// $s.mainCols = [
//   '$plusButton',
//   'name',
//   'status',
//   'series',
//   'patient',
//   'aliquot',
//   'clin_pheno',
//   'skin',
//   'patient_note',
//   'cell_density_tc',
//   'cell_density_indrop',
//   'cells_umis_gt_500',
//   'col_date',
//   'library_tube_id',
//   'pool_id',
//   'bead_batch',
//   'blister_comments',
//   'blister_loc',
//   'blister_num',
//   'ethnicity',
//   'gender',
//   'biosample_name',
//   'biosample_type',
//   'organism',
//   'perc_live_cells',
//   'total_cells',
//   'visit_num',
//   'volume_bf',
//   'comment',
//   'contract',
//   'index_id',
//   'index_seq',
//   'run_comments',
//   'sc_lib_status',
//   'seq_comments',
//   'seq_details',
//   'sequence_date',
//   'unique_id',
//   'total_valid_reads',
//   'duplication_rate',
//   'mean_umi',
//   'mean_cell',
//   'date_created',
//   'owner',
//   '$detailsButton'
// ];

// $s.mainColLabels = [
//   '',
//   'Name',
//   'Status',
//   'Series',
//   'Patient',
//   'Aliquot',
//   'Clinical phenotype',
//   'Skin',
//   'Patient Note',
//   'Cell density (TC)',
//   'Cell density indrop',
//   'Cells UMIs>500',
//   'Collect date',
//   'Library tube id',
//   'Pool id',
//   'Bead Batch',
//   'Blister Comments',
//   'Blister Location',
//   'Blister #',
//   'Ethnicity',
//   'Gender',
//   'Biosample Name',
//   'Biosample Type',
//   'Organism',
//   '%Live Cells',
//   'Total Cells',
//   'Visit #',
//   'Volume BF',
//   'Comment',
//   'Contract',
//   'Index Id',
//   'Index Seq',
//   'Run Comments',
//   'Sc Lib Status',
//   'Seq Comments',
//   'Seq Details',
//   'Sequence Date',
//   'Unique Id',
//   'Total Valid Reads',
//   'Duplication Rate',
//   'Mean UMIs per Cell',
//   'Mean Genes per Cell',
//   'Added on',
//   'Owner',
//   'Run'
// ];

// columns that are going to be visible on startup
// $s.initialShowCols = [
//   '$plusButton',
//   'name',
//   'status',
//   'experiment',
//   'patient',
//   'aliquot',
//   'clin_pheno',
//   'skin',
//   'patient_note',
//   'cell_density_tc',
//   'cell_density_indrop',
//   'col_date',
//   'library_tube_id',
//   'pool_id',
//   'date_created',
//   'owner',
//   '$detailsButton'
// ];

// columns that listed in configuration menu
// each config column defined in different object
// [{"main": ["name", "status"]}, {"sample_summary":'sample_summary.Total Reads'}]

// $s.showHideCols = [
//   'name',
//   'status',
//   'series',
//   'patient',
//   'aliquot',
//   'clin_pheno',
//   'skin',
//   'patient_note',
//   'cell_density_tc',
//   'cell_density_indrop',
//   'cells_umis_gt_500',
//   'col_date',
//   'library_tube_id',
//   'pool_id',
//   'bead_batch',
//   'blister_comments',
//   'blister_loc',
//   'blister_num',
//   'ethnicity',
//   'gender',
//   'biosample_name',
//   'biosample_type',
//   'organism',
//   'perc_live_cells',
//   'total_cells',
//   'visit_num',
//   'volume_bf',
//   'comment',
//   'contract',
//   'index_id',
//   'index_seq',
//   'run_comments',
//   'sc_lib_status',
//   'seq_comments',
//   'seq_details',
//   'sequence_date',
//   'unique_id',
//   'total_valid_reads',
//   'duplication_rate',
//   'mean_umi',
//   'mean_cell',
//   'date_created'
// ];

// $s.sidebarFilterCols = [
//   'status',
//   'series',
//   'patient',
//   'aliquot',
//   'clin_pheno',
//   'skin',
//   'pool_id',
//   'owner'
// ];

// input: selected mainCols in array
// returns: labels in array
export const getSelectedColLabels = selCols => {
  let colLabels = [];
  for (var i = 0; i < selCols.length; i++) {
    const ind = $s.mainCols.indexOf(selCols[i]);
    if (ind > -1) {
      colLabels.push($s.mainColLabels[ind]);
    }
  }
  return colLabels;
};

const getHideColIds = () => {
  let hideCols = [];
  for (var i = 0; i < $s.mainCols.length; i++) {
    if ($s.initialShowCols.indexOf($s.mainCols[i]) < 0) hideCols.push(i);
  }
  return hideCols;
};

const getShowHideBtns = colName => {
  let btn = '';
  const ind = $s.mainCols.indexOf(colName);
  if (ind >= 0 && $s.mainColLabels[ind]) {
    const divID = cleanSpecChar(colName);
    btn = `<div class="form-check">
      <input data-column="${ind}" class="form-check-input toggle-vis" type="checkbox" value="" id="${divID}">
      <label class="form-check-label" for="${divID}">
        ${$s.mainColLabels[ind]}
      </label>
    </div>`;
  }
  return btn;
};

const getColSelectMenu = () => {
  let menuDiv = `<div class="collapse" id="colSelectMenu" style="margin-bottom: 10px;">
  <div class="row">
  <div class="col-sm-12"><dt>Configure Visible Columns</dt></div>
  </div>
  <div class="row">`;
  for (var i = 0; i < $s.showHideCols.length; i++) {
    menuDiv += `<div class="col-sm-3">`;
    menuDiv += getShowHideBtns($s.showHideCols[i]);
    menuDiv += `</div>`;
  }
  menuDiv += `</div>`;
  return menuDiv;
};

const insertTableHeaders = TableID => {
  $(TableID).empty();
  $(TableID).append(`<thead><tr id="dmetaDetailedTableHeader"></tr></thead><tbody></tbody>`);
  for (var i = 0; i < $s.mainColLabels.length; i++) {
    $('#dmetaDetailedTableHeader').append(`<th>${$s.mainColLabels[i]}</th>`);
  }
};

const prepareColumnConfig = columnConfig => {
  let mainCols = [];
  let mainColLabels = [];
  let initialShowCols = [];
  let showHideCols = [];
  let sidebarFilterCols = [];
  const mainColsObjs = columnConfig.filter(c => c.main);
  if (mainColsObjs) {
    mainCols = mainColsObjs.map(c => c.name);
    mainColLabels = mainColsObjs.map(c => c.label);
    sidebarFilterCols = mainColsObjs.map(c => c.sidebar);
  }
  const visibleColsObjs = mainColsObjs.filter(c => c.visible);
  if (visibleColsObjs) initialShowCols = visibleColsObjs.map(c => c.name);
  const showHideColsObj = mainColsObjs.filter(c => c.toogle);
  if (showHideColsObj) showHideCols = showHideColsObj.map(c => c.name);
  const sidebarFilterColsObj = columnConfig.filter(c => c.sidebar);
  if (sidebarFilterColsObj) sidebarFilterCols = sidebarFilterColsObj.map(c => c.name);

  mainCols.unshift('$plusButton');
  mainColLabels.unshift('');
  initialShowCols.unshift('$plusButton');
  $s.mainCols = mainCols;
  $s.mainColLabels = mainColLabels;
  $s.initialShowCols = initialShowCols;
  $s.showHideCols = showHideCols;
  $s.sidebarFilterCols = sidebarFilterCols;
  console.log('mainCols', $s.mainCols);
  console.log('mainColLabels', $s.mainColLabels);
  console.log('initialShowCols', $s.initialShowCols);
  console.log('showHideCols', $s.showHideCols);
  console.log('sidebarFilterCols', $s.sidebarFilterCols);
};

const bindEventHandlers = () => {
  $(document).on('shown.coreui.tab', 'a.outcolltab[data-toggle="tab"]', function(e) {
    $($.fn.dataTable.tables(true))
      .DataTable()
      .columns.adjust();
  });
  //sidebar collapse
  $(document).on('show.coreui.collapse', '.collapse', function(e) {
    $(this)
      .prev('.card-header')
      .find('.cil')
      .removeClass('cil-plus')
      .addClass('cil-minus');
  });
  $(document).on('hide.coreui.collapse', '.collapse', function(e) {
    $(this)
      .prev('.card-header')
      .find('.cil')
      .removeClass('cil-minus')
      .addClass('cil-plus');
  });

  $(document).on('change', 'select.toggle-project', async function(e) {
    const project = $(this).val();
    const projectConfig = $s.configs.filter(i => i.project_name == project)[0];
    $s.data = { sample: {}, file: {}, server: {}, run: {}, out: {} };
    $s.outCollections = [];
    $s.DTObj = {};
    prepareColumnConfig(projectConfig.columns);
    let data = '';
    if ($s.project[project] && $s.project[project].data) {
      data = $s.project[project].data;
    } else {
      const send = { url: `/api/v1/projects/${project}/data/sample/format/detailed` };
      const res = await axios({
        method: 'POST',
        url: '/api/v1/dmeta',
        data: send
      });
      console.log(res.data);
      data = prepareDmetaData(res.data);
      $s.project[project] = {};
      $s.project[project].data = data;
    }
    console.log('data', data);
    if (data) {
      refreshDmetaTable(data, 'dmetaDetailed', project);
      const projectGraphs = projectConfig.graphs;
      for (let i = 0; i < projectGraphs.length; i++) {
        if (projectGraphs[i].type == 'bar') {
          prepareBarGraph(
            data,
            {
              dataCol: projectGraphs[i].dataCol,
              xLabel: projectGraphs[i].xLabel,
              yLabel: projectGraphs[i].yLabel,
              colorSchema: 'Tableau10',
              chartId: `basicBarChart${i + 1}`
            },
            project
          );
        }
      }

      prepareBreadcrumb('Dashboard', data, project);
      prepareSidebar(data, project);
      $('a.collection[data-toggle="tab"]').trigger('show.coreui.tab');
      $('[data-toggle="tooltip"]').tooltip();
    }
  });
};

const getDropdown = (className, name, data) => {
  return dropdown;
};

export const prepareProjectNav = async () => {
  bindEventHandlers();
  const configs = await ajaxCall('GET', `/api/v1/config`);
  $s.configs = configs;
  let dropdown = `<select class="form-control form-control-sm toggle-project" >`;
  if (configs) {
    configs.forEach(i => {
      const name = i.project_name.charAt(0).toUpperCase() + i.project_name.slice(1);
      dropdown += `<option  value="${i.project_name}">${name}</option>`;
    });
  }
  dropdown += `</select>`;
  $('#projectToogleDiv').append(dropdown);
  $('.toggle-project').trigger('change');
  $('.breadcrumb-dashboard').css('display', 'inline-flex');
};

export const refreshDmetaTable = function(data, id, project) {
  var TableID = '#' + id + 'Table';
  var searchBarID = '#' + id + 'SearchBar';

  var initCompDmetaTable = function(settings, json) {
    console.log('initCompDmetaTable');
    var api = new $.fn.dataTable.Api(settings);
    $(TableID + '_filter').css('display', 'inline-block');
    var toogleShowColsId = 'toogleShowColsId';
    $(searchBarID).append(
      '<div style="margin-bottom:20px; padding-left:8px; display:inline-block;" id="' +
        toogleShowColsId +
        '"></div>'
    );

    const colSelectMenu = getColSelectMenu();

    const colSelectBtn =
      '<button class="btn btn-primary" type="button" data-toggle="collapse" data-target="#colSelectMenu" aria-expanded="false" aria-controls="colSelectMenu"> <i class="cil-view-column"></i></button>';

    $('#' + toogleShowColsId).append(colSelectBtn);
    $(searchBarID).append(colSelectMenu);

    // Bind event handler for toogle-vis checkbox
    $('input.toggle-vis').on('change', function(e) {
      var column = api.column($(this).attr('data-column'));
      column.visible(this.checked);
    });
    // Check
    for (var i = 0; i < $s.mainCols.length; i++) {
      if ($s.initialShowCols.indexOf($s.mainCols[i]) >= 0) {
        $("input.toggle-vis[data-column='" + i + "']").prop('checked', true);
      } else {
        $("input.toggle-vis[data-column='" + i + "']").prop('checked', false);
      }
    }

    // Bind event handler for toggle-filter checkbox at the sidebar
    $(document).on('change', 'input.toggle-filter', function(e) {
      var dataColumn = $(this).attr('data-column');
      let vals = [];
      var dataFilters = $(`input.toggle-filter[data-column="${dataColumn}"]`);
      for (var k = 0; k < dataFilters.length; k++) {
        if ($(dataFilters[k]).is(':checked')) {
          vals.push($(dataFilters[k]).attr('data-val'));
        }
      }
      var valReg = '';
      for (var k = 0; k < vals.length; k++) {
        var val = $.fn.dataTable.util.escapeRegex(vals[k]);
        if (val) {
          if (k + 1 !== vals.length) {
            valReg += val + '|';
          } else {
            valReg += val;
          }
        }
      }
      api
        .column(dataColumn)
        .search(valReg ? '(^|,)' + valReg + '(,|$)' : '', true, false)
        .draw();
    });

    var getHeaderRow = function(text) {
      if (!text) text = '';
      return '<thead><tr><th>' + text + '</th></tr></thead>';
    };
    var getBodyRow = function(text) {
      if (!text) {
        text = '';
      }
      return '<tbody><tr><td>' + text + '</td></tr></tbody>';
    };
    var pattClean = function(text) {
      if (!text) {
        text = '';
      } else if (text.match(/s3:/i) || text.match(/gs:/i)) {
        var textPath = $.trim(text).split('\t')[0];
        if (textPath) {
          text = textPath;
        }
      }
      return text;
    };

    const getTableFromList = (label, value) => {
      if (!label[0]) return 'No data found.';
      let ret = '<table class="table-not-striped" style="width:100%"><tbody>';
      for (var k = 0; k < label.length; k++) {
        const val = value[k] ? value[k] : '';
        ret += `<tr><td>${label[k]}</td><td>${val}</td></tr>`;
      }
      ret += '</tbody></table>';
      return ret;
    };

    const getRunBlock = (label, value, type, listHeader) => {
      let ret = '';
      if (value) {
        if (type === 'single') {
          ret = `
          <div class="col-sm-6">
            <div class="card" style="height:125px;">
              <div class="card-body">
                <h2 style="text-align: center;">${label}</h2>
                <div class="summary_card_hero">${value}</div>
              </div>
            </div>
          </div>`;
        } else if (type === 'double') {
          ret = `
          <div class="col-sm-6">
            <div class="card" style="height:125px;">
              <div class="card-body">
                <div class="row">
                  <div class="col-sm-6">
                    <h4>${label[0]}</h4>
                    <div class="summary_card_hero">${value[0]}</div>
                  </div>
                  <div class="col-sm-6">
                    <h4>${label[1]}</h4>
                    <div class="summary_card_hero">${value[1]}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>`;
        } else if (type === 'list') {
          const table = getTableFromList(label, value);
          if (!table) return '';
          let headerDiv = '';
          if (listHeader) headerDiv = `<h4 style="text-align: center;">${listHeader}</h4>`;
          ret = `
          <div class="col-sm-6">
            <div class="card">
              <div class="card-body summary_card" style="overflow-x:auto;">
                ${headerDiv}
                ${table}
              </div>
            </div>
          </div>`;
        }
      }
      return ret;
    };

    const insertRunContent = async rowid => {
      try {
        if (!$s.data.file[rowid]) {
          console.log('insertRunContent rowid not found:', rowid);
          return 'No Run Found.';
        }
        const fileIDs = $s.data.file[rowid].map(el => el._id);
        console.log(`insertRunContent fileIDs: ${fileIDs}`);
        const res = await axios({
          method: 'POST',
          url: '/api/v1/dmeta',
          data: {
            url: `/api/v1/projects/${project}/data/run/detailed`,
            body: { file_ids: { '!in': fileIDs } }
          }
        });
        const data = prepareDmetaData(res.data);
        if (!data || data.length === 0) {
          console.log(`run not found belong to ${fileIDs}:`, data);
          return 'No Run Found.';
        }
        $s.data.run[rowid] = data;
        let ret = '';
        for (var i = 0; i < data.length; i++) {
          ret += insertRunTable(data[i], rowid);
        }
        return ret;
      } catch (err) {
        console.log(err);
        return 'No Run Found.';
      }
    };
    var insertRunTable = (data, rowid) => {
      console.log('run', data);
      let tableLabels = [];
      let tableValues = [];
      if (data.name) {
        tableLabels.push('Name');
        tableValues.push(data.name);
      }
      if (data.run_url) {
        tableLabels.push('Run URL');
        tableValues.push(`<a href="${data.run_url}" target="_blank">${data.run_url}</a>`);
      }
      if (data.run_env) {
        tableLabels.push('Run Environment');
        tableValues.push(data.run_env);
      }
      if (data.pipe_id) {
        tableLabels.push('Pipeline ID');
        tableValues.push(data.pipe_id);
      }
      if (data.work_dir) {
        tableLabels.push('Work Directory');
        tableValues.push(data.work_dir);
      }
      if (data.in) {
        tableLabels.push('Inputs');
        let inputs = data.in;
        for (const k of Object.keys(inputs)) {
          let input = inputs[k];
          if (Array.isArray(input)) {
            inputs[k] = input.map(el => {
              if (el.name) {
                return el.name;
              }
              return el;
            });
          }
        }
        tableValues.push(JSON.stringify(inputs));
      }
      if (data.out) {
        let outArr = Object.keys(data.out);
        if (outArr.length > 0) {
          if (!$s.outCollections[rowid]) $s.outCollections[rowid] = [];
          $s.outCollections[rowid] = Array.from(new Set($s.outCollections[rowid].concat(outArr)));
        }

        tableLabels.push('Output Collections');
        tableValues.push(outArr.join(', '));
      }

      let blocks = '';
      blocks += getRunBlock(tableLabels, tableValues, 'list');
      var content = `
      <div style="margin-top:10px; width:1850px;">
        <div class="row">
          ${blocks}
        </div>
      </div>`;
      return content;
    };
    const insertFileContent = async rowid => {
      try {
        const res = await axios({
          method: 'POST',
          url: '/api/v1/dmeta',
          data: { url: `/api/v1/projects/${project}/data/file/format/summary?sample_id=${rowid}` }
        });
        const data = prepareDmetaData(res.data);
        console.log('file', data);
        if (!data || data.length === 0) return 'No File Found.';
        $s.data.file[rowid] = data;
        let ret = '';
        for (var i = 0; i < data.length; i++) {
          ret += insertFileTable(data[i]);
        }
        return ret;
      } catch (err) {
        console.log(err);
        return 'No File Found.';
      }
    };
    const insertFileTable = data => {
      let tableLabels = [];
      let tableValues = [];
      tableLabels.push('Name');
      tableValues.push(data.name);
      var cpData = $.extend(true, {}, data);
      var file_dir = cpData.file_dir;
      var files_used = cpData.files_used;
      // convert dmeta format (Array) to dnext format
      if (file_dir && file_dir.constructor === Array) {
        file_dir = file_dir.join('\t');
      }
      if (files_used && files_used.constructor === Array) {
        for (var i = 0; i < files_used.length; i++) {
          files_used[i] = files_used[i].join(',');
        }
        files_used = files_used.join(' | ');
      }
      if (files_used) {
        if (data.file_dir) {
          tableLabels.push('Input File(s) Directory');
          tableValues.push(pattClean(file_dir));
          tableLabels.push('Input File(s)');
          tableValues.push(files_used.replace(/\|/g, '<br/>'));
        } else {
          tableLabels.push('GEO ID');
          tableValues.push(files_used.replace(/\|/g, '<br/>'));
        }
      }

      var collection_type = '';
      if (data.collection_type == 'single') {
        collection_type = 'Single/List';
      } else if (data.collection_type == 'pair') {
        collection_type = 'Paired List';
      } else if (data.collection_type == 'triple') {
        collection_type = 'Triple List';
      } else if (data.collection_type == 'quadruple') {
        collection_type = 'Quadruple List';
      } else if (data.collection_type) {
        collection_type = data.collection_type;
      }
      tableLabels.push('Collection Type');
      tableValues.push(collection_type);
      let blocks = '';
      blocks += getRunBlock(tableLabels, tableValues, 'list');
      var content = `
      <div style="margin-top:10px; width:1850px;">
        <div class="row">
          ${blocks}
        </div>
      </div>`;
      return content;
    };

    const getServerInfo = async (data, rowid) => {
      const runId = data.run_id;
      const sampleRunData = $s.data.run[rowid];
      const runData = sampleRunData.filter(e => e._id == runId);
      const serverData =
        runData[0] && runData[0].server_id && runData[0].server_id ? runData[0].server_id : '';
      console.log('serverData', serverData);
      if (!serverData) return '';
      const serverID = serverData._id ? serverData._id : '';
      if (!serverID) return '';
      if (!$s.data.server[serverID]) {
        $s.data.server[serverID] = serverData;
      }
      return $s.data.server[serverID];
    };

    const getOutCollTitle = (data, rowid) => {
      const runId = data.run_id;
      const fileId = data.file_id;
      const sampleRunData = $s.data.run[rowid];
      const sampleFileData = $s.data.file[rowid];
      const runData = sampleRunData.filter(e => e._id == runId);
      const fileData = sampleFileData.filter(e => e._id == fileId);
      const runUrl = runData[0] && runData[0].run_url ? runData[0].run_url : '';
      const runName = runData[0] && runData[0].name ? runData[0].name : 'Run';
      const fileName = fileData[0] && fileData[0].name ? fileData[0].name : '';
      const runHref = runUrl ? `href="${runUrl}" target="_blank"` : '';
      const header = `<a ${runHref}">${runName}</a> - ${fileName}`;
      return header;
    };

    const insertOutCollObjectSingleCellTable = (data, rowid) => {
      let blocks = '';
      const runId = data.run_id;
      const sampleRunData = $s.data.run[rowid];
      const runData = sampleRunData.filter(e => e._id == runId);
      const runUrl = runData[0] && runData[0].run_url ? runData[0].run_url : '';
      if (data.doc) {
        blocks += getRunBlock('Number of Cells', data.doc['Number of Cells'], 'single');
        blocks += getRunBlock('Mean UMIs per Cell', data.doc['Mean UMIs per Cell'], 'single');
        blocks += getRunBlock(
          [
            'Total Reads',
            'Unique Reads Aligned (STAR)',
            'Multimapped Reads Aligned (STAR)',
            'Total aligned UMIs (ESAT)',
            'Total deduped UMIs (ESAT)',
            'Duplication Rate'
          ],
          [
            data.doc['Total Reads'],
            data.doc['Unique Reads Aligned (STAR)'],
            data.doc['Multimapped Reads Aligned (STAR)'],
            data.doc['Total aligned UMIs (ESAT)'],
            data.doc['Total deduped UMIs (ESAT)'],
            data.doc['Duplication Rate']
          ],
          'list',
          'Mapping'
        );
        blocks += getRunBlock(
          ['Number of Cells', 'Number of Genes', 'Mean Genes per Cell', 'Mean UMIs per Cell'],
          [
            data.doc['Number of Cells'],
            data.doc['Number of Genes'],
            data.doc['Mean Genes per Cell'],
            data.doc['Mean UMIs per Cell']
          ],
          'list',
          'Cells'
        );
      }

      const width = document.getElementById('dmetaTableContainer').offsetWidth - 100;
      let runUrlDiv = '';
      if (runUrl)
        runUrlDiv = `<h5 style="margin-top:20px;"><a target="_blank" href="${runUrl}"> Go to run <i class="cil-external-link"></i></a></h5>`;
      var content = `
       ${runUrlDiv}
      <div style="margin-top:20px; width:${width}px;">
        <div class="row">
          ${blocks}
        </div>
      </div>`;
      return content;
    };

    const insertOutCollObjectTable = (data, rowid) => {
      let blocks = '';
      const header = getOutCollTitle(data, rowid);
      blocks += getRunBlock(Object.keys(data.doc), Object.values(data.doc), 'list', header);

      var content = `
      <div style="margin-top:10px; width:1850px;">
        <div class="row">
          ${blocks}
        </div>
      </div>`;
      return content;
    };

    const insertOutCollArrayTable = async (data, rowid) => {
      let fileBlock = [];
      if (data.doc) {
        let server;
        try {
          server = await getServerInfo(data, rowid);
        } catch (err) {
          console.log('getServerInfo err', err);
        }
        if (!server) return 'Server url not found';
        if (!server.url_server) return 'Server url_server not found';
        if (!server.url_client) return 'Server url_client not found';
        console.log(server);
        const files = data.doc;

        for (var i = 0; i < files.length; i++) {
          let ret = '';
          const n = files[i].lastIndexOf('/');
          const extloc = files[i].lastIndexOf('.');
          const name = files[i].substring(n + 1);
          const ext = files[i].substring(extloc + 1);
          const link = `${server.url_client}${files[i]}`;
          const url = `<div style="margin-top:20px; margin-bottom:10px;"><a  href="${link}" target="_blank">${name}</a></div>`;
          ret += url;
          const iframeExt = ['png', 'jpg', 'gif', 'tiff', 'tif', 'bmp', 'html', 'out', 'pdf'];
          const datatablesExt = ['tsv', 'csv'];
          if (iframeExt.includes(ext)) {
            const iframe = `<div style="margin-bottom:15px; margin-top:15px; height:300px;"><iframe frameborder="0"  style="width:100%; height:100%;" src="${link}"></iframe></div>`;
            ret += iframe;
          } else if (datatablesExt.includes(ext)) {
            const serverURL = `${server.url_server}${files[i]}`;
            try {
              const tableId = `file${rowid}${cleanSpecChar(link)}`;
              const table = `<div style="margin-bottom:15px; width:100%;  overflow-x:auto;"  class="table-responsive"><table style="overflow-x:auto; width:100%; white-space: nowrap;" class="fileTables row-border table" sample_id="${rowid}" ext="${ext}" serverURL="${serverURL}" id="${tableId}"></table></div>`;
              ret += table;
            } catch (err) {
              console.log(err);
            }
          }
          fileBlock.push(ret);
        }
      }
      const header = getOutCollTitle(data, rowid);
      let blocks = '';
      blocks += getRunBlock(fileBlock, [], 'list', header);

      var content = `
      <div style="margin-top:10px; width:1850px;">
        <div class="row">
          ${blocks}
        </div>
      </div>`;
      return content;
    };

    const getOutCollTable = async (collName, sample_id) => {
      try {
        const res = await axios({
          method: 'POST',
          url: '/api/v1/dmeta',
          data: {
            url: `/api/v1/projects/${project}/data/${collName}?sample_id=${sample_id}`
          }
        });
        const data = prepareDmetaData(res.data);
        if (!data || data.length === 0) return 'No Data Found.';
        console.log(data);
        if (!$s.data.out[collName]) $s.data.out[collName] = {};
        if (!$s.data.out[collName][sample_id]) $s.data.out[collName][sample_id] = {};
        data.reverse();
        $s.data.out[collName][sample_id] = data;

        // prepare data for table:
        let dataForTable = data.map(i => ({ ...i }));
        for (var i = 0; i < dataForTable.length; i++) {
          const runId = dataForTable[i].run_id;
          const sampleRunData = $s.data.run[sample_id];
          const runData = sampleRunData.filter(e => e._id == runId);
          const runName = runData[0] && runData[0].name ? runData[0].name : 'Run';
          const runDnextID =
            runData[0] && runData[0].run_url && runData[0].run_url.split('&id=')
              ? runData[0].run_url.split('&id=')[1] + ' - '
              : '';

          if (Array.isArray(dataForTable[i].doc)) {
            dataForTable[i] = dataForTable[i].doc.slice();
          } else if (typeof dataForTable[i].doc === 'object') {
            dataForTable[i] = $.extend(true, {}, dataForTable[i].doc);
          } else {
            dataForTable[i] = dataForTable[i].doc;
          }

          if (!dataForTable[i]) dataForTable[i] = {};
          if (Array.isArray(dataForTable[i])) {
            const numFiles = dataForTable[i].length;
            dataForTable[i] = { Files: numFiles };
          }
          if (dataForTable[i]) dataForTable[i]['Run Info'] = `${runDnextID}${runName}`;
        }
        console.log(dataForTable);
        console.log(data);
        let dataTableObj = dmetaOutDatatablePrep(dataForTable);
        dataTableObj.destroy = true;
        dataTableObj.searching = false;
        dataTableObj.paging = false;
        dataTableObj.info = false;
        dataTableObj.hover = true;
        dataTableObj.deferRender = true;
        dataTableObj.scroller = true;
        dataTableObj.scrollCollapse = true;
        dataTableObj.scrollX = 500;
        dataTableObj.sScrollX = true;
        dataTableObj.columnDefs = [{ defaultContent: '-', targets: '_all' }];
        if (!$s.DTObj[project]) $s.DTObj[project] = {};
        if (!$s.DTObj[project][sample_id]) $s.DTObj[project][sample_id] = {};
        if (!$s.DTObj[project][sample_id][collName]) $s.DTObj[project][sample_id][collName] = {};
        $s.DTObj[project][sample_id][collName] = dataTableObj;
        const width = document.getElementById('dmetaTableContainer').offsetWidth - 60;
        const tableId = `outTable-${project}-${sample_id}-${collName}`;
        const table = `<div style="margin-bottom:10px; margin-top:10px; width:${width}px;  overflow-x:auto;"  class="table-responsive" "><table style="width:100%; white-space: nowrap;" class="outTables row-border table " project="${project}" collName="${collName}" sample_id="${sample_id}" id="${tableId}"></table></div>`;

        return table;
      } catch (err) {
        console.log(err);
        return 'No Data Found.';
      }
    };

    const insertOutCollContent = async rowid => {
      let ret = '';
      if ($s.outCollections[rowid]) {
        for (var i = 0; i < $s.outCollections[rowid].length; i++) {
          const outName = $s.outCollections[rowid][i];
          const outNameTabID = `${outName}Tab_` + rowid;
          const content = await getOutCollTable($s.outCollections[rowid][i], rowid);
          ret += `<div role="tabpanel" class="tab-pane" id="${outNameTabID}" searchtab="true">
        ${content}
        </div>`;
        }
      }
      return ret;
    };

    const insertOutCollHeader = rowid => {
      let ret = '';
      if ($s.outCollections[rowid]) {
        for (var i = 0; i < $s.outCollections[rowid].length; i++) {
          const outName = $s.outCollections[rowid][i];
          const label = outName
            .replace('_', ' ')
            .split(' ')
            .map(s => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' ');

          const outNameTabID = `${outName}Tab_` + rowid;
          ret += `<li class="nav-item">
          <a class="nav-link outcolltab" data-toggle="tab" href="#${outNameTabID}" aria-expanded="false">
          ${label}
          </a>
        </li>`;
        }
      }
      return ret;
    };

    const formatOutChildRow = async (rowdata, i, sample_id, collName) => {
      const data = $s.data.out[collName][sample_id];
      console.log(data);
      let ret = '';
      if (data[i] && data[i].doc && Array.isArray(data[i].doc)) {
        // url array format
        try {
          ret += await insertOutCollArrayTable(data[i], sample_id);
        } catch (err) {
          console.log(err);
        }
        // object data for table format
      } else if (data[i] && data[i].doc && typeof data[i].doc === 'object') {
        if (data[i].doc['Number of Cells'] && data[i].doc['Mean UMIs per Cell']) {
          ret += insertOutCollObjectSingleCellTable(data[i], sample_id);
        } else {
          ret += insertOutCollObjectTable(data[i], sample_id);
        }
      } else {
        // return empty table
        ret += insertOutCollObjectSingleCellTable(data[i], sample_id);
      }
      return ret;
    };

    const formatChildRow = async rowdata => {
      const rowid = cleanSpecChar(rowdata._id);
      const fileTabID = 'fileTab_' + rowid;
      const runTabID = 'runTab_' + rowid;
      const fileContent = await insertFileContent(rowid);
      const runContent = await insertRunContent(rowid);
      const outCollContent = await insertOutCollContent(rowid);
      const outCollHeader = insertOutCollHeader(rowid);

      let ret = '';
      const header = `
        <ul id="dmetaChildRow" class="nav nav-tabs" role="tablist">
          <li class="nav-item">
            <a class="nav-link active" data-toggle="tab" href="#${fileTabID}" aria-expanded="true">
            Files
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" data-toggle="tab" href="#${runTabID}" aria-expanded="false">
            Run
            </a>
          </li>
          ${outCollHeader}
        </ul>`;

      const content = `
      <div class="tab-content">
        <div role="tabpanel" class="tab-pane active" searchtab="true" id="${fileTabID}">
          ${fileContent}
        </div>
        <div role="tabpanel" class="tab-pane" id="${runTabID}" searchtab="true">
        ${runContent}
        </div>
        ${outCollContent}
      </div>`;

      ret += '<div role="tabpanel">';
      ret += header;
      ret += content;
      ret += '</div>';
      return ret;
    };

    // Add event listener for opening and closing details
    $(document)
      .off('click', 'td.details-control')
      .on('click', 'td.details-control', async function(e) {
        console.log('1110');
        var icon = $(this).find('i');
        var tr = $(this).closest('tr');
        var row = api.row(tr);
        let rowid = '';
        if (row.child.isShown()) {
          // close child row
          row.child.hide();
          tr.removeClass('shown');
          icon.removeClass('cil-minus').addClass('cil-plus');
        } else {
          // Open child row
          if (!row.child()) {
            const rowdata = row.data();
            const formattedRow = await formatChildRow(rowdata);
            rowid = cleanSpecChar(rowdata._id);
            row.child(formattedRow).show();
            refreshOutTables(rowid);
          } else {
            row.child.show();
          }
          tr.addClass('shown');
          icon.removeClass('cil-plus').addClass('cil-minus');

          // $(`.outcollselectrun[sample_id="${rowid}"]`).trigger('change');
        }
      });

    // Add event listener for opening and closing details of out collection
    $(document)
      .off('click', 'td.outdetails-control')
      .on('click', 'td.outdetails-control', async function(e) {
        var icon = $(this).find('i');
        var tr = $(this).closest('tr');
        const tableID = $(this)
          .closest('table')
          .attr('id');
        const sample_id = $(`#${tableID}`).attr('sample_id');
        const collName = $(`#${tableID}`).attr('collName');
        const table = $(`#${tableID}`).DataTable();
        var row = table.row(tr);
        const rowIdx = table.row(tr).index();
        if (row.child.isShown()) {
          // close child row
          row.child.hide();
          tr.removeClass('shown');
          icon.removeClass('cil-minus').addClass('cil-plus');
        } else {
          // Open child row
          if (!row.child()) {
            const rowdata = row.data();
            console.log(rowIdx);
            console.log(rowdata);
            const formattedRow = await formatOutChildRow(rowdata, rowIdx, sample_id, collName);
            row.child(formattedRow).show();
            refreshFileTables(sample_id);
          } else {
            row.child.show();
          }
          tr.addClass('shown');
          icon.removeClass('cil-plus').addClass('cil-minus');

          $($.fn.dataTable.tables(true))
            .DataTable()
            .columns.adjust();
        }
      });

    const refreshOutTables = rowid => {
      const tables = $(`.outTables[sample_id="${rowid}"]`);
      console.log(tables);
      for (var i = 0; i < tables.length; i++) {
        const tableId = $(tables[i]).attr('id');
        console.log('tableId', tableId);
        const project = $(tables[i]).attr('project');
        const collName = $(tables[i]).attr('collName');
        if (!$.fn.DataTable.isDataTable(tableId)) {
          const dataTableObj = $s.DTObj[project][rowid][collName];
          console.log('dataTableObj', dataTableObj);
          $('#' + tableId).DataTable(dataTableObj);
        }
      }
    };

    const refreshFileTables = async rowid => {
      const tables = $(`.fileTables[sample_id="${rowid}"]`);
      console.log(tables);
      for (var i = 0; i < tables.length; i++) {
        const tableId = $(tables[i]).attr('id');
        const ext = $(tables[i]).attr('ext');
        const serverURL = $(tables[i]).attr('serverURL');
        if (!$.fn.DataTable.isDataTable(tableId)) {
          const { data } = await axios({
            method: 'POST',
            url: '/api/v1/misc/getDnextReportContent',
            data: { url: serverURL }
          });
          let sep = '\t';
          if (ext == 'csv') sep = ',';
          const fixHeader = true;
          dataTableObj = tsvCsvDatatablePrep(data.data, fixHeader, sep);
          //speed up the table loading
          dataTableObj.destroy = true;
          dataTableObj.hover = true;
          // speed up the table loading
          dataTableObj.deferRender = true;
          dataTableObj.scroller = true;
          dataTableObj.scrollCollapse = true;
          dataTableObj.scrollX = 500;
          dataTableObj.sScrollX = true;
          dataTableObj.columnDefs = [{ defaultContent: '-', targets: '_all' }];

          $('#' + tableId).DataTable(dataTableObj);
        }
      }
    };
  };

  if ($.fn.DataTable.isDataTable(TableID)) {
    $(TableID)
      .DataTable()
      .destroy();
  }
  insertTableHeaders(TableID);
  let columns = [];
  for (var i = 0; i < $s.mainCols.length; i++) {
    if ($s.mainCols[i] == '$detailsButton') {
      columns.push({
        data: null,
        fnCreatedCell: function(nTd, sData, oData, iRow, iCol) {
          let btn = '';
          if (oData.run_url) {
            var run_url = oData.run_url;
            btn = `<a href="${run_url}" target="_blank">View Run</a>`;
          }
          $(nTd).html(btn);
        }
      });
    } else if ($s.mainCols[i] == '$plusButton') {
      columns.push({
        className: 'details-control',
        orderable: false,
        data: null,
        defaultContent: '<i class="cil-plus"></i>'
      });
    } else {
      columns.push({ data: $s.mainCols[i] });
    }
  }
  var dataTableObj = {
    columns: columns,
    // select: {
    //   style: 'multi',
    //   selector: 'td:not(.no_select_row)'
    // },
    // order: [[24, 'desc']],
    columnDefs: [
      {
        targets: getHideColIds(),
        visible: false
      },
      { defaultContent: '-', targets: '_all' } //hides undefined error
    ],
    initComplete: initCompDmetaTable,
    lengthMenu: [
      [10, 25, 50, -1],
      [10, 25, 50, 'All']
    ]
  };

  dataTableObj.dom = '<"' + searchBarID + '.pull-left"f>lrt<"pull-left"i><"bottom"p><"clear">';
  dataTableObj.pageLength = 25;
  dataTableObj.destroy = true;
  dataTableObj.data = data;
  dataTableObj.hover = true;
  // speed up the table loading
  dataTableObj.deferRender = true;
  dataTableObj.scroller = true;
  dataTableObj.scrollCollapse = true;
  dataTableObj.scrollX = 500;
  dataTableObj.sScrollX = true;
  console.log(dataTableObj);
  $s.dmetaTable = $(TableID).DataTable(dataTableObj);
};

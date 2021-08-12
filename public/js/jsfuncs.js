/* eslint-disable */
const JSON5 = require('json5');

export const cleanSpecChar = n => {
  if (n) {
    n = n
      .replace(/-/g, '_')
      .replace(/:/g, '_')
      .replace(/,/g, '_')
      .replace(/\$/g, '_')
      .replace(/\!/g, '_')
      .replace(/\</g, '_')
      .replace(/\>/g, '_')
      .replace(/\?/g, '_')
      .replace(/\(/g, '_')
      .replace(/\)/g, '_')
      .replace(/\"/g, '_')
      .replace(/\'/g, '_')
      .replace(/\./g, '_')
      .replace(/\//g, '_')
      .replace(/\\/g, '_')
      .replace(/@/g, '_');
  }
  return n;
};

export const prepareDmetaData = data => {
  let ret = [];
  if (data.data && data.data.data) {
    ret = data.data.data;
  }
  return ret;
};

//prepare datatables input
//columns: [{"title":"id"}, {"title":"name"}]
//data: [["123","John Doe Fresno"],["124", "Alice Alicia"]]
export const tsvCsvDatatablePrep = (tsvCsv, fixHeader, sep) => {
  if (!tsvCsv) return '';
  var result = { columns: [], data: [] };
  var cols = result.columns;
  var data = result.data;
  var tsvCsv = $.trim(tsvCsv);
  var lines = tsvCsv.split('\n');
  if (fixHeader) {
    lines[0] = lines[0].replace(/\./g, '_');
  }
  var headers = lines[0].split(sep);
  for (var i = 0; i < headers.length; i++) {
    cols.push({ title: headers[i] });
  }
  for (var i = 1; i < lines.length; i++) {
    var currentline = lines[i].split(sep);
    data.push(currentline);
  }
  console.log(result);
  return result;
};

// prepare dmeta output collections for datatables
// Additional header names: Run Info, Files
// input data:  [{"Run Info":"run name"}, {"Run Info":"run name", "Files":3}, {"total_cells":10, "total_reads":100}]
//columns: [{"title":"id"}, {"title":"name"}]
//data: [["123","John Doe Fresno"],["124", "Alice Alicia"]]
export const dmetaOutDatatablePrep = dmeta => {
  const fixHeader = true;
  const plusButton = true;
  if (!dmeta) return '';
  let result = { columns: [], data: [] };
  let cols = result.columns;
  let data = result.data;
  // get all column headers of the input data
  let allColumns = [];
  for (var i = 0; i < dmeta.length; i++) {
    const keys = Object.keys(dmeta[i]);
    allColumns = allColumns.concat(keys.filter(item => allColumns.indexOf(item) < 0));
  }
  // re-order 'Run Info', 'Files' to the beggining of the array
  let reOrderCols = ['Run Info', 'Files'];
  reOrderCols.reverse();
  for (var i = 0; i < reOrderCols.length; i++) {
    const index = allColumns.indexOf(reOrderCols[i]);
    if (index > -1) {
      allColumns.splice(index, 1);
      allColumns.unshift(reOrderCols[i]);
    }
  }
  if (fixHeader) {
    allColumns = allColumns.map(item => {
      return item.replace(/\./g, '_');
    });
  }
  if (plusButton) {
    allColumns.unshift('$plusButton');
  }

  for (var i = 0; i < allColumns.length; i++) {
    if (allColumns[i] == '$plusButton') {
      cols.push({
        className: 'outdetails-control',
        orderable: false,
        data: null,
        defaultContent: '<i class="cil-plus"></i>'
      });
    } else {
      cols.push({ title: allColumns[i] });
    }
  }
  for (var i = 0; i < dmeta.length; i++) {
    let arr = [];
    for (var k = 0; k < allColumns.length; k++) {
      let push = '';
      if (dmeta[i][allColumns[k]]) {
        push = dmeta[i][allColumns[k]];
      }
      arr.push(push);
    }
    data.push(arr);
  }
  return result;
};

export const getFormRow = (element, label, settings) => {
  let required = '';
  let description = '';
  let hide = '';
  if (settings && settings.required) {
    required = '<span style="color:red";>*</span>';
  }
  if (settings && settings.hidden) return '';
  if (settings && settings.hide) hide = `style="display:none;"`;
  let ret = `
    <div class="form-group row" ${hide}>
        <label class="col-md-3 col-form-label text-right">${label}${required}</label>
        <div class="col-md-9">
            ${element}
        </div>
    </div>`;
  return ret;
};

export const showInfoModal = text => {
  const modalId = '#infoModal';
  const textID = '#infoModalText';
  //true if modal is open
  if ($(textID).html().length) {
    const oldText = $(textID).html();
    const newText = oldText + '<br/><br/>' + text;
    $(textID).html(newText);
  } else {
    $(modalId).off();
    $(modalId).on('show.coreui.modal', function(event) {
      $(textID).html(text);
    });
    $(modalId).on('hide.coreui.modal', function(event) {
      $(textID).html('');
    });
    $(modalId).modal('show');
  }
};

//use name attr to fill form
export const fillFormByName = (formId, find, data, reset) => {
  if (reset && $(formId)[0] && $(formId)[0].reset) $(formId)[0].reset();
  const formValues = $(formId).find(find);
  for (var k = 0; k < formValues.length; k++) {
    const nameAttr = $(formValues[k]).attr('name');
    const radioCheck = $(formValues[k]).is(':radio');
    const checkboxCheck = $(formValues[k]).is(':checkbox');
    // if select-text-opt class is found, select dropdown options based on text of the options
    const isSelectTextOpt = $(formValues[k]).hasClass('select-text-opt');
    // if selectized
    const isSelectized = $(formValues[k]).hasClass('selectized');
    // console.log('isSelectized', isSelectized, $(formValues[k]));
    // console.log('isSelectTextOpt', isSelectTextOpt, $(formValues[k]));
    if (data[nameAttr]) {
      if (radioCheck) {
        if (data[nameAttr] == $(formValues[k]).val()) {
          $(formValues[k]).attr('checked', true);
        }
      } else if (checkboxCheck) {
        if (
          data[nameAttr] == $(formValues[k]).val() ||
          data[nameAttr] === true ||
          data[nameAttr] === 'true'
        ) {
          $(formValues[k]).attr('checked', true);
        } else {
          $(formValues[k]).attr('checked', false);
        }
      } else {
        if (data[nameAttr] === 'on') {
          $(formValues[k]).attr('checked', true);
        } else {
          if (isSelectTextOpt && isSelectized) {
            const options = $(formValues[k])[0].selectize.options;
            let item = '';
            Object.keys(options).forEach((k, i) => {
              if (options[k].text == data[nameAttr]) item = k;
            });
            if (item) $(formValues[k])[0].selectize.setValue(item, false);
          } else if (isSelectTextOpt) {
            const item = $(formValues[k])
              .find('option')
              .filter(function() {
                return $(this).html() == data[nameAttr];
              })
              .val();
            if (item) $(formValues[k]).val(item);
          } else if (isSelectized) {
            $(formValues[k])[0].selectize.setValue(data[nameAttr], false);
          } else {
            $(formValues[k]).val(data[nameAttr]);
          }
        }
      }
    }
  }
};

// creates object of the form fields and change color of requiredFields
// if warn set to true, 'Please provide a valid information.' information will be added to field
// if visible set to true => display of field shouldn't be none;
// if visible set to "undefined" => hidden fields set to "undefined" to remove from db.
export const createFormObj = (formValues, requiredFields, warn, visible) => {
  var formObj = {};
  var stop = false;
  for (var i = 0; i < formValues.length; i++) {
    var name = $(formValues[i]).attr('name');
    var type = $(formValues[i]).attr('type');
    const isCustomized = $(formValues[i]).hasClass('customized');
    const isSelectized = $(formValues[i]).hasClass('selectized');
    const isDataPerms = $(formValues[i]).hasClass('data-perms');
    const isDataRestrictTo = $(formValues[i]).hasClass('data-restrictTo');
    const isDynamicFields = $(formValues[i]).hasClass('dynamicFields');
    if (isDynamicFields) continue;

    const isSetExist = $(formValues[i]).siblings('.multi-value').length;
    const isSet =
      $(formValues[i]).siblings('.multi-value').length &&
      $(formValues[i])
        .siblings('.multi-value')
        .css('display') === 'none';

    var val = '';
    if (type == 'radio') {
      for (var k = 0; k < formValues.length; k++) {
        if ($(formValues[k]).attr('name')) {
          if ($(formValues[k]).attr('name') == name && $(formValues[k]).is(':checked')) {
            val = $(formValues[k]).val();
            break;
          }
        }
      }
    } else if (type == 'checkbox') {
      if ($(formValues[i]).is(':checked')) {
        val = true;
      } else {
        val = false;
      }
    } else if ($(formValues[i]).is('select')) {
      if ($(formValues[i]).val() === '') {
        val = '';
      } else {
        val = $(formValues[i]).val();
      }
    } else {
      val = $(formValues[i]).val();
    }
    if (requiredFields.includes(name)) {
      if (val != '' && val !== null) {
        $(formValues[i]).removeClass('is-invalid');
        if (warn && $(formValues[i]).next('div.invalid-feedback').length == 1) {
          $(formValues[i])
            .next('div.invalid-feedback')
            .remove();
        }
      } else {
        $(formValues[i]).addClass('is-invalid');
        if (warn && $(formValues[i]).next('div.invalid-feedback').length == 0) {
          $(formValues[i]).after(
            '<div class="invalid-feedback text-left">Please provide a valid information.</div>'
          );
        }
        stop = true;
      }
    }

    if (
      isCustomized &&
      $(formValues[i])
        .next()
        .hasClass('dynamicFields')
    ) {
      val = getDynamicFieldsData($(formValues[i]).next());
    }

    if (isDataPerms || isDataRestrictTo) {
      const table = $(formValues[i])
        .next()
        .find('table');
      const rowData = table
        .DataTable()
        .rows()
        .data();
      val = {};
      for (var k = 0; k < rowData.length; k++) {
        const perm = rowData[k].perm;
        const type = rowData[k].type;
        const id = rowData[k].id;
        if (isDataPerms && perm && type && id) {
          if (!(perm in val)) val[perm] = {};
          if (!(type in val[perm])) val[perm][type] = [];
          if (!val[perm][type].includes(id)) val[perm][type].push(id);
        } else if (isDataRestrictTo && type && id) {
          if (!(type in val)) val[type] = [];
          if (!val[type].includes(id)) val[type].push(id);
        }
      }
    }

    if (
      (isSelectized || isDataPerms || isDataRestrictTo || isCustomized) &&
      visible &&
      !isSet &&
      isSetExist
    ) {
      if (visible == 'undefined') {
        val = 'undefined';
      } else {
        continue;
      }
    }

    if (
      isSetExist &&
      !isDataPerms &&
      !isSelectized &&
      !isDataRestrictTo &&
      !isCustomized &&
      visible &&
      ($(formValues[i]).css('display') == 'none' ||
        $(formValues[i])
          .closest('.row')
          .css('display') == 'none')
    ) {
      if (visible == 'undefined') {
        val = 'undefined';
      } else {
        continue;
      }
    }
    // for event form update
    // if (!isSetExist && visible == 'undefined') val = $(formValues[i]).val();
    if (name) formObj[name] = val;
  }
  return [formObj, stop];
};

export const IsJsonString = str => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};
export const IsJson5String = str => {
  try {
    console.log(str);
    console.log(JSON5.parse(str));
    JSON5.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

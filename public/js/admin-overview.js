/* eslint-disable */
import axios from 'axios';
import moment from 'moment';
const JSON5 = require('json5');
import {
  showInfoModal,
  createFormObj,
  fillFormByName,
  getFormRow,
  prepareDmetaData,
  IsJson5String
} from './jsfuncs';

// GLOBAL SCOPE
let $s = { projects: [], collections: [], apiConfigs: [], usergroups: {}, server: [] };

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

const getErrorDiv = () => {
  return '<p style="background-color:#e211112b;" id="crudModalError"></p>';
};
const getGroupMemberTableOptions = (owner_id, u_id) => {
  var button = '';
  if (owner_id === u_id) {
    //if user is the owner of the group
    var button = `<div class="btn-group">
        <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-expanded="true">Options <span class="fa fa-caret-down"></span></button>
        <ul class="dropdown-menu" role="menu">
          <li><a class="dropdown-item removeUserFromGroup" >Remove User from Group</a></li>
        </ul></div>`;
  }
  return button;
};

const getAdminTableOptions = (active, role) => {
  var button = `<div class="btn-group">
      <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-expanded="true">Options <span class="fa fa-caret-down"></span></button>
      <ul class="dropdown-menu dropdown-menu-right" role="menu">
        <li><a class="dropdown-item editUser">Edit User</a></li>
        <li><a class="dropdown-item deleteUser">Delete User</a></li>
      </ul>
    </div>`;
  return button;
};
const getConfigTableOptions = (active, role) => {
  var button = `<div class="btn-group">
      <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-expanded="true">Options <span class="fa fa-caret-down"></span></button>
      <ul class="dropdown-menu dropdown-menu-right" role="menu">
        <li><a class="dropdown-item editConfig">Edit Config</a></li>
        <li><a class="dropdown-item deleteConfig">Delete Config</a></li>
      </ul>
    </div>`;
  return button;
};

const getServerTableOptions = () => {
  var button = `<div class="btn-group">
      <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-expanded="true">Options <span class="fa fa-caret-down"></span></button>
      <ul class="dropdown-menu dropdown-menu-right" role="menu">
        <li><a class="dropdown-item editServer">Edit Server</a></li>
        <li><a class="dropdown-item deleteServer">Delete Server</a></li>
      </ul>
    </div>`;
  return button;
};

const getGroupTableOptions = (owner_id, u_id) => {
  if (owner_id === u_id) {
    //if user is the owner of the group
    var button = `<div class="btn-group">
        <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-expanded="true">Options <span class="fa fa-caret-down"></span></button>
        <ul class="dropdown-menu" role="menu">
          <li><a class="dropdown-item viewGroupMembers">View Group Members</a></li>
          <li><a class="dropdown-item addUsers">Edit Group Members</a></li>
          <li><a class="dropdown-item editGroup">Edit Group Name</a></li>
          <li><a class="dropdown-item deleteGroup">Delete Group</a></li>
        </ul>
      </div>`;
  } else {
    var button = `<div class="btn-group"><button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-expanded="true">Options <span class="fa fa-caret-down"></span></button>
    <ul class="dropdown-menu" role="menu">
      <li><a class="dropdown-item viewGroupMembers">View Group Members</a></li>
    </ul>
    </div>`;
  }
  return button;
};

const refreshGroupUsersTable = async (TableID, rowData, group_id) => {
  let data = [];
  try {
    [data] = await Promise.all([ajaxCall('GET', `/api/v1/groups/${group_id}/user`)]);
  } catch (err) {
    console.log(err);
  }
  if (!data) data = [];
  if ($.fn.DataTable.isDataTable(`#${TableID}`)) {
    console.log('1');
    $(`#${TableID}`)
      .DataTable()
      .destroy();
  }
  if (!$.fn.DataTable.isDataTable(`#${TableID}`)) {
    let columns = [];
    columns.push({ data: 'name' });
    columns.push({ data: 'username' });
    columns.push({ data: 'email' });
    columns.push({
      data: null,
      fnCreatedCell: function(nTd, sData, oData, iRow, iCol) {
        $(nTd).html(getGroupMemberTableOptions(rowData.owner, rowData.user_id));
      }
    });
    var dataTableObj = {
      columns: columns,
      columnDefs: [
        { defaultContent: '', targets: '_all' } //hides undefined error,
      ]
    };
    dataTableObj.dom = '<"pull-left"f>lrt<"pull-left"i><"bottom"p><"clear">';
    dataTableObj.destroy = true;
    dataTableObj.pageLength = 10;
    dataTableObj.data = data;
    dataTableObj.hover = true;
    // speed up the table loading
    dataTableObj.deferRender = true;
    dataTableObj.scroller = true;
    dataTableObj.scrollCollapse = true;
    // dataTableObj.sScrollX = true; // dropdown remains under the datatable div
    $s.TableID = $(`#${TableID}`).DataTable(dataTableObj);
  }
};

const refreshGroupTable = async () => {
  const TableID = 'table-groups';
  try {
    let [usergroups] = await Promise.all([ajaxCall('GET', '/api/v1/groups/related')]);
    $s.usergroups = usergroups;
  } catch {
    $s.usergroups = [];
  }
  if (!$s.usergroups) $s.usergroups = [];
  const data = $s.usergroups;
  let fomatted_data = [];
  if (data.length) {
    fomatted_data = data.map(i => {
      i.creationDate = moment(i.creationDate).format('YYYY-MM-DD');
      return i;
    });
  }
  if ($.fn.DataTable.isDataTable(`#${TableID}`)) {
    $(`#${TableID}`)
      .DataTable()
      .destroy();
  }
  if (!$.fn.DataTable.isDataTable(`#${TableID}`)) {
    let columns = [];
    columns.push({ data: 'name' });
    columns.push({ data: 'owner_username' });
    columns.push({ data: 'creationDate' });
    columns.push({
      data: null,
      fnCreatedCell: function(nTd, sData, oData, iRow, iCol) {
        $(nTd).html(getGroupTableOptions(oData.owner, oData.user_id));
      }
    });
    var dataTableObj = {
      columns: columns,
      columnDefs: [
        { defaultContent: '', targets: '_all' } //hides undefined error,
      ]
    };
    dataTableObj.dom = '<"pull-left"f>lrt<"pull-left"i><"bottom"p><"clear">';
    dataTableObj.destroy = true;
    dataTableObj.pageLength = 10;
    dataTableObj.data = fomatted_data;
    dataTableObj.hover = true;
    // speed up the table loading
    dataTableObj.deferRender = true;
    dataTableObj.scroller = true;
    dataTableObj.scrollCollapse = true;
    // dataTableObj.sScrollX = true; // dropdown remains under the datatable div
    $s.TableID = $(`#${TableID}`).DataTable(dataTableObj);
  }
};

const refreshServerTable = async () => {
  const TableID = 'table-servers';
  try {
    let [server] = await Promise.all([ajaxCall('GET', '/api/v1/server')]);
    $s.server = server;
  } catch {
    $s.server = [];
  }
  console.log($s.server);
  const fomatted_data = $s.server;
  if ($.fn.DataTable.isDataTable(`#${TableID}`)) {
    $(`#${TableID}`)
      .DataTable()
      .destroy();
  }

  if (!$.fn.DataTable.isDataTable(`#${TableID}`)) {
    let columns = [];
    columns.push({ data: '_id' });
    columns.push({ data: 'name' });
    columns.push({ data: 'type' });
    columns.push({ data: 'url_client' });
    columns.push({ data: 'url_server' });
    columns.push({
      data: null,
      fnCreatedCell: function(nTd, sData, oData, iRow, iCol) {
        $(nTd).html(getServerTableOptions());
      }
    });
    var dataTableObj = {
      columns: columns,
      columnDefs: [
        { defaultContent: '', targets: '_all' } //hides undefined error,
      ]
    };
    dataTableObj.dom = '<"pull-left"f>lrt<"pull-left"i><"bottom"p><"clear">';
    dataTableObj.destroy = true;
    dataTableObj.pageLength = 10;
    dataTableObj.data = fomatted_data;
    dataTableObj.hover = true;
    // speed up the table loading
    dataTableObj.deferRender = true;
    dataTableObj.scroller = true;
    dataTableObj.scrollCollapse = true;
    // dataTableObj.sScrollX = true; // dropdown remains under the datatable div
    $s.TableID = $(`#${TableID}`).DataTable(dataTableObj);
  }
};

const refreshConfigTable = async () => {
  const TableID = 'table-configs';
  try {
    let [configs] = await Promise.all([ajaxCall('GET', '/api/v1/config')]);
    $s.configs = configs;
  } catch {
    $s.configs = [];
  }
  console.log($s.configs);
  if (!$s.configs) $s.configs = [];
  const data = $s.configs;
  let fomatted_data = [];
  if (data.length) {
    fomatted_data = data.map(i => {
      i.creationDate = moment(i.creationDate).format('YYYY-MM-DD');
      return i;
    });
  }
  if ($.fn.DataTable.isDataTable(`#${TableID}`)) {
    $(`#${TableID}`)
      .DataTable()
      .destroy();
  }

  if (!$.fn.DataTable.isDataTable(`#${TableID}`)) {
    let columns = [];
    columns.push({ data: '_id' });
    columns.push({ data: 'project_name' });
    columns.push({
      data: 'graphs',
      fnCreatedCell: function(nTd, sData, oData, iRow, iCol) {
        $(nTd).html(JSON.stringify(oData.graphs).substring(0, 30) + '...');
      }
    });
    columns.push({
      data: 'columns',
      fnCreatedCell: function(nTd, sData, oData, iRow, iCol) {
        $(nTd).html(JSON.stringify(oData.columns).substring(0, 30) + '...');
      }
    });
    columns.push({
      data: null,
      fnCreatedCell: function(nTd, sData, oData, iRow, iCol) {
        $(nTd).html(getConfigTableOptions(oData.active, oData.role));
      }
    });
    var dataTableObj = {
      columns: columns,
      columnDefs: [
        { defaultContent: '', targets: '_all' } //hides undefined error,
      ]
    };
    dataTableObj.dom = '<"pull-left"f>lrt<"pull-left"i><"bottom"p><"clear">';
    dataTableObj.destroy = true;
    dataTableObj.pageLength = 10;
    dataTableObj.data = fomatted_data;
    dataTableObj.hover = true;
    // speed up the table loading
    dataTableObj.deferRender = true;
    // dataTableObj.scroller = true;
    // dataTableObj.scrollCollapse = true;
    // dataTableObj.sScrollX = true; // dropdown remains under the datatable div
    $s.TableID = $(`#${TableID}`).DataTable(dataTableObj);
  }
};

const refreshAdminTable = async () => {
  const TableID = 'table-admin';
  try {
    let [users] = await Promise.all([ajaxCall('GET', '/api/v1/users')]);
    $s.users = users;
  } catch {
    $s.users = [];
  }
  console.log($s.users);
  if (!$s.users) $s.users = [];
  const data = $s.users;
  let fomatted_data = [];
  if (data.length) {
    fomatted_data = data.map(i => {
      i.creationDate = moment(i.creationDate).format('YYYY-MM-DD');
      return i;
    });
  }
  if ($.fn.DataTable.isDataTable(`#${TableID}`)) {
    $(`#${TableID}`)
      .DataTable()
      .destroy();
  }

  if (!$.fn.DataTable.isDataTable(`#${TableID}`)) {
    let columns = [];
    columns.push({ data: '_id' });
    columns.push({ data: 'name' });
    columns.push({ data: 'username' });
    columns.push({ data: 'email' });
    columns.push({ data: 'role' });
    columns.push({ data: 'active' });
    columns.push({ data: 'creationDate' });
    columns.push({
      data: null,
      fnCreatedCell: function(nTd, sData, oData, iRow, iCol) {
        $(nTd).html(getAdminTableOptions(oData.active, oData.role));
      }
    });
    var dataTableObj = {
      columns: columns,
      columnDefs: [
        { defaultContent: '', targets: '_all' } //hides undefined error,
      ]
    };
    dataTableObj.dom = '<"pull-left"f>lrt<"pull-left"i><"bottom"p><"clear">';
    dataTableObj.destroy = true;
    dataTableObj.pageLength = 10;
    dataTableObj.data = fomatted_data;
    dataTableObj.hover = true;
    // speed up the table loading
    dataTableObj.deferRender = true;
    dataTableObj.scroller = true;
    dataTableObj.scrollCollapse = true;
    // dataTableObj.sScrollX = true; // dropdown remains under the datatable div
    $s.TableID = $(`#${TableID}`).DataTable(dataTableObj);
  }
};

const getTableHeaders = labels => {
  let ret = '';
  for (var i = 0; i < labels.length; i++) {
    ret += `<th>${labels[i]}</th>`;
  }
  return ret;
};

const getGroupsTab = id => {
  const headers = getTableHeaders(['Group Name', 'Owner', 'Created On', 'Options']);
  const tableID = `table-${id}`;
  const table = `
  <div class="table-responsive" style="overflow-x:auto; width:100%; ">
    <table id="${tableID}" class="table table-striped" style='white-space: nowrap; width:100%;' cellspacing="0" >
        <thead>
            <tr>
            ${headers}
            </tr>
        </thead>
        <tbody>
        </tbody>
    </table>
  </div>`;
  const button = `<button class="btn btn-primary create-group" type="button">Create a Group</button>`;
  const groups = `
  <div style="margin-top:10px;" class="row">
    <div class="col-sm-12">
      <div class="card">
        <div class="card-header"> 
          <span style="font-size:large; font-weight:600;"><i class="cil-people"> </i> Groups</span>
          <div style="float:right;" class="card-header-actions">${button}</div>
        </div>
        <div class="card-body">
          ${table}
        </div>
      </div>
    </div>
  </div>`;
  return groups;
};

const getServersTab = id => {
  const headers = getTableHeaders(['ID', 'Name', 'Type', 'URL Client', 'URL Server', 'Options']);
  const tableID = `table-${id}`;
  const table = `
  <div class="table-responsive" style="overflow-x:auto; width:100%; ">
    <table id="${tableID}" class="table table-striped" style='white-space: nowrap; width:100%;' cellspacing="0" >
        <thead>
            <tr>
            ${headers}
            </tr>
        <tbody>
        </tbody>
    </thead>
    </table>
  </div>`;
  const button = `<button class="btn btn-primary admin-add-server" type="button">Add a Server</button>`;
  const groups = `
  <div style="margin-top:10px;" class="row">
    <div class="col-sm-12">
      <div class="card">
        <div class="card-header"> 
        <span style="font-size:large; font-weight:600;"><i class="cil-sitemap"> </i> Server Panel</span>
          <div style="float:right;" class="card-header-actions">
            ${button}
          </div>
        </div>
      <div class="card-body">
        ${table}
      </div>
    </div>
    </div>
  </div>`;
  return groups;
};
const getConfigsTab = id => {
  const headers = getTableHeaders(['ID', 'Project Name', 'Graphs', 'Columns', 'Options']);
  const tableID = `table-${id}`;
  const table = `
    <div class="table-responsive" style="overflow-x:auto; width:100%; ">
      <table id="${tableID}" class="table table-striped" style='white-space: nowrap; width:100%;' cellspacing="0" >
          <thead>
              <tr>
              ${headers}
              </tr>
          <tbody>
          </tbody>
      </thead>
      </table>
    </div>`;
  const button = `<button class="btn btn-primary admin-add-config" type="button">Add a Project Config</button>`;
  const groups = `
    <div style="margin-top:10px;" class="row">
      <div class="col-sm-12">
        <div class="card">
          <div class="card-header"> 
          <span style="font-size:large; font-weight:600;"><i class="cil-sitemap"> </i> Project Configuration Panel</span>
            <div style="float:right;" class="card-header-actions">
              ${button}
            </div>
          </div>
        <div class="card-body">
          ${table}
        </div>
      </div>
      </div>
    </div>`;
  return groups;
};
const getAdminTab = id => {
  const headers = getTableHeaders([
    'ID',
    'Name',
    'Username',
    'E-mail',
    'Role',
    'Active',
    'Member Date',
    'Options'
  ]);
  const tableID = `table-${id}`;
  const table = `
  <div class="table-responsive" style="overflow-x:auto; width:100%; ">
    <table id="${tableID}" class="table table-striped" style='white-space: nowrap; width:100%;' cellspacing="0" >
        <thead>
            <tr>
            ${headers}
            </tr>
        <tbody>
        </tbody>
    </thead>
    </table>
  </div>`;
  const button = `<button class="btn btn-primary admin-add-user" type="button">Add a User</button>`;
  const groups = `
  <div style="margin-top:10px;" class="row">
    <div class="col-sm-12">
      <div class="card">
        <div class="card-header"> 
        <span style="font-size:large; font-weight:600;"><i class="cil-people"> </i> User Panel</span>
          <div style="float:right;" class="card-header-actions">
            ${button}
          </div>
        </div>
      <div class="card-body">
        ${table}
      </div>
    </div>
    </div>
  </div>`;
  return groups;
};

export const loadProfileTabContent = userRole => {
  if (userRole == 'admin') {
    refreshConfigTable();
    // refreshAdminTable();
  }
};

const getGroupForm = () => {
  let ret = `<form id="groupForm">`;
  const nameElement = `<input class="form-control" type="text" name="name" required value=""></input>`;
  ret += getFormRow(nameElement, 'Group Name', {});
  ret += '</form>';
  return ret;
};

const getInputElement = (name, attr) => {
  return `<input class="form-control" type="text" name="${name}" ${attr} value=""></input>`;
};
const getTextareaElement = (name, attr) => {
  return `<textarea name="${name}" ${attr} class="form-control" value="" rows="5"></textarea>`;
};

const getDropdown = (name, data) => {
  let dropdown = `<select class="form-control" name="${name}">`;
  if (data) {
    data.forEach(i => {
      dropdown += `<option  value="${i}">${i}</option>`;
    });
  }
  dropdown += `</select>`;
  return dropdown;
};
const getArrObjDropdown = (name, data, settings) => {
  let placeholder = '';
  let className = '';
  let selected = '';
  let selectedText = '';
  if (settings.class) className = settings.class;
  if (settings.placeholder) placeholder = settings.placeholder;
  if (settings.selected) selected = settings.selected;
  let dropdown = `<select class="form-control ${className}" name="${name}" >`;
  if (placeholder) dropdown += `<option  selected disabled value="">${placeholder}</option>`;
  if (data) {
    data.forEach(i => {
      selectedText = '';
      if (selected && i._id == selected) {
        selectedText = 'selected';
      }
      dropdown += `<option  ${selectedText} value="${i._id}">${i.name}</option>`;
    });
  }
  dropdown += `</select>`;
  return dropdown;
};

const getAdminUserForm = () => {
  let ret = `<form id="userForm">`;
  ret += getFormRow(getInputElement('name', 'required'), 'Name', {});
  ret += getFormRow(getInputElement('username', 'required'), 'Username', {});
  ret += getFormRow(getInputElement('email', 'required'), 'E-mail', {});
  ret += getFormRow(getDropdown('role', ['user', 'project-admin', 'admin']), 'Role', {});
  ret += '</form>';
  return ret;
};

const getServerUserForm = () => {
  let ret = `<form id="serverForm">`;
  ret += getFormRow(getInputElement('name', 'required'), 'Name', {});
  ret += getFormRow(getDropdown('type', ['dnext', 'dmeta', 'dportal', 'dsso']), 'Type', {});
  ret += getFormRow(getInputElement('url_client', 'required'), 'URL Client', {});
  ret += getFormRow(getInputElement('url_server', 'required'), 'URL Server', {});
  ret += '</form>';
  return ret;
};
const getConfigUserForm = async () => {
  let ret = `<form id="configForm">`;
  // get Projects
  let res;
  try {
    const url = `/api/v1/projects`;
    const send = { url };
    res = await axios({
      method: 'POST',
      url: '/api/v1/dmeta',
      data: send
    });
  } catch (err) {
    console.log(err);
    showInfoModal(`Project is not found in Dmeta.`);
    return;
  }
  const projectData = prepareDmetaData(res.data);
  $s.projects = projectData;
  console.log(projectData);

  // get collections
  res = '';
  try {
    const url = `/api/v1/collections`;
    const send = { url };
    res = await axios({
      method: 'POST',
      url: '/api/v1/dmeta',
      data: send
    });
  } catch (err) {
    return;
  }
  $s.collections = prepareDmetaData(res.data);
  const projectDataDropdown = projectData.map(p => {
    return { _id: p.name, name: p.name };
  });
  ret += getFormRow(
    getArrObjDropdown('project_name', projectDataDropdown, {
      placeholder: ' -- Select --',
      class: 'validateProject'
    }),
    'Project',
    {}
  );
  //

  ret += getFormRow(
    getArrObjDropdown('api_config', [], {
      class: 'apiConfigRoute'
    }),
    'API Routes',
    {}
  );
  ret += getFormRow(
    `<div class="graph-settings" style="display:none;"></div>`,
    'Graph Settings',
    {}
  );
  ret += getFormRow(
    `<div class="check-columns" style="display:none;"></div>`,
    'Column Settings',
    {}
  );
  ret += '</form>';
  return ret;
};

const convertConfigFormat = formObj => {
  // columns
  let columns = [];
  const order = formObj.order.split(',');
  $('#config-column-table>tbody>tr').each(function(index) {
    const formValues = $(this).find('input,select');
    let [rowObj, stop] = createFormObj(formValues, '', true, true);
    rowObj.name = $(this)
      .find('[name=name')
      .html();
    columns.push(rowObj);
  });
  let reorderedColumns = [];
  for (let i = 0; i < order.length; i++) {
    reorderedColumns.push(columns.filter(c => c.name == order[i])[0]);
  }
  formObj.columns = reorderedColumns;

  // graph Settings
  let graphs = [];
  $('#graph-settings-table>tbody>tr').each(function(index) {
    const formValues = $(this).find('input,select');
    let [rowObj, stop] = createFormObj(formValues, '', true, true);
    rowObj.name = $(this)
      .find('[name=name')
      .html();
    graphs.push(rowObj);
  });
  console.log(graphs);
  formObj.graphs = graphs;
  return formObj;
};

const insertColumnSettingsTable = (keys, type) => {
  if (keys) {
    // let removeCol = ['_id'];
    // keys = keys.filter(item => !removeCol.includes(item));
    let tbody = '';

    for (let i = 0; i < keys.length; i++) {
      let label = '';
      let checked = '';
      if (type == 'new') {
        label = keys[i];
        checked = 'checked';
      }
      tbody += `
    <tr>
      <td><span name="name">${keys[i]}</span></td>
      <td><input class="form-control" type="text" name="label" value="${label}"></input></td>
      <td>
          <div class="form-check" style="margin-left: 25px;">
              <input name="main" type="checkbox" ${checked} class="form-check-input" style="position:relative;" >
          </div>
      </td>
      <td>
          <div class="form-check" style="margin-left: 25px;">
              <input name="visible" type="checkbox" ${checked} class="form-check-input" style="position:relative;" >
          </div>
      </td>
      <td>
          <div class="form-check" style="margin-left: 25px;">
              <input name="toogle" type="checkbox" ${checked} class="form-check-input" style="position:relative;" >
          </div>
      </td>
      <td>
          <div class="form-check" style="margin-left: 25px;">
              <input name="sidebar" type="checkbox" ${checked} class="form-check-input " style="position:relative;" >
          </div>
      </td>
    </tr>`;
    }
    let form = `
    <table id="config-column-table" class="table table-striped">
      <thead>
        <tr>
          <th>Column Name</th>
          <th>Column Label</th>
          <th>Main Table Column</th>
          <th>Visible on Load</th>
          <th>Allow Toogle</th>
          <th>Show in the sidebar</th>
        </tr>
      </thead>
      <tbody>
        ${tbody}
      </tbody>
    </table>`;
    const orderRow = getFormRow(
      `<input id="check-columns-order" class="form-control" type="text" name="order"  value="${keys.join(
        ','
      )}"></input>`,
      'Column Order',
      {}
    );
    $('div.check-columns').css('display', 'inline');
    $('div.check-columns').empty();
    $('div.check-columns').append(form);
    if (document.querySelector('#check-columns-order')) {
      $('div.check-columns')
        .closest('.row')
        .next()
        .remove();
    }
    $('div.check-columns')
      .closest('.row')
      .after(orderRow);
    $('#check-columns-order').selectize({
      plugins: ['drag_drop'],
      delimiter: ',',
      persist: true
    });
  }
};

const insertGraphSettingsTable = (keys, type, collectionName) => {
  if (keys) {
    let tbody = '';
    const fieldData = keys.map(k => {
      return { _id: k, name: k };
    });
    const fieldsDropdown = getArrObjDropdown('dataCol', fieldData, {
      placeholder: ' -- Select --',
      class: 'graph-field'
    });
    const barTypeDropdown = getArrObjDropdown('type', [{ _id: 'bar', name: 'bar' }], {});
    for (let i = 0; i < 3; i++) {
      let label = '';
      if (type == 'new') {
        label = collectionName;
      }
      tbody += `
    <tr>
      <td>${barTypeDropdown}</td>
      <td>${fieldsDropdown}</td>
      <td><input class="form-control" type="text" name="xLabel" value=""></input></td>
      <td><input class="form-control" type="text" name="yLabel" value="${label}"></input></td>
    </tr>`;
    }
    //{"type":"bar","dataCol":"status","xLabel":"Status","yLabel":"Samples"}]
    let form = `
    <table id="graph-settings-table" class="table table-striped">
      <thead>
        <tr>
          <th>Graph Type</th>
          <th>Data Field</th>
          <th>x-Axis Label</th>
          <th>y-Axis Label</th>
        </tr>
      </thead>
      <tbody>
        ${tbody}
      </tbody>
    </table>`;

    $('div.graph-settings').css('display', 'inline');
    $('div.graph-settings').empty();
    $('div.graph-settings').append(form);
  }
};
const fillDropdown = (apiConfigDropdown, dropdownData) => {
  $(apiConfigDropdown).empty();
  $(apiConfigDropdown).append(
    $('<option>', {
      value: '',
      text: '-- Select -- '
    })
  );
  for (let i = 0; i < dropdownData.length; i++) {
    $(apiConfigDropdown).append(
      $('<option>', {
        value: dropdownData[i]._id,
        text: dropdownData[i].name
      })
    );
  }
};
const validateProject = async projectName => {
  const projectID = $s.projects.filter(p => p.name == projectName)[0]._id;
  const apiConfigDropdown = $('#crudModal').find('[name="api_config"]');
  if (!projectID) return;
  const url = `/api/v1/config/apis?projectID=${projectID}`;
  const send = { url };
  let res;
  try {
    res = await axios({
      method: 'POST',
      url: '/api/v1/dmeta',
      data: send
    });
  } catch (err) {
    $(apiConfigDropdown).empty();
    showInfoModal(`Please define sample route in Dmeta API config for project configuration.`);
    return;
  }
  console.log(res.data);
  const apiConfigData = prepareDmetaData(res.data);
  $s.apiConfigs = apiConfigData;
  const dropdownData = apiConfigData.map(c => {
    let collectionName = '';
    const collectionData = $s.collections.filter(col => col._id === c.collectionID);
    if (collectionData && collectionData[0]) collectionName = collectionData[0].name;
    return {
      _id: c._id,
      name: `/api/v1/projects/${projectName}/data/${collectionName}/format/${c.route}`
    };
  });
  fillDropdown(apiConfigDropdown, dropdownData);
};

const bindEventHandlers = () => {
  // -------- CONFIGS ------------------------------
  $(document).on('change', `.graph-field`, async function(e) {
    const field = $(this).val();
    $(this)
      .closest('td')
      .next('td')
      .find('input')
      .val(field);
  });

  $(document).on('change', `.apiConfigRoute`, async function(e) {
    const apiConfigID = $(this).val();
    const apiConf = $s.apiConfigs.filter(a => a._id == apiConfigID);
    if (apiConf && apiConf[0] && apiConf[0].config && apiConf[0].config.rename) {
      let columns = apiConf[0].config.rename.split(' ');

      let collectionName = '';
      const collectionData = $s.collections.filter(col => col._id === apiConf[0].collectionID);
      if (collectionData && collectionData[0]) collectionName = collectionData[0].name;

      let type = 'new';
      // if ($('#crudModalTitle').text() == 'Insert Config') {
      //   type = 'new';
      // }
      insertGraphSettingsTable(columns, type, collectionName);
      insertColumnSettingsTable(columns, type);
    }
  });

  $(document).on('change', `.validateProject`, async function(e) {
    const projectName = $(this).val();
    validateProject(projectName);
  });
  const createGraphTable = (data, columns) => {
    console.log(data);
    let tbody = '';
    let keys = columns.map(d => d && d.name);
    const fieldData = keys.map(k => {
      return { _id: k, name: k };
    });
    for (let i = 0; i < data.length; i++) {
      const xLabel = data[i] && data[i].xLabel ? data[i].xLabel : '';
      const yLabel = data[i] && data[i].yLabel ? data[i].yLabel : '';
      const dataCol = data[i] && data[i].dataCol ? data[i].dataCol : '';

      const fieldsDropdown = getArrObjDropdown('dataCol', fieldData, {
        placeholder: ' -- Select --',
        class: 'graph-field',
        selected: dataCol
      });
      const barTypeDropdown = getArrObjDropdown('type', [{ _id: 'bar', name: 'bar' }], {});

      tbody += `
        <tr>
          <td>${barTypeDropdown}</td>
          <td>${fieldsDropdown}</td>
          <td><input class="form-control" type="text" name="xLabel" value="${xLabel}"></input></td>
          <td><input class="form-control" type="text" name="yLabel" value="${yLabel}"></input></td>
        </tr>`;
    }
    //{"type":"bar","dataCol":"status","xLabel":"Status","yLabel":"Samples"}]
    let form = `
        <table id="graph-settings-table" class="table table-striped">
          <thead>
            <tr>
              <th>Graph Type</th>
              <th>Data Field</th>
              <th>x-Axis Label</th>
              <th>y-Axis Label</th>
            </tr>
          </thead>
          <tbody>
            ${tbody}
          </tbody>
        </table>`;

    $('div.graph-settings').css('display', 'inline');
    $('div.graph-settings').empty();
    $('div.graph-settings').append(form);
  };

  const createConfigTable = data => {
    let tbody = '';
    let keys = data.map(d => d && d.name);
    for (let i = 0; i < data.length; i++) {
      const mainChecked = data[i] && data[i].main ? 'checked' : '';
      const visibleChecked = data[i] && data[i].visible ? 'checked' : '';
      const toogleChecked = data[i] && data[i].toogle ? 'checked' : '';
      const sidebarChecked = data[i] && data[i].sidebar ? 'checked' : '';
      const name = data[i] && data[i].name ? data[i].name : '';
      const label = data[i] && data[i].label ? data[i].label : '';
      tbody += `
    <tr>
      <td><span name="name">${name}</span></td>
      <td><input class="form-control" type="text" name="label" value="${label}"></input></td>
      <td>
          <div class="form-check" style="margin-left: 25px;">
              <input name="main" ${mainChecked} type="checkbox" class="form-check-input" style="position:relative;" >
          </div>
      </td>
      <td>
          <div class="form-check" style="margin-left: 25px;">
              <input name="visible" ${visibleChecked} type="checkbox" class="form-check-input" style="position:relative;" >
          </div>
      </td>
      <td>
          <div class="form-check" style="margin-left: 25px;">
              <input name="toogle" ${toogleChecked} type="checkbox" class="form-check-input" style="position:relative;" >
          </div>
      </td>
      <td>
          <div class="form-check" style="margin-left: 25px;">
              <input name="sidebar" ${sidebarChecked} type="checkbox" class="form-check-input " style="position:relative;" >
          </div>
      </td>
    </tr>`;
    }
    const form = `
    <table id="config-column-table" class="table table-striped">
      <thead>
        <tr>
          <th>Column Name</th>
          <th>Column Label</th>
          <th>Main Table Column</th>
          <th>Visible on Load</th>
          <th>Allow Toogle</th>
          <th>Show in the sidebar</th>
        </tr>
      </thead>
      <tbody>
        ${tbody}
      </tbody>
    </table>`;
    $('div.check-columns').css('display', 'inline');
    $('div.check-columns').empty();
    $('div.check-columns').append(form);
    const orderRow = getFormRow(
      `<input id="check-columns-order" class="form-control" type="text" name="order"  value="${keys.join(
        ','
      )}"></input>`,
      'Column Order',
      {}
    );
    $('div.check-columns')
      .closest('.row')
      .after(orderRow);
    $('#check-columns-order').selectize({
      plugins: ['drag_drop'],
      delimiter: ',',
      persist: true
    });
  };
  $(document).on('click', `button.admin-add-config`, async function(e) {
    $('#crudModalError').empty();
    const form = await getConfigUserForm();
    $('#crudModalTitle').text(`Insert Config`);
    $('#crudModalYes').text('Save');
    $('#crudModalBody').empty();
    $('#crudModalBody').append(getErrorDiv());
    $('#crudModalBody').append(form);
    $('#crudModal').off();

    $('#crudModal').on('click', '#crudModalYes', async function(e) {
      e.preventDefault();
      $('#crudModalError').empty();
      const formValues = $('#crudModal').find('input,select,textarea');
      const requiredValues = formValues.filter('[required]');
      const requiredFields = $.map(requiredValues, function(el) {
        return $(el).attr('name');
      });
      let [formObj, stop] = createFormObj(formValues, requiredFields, true, true);
      formObj = convertConfigFormat(formObj);
      if (!stop) {
        try {
          const res = await axios({
            method: 'POST',
            url: '/api/v1/config',
            data: formObj
          });
          if (res.data.status == 'success') {
            await refreshConfigTable();
            $('#crudModal').modal('hide');
          } else {
            showInfoModal('Error occured.');
          }
        } catch (err) {
          if (err.response && err.response.data && err.response.data.message) {
            showInfoModal(`Error occured.(${JSON.stringify(err.response.data.message)})`);
          } else {
            showInfoModal(`Error occured.(${JSON.stringify(err)})`);
          }
        }
      }
    });
    $('#crudModal').modal('show');
  });
  $(document).on('click', `a.deleteConfig`, async function(e) {
    const clickedRow = $(this).closest('tr');
    const table = $('#table-configs').DataTable();
    const data = table.row(clickedRow).data();
    const id = data._id;

    $('#crudModalTitle').text(`Remove Config`);
    $('#crudModalYes').text('Remove');
    $('#crudModalBody').empty();
    $('#crudModalBody').append(
      `<p>Are you sure you want to delete config (${data.project_name})?</p>`
    );
    $('#crudModal').off();
    $('#crudModal').on('click', '#crudModalYes', async function(e) {
      if (id) {
        try {
          const res = await axios({
            method: 'DELETE',
            url: `/api/v1/config/${id}`
          });
          await refreshConfigTable();
          $('#crudModal').modal('hide');
        } catch (err) {
          console.log(err);
          if (err.response && err.response.data && err.response.data.message) {
            showInfoModal(`Error occured.(${JSON.stringify(err.response.data.message)})`);
          } else {
            showInfoModal(`Error occured.(${JSON.stringify(err)})`);
          }
        }
      }
    });
    $('#crudModal').modal('show');
  });

  $(document).on('click', `a.editConfig`, async function(e) {
    const clickedRow = $(this).closest('tr');
    const table = $('#table-configs').DataTable();
    const data = table.row(clickedRow).data();
    const id = data._id;

    $('#crudModalError').empty();
    const form = await getConfigUserForm();
    $('#crudModalTitle').text(`Edit Config`);
    $('#crudModalYes').text('Save');
    $('#crudModalBody').empty();
    $('#crudModalBody').append(getErrorDiv());
    $('#crudModalBody').append(form);
    $('#crudModal').off();
    await validateProject(data.project_name);

    // $('#crudModal')
    //   .find('.apiConfigRoute')
    //   .val(data.api_config)
    //   .trigger('change');

    fillFormByName('#configForm', 'input, select,textarea', data, true);
    createConfigTable(data.columns);
    createGraphTable(data.graphs, data.columns);
    $('#crudModal').on('click', '#crudModalYes', async function(e) {
      e.preventDefault();
      $('#crudModalError').empty();
      const formValues = $('#crudModal').find('input,select,textarea');
      const requiredValues = formValues.filter('[required]');
      const requiredFields = $.map(requiredValues, function(el) {
        return $(el).attr('name');
      });
      let [formObj, stop] = createFormObj(formValues, requiredFields, true, true);
      formObj = convertConfigFormat(formObj);

      console.log(formObj);
      if (!stop) {
        try {
          const res = await axios({
            method: 'PATCH',
            url: `/api/v1/config/${id}`,
            data: formObj
          });
          console.log(res);
          if (res.data.status == 'success') {
            await refreshConfigTable();
            $('#crudModal').modal('hide');
          } else {
            showInfoModal('Error occured.');
          }
        } catch (err) {
          if (err.response && err.response.data && err.response.data.message) {
            showInfoModal(`Error occured.(${JSON.stringify(err.response.data.message)})`);
          } else {
            showInfoModal(`Error occured.(${JSON.stringify(err)})`);
          }
        }
      }
    });
    $('#crudModal').modal('show');
  });
  // -------- SERVERS ------------------------------
  $(document).on('click', `button.admin-add-server`, async function(e) {
    $('#crudModalError').empty();
    const form = getServerUserForm();
    $('#crudModalTitle').text(`Insert Server`);
    $('#crudModalYes').text('Save');
    $('#crudModalBody').empty();
    $('#crudModalBody').append(getErrorDiv());
    $('#crudModalBody').append(form);
    $('#crudModal').off();

    $('#crudModal').on('click', '#crudModalYes', async function(e) {
      e.preventDefault();
      $('#crudModalError').empty();
      const formValues = $('#crudModal').find('input,select');
      const requiredValues = formValues.filter('[required]');
      const requiredFields = $.map(requiredValues, function(el) {
        return $(el).attr('name');
      });
      let [formObj, stop] = createFormObj(formValues, requiredFields, true, true);
      if (stop === false) {
        try {
          const res = await axios({
            method: 'POST',
            url: '/api/v1/server',
            data: formObj
          });
          if (res.data.status == 'success') {
            await refreshServerTable();
            $('#crudModal').modal('hide');
          } else {
            showInfoModal('Error occured.');
          }
        } catch (err) {
          if (err.response && err.response.data && err.response.data.message) {
            showInfoModal(`Error occured.(${JSON.stringify(err.response.data.message)})`);
          } else {
            showInfoModal(`Error occured.(${JSON.stringify(err)})`);
          }
        }
      }
    });
    $('#crudModal').modal('show');
  });
  $(document).on('click', `a.deleteServer`, async function(e) {
    const clickedRow = $(this).closest('tr');
    const table = $('#table-servers').DataTable();
    const data = table.row(clickedRow).data();
    const user_id = data._id;

    $('#crudModalTitle').text(`Remove Server`);
    $('#crudModalYes').text('Remove');
    $('#crudModalBody').empty();
    $('#crudModalBody').append(`<p>Are you sure you want to delete server (${data.name})?</p>`);
    $('#crudModal').off();
    $('#crudModal').on('click', '#crudModalYes', async function(e) {
      if (user_id) {
        try {
          const res = await axios({
            method: 'DELETE',
            url: `/api/v1/server/${user_id}`
          });
          await refreshServerTable();
          $('#crudModal').modal('hide');
        } catch (err) {
          console.log(err);
          if (err.response && err.response.data && err.response.data.message) {
            showInfoModal(`Error occured.(${JSON.stringify(err.response.data.message)})`);
          } else {
            showInfoModal(`Error occured.(${JSON.stringify(err)})`);
          }
        }
      }
    });
    $('#crudModal').modal('show');
  });

  $(document).on('click', `a.editServer`, async function(e) {
    const clickedRow = $(this).closest('tr');
    const table = $('#table-servers').DataTable();
    const userData = table.row(clickedRow).data();
    const user_id = userData._id;

    $('#crudModalError').empty();
    const form = getServerUserForm();
    $('#crudModalTitle').text(`Edit Server`);
    $('#crudModalYes').text('Save');
    $('#crudModalBody').empty();
    $('#crudModalBody').append(getErrorDiv());
    $('#crudModalBody').append(form);
    $('#crudModal').off();
    fillFormByName('#serverForm', 'input, select', userData, true);

    $('#crudModal').on('click', '#crudModalYes', async function(e) {
      e.preventDefault();
      $('#crudModalError').empty();
      const formValues = $('#crudModal').find('input,select');
      const requiredValues = formValues.filter('[required]');
      const requiredFields = $.map(requiredValues, function(el) {
        return $(el).attr('name');
      });
      let [formObj, stop] = createFormObj(formValues, requiredFields, true, true);
      console.log(formObj);
      if (stop === false) {
        try {
          const res = await axios({
            method: 'PATCH',
            url: `/api/v1/server/${user_id}`,
            data: formObj
          });
          console.log(res);
          if (res.data.status == 'success') {
            await refreshServerTable();
            $('#crudModal').modal('hide');
          } else {
            showInfoModal('Error occured.');
          }
        } catch (err) {
          if (err.response && err.response.data && err.response.data.message) {
            showInfoModal(`Error occured.(${JSON.stringify(err.response.data.message)})`);
          } else {
            showInfoModal(`Error occured.(${JSON.stringify(err)})`);
          }
        }
      }
    });
    $('#crudModal').modal('show');
  });
  // -------- USERS -----------
  $(document).on('click', `button.admin-add-user`, async function(e) {
    $('#crudModalError').empty();
    const form = getAdminUserForm();
    $('#crudModalTitle').text(`Insert User`);
    $('#crudModalYes').text('Save');
    $('#crudModalBody').empty();
    $('#crudModalBody').append(getErrorDiv());
    $('#crudModalBody').append(form);
    $('#crudModal').off();

    $('#crudModal').on('click', '#crudModalYes', async function(e) {
      e.preventDefault();
      $('#crudModalError').empty();
      const formValues = $('#crudModal').find('input,select');
      const requiredValues = formValues.filter('[required]');
      const requiredFields = $.map(requiredValues, function(el) {
        return $(el).attr('name');
      });
      let [formObj, stop] = createFormObj(formValues, requiredFields, true, true);
      if (stop === false) {
        try {
          const res = await axios({
            method: 'POST',
            url: '/api/v1/users',
            data: formObj
          });
          if (res.data.status == 'success') {
            await refreshAdminTable();
            $('#crudModal').modal('hide');
          } else {
            showInfoModal('Error occured.');
          }
        } catch (err) {
          if (err.response && err.response.data && err.response.data.message) {
            showInfoModal(`Error occured.(${JSON.stringify(err.response.data.message)})`);
          } else {
            showInfoModal(`Error occured.(${JSON.stringify(err)})`);
          }
        }
      }
    });
    $('#crudModal').modal('show');
  });
  $(document).on('click', `a.deleteUser`, async function(e) {
    const clickedRow = $(this).closest('tr');
    const table = $('#table-admin').DataTable();
    const data = table.row(clickedRow).data();
    const user_id = data._id;

    $('#crudModalTitle').text(`Remove User`);
    $('#crudModalYes').text('Remove');
    $('#crudModalBody').empty();
    $('#crudModalBody').append(`<p>Are you sure you want to delete user (${data.name})?</p>`);
    $('#crudModal').off();
    $('#crudModal').on('click', '#crudModalYes', async function(e) {
      if (user_id) {
        try {
          const res = await axios({
            method: 'DELETE',
            url: `/api/v1/users/${user_id}`
          });
          await refreshAdminTable();
          $('#crudModal').modal('hide');
        } catch (err) {
          console.log(err);
          if (err.response && err.response.data && err.response.data.message) {
            showInfoModal(`Error occured.(${JSON.stringify(err.response.data.message)})`);
          } else {
            showInfoModal(`Error occured.(${JSON.stringify(err)})`);
          }
        }
      }
    });
    $('#crudModal').modal('show');
  });

  $(document).on('click', `a.editUser`, async function(e) {
    const clickedRow = $(this).closest('tr');
    const table = $('#table-admin').DataTable();
    const userData = table.row(clickedRow).data();
    const user_id = userData._id;

    $('#crudModalError').empty();
    const form = getAdminUserForm();
    $('#crudModalTitle').text(`Edit User`);
    $('#crudModalYes').text('Save');
    $('#crudModalBody').empty();
    $('#crudModalBody').append(getErrorDiv());
    $('#crudModalBody').append(form);
    $('#crudModal').off();
    fillFormByName('#userForm', 'input, select', userData, true);

    $('#crudModal').on('click', '#crudModalYes', async function(e) {
      e.preventDefault();
      $('#crudModalError').empty();
      const formValues = $('#crudModal').find('input,select');
      const requiredValues = formValues.filter('[required]');
      const requiredFields = $.map(requiredValues, function(el) {
        return $(el).attr('name');
      });
      let [formObj, stop] = createFormObj(formValues, requiredFields, true, true);
      console.log(formObj);
      if (stop === false) {
        try {
          const res = await axios({
            method: 'PATCH',
            url: `/api/v1/users/${user_id}`,
            data: formObj
          });
          console.log(res);
          if (res.data.status == 'success') {
            await refreshAdminTable();
            $('#crudModal').modal('hide');
          } else {
            showInfoModal('Error occured.');
          }
        } catch (err) {
          if (err.response && err.response.data && err.response.data.message) {
            showInfoModal(`Error occured.(${JSON.stringify(err.response.data.message)})`);
          } else {
            showInfoModal(`Error occured.(${JSON.stringify(err)})`);
          }
        }
      }
    });
    $('#crudModal').modal('show');
  });

  // -------- GROUPS -----------
  $(document).on('click', `a.deleteGroup`, async function(e) {
    const clickedRow = $(this).closest('tr');
    const grouptable = $('#table-groups').DataTable();
    const groupData = grouptable.row(clickedRow).data();
    const group_id = groupData._id;

    $('#crudModalTitle').text(`Remove Group`);
    $('#crudModalYes').text('Remove');
    $('#crudModalBody').empty();
    $('#crudModalBody').append(`<p>Are you sure you want to delete group (${groupData.name})?</p>`);
    $('#crudModal').off();
    $('#crudModal').on('click', '#crudModalYes', async function(e) {
      if (group_id) {
        try {
          const res = await axios({
            method: 'DELETE',
            url: `/api/v1/groups/${group_id}`
          });
          await refreshGroupTable();
          $('#crudModal').modal('hide');
        } catch (err) {
          if (err.response && err.response.data && err.response.data.message) {
            showInfoModal(`Error occured.(${JSON.stringify(err.response.data.message)})`);
          } else {
            showInfoModal(`Error occured.(${JSON.stringify(err)})`);
          }
        }
      }
    });
    $('#crudModal').modal('show');
  });

  $(document).on('click', `a.editGroup`, async function(e) {
    const clickedRow = $(this).closest('tr');
    const grouptable = $('#table-groups').DataTable();
    const groupData = grouptable.row(clickedRow).data();
    const group_id = groupData._id;

    $('#crudModalError').empty();
    const groupForm = getGroupForm();
    $('#crudModalTitle').text(`Edit Group`);
    $('#crudModalYes').text('Save');
    $('#crudModalBody').empty();
    $('#crudModalBody').append(getErrorDiv());
    $('#crudModalBody').append(groupForm);
    $('#crudModal').off();
    fillFormByName('#groupForm', 'input, select', groupData, true);

    $('#crudModal').on('click', '#crudModalYes', async function(e) {
      e.preventDefault();
      $('#crudModalError').empty();
      const formValues = $('#crudModal').find('input,select');
      const requiredValues = formValues.filter('[required]');
      const requiredFields = $.map(requiredValues, function(el) {
        return $(el).attr('name');
      });
      let [formObj, stop] = createFormObj(formValues, requiredFields, true, true);
      console.log(formObj);
      if (stop === false) {
        try {
          const res = await axios({
            method: 'PATCH',
            url: `/api/v1/groups/${group_id}`,
            data: formObj
          });
          console.log(res);
          if (res.data.status == 'success') {
            await refreshGroupTable();
            $('#crudModal').modal('hide');
          } else {
            showInfoModal('Error occured.');
          }
        } catch (err) {
          showInfoModal(JSON.stringify(err));
        }
      }
    });
    $('#crudModal').modal('show');
  });

  $(document).on('click', `button.create-group`, async function(e) {
    $('#crudModalError').empty();
    const groupForm = getGroupForm();
    $('#crudModalTitle').text(`Insert Group`);
    $('#crudModalYes').text('Save');
    $('#crudModalBody').empty();
    $('#crudModalBody').append(getErrorDiv());
    $('#crudModalBody').append(groupForm);
    $('#crudModal').off();

    $('#crudModal').on('click', '#crudModalYes', async function(e) {
      e.preventDefault();
      $('#crudModalError').empty();
      const formValues = $('#crudModal').find('input,select');
      const requiredValues = formValues.filter('[required]');
      const requiredFields = $.map(requiredValues, function(el) {
        return $(el).attr('name');
      });
      let [formObj, stop] = createFormObj(formValues, requiredFields, true, true);
      if (stop === false) {
        try {
          const res = await axios({
            method: 'POST',
            url: '/api/v1/groups',
            data: formObj
          });
          console.log(res);
          if (res.data.status == 'success') {
            await refreshGroupTable();
            if (res.data && res.data.data && res.data.data.data) {
              const group_id = res.data.data.data._id;
              const user_id = res.data.data.data.owner;
              const res2 = await axios({
                method: 'POST',
                url: '/api/v1/usergroups',
                data: { group_id, user_id }
              });
            }
            $('#crudModal').modal('hide');
          } else {
            showInfoModal('Error occured.');
          }
        } catch (err) {
          showInfoModal(JSON.stringify(err));
        }
      }
    });
    $('#crudModal').modal('show');
  });

  $(document).on('click', `a.addUsers,a.viewGroupMembers`, async function(e) {
    const clickedRow = $(this).closest('tr');
    const grouptable = $('#table-groups').DataTable();
    const rowData = grouptable.row(clickedRow).data();
    const group_id = rowData._id;
    if ($(this).hasClass('addUsers')) {
      $('#groupModalTitle').html('Edit Group Members');
      $('#groupModalAdd').css('display', 'block');
    } else if ($(this).hasClass('viewGroupMembers')) {
      $('#groupModalTitle').html('View Group Members');
      $('#groupModalAdd').css('display', 'none');
    }
    $('#groupModal').off();
    $('#groupModal').on('show.coreui.modal', async function(e) {
      $('#groupModal')
        .find('form')
        .trigger('reset');

      await refreshGroupUsersTable('groupmembertable', rowData, group_id);
    });

    $('#groupModal').on('click', `#groupModal_adduser`, async function(e) {
      const email = $('#groupModal_email').val();
      let user_id = '';
      if (email && group_id) {
        try {
          user_id = await ajaxCall('GET', `/api/v1/users/useridwithemail/${email}`);
        } catch (err) {
          console.log(err);
        }
        if (!user_id) {
          showInfoModal('E-mail not found.');
          return;
        }
        if (user_id) {
          try {
            const res = await axios({
              method: 'POST',
              url: '/api/v1/usergroups',
              data: {
                group_id: group_id,
                user_id: user_id
              }
            });
            console.log(res);
            if (res.data.status == 'success') {
              //update group members table
              await refreshGroupUsersTable('groupmembertable', rowData, group_id);
            } else {
              showInfoModal('Error occured. Please try again.');
            }
          } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
              showInfoModal(`Error occured.(${JSON.stringify(err.response.data.message)})`);
            } else {
              showInfoModal(`Error occured.(${JSON.stringify(err)})`);
            }
          }
        }
      } else {
        showInfoModal('Please enter e-mail to add user into a group.');
      }
    });
    $(document).on('click', `a.removeUserFromGroup`, async function(e) {
      const clickedRow = $(this).closest('tr');
      const groupmembertable = $('#groupmembertable').DataTable();
      const grouprowData = groupmembertable.row(clickedRow).data();
      const usergroup_id = grouprowData._id;

      $('#crudModalTitle').text(`Remove User`);
      $('#crudModalYes').text('Remove');
      $('#crudModalBody').empty();
      $('#crudModalBody').append(
        `<p>Are you sure you want to remove user (${grouprowData.name})?</p>`
      );
      $('#crudModal').off();
      $('#crudModal').on('click', '#crudModalYes', async function(e) {
        if (usergroup_id) {
          try {
            const res = await axios({
              method: 'DELETE',
              url: `/api/v1/usergroups/${usergroup_id}`
            });
            await refreshGroupUsersTable('groupmembertable', rowData, group_id);
            $('#crudModal').modal('hide');
          } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
              showInfoModal(`Error occured.(${JSON.stringify(err.response.data.message)})`);
            } else {
              showInfoModal(`Error occured.(${JSON.stringify(err)})`);
            }
          }
        }
      });
      $('#crudModal').modal('show');
    });
    $('#groupModal').modal('show');
  });
};

export const getAdminNavbar = async userRole => {
  bindEventHandlers();

  let tabs = [];
  //   tabs.push({ label: 'Groups', id: 'groups' });
  if (userRole == 'admin') {
    // tabs.push({ label: 'Users', id: 'admin' });
    tabs.push({ label: 'Project Configuration', id: 'configs' });
  }
  let header = '<ul class="nav nav-tabs" role="tablist">';
  let content = '<div class="tab-content">';

  for (var i = 0; i < tabs.length; i++) {
    const id = tabs[i].id;
    const label = tabs[i].label;
    const tabID = 'tab_' + id;
    const active = i === 0 ? 'active' : '';
    const headerLi = `
    <li class="nav-item">
        <a class="nav-link ${active}" data-toggle="tab" href="#${tabID}" aria-expanded="true">${label}</a>
    </li>`;
    header += headerLi;
    let tabContent = '';
    if (id == 'groups') {
      tabContent = getGroupsTab(id);
    } else if (id == 'admin') {
      tabContent = getAdminTab(id);
    } else if (id == 'servers') {
      tabContent = getServersTab(id);
    } else if (id == 'configs') {
      tabContent = getConfigsTab(id);
    }
    const contentDiv = `
    <div role="tabpanel" class="tab-pane ${active}" searchtab="true" id="${tabID}">
        ${tabContent}
      </div>`;
    content += contentDiv;
  }
  header += `</ul>`;
  content += `</div>`;

  let ret = '';
  ret += '<div role="tabpanel">';
  ret += header;
  ret += content;
  ret += '</div>';
  return ret;
};

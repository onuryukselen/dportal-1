/* eslint-disable */
let $s = {};
$s.dmeta_summary = {};

// returns summary object
// { 'Skin': { "Healthy": 3, "Lesional": 10}}
export const createDataSummary = function(data, fields, project) {
  for (var i = 0; i < fields.length; i++) {
    const field = fields[i];
    if (!$s.dmeta_summary[project] || !$s.dmeta_summary[project][field]) {
      let lookup = {};
      for (var k = 0; k < data.length; k++) {
        if (data[k][field]) {
          const value = data[k][field];
          if (!lookup[value]) {
            lookup[value] = 1;
          } else {
            lookup[value]++;
          }
        }
      }
      if (!$s.dmeta_summary[project]) $s.dmeta_summary[project] = {};
      $s.dmeta_summary[project][field] = lookup;
    }
  }
  return $s.dmeta_summary[project];
};

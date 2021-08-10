/* eslint-disable */
import { createDataSummary } from './dataSummary';

export const prepareBreadcrumb = function(data) {
  const sumData = createDataSummary(data, ['series', 'biosample_name']);
  const sample_num = data.length;
  const exp_series_num = Object.keys(sumData['series']).length;
  const exp_num = Object.keys(sumData['biosample_name']).length;
  document.getElementById('series_num').textContent = exp_series_num;
  document.getElementById('biosample_name_num').textContent = exp_num;
  document.getElementById('samples_num').textContent = sample_num;
  $('.breadcrumb').css('display', 'inline-flex');
};

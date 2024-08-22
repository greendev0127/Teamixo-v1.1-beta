import _ from 'lodash';

export function formatReportData(initData) {
  const groupData = _.chain(initData)
    .sortBy('start_date')
    .reverse()
    .groupBy('track_id')
    .map((block, index) => {
      // Add a key to each element of the block
      return _.sortBy(block, 'id').map((item, itemIndex) => ({
        ...item,
        key: `${index}-${itemIndex}`, // or any unique value
      }));
    })
    .value();

  let joinGroupData = _.map(groupData, (item, index) => {
    let work_total = _.reduce(
      item,
      (memo, obj) => {
        if (obj.status === 'start' || obj.status === 'restart') {
          return memo + obj.total_time;
        }
        return memo;
      },
      0
    );

    let break_total = _.reduce(
      item,
      (memo, obj) => {
        if (obj.status === 'break') {
          return memo + obj.total_time;
        }
        return memo;
      },
      0
    );

    const track_type = _.chain(item)
      .groupBy('track_type')
      .sortBy('track_type')
      .value()[0][0].track_type;

    let joinData = {
      no: index + 1,
      key: 'main-' + index,
      id: item[0].track_id,
      date: item[0].date,
      name: item[0].name,
      staff_id: item[0].staff_id,
      site_id: item[0].site_id,
      start_time: _.find(item, { status: 'start' })?.start_date,
      end_time: _.find(item, { status: 'end' })?.start_date,
      status: _.last(item).status,
      track_type: track_type,
      work_time: work_total,
      break_time: break_total,
      sub_data: groupData[index],
    };

    return joinData;
  });

  return joinGroupData;
}

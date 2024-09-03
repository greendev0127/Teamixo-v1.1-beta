'use client';

import { useState, useCallback, useEffect } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { fTimestamp } from 'src/utils/format-time';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import StaffReportTableRow from '../staff-report-table-row';
import StaffReportTableToolbar from '../staff-report-table-toolbar';
import StaffReportTableFiltersResult from '../staff-report-table-filters-result';

import { tokenDecode } from 'src/auth/context/jwt/utils';
import axiosInstance, { endpoints } from 'src/utils/axios';
import Loading from 'src/app/dashboard/loading';
import { formatReportData } from 'src/utils/format-report-data';
import { REPORT_STATUS_OPTIONS } from 'src/_mock/_report';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...REPORT_STATUS_OPTIONS];

const TABLE_HEAD = [
  { id: 'no', label: 'No', width: 80 },
  { id: 'name', label: 'Service' },
  { id: 'start_time', label: 'Start Time', width: 120, align: 'center' },
  { id: 'end_time', label: 'End Time', width: 140 },
  { id: 'work_time', label: 'Work Time', width: 140 },
  { id: 'break_time', label: 'Break Time', width: 140 },
  { id: 'status', label: 'Status', width: 110 },
  { id: '', width: 88 },
];

const defaultFilters = {
  name: '',
  status: 'all',
  startDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------

export default function StaffReportListView() {
  const table = useTable({ defaultOrderBy: 'orderNumber' });

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const loadingInitData = useBoolean();

  const [tableData, setTableData] = useState([]);

  const [refresh, setRefresh] = useState(new Date());

  const [staffs, setStaffs] = useState([]);
  const [services, setServices] = useState([]);
  const [selectService, setSelectService] = useState(null);
  const [selectStaff, setSelectStaff] = useState(null);

  const [filters, setFilters] = useState(defaultFilters);

  useEffect(() => {
    const accessToken = sessionStorage.getItem('accessToken');

    const organizationId = tokenDecode(accessToken)['custom:organization_id'];

    async function getInitData() {
      try {
        loadingInitData.onTrue();

        const services = await axiosInstance.post(endpoints.services.list, {
          organizationId: organizationId,
        });

        const staffs = await axiosInstance.post(endpoints.staff.list, {
          organization_id: organizationId,
        });

        setServices(services.data.body);
        setStaffs(staffs.data.body);
        setSelectStaff(staffs.data.body[0]);

        const reportData = await axiosInstance.post(endpoints.report.list, {
          tableName: `record_${organizationId}`,
        });

        const initReportData = formatReportData(reportData.data.body.Items);

        setTableData(initReportData);
      } catch (error) {
        console.log('Error is occurred: ', error.message);
      } finally {
        loadingInitData.onFalse();
      }
    }

    getInitData();
  }, [refresh]);

  const dateError =
    filters.startDate && filters.endDate
      ? filters.startDate.getTime() > filters.endDate.getTime()
      : false;

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    staff: selectStaff,
    filters,
    dateError,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 52 : 72;

  const canReset =
    !!filters.name || filters.status !== 'all' || (!!filters.startDate && !!filters.endDate);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleChangeStaff = useCallback(
    (staff) => {
      table.onResetPage();
      setSelectStaff(staff);
    },
    [table]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRows: tableData.length,
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, table, tableData]);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.staffreport.edit(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  if (loadingInitData.value) {
    return <Loading />;
  }

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="List"
          links={[
            {
              name: 'Dashboard',
              href: paths.dashboard.root,
            },
            {
              name: 'Report',
              href: paths.dashboard.staffreport.root,
            },
            { name: 'Staff' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <Tabs
            value={filters.status}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === filters.status) && 'filled') || 'soft'
                    }
                    color={
                      (tab.value === 'start' && 'success') ||
                      (tab.value === 'break' && 'warning') ||
                      'default'
                    }
                  >
                    {tab.value === 'all' &&
                      tableData.filter((item) => item.staff_id === selectStaff.id).length}
                    {tab.value === 'start' &&
                      tableData.filter(
                        (item) => item.staff_id === selectStaff.id && item.status === 'start'
                      ).length}

                    {tab.value === 'break' &&
                      tableData.filter(
                        (item) => item.staff_id === selectStaff.id && item.status === 'break'
                      ).length}
                    {tab.value === 'end' &&
                      tableData.filter(
                        (item) => item.staff_id === selectStaff.id && item.status === 'end'
                      ).length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <StaffReportTableToolbar
            filters={filters}
            onFilters={handleFilters}
            //
            canReset={canReset}
            onResetFilters={handleResetFilters}
            //
            staffs={staffs}
            setSelectStaff={handleChangeStaff}
            selectStaff={selectStaff}
          />

          {canReset && (
            <StaffReportTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  tableData.map((row) => row.id)
                )
              }
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      tableData.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row, index) => (
                      <StaffReportTableRow
                        key={row.id}
                        index={index}
                        row={row}
                        service={services.find((item) => item.id === row.site_id)}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => setRefresh(new Date().getTime())}
                        onViewRow={() => handleViewRow(row.id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            //
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, staff, filters, dateError }) {
  const { status, name, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  inputData = inputData.filter((item) => item.staff_id === staff.id);

  if (name) {
    inputData = inputData.filter(
      (report) => report.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((order) => order.status === status);
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter(
        (report) =>
          fTimestamp(report.start_time) >= fTimestamp(startDate) &&
          fTimestamp(report.start_time) <= fTimestamp(endDate)
      );
    }
  }

  inputData.map((item, index) => {
    return (item.no = index + 1);
  });

  return inputData;
}

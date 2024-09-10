import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Page, View, Text, Font, Image, Document, StyleSheet } from '@react-pdf/renderer';

import { convertMillisToTime, fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
import { format } from 'date-fns';

// ----------------------------------------------------------------------

Font.register({
  family: 'Roboto',
  fonts: [{ src: '/fonts/Roboto-Regular.ttf' }, { src: '/fonts/Roboto-Bold.ttf' }],
});

const useStyles = () =>
  useMemo(
    () =>
      StyleSheet.create({
        col4: { width: '25%' },
        col8: { width: '75%' },
        col6: { width: '50%' },
        mb4: { marginBottom: 4 },
        mb8: { marginBottom: 8 },
        mb40: { marginBottom: 40 },
        mt40: { marginTop: 40 },
        h3: { fontSize: 16, fontWeight: 700 },
        h4: { fontSize: 13, fontWeight: 700 },
        body1: { fontSize: 10 },
        body2: { fontSize: 9 },
        subtitle1: { fontSize: 10, fontWeight: 700 },
        subtitle2: { fontSize: 9, fontWeight: 700 },
        alignRight: { textAlign: 'right' },
        sign: {
          borderBottomWidth: 1,
          borderStyle: 'solid',
          borderColor: '#000000',
        },
        page: {
          fontSize: 9,
          lineHeight: 1.6,
          fontFamily: 'Roboto',
          backgroundColor: '#FFFFFF',
          textTransform: 'capitalize',
          padding: '40px 24px 110px 24px',
        },
        footer: {
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 24,
          paddingVertical: 12,
          margin: 'auto',
          borderTopWidth: 1,
          borderStyle: 'solid',
          position: 'absolute',
          borderColor: '#DFE3E8',
        },
        gridContainer: {
          flexDirection: 'row',
          justifyContent: 'space-between',
        },
        table: {
          display: 'flex',
          width: 'auto',
        },
        tableRow: {
          padding: '8px 0',
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderStyle: 'solid',
          borderColor: '#DFE3E8',
        },
        noBorder: {
          paddingTop: 8,
          paddingBottom: 0,
          borderBottomWidth: 0,
        },
        tableCell_1: {
          width: '5%',
        },
        tableCell_2: {
          width: '35%',
          paddingRight: 16,
        },
        tableCell_3: {
          width: '12%',
        },
      }),
    []
  );

// ----------------------------------------------------------------------

export default function InvoicePDF({ invoice, selectStaff, services, filters }) {
  // const {
  //   items,
  //   taxes,
  //   dueDate,
  //   discount,
  //   shipping,
  //   invoiceTo,
  //   createDate,
  //   totalAmount,
  //   invoiceFrom,
  //   invoiceNumber,
  //   subTotal,
  // } = invoice;

  const styles = useStyles();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={[styles.gridContainer, styles.mb40]}>
          <Image source="/logo/logo.png" style={{ width: 48, height: 48 }} />

          <View style={{ alignItems: 'flex-end', flexDirection: 'column' }}>
            <Text style={[styles.h4]}>{selectStaff.name}</Text>
            {filters.startDate && (
              <Text>
                {format(filters.startDate, 'dd MMM yyyy')}-{format(filters.endDate, 'dd MMM yyyy')}
              </Text>
            )}
            <Text> INV-23512623 </Text>
          </View>
        </View>

        {/* <View style={[styles.gridContainer, styles.mb40]}>
          <View style={styles.col6}>
            <Text style={[styles.subtitle2, styles.mb4]}>Invoice from</Text>
            <Text style={styles.body2}>{invoiceFrom.name}</Text>
            <Text style={styles.body2}>{invoiceFrom.fullAddress}</Text>
            <Text style={styles.body2}>{invoiceFrom.phoneNumber}</Text>
          </View>

          <View style={styles.col6}>
            <Text style={[styles.subtitle2, styles.mb4]}>Invoice to</Text>
            <Text style={styles.body2}>{invoiceTo.name}</Text>
            <Text style={styles.body2}>{invoiceTo.fullAddress}</Text>
            <Text style={styles.body2}>{invoiceTo.phoneNumber}</Text>
          </View>
        </View> */}

        {/* <View style={[styles.gridContainer, styles.mb40]}>
          <View style={styles.col6}>
            <Text style={[styles.subtitle2, styles.mb4]}>Date create</Text>
            <Text style={styles.body2}>{fDate(createDate)}</Text>
          </View>
          <View style={styles.col6}>
            <Text style={[styles.subtitle2, styles.mb4]}>Due date</Text>
            <Text style={styles.body2}>{fDate(dueDate)}</Text>
          </View>
        </View> */}

        <Text style={[styles.subtitle1, styles.mb8]}>Invoice Details</Text>

        <View style={styles.table}>
          <View>
            <View style={styles.tableRow}>
              <View style={styles.tableCell_1}>
                <Text style={styles.subtitle2}>#</Text>
              </View>

              <View style={styles.tableCell_2}>
                <Text style={styles.subtitle2}>Service</Text>
              </View>

              <View style={styles.tableCell_3}>
                <Text style={styles.subtitle2}>Date</Text>
              </View>

              <View style={styles.tableCell_3}>
                <Text style={styles.subtitle2}>Start time</Text>
              </View>

              <View style={styles.tableCell_3}>
                <Text style={styles.subtitle2}>End time</Text>
              </View>

              <View style={styles.tableCell_3}>
                <Text style={styles.subtitle2}>Work time</Text>
              </View>

              <View style={[styles.tableCell_3]}>
                <Text style={styles.subtitle2}>Break time</Text>
              </View>
            </View>
          </View>

          <View>
            {invoice.map((item, index) => {
              const service = services.find((service) => service.id === item.site_id);
              return (
                <View style={styles.tableRow} key={item.id}>
                  <View style={styles.tableCell_1}>
                    <Text>{index + 1}</Text>
                  </View>

                  <View style={styles.tableCell_2}>
                    <Text style={styles.subtitle2}>{service.name}</Text>
                  </View>

                  <View style={styles.tableCell_3}>
                    <Text>{format(new Date(item.start_time), 'dd MMM yyyy')}</Text>
                  </View>

                  <View style={styles.tableCell_3}>
                    <Text>{format(new Date(item.start_time), 'HH:mm')}</Text>
                  </View>

                  <View style={styles.tableCell_3}>
                    <Text>{format(new Date(item.end_time), 'HH:mm')}</Text>
                  </View>

                  <View style={styles.tableCell_3}>
                    <Text>{convertMillisToTime(item.work_time)}</Text>
                  </View>

                  <View style={styles.tableCell_3}>
                    <Text>{convertMillisToTime(item.break_time)}</Text>
                  </View>
                </View>
              );
            })}

            <View style={[styles.tableRow, styles.noBorder, styles.mt40]}>
              <View style={styles.tableCell_1} />
              <View style={styles.tableCell_2} />
              <View style={styles.tableCell_3} />
              <View style={styles.tableCell_3} />
              <View style={styles.tableCell_3} />
              <View style={styles.tableCell_3}>
                <Text>Created Date</Text>
              </View>
              <View style={[styles.tableCell_3, styles.alignRight]}>
                <Text>{format(new Date(), 'dd MMM yyyy')}</Text>
              </View>
            </View>
            <View style={[styles.tableRow, styles.noBorder]}>
              <View style={styles.tableCell_1} />
              <View style={styles.tableCell_2} />
              <View style={styles.tableCell_3} />
              <View style={styles.tableCell_3} />
              <View style={styles.tableCell_3} />
              <View style={styles.tableCell_3}>
                <Text style={styles.body1}>Sign</Text>
              </View>
              <View style={[styles.tableCell_3, styles.alignRight, styles.sign]}></View>
            </View>
          </View>
        </View>

        <View style={[styles.gridContainer, styles.footer]} fixed>
          <View style={styles.col8}>
            <Text style={styles.subtitle2}>Created by</Text>
            <Text>Teamixo Company</Text>
          </View>
          <View style={[styles.col4, styles.alignRight]}>
            <Text style={styles.subtitle2}>Have a Question?</Text>
            <Text>support@teamixo.com</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

InvoicePDF.propTypes = {
  invoice: PropTypes.array,
  selectService: PropTypes.object,
};

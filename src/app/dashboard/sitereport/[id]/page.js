import PropTypes from 'prop-types';

import { SiteReportDetailsView } from 'src/sections/sitereport/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Report Details',
};

export default function ServiceDetailsPage({ params }) {
  const { id } = params;

  return <SiteReportDetailsView id={id} />;
}

ServiceDetailsPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};

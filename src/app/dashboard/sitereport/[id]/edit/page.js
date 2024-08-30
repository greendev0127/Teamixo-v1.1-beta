import PropTypes from 'prop-types';
import { SiteReportEditView } from 'src/sections/sitereport/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Site Report Edit',
};

export default function SiteReportEditPage({ params }) {
  const { id } = params;

  return <SiteReportEditView id={id} />;
}

SiteReportEditPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};

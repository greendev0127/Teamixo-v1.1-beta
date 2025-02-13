import PropTypes from 'prop-types';

import ServiceDetailsView from 'src/sections/services/view/service-details-view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Service Details',
};

export default function ServiceDetailsPage({ params }) {
  const { id } = params;

  return <ServiceDetailsView id={id} />;
}

ServiceDetailsPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};

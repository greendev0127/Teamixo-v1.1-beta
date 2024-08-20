import PropTypes from 'prop-types';

import { _tours } from 'src/_mock/_tour';
import ServiceDetailsView from 'src/sections/services/view/service-details-view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Service Details',
};

export default function ServiceDetailsPage({ params }) {
  const { id } = params;

  return <ServiceDetailsView id={id} />;
}

// export async function generateStaticParams() {
//   return _tours.map((tour) => ({
//     id: tour.id,
//   }));
// }

ServiceDetailsPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};

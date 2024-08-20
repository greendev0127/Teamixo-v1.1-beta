import PropTypes from 'prop-types';

import { StaffEditView } from 'src/sections/staff/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: User Edit',
};

export default function StaffEditPage({ params }) {
  const { id } = params;

  return <StaffEditView id={id} />;
}

StaffEditPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};

import ServiceEditView from 'src/sections/services/view/service-edit-view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Service Edit',
};

export default function TourEditPage({ params }) {
  const { id } = params;

  return <ServiceEditView id={id} />;
}

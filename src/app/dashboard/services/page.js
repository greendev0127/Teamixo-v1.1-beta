import FourView from 'src/sections/four/view';
import { ServiceListView } from 'src/sections/services/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Service List',
};

export default function Page() {
  return <ServiceListView />;
}

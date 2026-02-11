import { getLicensesAction } from './actions';
import LicensesClientPage from './client-page';

export default async function LicensesPage() {
  const licenses = await getLicensesAction();
  return <LicensesClientPage initialLicenses={licenses} />;
}

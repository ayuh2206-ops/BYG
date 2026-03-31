import LegacyPageRenderer from "../components/legacy-page-renderer";
import { getLegacyPageByFile, NOT_FOUND_PAGE } from "../lib/legacy-pages";

export default async function NotFound() {
  const page = await getLegacyPageByFile(NOT_FOUND_PAGE);
  return <LegacyPageRenderer page={page} />;
}

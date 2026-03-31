import { notFound } from "next/navigation";
import LegacyPageRenderer from "../../components/legacy-page-renderer";
import { getLegacyPageByParams } from "../../lib/legacy-pages";

export async function generateMetadata({ params }) {
  const page = await getLegacyPageByParams(params);

  return {
    title: page?.title || "BeforeYouGo"
  };
}

export default async function LegacyCatchAllPage({ params }) {
  const page = await getLegacyPageByParams(params);

  if (!page) {
    notFound();
  }

  return <LegacyPageRenderer page={page} />;
}

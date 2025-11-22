import { GetServerSideProps } from "next";
import { query } from "../lib/db";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const code = ctx.params?.code;
  if (typeof code !== "string") {
    return { notFound: true };
  }

  const result = await query<{ url: string }>("SELECT url FROM links WHERE code = $1", [code]);

  if (result.rowCount === 0) {
    return { notFound: true };
  }

  await query(
    "UPDATE links SET total_clicks = total_clicks + 1, last_clicked_at = NOW() WHERE code = $1",
    [code]
  );

  const target = result.rows[0].url;

  return {
    redirect: {
      destination: target,
      permanent: false
    }
  };
};

export default function RedirectPage() {
  return null;
}

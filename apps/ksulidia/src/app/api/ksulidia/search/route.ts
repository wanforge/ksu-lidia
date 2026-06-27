export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type SearchHit = {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
};

export type SearchResponse = {
  employees: SearchHit[];
  documents: SearchHit[];
};

export async function GET(): Promise<Response> {
  return Response.json({
    employees: [],
    documents: [],
  } satisfies SearchResponse);
}

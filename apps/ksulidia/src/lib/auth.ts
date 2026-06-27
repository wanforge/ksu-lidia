import { cache } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

// Deduplicated per render — all server components that call this within one
// request share a single jwt callback + DB query instead of one each.
export const getSession = cache(() => getServerSession(authOptions));

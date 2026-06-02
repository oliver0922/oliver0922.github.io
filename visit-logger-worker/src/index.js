const TRANSPARENT_GIF = Uint8Array.from(
  atob("R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="),
  (char) => char.charCodeAt(0),
);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/collect.gif") {
      return collectVisit(request, env, ctx, url);
    }

    if (request.method === "GET" && url.pathname === "/admin") {
      return listVisits(request, env, url);
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return jsonResponse({ ok: true });
    }

    return new Response("Not found", { status: 404 });
  },

  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(deleteExpiredVisits(env));
  },
};

function collectVisit(request, env, ctx, url) {
  if (!isAllowedReferrer(request, env.ALLOWED_ORIGIN)) {
    return new Response("Forbidden", { status: 403 });
  }

  const ip = request.headers.get("CF-Connecting-IP");
  if (!ip) {
    return new Response("Missing client IP", { status: 400 });
  }

  ctx.waitUntil(storeVisit(request, env, url, ip));

  return new Response(TRANSPARENT_GIF, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "image/gif",
    },
  });
}

async function storeVisit(request, env, url, ip) {
  const cf = request.cf || {};

  await env.DB.prepare(
    `INSERT INTO visits (
      visited_at,
      ip,
      country,
      city,
      region,
      timezone,
      asn,
      as_organization,
      colo,
      path,
      referrer,
      user_agent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      new Date().toISOString(),
      ip,
      clean(cf.country, 2),
      clean(cf.city, 120),
      clean(cf.region, 120),
      clean(cf.timezone, 80),
      Number.isInteger(cf.asn) ? cf.asn : null,
      clean(cf.asOrganization, 200),
      clean(cf.colo, 8),
      clean(url.searchParams.get("path"), 500) || "/",
      clean(url.searchParams.get("referrer"), 500),
      clean(request.headers.get("User-Agent"), 500),
    )
    .run();
}

async function listVisits(request, env, url) {
  if (!isOwner(request, env.ADMIN_TOKEN)) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const limit = clampInteger(url.searchParams.get("limit"), 100, 1, 500);
  const [countResult, visitsResult] = await env.DB.batch([
    env.DB.prepare("SELECT COUNT(*) AS count FROM visits"),
    env.DB.prepare(
      `SELECT
        id,
        visited_at,
        ip,
        country,
        city,
        region,
        timezone,
        asn,
        as_organization,
        colo,
        path,
        referrer,
        user_agent
      FROM visits
      ORDER BY visited_at DESC
      LIMIT ?`,
    ).bind(limit),
  ]);

  return jsonResponse({
    total: countResult.results[0].count,
    visits: visitsResult.results,
  });
}

async function deleteExpiredVisits(env) {
  const retentionDays = clampInteger(env.RETENTION_DAYS, 90, 1, 365);
  const modifier = `-${retentionDays} days`;

  await env.DB.prepare(
    "DELETE FROM visits WHERE visited_at < datetime('now', ?)",
  )
    .bind(modifier)
    .run();
}

function isAllowedReferrer(request, allowedOrigin) {
  const referrer = request.headers.get("Referer");

  if (!referrer || !allowedOrigin) {
    return false;
  }

  try {
    return new URL(referrer).origin === allowedOrigin;
  } catch {
    return false;
  }
}

function isOwner(request, expectedToken) {
  const authorization = request.headers.get("Authorization") || "";
  const prefix = "Bearer ";

  if (!authorization.startsWith(prefix)) {
    return false;
  }

  return constantTimeEqual(authorization.slice(prefix.length), expectedToken);
}

function constantTimeEqual(actual, expected) {
  if (!actual || !expected || actual.length !== expected.length) {
    return false;
  }

  let difference = 0;

  for (let index = 0; index < actual.length; index += 1) {
    difference |= actual.charCodeAt(index) ^ expected.charCodeAt(index);
  }

  return difference === 0;
}

function clampInteger(value, fallback, minimum, maximum) {
  const number = Number.parseInt(value, 10);

  if (!Number.isInteger(number)) {
    return fallback;
  }

  return Math.min(Math.max(number, minimum), maximum);
}

function clean(value, maximumLength) {
  if (typeof value !== "string") {
    return null;
  }

  return value.slice(0, maximumLength);
}

function jsonResponse(body, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}


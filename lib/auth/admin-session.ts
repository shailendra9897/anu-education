// FILE: lib/auth/admin-session.ts
//
// Short-lived, HttpOnly, HMAC-signed admin session token.
//
// Purpose: bridge the existing HTTP Basic Auth login to same-origin
// /api/admin/* fetches WITHOUT exposing ADMIN_PASS to browser code and
// WITHOUT relying on the browser's Basic-auth cache being forwarded to
// fetch(). After the middleware verifies valid Basic credentials it
// issues this token as an HttpOnly cookie; the browser automatically
// sends the cookie on same-origin requests, and the API handler guard
// accepts it as a valid authenticated state.
//
// Security properties:
//   • The token NEVER contains the admin password — only the
//     authenticated username and an expiry timestamp.
//   • The token is HMAC-SHA256 signed with a key derived server-side
//     from ADMIN_PASS. Clients cannot forge or tamper with it, and the
//     password never leaves the server.
//   • Short-lived (12h), fails closed on expiry/tamper/malformation.
//   • Uses only Web Crypto (globalThis.crypto.subtle) so this module is
//     portable across the Edge and Node middleware runtimes.
//
// The token value must never be logged.

export const ADMIN_SESSION_COOKIE = "anu_admin_session";

export const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
export const ADMIN_SESSION_TTL_S = Math.floor(ADMIN_SESSION_TTL_MS / 1000);

const TOKEN_VERSION = "v1";
const KEY_SALT = "anu-education :: admin session :: v1";

const B64_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function base64UrlEncode(data: Uint8Array): string {
  let out = "";
  for (let i = 0; i < data.length; i += 3) {
    const b0 = data[i]!;
    const b1 = i + 1 < data.length ? data[i + 1]! : 0;
    const b2 = i + 2 < data.length ? data[i + 2]! : 0;
    out += B64_ALPHABET[b0 >> 2]!;
    out += B64_ALPHABET[((b0 & 0x03) << 4) | (b1 >> 4)]!;
    if (i + 1 < data.length) {
      out += B64_ALPHABET[((b1 & 0x0f) << 2) | (b2 >> 6)]!;
    }
    if (i + 2 < data.length) {
      out += B64_ALPHABET[b2 & 0x3f]!;
    }
  }
  return out;
}

function base64UrlDecode(text: string): Uint8Array {
  const clean = text.replace(/=+$/, "");
  const valueOf = new Map<string, number>();
  for (let i = 0; i < B64_ALPHABET.length; i += 1) {
    valueOf.set(B64_ALPHABET[i]!, i);
  }

  const bytes: number[] = [];
  for (let i = 0; i < clean.length; i += 4) {
    const c0 = valueOf.get(clean[i] ?? "") ?? Number.NaN;
    const c1 = valueOf.get(clean[i + 1] ?? "") ?? Number.NaN;
    const n2 = i + 2 < clean.length ? clean[i + 2] : undefined;
    const n3 = i + 3 < clean.length ? clean[i + 3] : undefined;
    const c2 = n2 === undefined ? undefined : valueOf.get(n2);
    const c3 = n3 === undefined ? undefined : valueOf.get(n3);
    if (Number.isNaN(c0) || Number.isNaN(c1)) {
      throw new Error("Invalid base64url input");
    }
    bytes.push((c0 << 2) | (c1 >> 4));
    if (c2 !== undefined) {
      bytes.push(((c1 & 0x0f) << 4) | (c2 >> 2));
    }
    if (c3 !== undefined) {
      bytes.push(((c2! & 0x03) << 6) | c3);
    }
  }

  return Uint8Array.from(bytes);
}

function deriveHmacKey(): Promise<CryptoKey> {
  const pass = process.env.ADMIN_PASS;
  if (!pass) {
    throw new Error("Admin authentication is not configured.");
  }

  const material = `${KEY_SALT}:${pass}`;
  return crypto.subtle
    .digest("SHA-256", new TextEncoder().encode(material))
    .then((digest) =>
      crypto.subtle.importKey(
        "raw",
        digest,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"],
      ),
    );
}

async function sign(message: string): Promise<string> {
  const key = await deriveHmacKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );
  return base64UrlEncode(new Uint8Array(signature));
}

async function verifySignature(
  message: string,
  signatureB64: string,
): Promise<boolean> {
  try {
    const key = await deriveHmacKey();
    const signature = new Uint8Array(base64UrlDecode(signatureB64));
    const messageBytes = new TextEncoder().encode(message);
    return await crypto.subtle.verify("HMAC", key, signature, messageBytes);
  } catch {
    return false;
  }
}

export type IssuedAdminSession = {
  token: string;
  expiresAt: number;
  maxAgeSeconds: number;
};

export type AdminSessionPayload = {
  v: string;
  u: string;
  e: number;
};

/**
 * Sign a session payload into a `<payload>.<signature>` token. Server-side
 * only. Exported so tests can construct expired / wrong-version tokens to
 * verify fail-closed behaviour; the signature cannot be forged without
 * ADMIN_PASS.
 */
export async function signSessionToken(
  payload: AdminSessionPayload,
): Promise<string> {
  const encoded = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify(payload)),
  );
  return `${encoded}.${await sign(encoded)}`;
}

/**
 * Build a signed, short-lived session token for `username` (the
 * authenticated admin login, never the password).
 */
export async function issueAdminSession(
  username: string,
): Promise<IssuedAdminSession> {
  const expiresAt = Date.now() + ADMIN_SESSION_TTL_MS;
  const token = await signSessionToken({
    v: TOKEN_VERSION,
    u: username,
    e: expiresAt,
  });
  return { token, expiresAt, maxAgeSeconds: ADMIN_SESSION_TTL_S };
}

/**
 * Verify a session token. Returns the authenticated username on success,
 * or null when the token is missing, malformed, tampered with, expired,
 * or of an unknown version. Fail closed.
 */
export async function verifyAdminSession(
  token: string | null | undefined,
): Promise<string | null> {
  if (!token) {
    return null;
  }

  const separator = token.indexOf(".");
  if (separator === -1) {
    return null;
  }

  const encoded = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  if (!encoded || !signature) {
    return null;
  }

  if (!(await verifySignature(encoded, signature))) {
    return null;
  }

  try {
    const raw = new TextDecoder().decode(base64UrlDecode(encoded));
    const payload = JSON.parse(raw) as {
      v?: unknown;
      u?: unknown;
      e?: unknown;
    };

    if (payload.v !== TOKEN_VERSION) {
      return null;
    }
    if (typeof payload.u !== "string" || payload.u.length === 0) {
      return null;
    }
    if (typeof payload.e !== "number" || Number.isNaN(payload.e)) {
      return null;
    }
    if (payload.e <= Date.now()) {
      return null;
    }

    return payload.u;
  } catch {
    return null;
  }
}

/**
 * True when `text` contains anything that looks like the configured
 * admin password or secret credentials. Used by tests to guard against
 * ADMIN_PASS leaking into values/tokens/bundles. Never logs the value.
 */
export function containsSecretMaterial(text: string): boolean {
  const pass = process.env.ADMIN_PASS;
  if (pass && pass.length > 0 && text.includes(pass)) {
    return true;
  }
  return /\bADMIN_PASS\b/.test(text);
}
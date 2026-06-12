import { describe, expect, it } from "vitest";
import crypto from "node:crypto";
import { validateInitData } from "./validate-init-data";

const BOT_TOKEN = "123456:TEST-TOKEN";
const MAX_AGE = 3600;

function sign(params: URLSearchParams, botToken = BOT_TOKEN): string {
  const dataCheckString = [...params.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join("\n");
  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();
  return crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");
}

function buildInitData(overrides: Record<string, string | null> = {}): string {
  const base: Record<string, string> = {
    auth_date: String(Math.floor(Date.now() / 1000)),
    query_id: "AAH_test",
    user: JSON.stringify({
      id: 7223342354,
      first_name: "Test",
      last_name: "User",
      username: "testuser",
      language_code: "en",
    }),
  };
  for (const [k, v] of Object.entries(overrides)) {
    if (v === null) delete base[k];
    else base[k] = v;
  }
  const params = new URLSearchParams(base);
  params.set("hash", sign(params));
  return params.toString();
}

describe("validateInitData", () => {
  it("accepts a valid signed payload", () => {
    const result = validateInitData(buildInitData(), BOT_TOKEN, MAX_AGE);
    expect(result).not.toBeNull();
    expect(result!.user.id).toBe(7223342354);
    expect(result!.user.first_name).toBe("Test");
    expect(result!.queryId).toBe("AAH_test");
  });

  it("rejects a tampered hash", () => {
    const params = new URLSearchParams(buildInitData());
    params.set("hash", "0".repeat(64));
    expect(validateInitData(params.toString(), BOT_TOKEN, MAX_AGE)).toBeNull();
  });

  it("rejects tampered data with a stale hash", () => {
    const params = new URLSearchParams(buildInitData());
    params.set(
      "user",
      JSON.stringify({ id: 999, first_name: "Evil" })
    );
    expect(validateInitData(params.toString(), BOT_TOKEN, MAX_AGE)).toBeNull();
  });

  it("rejects when hash is missing", () => {
    const params = new URLSearchParams(buildInitData());
    params.delete("hash");
    expect(validateInitData(params.toString(), BOT_TOKEN, MAX_AGE)).toBeNull();
  });

  it("rejects an expired auth_date (replay)", () => {
    const stale = String(Math.floor(Date.now() / 1000) - MAX_AGE - 10);
    const init = buildInitData({ auth_date: stale });
    expect(validateInitData(init, BOT_TOKEN, MAX_AGE)).toBeNull();
  });

  it("rejects missing user field", () => {
    const init = buildInitData({ user: null });
    expect(validateInitData(init, BOT_TOKEN, MAX_AGE)).toBeNull();
  });

  it("rejects malformed user JSON", () => {
    const init = buildInitData({ user: "{not-json" });
    expect(validateInitData(init, BOT_TOKEN, MAX_AGE)).toBeNull();
  });

  it("rejects non-numeric user id", () => {
    const init = buildInitData({
      user: JSON.stringify({ id: "123", first_name: "X" }),
    });
    expect(validateInitData(init, BOT_TOKEN, MAX_AGE)).toBeNull();
  });

  it("rejects a payload signed with a different bot token", () => {
    const params = new URLSearchParams({
      auth_date: String(Math.floor(Date.now() / 1000)),
      user: JSON.stringify({ id: 1, first_name: "A" }),
    });
    params.set("hash", sign(params, "999999:OTHER-TOKEN"));
    expect(validateInitData(params.toString(), BOT_TOKEN, MAX_AGE)).toBeNull();
  });

  it("rejects empty input", () => {
    expect(validateInitData("", BOT_TOKEN, MAX_AGE)).toBeNull();
  });
});

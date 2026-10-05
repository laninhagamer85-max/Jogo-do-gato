import { afterEach, describe, expect, it, vi } from "vitest";
import { firebaseAppCheckGuard } from "./middleware";

const originalNodeEnv = process.env.NODE_ENV;
const originalAppCheckRequired = process.env.FIREBASE_APP_CHECK_REQUIRED;
afterEach(() => {
  if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalNodeEnv;
  if (originalAppCheckRequired === undefined) delete process.env.FIREBASE_APP_CHECK_REQUIRED;
  else process.env.FIREBASE_APP_CHECK_REQUIRED = originalAppCheckRequired;
});

function responseMock() {
  const response: { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> } = {
    status: vi.fn(),
    json: vi.fn(),
  };
  response.status.mockReturnValue(response);
  return response;
}

const requestWithoutAppCheck = { get: () => undefined } as never;

describe("Firebase App Check middleware", () => {
  it("fails closed in production when no token is supplied", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.FIREBASE_APP_CHECK_REQUIRED;
    const response = responseMock();
    const next = vi.fn();
    await firebaseAppCheckGuard(requestWithoutAppCheck, response as never, next);
    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ code: "APP_CHECK_REQUIRED" }));
    expect(next).not.toHaveBeenCalled();
  });

  it("allows the local development preview when optional enforcement is off", async () => {
    process.env.NODE_ENV = "development";
    delete process.env.FIREBASE_APP_CHECK_REQUIRED;
    const next = vi.fn();
    await firebaseAppCheckGuard(requestWithoutAppCheck, responseMock() as never, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it("fails closed in staging when the explicit enforcement flag is enabled", async () => {
    process.env.NODE_ENV = "development";
    process.env.FIREBASE_APP_CHECK_REQUIRED = "true";
    const response = responseMock();
    const next = vi.fn();
    await firebaseAppCheckGuard(requestWithoutAppCheck, response as never, next);
    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ code: "APP_CHECK_REQUIRED" }));
    expect(next).not.toHaveBeenCalled();
  });
});

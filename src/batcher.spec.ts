import Conserial from "./conserial";

describe("Conserial", () => {
  it("should batch requests", async () => {
    const run = new Conserial();
    const time = Date.now();
    const foo = run.async(
      () =>
        new Promise<string>((resolve) => setTimeout(() => resolve("foo"), 200))
    );
    expect(foo.status).toBe("pending");
    expect(foo.value).toBe(undefined);
    expect(foo.error).toBe(undefined);
    const bar = run.async(
      () =>
        new Promise<string>((resolve) => setTimeout(() => resolve("bar"), 200))
    );
    await run.batch();
    // foo and bar should run in parallel
    expect(Date.now() - time).toBeLessThan(300);
    expect(foo.status).toBe("resolved");
    expect(foo.value).toEqual("foo");
    expect(bar.value).toEqual("bar");
  });

  it("should batch requests with dependencies", async () => {
    const run = new Conserial();
    const time = Date.now();
    const foo = run.async(
      () =>
        new Promise<string>((resolve) => setTimeout(() => resolve("foo"), 200))
    );
    const bar = run.async(
      () =>
        new Promise<string>((resolve) => setTimeout(() => resolve("bar"), 200))
    );
    const baz = run.async(
      (foo, bar) =>
        new Promise<string>((resolve) =>
          setTimeout(() => resolve("baz" + foo.value + bar.value), 200)
        ),
      [foo, bar]
    );
    await run.batch();
    // foo and bar should be resolved in parallel (200ms)
    // baz should be resolved after foo and bar (400ms)
    expect(Date.now() - time).toBeLessThan(500);
    expect(foo.value).toEqual("foo");
    expect(bar.value).toEqual("bar");
    expect(baz.value).toEqual("bazfoobar");
  });

  it("should be able to throw exceptions", async () => {
    const run = new Conserial();
    const time = Date.now();
    const foo = run.async(
      () =>
        new Promise<string>((resolve) => setTimeout(() => resolve("foo"), 200))
    );
    const bar = run.async(
      () =>
        new Promise<string>((resolve, reject) =>
          setTimeout(() => reject("bar"), 200)
        )
    );
    expect(bar.status).toBe("pending");
    expect(bar.value).toBe(undefined);
    await expect(run.batch()).rejects.toEqual("bar");
    // foo and bar should be resolved in parallel (200ms)
    // baz should not be resolved
    expect(Date.now() - time).toBeLessThan(300);
    expect(foo.value).toEqual("foo");
    expect(bar.value).toBeUndefined();
    expect(bar.error).toEqual("bar");
    expect(bar.status).toBe("rejected");
  })
});

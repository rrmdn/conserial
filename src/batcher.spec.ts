import Batcher from "./batcher";

describe("batcher", () => {
  it("should batch requests", async () => {
    const batcher = new Batcher();
    const time = Date.now();
    const foo = batcher.async(
      () =>
        new Promise<string>((resolve) => setTimeout(() => resolve("foo"), 200))
    );
    const bar = batcher.async(
      () =>
        new Promise<string>((resolve) => setTimeout(() => resolve("bar"), 200))
    );
    await batcher.run();
    // foo and bar should run in parallel
    expect(Date.now() - time).toBeLessThan(300);
    expect(foo.value).toEqual("foo");
    expect(bar.value).toEqual("bar");
  });

  it("should batch requests with dependencies", async () => {
    const batcher = new Batcher();
    const time = Date.now();
    const foo = batcher.async(
      () =>
        new Promise<string>((resolve) => setTimeout(() => resolve("foo"), 200))
    );
    const bar = batcher.async(
      () =>
        new Promise<string>((resolve) => setTimeout(() => resolve("bar"), 200))
    );
    const baz = batcher.async(
      (foo, bar) =>
        new Promise<string>((resolve) =>
          setTimeout(() => resolve("baz" + foo.value + bar.value), 200)
        ),
      [foo, bar]
    );
    await batcher.run();
    // foo and bar should be resolved in parallel (200ms)
    // baz should be resolved after foo and bar (400ms)
    expect(Date.now() - time).toBeLessThan(500);
    expect(foo.value).toEqual("foo");
    expect(bar.value).toEqual("bar");
    expect(baz.value).toEqual("bazfoobar");
  });

  it("should be able to throw exceptions", async () => {
    const batcher = new Batcher();
    const time = Date.now();
    const foo = batcher.async(
      () =>
        new Promise<string>((resolve) => setTimeout(() => resolve("foo"), 200))
    );
    const bar = batcher.async(
      () =>
        new Promise<string>((resolve, reject) =>
          setTimeout(() => reject("bar"), 200)
        )
    );
    await expect(batcher.run()).rejects.toEqual("bar");
    // foo and bar should be resolved in parallel (200ms)
    // baz should not be resolved
    expect(Date.now() - time).toBeLessThan(300);
    expect(foo.value).toEqual("foo");
    expect(bar.value).toBeUndefined();
  })
});

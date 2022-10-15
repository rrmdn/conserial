class Result<Value> {
  value: Value;
  promise: Promise<Value>;
}

export default class Conserial {
  promises: Array<Promise<any>> = [];
  async = <R, D extends Result<any>>(
    asyncFn: (...dependencies: D[]) => Promise<R>,
    dependencies: D[] = []
  ): Result<R> => {
    const result = new Result<R>();
    result.promise = new Promise<R>(async (resolve, reject) => {
      try {
        await Promise.all(dependencies.map((dependency) => dependency.promise));
        const val = await asyncFn(...dependencies);
        result.value = val;
        resolve(val);
      } catch (error) {
        reject(error);
      }
    });
    this.promises.push(result.promise);
    return result;
  };
  batch = async () => {
    await Promise.all(this.promises);
  };
}

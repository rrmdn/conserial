class Result<Value> {
  value: Value;
  promise: Promise<Value>;
}

export default class Batcher {
  batch: Array<Promise<any>> = [];
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
    this.batch.push(result.promise);
    return result;
  };
  run = async () => {
    await Promise.all(this.batch);
  };
}

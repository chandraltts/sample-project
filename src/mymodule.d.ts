export default MyModule;
declare function MyModule<T>(target?: T): Promise<T & typeof MyModule>;
declare module MyModule {
  function destroy(obj: any): void;
  function _malloc(size: number): number;
  function _free(ptr: number): void;
  const HEAP8: Int8Array;
  const HEAP16: Int16Array;
  const HEAP32: Int32Array;
  const HEAPU8: Uint8Array;
  const HEAPU16: Uint16Array;
  const HEAPU32: Uint32Array;
  const HEAPF32: Float32Array;
  const HEAPF64: Float64Array;
  class Foo {
    constructor();
    getVal(): number;
    setVal(v: number): void;
  }
  class Bar {
    get_value(): number;
    set_value(value: number): void;
    value: number;
    constructor(val: number);
    doSomething(): void;
  }
}
export function BunControllerAdapter(
  /**
   * @description Target is the object that the method belongs to.
   */
  target: unknown,
  /**
   * @description The name of decorated method.
   */
  propertyKey: string,
  /**
   * @description Descriptor are the metadata of decorated method.
   */
  descriptor: PropertyDescriptor
) {
  console.log({ target, propertyKey, descriptor });
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyKey} with:`, args);
    return originalMethod.apply(this, args);
  };
}

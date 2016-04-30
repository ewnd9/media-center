export default function proxy(obj, func) {
  return function(args) {
    return func.apply(obj, Array.prototype.slice.apply(args));
  };
}

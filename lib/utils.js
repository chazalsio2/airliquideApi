export function generateError(message, errorCode = 500) {
  const error = new Error(message);
  error.code = errorCode;
  return error;
}

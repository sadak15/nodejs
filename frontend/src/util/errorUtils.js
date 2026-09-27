export function extractErrorMessages(err) {
  const data = err?.response?.data

  if (data?.errors?.length) {
    return data.errors.map((e) => e.message).join(', ')
  }

  if (data?.message) {
    return data.message
  }

  return 'Something went wrong. Please try again.'
}

// True when the request never got a response at all (dropped connection,
// timeout, cold start) as opposed to the server responding with an error.
// In that case the write may have actually gone through server-side.
export function isNoResponseError(err) {
  return Boolean(err) && !err.response
}

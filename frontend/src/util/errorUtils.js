const GENERIC_FALLBACK = 'Something went wrong. Please try again.'

export function extractErrorMessages(err) {
  if (!err) return null

  const data = err?.response?.data

  if (data?.errors?.length) {
    return data.errors.map((e) => e.message).join(', ')
  }

  if (data?.message) {
    return data.message
  }

  return GENERIC_FALLBACK
}

// True when the request never got a response at all (dropped connection,
// timeout, cold start) as opposed to the server responding with an error.
// In that case the write may have actually gone through server-side.
export function isNoResponseError(err) {
  return Boolean(err) && !err.response
}

// A real, actionable message to show the user (e.g. a validation error),
// or null when we have nothing specific to say (dropped connection, or the
// server gave no useful detail). Callers should suppress the error UI and
// rely on refetching real state instead of showing an unhelpful message.
export function getActionableErrorMessage(err) {
  if (isNoResponseError(err)) return null
  const message = extractErrorMessages(err)
  return message === GENERIC_FALLBACK ? null : message
}

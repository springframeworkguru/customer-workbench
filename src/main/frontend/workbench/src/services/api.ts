import axios from 'axios'

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const responseMessage =
      (error.response?.data as { error?: string; message?: string } | undefined)?.error ??
      (error.response?.data as { message?: string } | undefined)?.message

    return responseMessage ?? error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Unexpected error occurred'
}

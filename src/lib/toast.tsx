import type { ToasterProps } from 'sonner'

import { toast } from 'sonner'

export const notifySuccess = (message: string, opts: ToasterProps = {}): void => {
  toast.success(message, opts)
}

export const notifyError = (message: string, opts: ToasterProps = {}): void => {
  toast.error(message, opts)
}

export const notifyWarning = (message: string, opts: ToasterProps = {}): void => {
  toast.warning(message, opts)
}

export const notifyInfo = (message: string, opts: ToasterProps = {}): void => {
  toast.info(message, opts)
}
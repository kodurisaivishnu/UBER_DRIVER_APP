import { enqueueSnackbar } from 'notistack';

export const toast = {
  success: (message) => enqueueSnackbar(message, { variant: 'success' }),
  error: (message) => enqueueSnackbar(message, { variant: 'error' }),
  info: (message) => enqueueSnackbar(message, { variant: 'info' }),
  warning: (message) => enqueueSnackbar(message, { variant: 'warning' }),
};

import { Signale } from 'signale';

const options = {
  types: {
    info: {
      badge: 'I',
      color: 'cyan',
      label: 'info',
    },
    success: {
      badge: 'V',
      color: 'green',
      label: 'success',
    },
    error: {
      badge: 'X',
      color: 'red',
      label: 'error',
    },
    warn: {
      badge: 'W',
      color: 'yellow',
      label: 'warn',
    },
    critical: {
      badge: 'C',
      color: 'red',
      label: 'critical',
    },
    apiPath: {
      badge: '://',
      color: 'blue',
      label: 'api path',
    },
  },
};

export const logger = new Signale(options);

// logger.info('This is an informational message');
// logger.success('Task completed successfully');
// logger.error('An error occurred');
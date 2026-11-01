import multer from 'multer';
import env from '../config/env.js';
import { log } from '../utils/http.js';

const UPLOAD_MESSAGES = {
  LIMIT_FILE_SIZE: `That photo is too large. The limit is ${env.MAX_UPLOAD_MB} MB per photo.`,
  LIMIT_FILE_COUNT: 'Too many photos in one go — please upload 6 or fewer at a time.',
  LIMIT_UNEXPECTED_FILE: 'Unexpected file in the upload.',
  LIMIT_PART_COUNT: 'The upload has too many parts.',
};

export function notFoundApi(req, res) {
  res.status(404).json({ error: 'Not found.' });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return undefined;
  let status = err.status || err.statusCode || 500;
  let message = err.message;
  let { details } = err;

  if (err instanceof multer.MulterError) {
    status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message = UPLOAD_MESSAGES[err.code] || 'The upload could not be read.';
  } else if (err.type === 'entity.parse.failed') {
    status = 400; message = 'The information sent could not be read.';
  } else if (err.type === 'entity.too.large') {
    status = 413; message = 'Too much information in one save. Please shorten it.';
  } else if (err.name === 'CastError') {
    status = 404; message = 'This item no longer exists. It may have been deleted.';
  } else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || {})[0];
    message = field === 'slug' ? 'Another story already uses this web address. Please change the headline or the web address.'
      : field === 'email' ? 'Someone with this email address already exists.'
        : 'Something with the same details already exists.';
    details = field ? { [field]: message } : undefined;
  } else if (err.name === 'ValidationError') {
    status = 400; message = 'Some details are not right. Please check the form.';
  }

  if (status >= 500) {
    log.error(`${req.method} ${req.originalUrl}`, err);
    message = 'Something went wrong on our side. Please try again. If it keeps happening, contact your website developer.';
    details = undefined;
  }

  return res.status(status).json({
    error: message,
    ...(details && { details }),
    ...(typeof err.code === 'string' && status < 500 && !err.code.startsWith('LIMIT_') && { code: err.code }),
    ...(!env.isProd && status >= 500 && { debug: err.message }),
  });
}

import crypto from 'crypto';

export const generateId = () => {
  return crypto.randomBytes(12).toString('hex');
};

export const normalizeId = (id) => {
  if (!id) return id;
  if (typeof id === 'object') {
    if (id._id) return id._id.toString();
    if (id.id) return id.id.toString();
  }
  return id.toString();
};

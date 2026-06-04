import { Schema, model } from 'mongoose';

const AuditLogSchema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  userId: { type: String, required: true },
  action: { type: String, enum: ['created', 'updated', 'deleted'], required: true },
  summary: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
});

export const AuditLog = model('AuditLog', AuditLogSchema);

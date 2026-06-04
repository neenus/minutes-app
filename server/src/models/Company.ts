import { Schema, model } from 'mongoose';

// LedgerEntry uses String _id so the frontend can pass UUID strings without ObjectId conflicts
const LedgerEntrySchema = new Schema({
  _id: { type: String },
  date: { type: String, default: '' },
  certNo: { type: String, default: '' },
  transactionNo: { type: String, default: '' },
  type: { type: String, enum: ['acquired', 'transferred'], default: 'acquired' },
  toFrom: { type: String, default: '' },
  classOfShares: { type: String, default: '' },
  shares: { type: String, default: '' },
  balance: { type: String, default: '' },
});

// shareholderId stores the personId string (not a sub-document ObjectId)
const ShareholderLedgerSchema = new Schema({
  shareholderId: { type: String },
  entries: [LedgerEntrySchema],
});

const CompanySchema = new Schema(
  {
    name: { type: String, required: true },
    streetAddress: { type: String, default: '' },
    city: { type: String, default: '' },
    province: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    incorporationDate: { type: String, default: '' },
    certPrefix: { type: String, default: 'ON' },
    status: { type: String, enum: ['active', 'dissolved'], default: 'active' },
    dissolvedAt: { type: String, default: '' },
    people: [{ type: Schema.Types.ObjectId, ref: 'Person' }],
    shareholders: [
      {
        personId: { type: Schema.Types.ObjectId, ref: 'Person', required: true },
        date: { type: String, default: '' },
        numberOfShares: { type: String, default: '' },
        classOfShares: { type: String, default: '' },
      },
    ],
    directors: [
      {
        personId: { type: Schema.Types.ObjectId, ref: 'Person', required: true },
        dateElected: { type: String, default: '' },
        dateResigned: { type: String, default: '' },
      },
    ],
    officers: [
      {
        personId: { type: Schema.Types.ObjectId, ref: 'Person', required: true },
        officeHeld: { type: String, default: '' },
        dateAppointed: { type: String, default: '' },
        dateResigned: { type: String, default: '' },
      },
    ],
    banking: {
      bankName: { type: String, default: '' },
      resolutionDate: { type: String, default: '' },
      signingInstructions: { type: String, default: '' },
      signatories: [
        {
          personId: { type: Schema.Types.ObjectId, ref: 'Person' },
          title: { type: String, default: '' },
        },
      ],
    },
    ledger: [ShareholderLedgerSchema],
    createdBy: { type: String, default: '' },
    updatedBy: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Company = model('Company', CompanySchema);

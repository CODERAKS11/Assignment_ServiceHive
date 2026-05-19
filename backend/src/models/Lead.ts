import mongoose, { Schema, Document } from 'mongoose';
import { LeadStatus, LeadSource } from '../types';

export interface ILeadActivity {
  action: string;
  performedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface ILeadDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  activities: ILeadActivity[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<ILeadActivity>({
  action: { type: String, required: true },
  performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const leadSchema = new Schema<ILeadDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Qualified', 'Lost'],
      default: 'New',
    },
    source: {
      type: String,
      enum: ['Website', 'Instagram', 'Referral'],
      required: [true, 'Source is required'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    activities: [activitySchema],
  },
  {
    timestamps: true,
  }
);

// Indexes for fast filtering and search
leadSchema.index({ status: 1 });
leadSchema.index({ source: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ name: 'text', email: 'text' });
leadSchema.index({ createdBy: 1 });

const Lead = mongoose.model<ILeadDocument>('Lead', leadSchema);
export default Lead;

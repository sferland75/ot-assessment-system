import mongoose, { Schema, Document } from 'mongoose';
import { GoalCategory, GoalStatus } from '../types/goal';

export interface IMeasurement {
  date: Date;
  value: number;
  notes?: string;
  linked_assessment?: string; // Reference to assessment ID
}

export interface IGoal extends Document {
  category: GoalCategory;
  description: string;
  clientId: string;
  baseline: IMeasurement;
  target: {
    value: number;
    target_date: Date;
  };
  measurements: IMeasurement[];
  status: GoalStatus;
  created_date: Date;
  modified_date: Date;
  progress_indicators: {
    measurement_type: string;
    unit: string;
    frequency: string;
  };
  barriers: string[];
  facilitators: string[];
  intervention_strategies: string[];
}

const MeasurementSchema = new Schema<IMeasurement>(
  {
    date: { type: Date, required: true },
    value: { type: Number, required: true },
    notes: String,
    linked_assessment: { type: Schema.Types.ObjectId, ref: 'Assessment' }
  },
  { _id: false }
);

const GoalSchema = new Schema<IGoal>(
  {
    category: {
      type: String,
      enum: Object.values(GoalCategory),
      required: true
    },
    description: { type: String, required: true },
    clientId: { type: String, required: true, index: true },
    baseline: { type: MeasurementSchema, required: true },
    target: {
      value: { type: Number, required: true },
      target_date: { type: Date, required: true }
    },
    measurements: [MeasurementSchema],
    status: {
      type: String,
      enum: Object.values(GoalStatus),
      required: true,
      default: GoalStatus.NOT_STARTED
    },
    created_date: { type: Date, default: Date.now },
    modified_date: { type: Date, default: Date.now },
    progress_indicators: {
      measurement_type: { type: String, required: true },
      unit: { type: String, required: true },
      frequency: { type: String, required: true }
    },
    barriers: [String],
    facilitators: [String],
    intervention_strategies: [String]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Ensure modified_date is updated
GoalSchema.pre('save', function(next) {
  this.modified_date = new Date();
  next();
});

// Add indexes for common queries
GoalSchema.index({ clientId: 1, category: 1 });
GoalSchema.index({ clientId: 1, status: 1 });
GoalSchema.index({ clientId: 1, created_date: -1 });

export const Goal = mongoose.model<IGoal>('Goal', GoalSchema);

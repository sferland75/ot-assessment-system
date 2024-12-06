import React, { useState } from 'react';
import { GASGoal, GASLevel } from '../../types/GASTypes';
import { GASProcessor } from '../assessment/GASProcessor';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GASGoalEditorProps {
  goal?: GASGoal;
  onSave: (goal: GASGoal) => void;
  onCancel: () => void;
}

export const GASGoalEditor: React.FC<GASGoalEditorProps> = ({
  goal,
  onSave,
  onCancel,
}) => {
  const [editedGoal, setEditedGoal] = useState<GASGoal>(
    goal || GASProcessor.createNewGoal('', '')
  );

  const [baselineDescription, setBaselineDescription] = useState('');

  const handleScaleChange = (level: GASLevel, description: string) => {
    setEditedGoal(prev => ({
      ...prev,
      scales: {
        ...prev.scales,
        [level]: description
      }
    }));
  };

  const handleGenerateScales = () => {
    if (baselineDescription) {
      const scales = GASProcessor.generateScaleDescriptions(baselineDescription);
      setEditedGoal(prev => ({
        ...prev,
        scales
      }));
    }
  };

  const handleSave = () => {
    if (GASProcessor.validateGoal(editedGoal)) {
      onSave(editedGoal);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Goal Title</Label>
              <Input
                id="title"
                value={editedGoal.title}
                onChange={e => setEditedGoal(prev => ({
                  ...prev,
                  title: e.target.value
                }))}
                placeholder="Enter goal title"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={editedGoal.category}
                onChange={e => setEditedGoal(prev => ({
                  ...prev,
                  category: e.target.value
                }))}
                placeholder="Enter goal category"
              />
            </div>

            <div>
              <Label htmlFor="importance">Importance</Label>
              <Select
                value={editedGoal.importance.toString()}
                onValueChange={value => setEditedGoal(prev => ({
                  ...prev,
                  importance: parseInt(value)
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select importance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Low (1)</SelectItem>
                  <SelectItem value="2">Medium (2)</SelectItem>
                  <SelectItem value="3">High (3)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="baseline">Baseline Description</Label>
            <Textarea
              id="baseline"
              value={baselineDescription}
              onChange={e => setBaselineDescription(e.target.value)}
              placeholder="Enter baseline description to generate scale levels"
            />
            <Button onClick={handleGenerateScales}>
              Generate Scale Descriptions
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Scale Levels</h3>
            {([-2, -1, 0, 1, 2] as GASLevel[]).map(level => (
              <div key={level}>
                <Label htmlFor={`level-${level}`}>
                  Level {level}
                  {level === 0 && ' (Expected Outcome)'}
                </Label>
                <Textarea
                  id={`level-${level}`}
                  value={editedGoal.scales[level]}
                  onChange={e => handleScaleChange(level, e.target.value)}
                  placeholder={`Describe level ${level} outcome`}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Goal
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
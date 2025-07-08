
'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettings, type AppSettings } from '@/hooks/use-settings';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

const subjectsList = [
  { id: 'science', label: 'Science' },
  { id: 'math', label: 'Mathematics' },
  { id: 'history', label: 'History & Social Studies' },
  { id: 'art', label: 'Arts & Music' },
  { id: 'language', label: 'Language Arts' },
];

export default function SettingsPage() {
  const { settings, saveSettings, isLoaded } = useSettings();
  const { toast } = useToast();
  const [currentSettings, setCurrentSettings] = useState<AppSettings>({ gradeLevel: '', subjects: [], language: '', theme: 'light' });

  useEffect(() => {
    if (isLoaded) {
      setCurrentSettings(settings);
    }
  }, [isLoaded, settings]);

  const handleSubjectChange = (subjectId: string, checked: boolean) => {
    setCurrentSettings(prev => {
      const newSubjects = checked
        ? [...prev.subjects, subjectId]
        : prev.subjects.filter(s => s !== subjectId);
      return { ...prev, subjects: newSubjects };
    });
  };

  const handleThemeChange = (checked: boolean) => {
      const newTheme = checked ? 'dark' : 'light';
      setCurrentSettings(prev => ({ ...prev, theme: newTheme }));
  }

  const handleSave = () => {
    saveSettings(currentSettings);
    toast({
      title: 'Preferences Saved',
      description: 'Your settings have been updated.',
    });
  };
  
  if (!isLoaded) {
    return (
       <AppLayout title="Settings">
         <div className="space-y-8">
            <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2"><Skeleton className="h-4 w-1/6" /><Skeleton className="h-10 w-full max-w-sm" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-1/6" /><Skeleton className="h-10 w-full max-w-md" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-1/6" /><Skeleton className="h-10 w-full max-w-sm" /></div>
                <div><Skeleton className="h-10 w-28" /></div>
            </CardContent>
            </Card>
            <Card>
                <CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader>
                <CardContent><Skeleton className="h-10 w-full max-w-xs" /></CardContent>
            </Card>
         </div>
       </AppLayout>
    );
  }

  return (
    <AppLayout title="Settings">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Lesson Preferences</CardTitle>
            <CardDescription>Set your default preferences for generating lesson plans.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="grade-level">Default Grade Level</Label>
              <Select
                value={currentSettings.gradeLevel}
                onValueChange={(value) => setCurrentSettings(prev => ({ ...prev, gradeLevel: value }))}
              >
                <SelectTrigger id="grade-level" className="w-full max-w-sm">
                  <SelectValue placeholder="Select a grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preschool">Preschool</SelectItem>
                  <SelectItem value="kindergarten">Kindergarten</SelectItem>
                  <SelectItem value="1">Class 1</SelectItem>
                  <SelectItem value="2">Class 2</SelectItem>
                  <SelectItem value="3">Class 3</SelectItem>
                  <SelectItem value="4">Class 4</SelectItem>
                  <SelectItem value="5">Class 5</SelectItem>
                  <SelectItem value="6">Class 6</SelectItem>
                  <SelectItem value="7">Class 7</SelectItem>
                  <SelectItem value="8">Class 8</SelectItem>
                  <SelectItem value="9">Class 9</SelectItem>
                  <SelectItem value="10">Class 10</SelectItem>
                  <SelectItem value="11">Class 11</SelectItem>
                  <SelectItem value="12">Class 12</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
                <Label>Preferred Subjects</Label>
                <div className="flex flex-wrap gap-x-6 gap-y-4 pt-2">
                  {subjectsList.map(subject => (
                    <div key={subject.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={subject.id}
                        checked={currentSettings.subjects.includes(subject.id)}
                        onCheckedChange={(checked) => handleSubjectChange(subject.id, !!checked)}
                      />
                      <label htmlFor={subject.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {subject.label}
                      </label>
                    </div>
                  ))}
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language-input">Default Language</Label>
              <Input
                id="language-input"
                placeholder="e.g., English, Hindi"
                className="w-full max-w-sm"
                value={currentSettings.language}
                onChange={(e) => setCurrentSettings(prev => ({ ...prev, language: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the app.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">
                            Enable dark mode for a different visual experience.
                        </p>
                    </div>
                    <Switch
                        id="dark-mode"
                        checked={currentSettings.theme === 'dark'}
                        onCheckedChange={handleThemeChange}
                    />
                </div>
            </CardContent>
        </Card>

        <div>
            <Button onClick={handleSave}>Save Preferences</Button>
        </div>
      </div>
    </AppLayout>
  );
}

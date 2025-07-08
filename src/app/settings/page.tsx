
'use client';

import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SettingsPage() {
  return (
    <AppLayout title="Settings">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Set your default preferences for generating lesson plans.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="grade-level">Default Grade Level</Label>
              <Select>
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
                    <div className="flex items-center space-x-2">
                        <Checkbox id="science" />
                        <label htmlFor="science" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Science
                        </label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Checkbox id="math" />
                        <label htmlFor="math" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Mathematics
                        </label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Checkbox id="history" />
                        <label htmlFor="history" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            History & Social Studies
                        </label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Checkbox id="art" />
                        <label htmlFor="art" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Arts & Music
                        </label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Checkbox id="language" />
                        <label htmlFor="language" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Language Arts
                        </label>
                    </div>
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language-input">Default Language</Label>
              <Input id="language-input" placeholder="e.g., English, Hindi" className="w-full max-w-sm" />
            </div>
            <div>
                 <Button disabled>Save Preferences</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

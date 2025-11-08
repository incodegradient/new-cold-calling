import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Globe } from 'lucide-react';

const scheduleSchema = z.object({
  schedule: z.object({
    start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
    end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
    weekdays: z.array(z.string()).min(1, "Select at least one day"),
    timezone: z.string().optional(),
  }),
  pacing: z.object({
    gap_minutes: z.coerce.number().min(0, "Must be 0 or more"),
    max_concurrent_calls: z.coerce.number().min(1, "Must be at least 1"),
  }),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface Step3ScheduleProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData: Partial<ScheduleFormValues>;
}

const Step3Schedule = ({ onNext, onBack, initialData }: Step3ScheduleProps) => {
  const { control, register, handleSubmit, formState: { errors } } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      schedule: initialData.schedule || { weekdays: [] },
      pacing: initialData.pacing || {},
    },
  });

  const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const onSubmitWithTimezone = (data: ScheduleFormValues) => {
    const enrichedData = {
      ...data,
      schedule: {
        ...data.schedule,
        timezone: detectedTimezone,
      },
    };
    onNext(enrichedData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitWithTimezone)} className="space-y-8">
      <div>
        <h3 className="text-lg font-medium">Schedule</h3>
        <p className="text-sm text-muted-foreground">Define when your campaign will be active.</p>

        <div className="mt-4 p-3 rounded-md bg-muted/50 flex items-center gap-3">
          <Globe className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            Detected Timezone: <strong className="text-foreground">{detectedTimezone}</strong>. All times are relative to this timezone.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="start_time">Start Time (24h)</Label>
            <Input id="start_time" type="time" {...register('schedule.start_time')} />
            {errors.schedule?.start_time && <p className="text-sm text-destructive">{errors.schedule.start_time.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_time">End Time (24h)</Label>
            <Input id="end_time" type="time" {...register('schedule.end_time')} />
            {errors.schedule?.end_time && <p className="text-sm text-destructive">{errors.schedule.end_time.message}</p>}
          </div>
        </div>
        <div className="space-y-2 mt-4">
          <Label>Active Weekdays</Label>
          <Controller
            name="schedule.weekdays"
            control={control}
            render={({ field }) => (
              <div className="flex flex-wrap gap-4">
                {WEEKDAYS.map(day => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={field.value?.includes(day)}
                      onCheckedChange={(checked) => {
                        const currentValue = field.value || [];
                        return checked
                          ? field.onChange([...currentValue, day])
                          : field.onChange(currentValue.filter(d => d !== day));
                      }}
                    />
                    <Label htmlFor={day}>{day}</Label>
                  </div>
                ))}
              </div>
            )}
          />
          {errors.schedule?.weekdays && <p className="text-sm text-destructive">{errors.schedule.weekdays.message}</p>}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">Pacing</h3>
        <p className="text-sm text-muted-foreground">Control the speed of your outbound calls.</p>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="gap_minutes">Gap Between Calls (minutes)</Label>
            <Input id="gap_minutes" type="number" {...register('pacing.gap_minutes')} />
            {errors.pacing?.gap_minutes && <p className="text-sm text-destructive">{errors.pacing.gap_minutes.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_concurrent_calls">Max Concurrent Calls</Label>
            <Input id="max_concurrent_calls" type="number" {...register('pacing.max_concurrent_calls')} />
            {errors.pacing?.max_concurrent_calls && <p className="text-sm text-destructive">{errors.pacing.max_concurrent_calls.message}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>Back</Button>
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
};

export default Step3Schedule;

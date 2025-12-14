import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Search, Plus, X, CalendarIcon } from 'lucide-react';
import { africanCities } from '@/data/africanCities';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Stop {
  city: string;
  order: number;
}

interface MultiCitySearchFormProps {
  onSearch: (stops: Stop[], date: string, passengers: number) => void;
}

export function MultiCitySearchForm({ onSearch }: MultiCitySearchFormProps) {
  const [stops, setStops] = useState<Stop[]>([
    { city: '', order: 1 },
    { city: '', order: 2 }
  ]);
  const [date, setDate] = useState<Date>();
  const [passengers, setPassengers] = useState(1);

  const addStop = () => {
    if (stops.length < 6) {
      setStops([...stops, { city: '', order: stops.length + 1 }]);
    }
  };

  const removeStop = (order: number) => {
    if (stops.length > 2) {
      setStops(stops.filter(s => s.order !== order).map((s, i) => ({ ...s, order: i + 1 })));
    }
  };

  const updateStop = (order: number, city: string) => {
    setStops(stops.map(s => s.order === order ? { ...s, city } : s));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stops.every(s => s.city) && date) {
      onSearch(stops, format(date, 'yyyy-MM-dd'), passengers);
    }
  };

  const today = new Date();
  const twentyYearsFromNow = new Date();
  twentyYearsFromNow.setFullYear(today.getFullYear() + 20);

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">Multi-City Journey Planner</h3>
      <div className="space-y-3 mb-4">
        {stops.map((stop, index) => (
          <div key={stop.order} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              {index + 1}
            </div>
            <Select value={stop.city} onValueChange={(value) => updateStop(stop.order, value)} required>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder={`Stop ${index + 1}`} />
              </SelectTrigger>
              <SelectContent>
                {africanCities.map((city) => (
                  <SelectItem key={city.value} value={city.label}>{city.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {stops.length > 2 && (
              <Button type="button" variant="ghost" size="icon" onClick={() => removeStop(stop.order)}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" onClick={addStop} disabled={stops.length >= 6} className="w-full mb-4">
        <Plus className="mr-2 h-4 w-4" /> Add Stop
      </Button>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} disabled={(date) => date < today || date > twentyYearsFromNow} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label htmlFor="passengers">Passengers</Label>
          <Input id="passengers" type="number" min="1" max="9" value={passengers} onChange={(e) => setPassengers(parseInt(e.target.value))} />
        </div>
        <div className="flex items-end">
          <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-orange-500">
            <Search className="mr-2 h-4 w-4" /> Find Routes
          </Button>
        </div>
      </div>
    </form>
  );
}

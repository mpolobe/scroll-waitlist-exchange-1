import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Search, CalendarIcon } from 'lucide-react';
import { africanCities } from '@/data/africanCities';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface RouteSearchFormProps {
  onSearch: (from: string, to: string, date: string, adults: number, children: number) => void;
}

export function RouteSearchForm({ onSearch }: RouteSearchFormProps) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState<Date>();
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (from && to && date && adults >= 1) {
      onSearch(from, to, format(date, 'yyyy-MM-dd'), adults, children);
    }
  };


  const today = new Date();
  const twentyYearsFromNow = new Date();
  twentyYearsFromNow.setFullYear(today.getFullYear() + 20);

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div>
          <Label htmlFor="from">From</Label>
          <Select value={from} onValueChange={setFrom} required>
            <SelectTrigger>
              <SelectValue placeholder="Departure city" />
            </SelectTrigger>
            <SelectContent>
              {africanCities.map((city) => (
                <SelectItem key={city.value} value={city.label}>{city.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="to">To</Label>
          <Select value={to} onValueChange={setTo} required>
            <SelectTrigger>
              <SelectValue placeholder="Arrival city" />
            </SelectTrigger>
            <SelectContent>
              {africanCities.map((city) => (
                <SelectItem key={city.value} value={city.label}>{city.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
          <Label htmlFor="adults">Adults</Label>
          <Input 
            id="adults" 
            type="number" 
            min="1" 
            max="9" 
            value={adults} 
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val) && val >= 1) {
                setAdults(val);
              }
            }}
          />
        </div>
        <div>
          <Label htmlFor="children">Children (Under 12)</Label>
          <Input 
            id="children" 
            type="number" 
            min="0" 
            max="9" 
            value={children} 
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val) && val >= 0) {
                setChildren(val);
              }
            }}
          />
          <p className="text-xs text-gray-500 mt-1">50% discount</p>
        </div>

        <div className="flex items-end">
          <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-orange-500">
            <Search className="mr-2 h-4 w-4" /> Search
          </Button>
        </div>
      </div>
    </form>
  );
}

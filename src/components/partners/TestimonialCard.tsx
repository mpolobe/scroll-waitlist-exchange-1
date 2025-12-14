import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  author: string;
  position: string;
  company: string;
  image: string;
}

export default function TestimonialCard({ quote, author, position, company, image }: TestimonialCardProps) {
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <Quote className="h-8 w-8 text-orange-500 mb-4" />
        <p className="text-gray-700 mb-6 italic">"{quote}"</p>
        <div className="flex items-center gap-4">
          <img src={image} alt={author} className="h-12 w-12 rounded-full object-cover" />
          <div>
            <p className="font-bold">{author}</p>
            <p className="text-sm text-gray-600">{position}</p>
            <p className="text-sm text-gray-500">{company}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

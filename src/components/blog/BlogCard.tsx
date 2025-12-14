import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BlogCardProps {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  image: string;
  readTime: string;
}

export function BlogCard({ id, title, excerpt, category, author, date, image, readTime }: BlogCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/blog/${id}`}>
        <img src={image} alt={title} className="w-full h-48 object-cover" />
      </Link>
      <CardContent className="p-6">
        <Badge className="mb-3">{category}</Badge>
        <Link to={`/blog/${id}`}>
          <h3 className="text-xl font-bold mb-2 hover:text-orange-600 transition-colors">{title}</h3>
        </Link>
        <p className="text-gray-600 mb-4">{excerpt}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <User className="w-4 h-4" />
            {author}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {date}
          </span>
          <span>{readTime}</span>
        </div>
      </CardContent>
      <CardFooter className="px-6 pb-6">
        <Link to={`/blog/${id}`} className="text-orange-600 hover:text-orange-700 flex items-center gap-2 font-semibold">
          Read More <ArrowRight className="w-4 h-4" />
        </Link>
      </CardFooter>
    </Card>
  );
}

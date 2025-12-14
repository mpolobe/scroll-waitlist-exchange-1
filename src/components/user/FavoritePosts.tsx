import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { blogPosts } from '@/data/blogPosts';
import { Heart, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function FavoritePosts() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('favorite_posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setFavorites(data || []);
  };

  const removeFavorite = async (id: string) => {
    await supabase.from('favorite_posts').delete().eq('id', id);
    loadFavorites();
  };

  const favoritePosts = favorites.map(fav => 
    blogPosts.find(post => post.id === fav.post_id)
  ).filter(Boolean);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Favorite Blog Posts</CardTitle>
      </CardHeader>
      <CardContent>
        {favoritePosts.length === 0 ? (
          <p className="text-muted-foreground">No favorite posts yet. Browse the blog to save posts!</p>
        ) : (
          <div className="space-y-4">
            {favoritePosts.map((post, idx) => (
              <div key={post?.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{post?.title}</h3>
                  <p className="text-sm text-muted-foreground">{post?.category}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/blog/${post?.id}`)}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => removeFavorite(favorites[idx].id)}>
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

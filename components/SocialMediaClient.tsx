"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Facebook, Instagram, Twitter, MessageCircle, TrendingUp, Users, Heart, Share } from "lucide-react";
import { toast } from "sonner";

interface SocialPost {
  _id: string;
  platform: string;
  content: string;
  status: string;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
    reach: number;
  };
  createdAt: string;
}

export default function SocialMediaClient({ storeId, branchId }: { storeId: string; branchId: string }) {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('facebook');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [storeId, branchId]);

  const fetchAnalytics = async () => {
    try {
      const { getSocialMediaAnalytics } = await import("@/lib/actions/social-media.actions");
      const data = await getSocialMediaAnalytics(storeId, branchId);
      setAnalytics(data);
      setPosts(data.recentPosts || []);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const generateProductPromotion = async (productId: string) => {
    try {
      setLoading(true);
      const { generateProductPromotion } = await import("@/lib/actions/social-media.actions");
      const result = await generateProductPromotion(storeId, branchId, productId, selectedPlatform);
      
      if (result.success) {
        setContent(result.content);
        toast.success("Promotion content generated!");
      } else {
        toast.error(result.error || "Failed to generate promotion");
      }
    } catch (error) {
      toast.error("Error generating promotion");
    } finally {
      setLoading(false);
    }
  };

  const generateDailySummary = async () => {
    try {
      setLoading(true);
      const { generateDailySummaryPost } = await import("@/lib/actions/social-media.actions");
      const result = await generateDailySummaryPost(storeId, branchId, new Date());
      
      if (result.success) {
        setContent(result.content);
        toast.success("Daily summary generated!");
      } else {
        toast.error(result.error || "Failed to generate summary");
      }
    } catch (error) {
      toast.error("Error generating summary");
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    try {
      setLoading(true);
      const { createSocialPost } = await import("@/lib/actions/social-media.actions");
      const result = await createSocialPost(storeId, branchId, {
        platform: selectedPlatform as any,
        content
      });
      
      if (result.success) {
        toast.success("Post created successfully!");
        setContent('');
        fetchAnalytics();
      } else {
        toast.error(result.error || "Failed to create post");
      }
    } catch (error) {
      toast.error("Error creating post");
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'whatsapp': return <MessageCircle className="w-4 h-4" />;
      default: return <Share className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Social Media Marketing</h1>
        <p className="text-muted-foreground">Create and manage your social media presence</p>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Total Posts</span>
              </div>
              <p className="text-2xl font-bold">{analytics.totalPosts}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium">Total Likes</span>
              </div>
              <p className="text-2xl font-bold">{analytics.totalEngagement.likes}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Share className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Total Shares</span>
              </div>
              <p className="text-2xl font-bold">{analytics.totalEngagement.shares}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Total Reach</span>
              </div>
              <p className="text-2xl font-bold">{analytics.totalEngagement.reach}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Post Creator */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="facebook">
                  <div className="flex items-center gap-2">
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </div>
                </SelectItem>
                <SelectItem value="instagram">
                  <div className="flex items-center gap-2">
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </div>
                </SelectItem>
                <SelectItem value="twitter">
                  <div className="flex items-center gap-2">
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </div>
                </SelectItem>
                <SelectItem value="whatsapp">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Textarea
              placeholder="Write your post content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />

            <div className="flex gap-2">
              <Button onClick={generateDailySummary} variant="outline" disabled={loading}>
                Generate Daily Summary
              </Button>
              <Button onClick={createPost} disabled={!content || loading}>
                Create Post
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {posts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No posts yet</p>
              ) : (
                posts.slice(0, 5).map((post) => (
                  <div key={post._id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(post.platform)}
                        <span className="font-medium capitalize">{post.platform}</span>
                      </div>
                      <Badge variant={post.status === 'posted' ? 'default' : 'secondary'}>
                        {post.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                      {post.content}
                    </p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>❤️ {post.engagement.likes}</span>
                      <span>🔄 {post.engagement.shares}</span>
                      <span>💬 {post.engagement.comments}</span>
                      <span>👥 {post.engagement.reach}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
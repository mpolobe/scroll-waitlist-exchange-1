import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Send, Eye, CheckCircle, XCircle, Bot, MessageSquare, Zap } from 'lucide-react';
import {
  postToTelegram,
  postTemplate,
  getBotInfo,
  getChatInfo,
  MESSAGE_TEMPLATES,
  TemplateKey,
} from '@/services/telegramService';

export function AdminTelegram() {
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey | ''>('');
  const [isPosting, setIsPosting] = useState(false);
  const [preview, setPreview] = useState('');
  const [botStatus, setBotStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [botInfo, setBotInfo] = useState<{ username: string; chatTitle: string } | null>(null);

  // Check bot connection on mount
  useEffect(() => {
    checkBotConnection();
  }, []);

  const checkBotConnection = async () => {
    setBotStatus('checking');
    try {
      const [botResult, chatResult] = await Promise.all([getBotInfo(), getChatInfo()]);
      
      if (botResult.ok && chatResult.ok) {
        setBotStatus('connected');
        setBotInfo({
          username: botResult.result?.username || 'Unknown',
          chatTitle: chatResult.result?.title || '@afrcsentinel',
        });
      } else {
        setBotStatus('error');
      }
    } catch {
      setBotStatus('error');
    }
  };

  const handleTemplateSelect = (value: string) => {
    if (value === 'custom') {
      setSelectedTemplate('');
      setMessage('');
      setPreview('');
    } else {
      const key = value as TemplateKey;
      setSelectedTemplate(key);
      setMessage(MESSAGE_TEMPLATES[key]);
      setPreview(MESSAGE_TEMPLATES[key]);
    }
  };

  const handleMessageChange = (value: string) => {
    setMessage(value);
    setPreview(value);
    setSelectedTemplate('');
  };

  const handlePreview = () => {
    setPreview(message);
    toast({
      title: 'Preview Updated',
      description: 'Check the preview panel on the right',
    });
  };

  const handlePost = async () => {
    if (!message.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a message to post',
        variant: 'destructive',
      });
      return;
    }

    setIsPosting(true);
    try {
      const result = await postToTelegram(message);
      
      if (result.ok) {
        toast({
          title: 'Posted Successfully',
          description: `Message sent to ${botInfo?.chatTitle || '@afrcsentinel'}`,
        });
        // Clear after successful post
        setMessage('');
        setPreview('');
        setSelectedTemplate('');
      } else {
        throw new Error(result.description || 'Failed to post');
      }
    } catch (error) {
      toast({
        title: 'Post Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleQuickPost = async (templateKey: TemplateKey) => {
    setIsPosting(true);
    try {
      const result = await postTemplate(templateKey);
      
      if (result.ok) {
        toast({
          title: 'Posted Successfully',
          description: `${templateKey.replace('_', ' ')} sent to Telegram`,
        });
      } else {
        throw new Error(result.description || 'Failed to post');
      }
    } catch (error) {
      toast({
        title: 'Post Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <CardTitle className="text-lg">Telegram Bot Status</CardTitle>
            </div>
            <Badge variant={botStatus === 'connected' ? 'default' : botStatus === 'error' ? 'destructive' : 'secondary'}>
              {botStatus === 'checking' && 'Checking...'}
              {botStatus === 'connected' && (
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Connected
                </span>
              )}
              {botStatus === 'error' && (
                <span className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" /> Error
                </span>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Bot:</span>{' '}
              <span className="font-mono">@{botInfo?.username || 'AfricaRailwaysBot'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Channel:</span>{' '}
              <span className="font-mono">{botInfo?.chatTitle || '@afrcsentinel'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Post Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Post
          </CardTitle>
          <CardDescription>One-click posting for common announcements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={() => handleQuickPost('ido_live')}
              disabled={isPosting || botStatus !== 'connected'}
            >
              IDO Live
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickPost('countdown')}
              disabled={isPosting || botStatus !== 'connected'}
            >
              Countdown
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickPost('ecosystem')}
              disabled={isPosting || botStatus !== 'connected'}
            >
              Ecosystem
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickPost('why_sent')}
              disabled={isPosting || botStatus !== 'connected'}
            >
              Why SENT
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickPost('afc_token')}
              disabled={isPosting || botStatus !== 'connected'}
            >
              AFC Token
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickPost('daily_reminder')}
              disabled={isPosting || botStatus !== 'connected'}
            >
              Daily Reminder
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Custom Message */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Compose Message
            </CardTitle>
            <CardDescription>Write a custom message or select a template</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select onValueChange={handleTemplateSelect} value={selectedTemplate || 'custom'}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template or write custom" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Custom Message</SelectItem>
                <SelectItem value="ido_live">IDO Live Announcement</SelectItem>
                <SelectItem value="countdown">Countdown Reminder</SelectItem>
                <SelectItem value="ecosystem">Ecosystem Overview</SelectItem>
                <SelectItem value="why_sent">Why SENT</SelectItem>
                <SelectItem value="afc_token">AFC Token</SelectItem>
                <SelectItem value="daily_reminder">Daily Reminder</SelectItem>
              </SelectContent>
            </Select>

            <Textarea
              placeholder="Enter your message here... Use *bold* and [links](url) for Markdown formatting"
              value={message}
              onChange={(e) => handleMessageChange(e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />

            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePreview} className="flex-1">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button
                onClick={handlePost}
                disabled={isPosting || !message.trim() || botStatus !== 'connected'}
                className="flex-1"
              >
                <Send className="mr-2 h-4 w-4" />
                {isPosting ? 'Posting...' : 'Post to Telegram'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>How your message will appear in Telegram</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-[#1a1a2e] text-white p-4 rounded-lg min-h-[300px] font-sans text-sm whitespace-pre-wrap">
              {preview ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: preview
                      .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
                      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 underline">$1</a>')
                      .replace(/\n/g, '<br/>'),
                  }}
                />
              ) : (
                <span className="text-gray-500 italic">Your message preview will appear here...</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Markdown Formatting Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium mb-2">Formatting:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li><code className="bg-muted px-1">*bold*</code> → <strong>bold</strong></li>
                <li><code className="bg-muted px-1">_italic_</code> → <em>italic</em></li>
                <li><code className="bg-muted px-1">`code`</code> → <code>code</code></li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">Links:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li><code className="bg-muted px-1">[text](url)</code> → clickable link</li>
                <li>Example: <code className="bg-muted px-1">[PinkSale](https://pinksale.finance)</code></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

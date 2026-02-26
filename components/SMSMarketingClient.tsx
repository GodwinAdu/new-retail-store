'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { MessageSquare, Send, Users, DollarSign, Plus, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import {
  createCampaign,
  getCampaigns,
  deleteCampaign,
  sendCampaign,
  getRecipientCount,
  createTemplate,
  getTemplates,
  deleteTemplate,
} from '@/lib/actions/sms-marketing.actions';

interface SMSMarketingClientProps {
  storeId: string;
  userId: string;
}

export default function SMSMarketingClient({ storeId, userId }: SMSMarketingClientProps) {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCampaignDialog, setShowCampaignDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [recipientCount, setRecipientCount] = useState(0);

  const [campaignForm, setCampaignForm] = useState({
    name: '',
    message: '',
    recipientType: 'all',
    minPurchases: '',
    maxPurchases: '',
    minSpent: '',
    maxSpent: '',
    lastPurchaseDays: '',
  });

  const [templateForm, setTemplateForm] = useState({
    name: '',
    message: '',
    category: 'promotional',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [campaignsRes, templatesRes] = await Promise.all([
      getCampaigns(storeId),
      getTemplates(storeId),
    ]);

    if (campaignsRes?.success) setCampaigns(campaignsRes.data);
    if (templatesRes?.success) setTemplates(templatesRes.data);
    setLoading(false);
  };

  const handleCreateCampaign = async () => {
    if (!campaignForm.name || !campaignForm.message) {
      toast.error('Name and message are required');
      return;
    }

    const recipients: any = { type: campaignForm.recipientType };

    if (campaignForm.recipientType === 'segment') {
      recipients.segment = {
        minPurchases: campaignForm.minPurchases ? parseInt(campaignForm.minPurchases) : undefined,
        maxPurchases: campaignForm.maxPurchases ? parseInt(campaignForm.maxPurchases) : undefined,
        minSpent: campaignForm.minSpent ? parseFloat(campaignForm.minSpent) : undefined,
        maxSpent: campaignForm.maxSpent ? parseFloat(campaignForm.maxSpent) : undefined,
        lastPurchaseDays: campaignForm.lastPurchaseDays ? parseInt(campaignForm.lastPurchaseDays) : undefined,
      };
    }

    const result = await createCampaign(storeId, userId, {
      name: campaignForm.name,
      message: campaignForm.message,
      recipients,
    });

    if (result?.success) {
      toast.success('Campaign created successfully');
      setShowCampaignDialog(false);
      setCampaignForm({
        name: '',
        message: '',
        recipientType: 'all',
        minPurchases: '',
        maxPurchases: '',
        minSpent: '',
        maxSpent: '',
        lastPurchaseDays: '',
      });
      loadData();
    } else {
      toast.error(result?.error || 'Failed to create campaign');
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to send this campaign?')) return;

    const result = await sendCampaign(storeId, campaignId);

    if (result?.success) {
      toast.success(`Campaign sent! ${result.data.sent} sent, ${result.data.failed} failed`);
      loadData();
    } else {
      toast.error(result?.error || 'Failed to send campaign');
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    const result = await deleteCampaign(storeId, campaignId);

    if (result?.success) {
      toast.success('Campaign deleted');
      loadData();
    } else {
      toast.error(result?.error || 'Failed to delete campaign');
    }
  };

  const handleCreateTemplate = async () => {
    if (!templateForm.name || !templateForm.message) {
      toast.error('Name and message are required');
      return;
    }

    const result = await createTemplate(storeId, templateForm);

    if (result?.success) {
      toast.success('Template created successfully');
      setShowTemplateDialog(false);
      setTemplateForm({ name: '', message: '', category: 'promotional' });
      loadData();
    } else {
      toast.error(result?.error || 'Failed to create template');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    const result = await deleteTemplate(storeId, templateId);

    if (result?.success) {
      toast.success('Template deleted');
      loadData();
    } else {
      toast.error(result?.error || 'Failed to delete template');
    }
  };

  const updateRecipientCount = async () => {
    const recipients: any = { type: campaignForm.recipientType };

    if (campaignForm.recipientType === 'segment') {
      recipients.segment = {
        minPurchases: campaignForm.minPurchases ? parseInt(campaignForm.minPurchases) : undefined,
        maxPurchases: campaignForm.maxPurchases ? parseInt(campaignForm.maxPurchases) : undefined,
        minSpent: campaignForm.minSpent ? parseFloat(campaignForm.minSpent) : undefined,
        maxSpent: campaignForm.maxSpent ? parseFloat(campaignForm.maxSpent) : undefined,
        lastPurchaseDays: campaignForm.lastPurchaseDays ? parseInt(campaignForm.lastPurchaseDays) : undefined,
      };
    }

    const result = await getRecipientCount(storeId, recipients);
    if (result?.success) setRecipientCount(result.data);
  };

  useEffect(() => {
    if (showCampaignDialog) {
      updateRecipientCount();
    }
  }, [campaignForm.recipientType, campaignForm.minPurchases, campaignForm.maxPurchases, campaignForm.minSpent, campaignForm.maxSpent, campaignForm.lastPurchaseDays]);

  const stats = {
    totalCampaigns: campaigns.length,
    totalSent: campaigns.reduce((sum, c) => sum + c.stats.sent, 0),
    totalCost: campaigns.reduce((sum, c) => sum + c.stats.cost, 0),
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/dashboard/${storeId}`}>
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">SMS Marketing</h1>
            <p className="text-gray-300 mt-1">Send targeted SMS campaigns to your customers</p>
          </div>
          <Button onClick={() => setShowCampaignDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Campaigns</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalCampaigns}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Messages Sent</CardTitle>
            <Send className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalSent}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${stats.totalCost.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          {campaigns.map((campaign) => (
            <Card key={campaign._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{campaign.name}</CardTitle>
                    <CardDescription className="mt-2">{campaign.message}</CardDescription>
                  </div>
                  <Badge variant={campaign.status === 'sent' ? 'default' : campaign.status === 'draft' ? 'secondary' : 'destructive'}>
                    {campaign.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {campaign.stats.sent} sent • {campaign.stats.failed} failed • ${campaign.stats.cost.toFixed(2)} cost
                  </div>
                  <div className="space-x-2">
                    {campaign.status === 'draft' && (
                      <Button size="sm" onClick={() => handleSendCampaign(campaign._id)}>
                        <Send className="mr-2 h-4 w-4" />
                        Send
                      </Button>
                    )}
                    {(campaign.status === 'draft' || campaign.status === 'failed') && (
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteCampaign(campaign._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Button onClick={() => setShowTemplateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>

          {templates.map((template) => (
            <Card key={template._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription className="mt-2">{template.message}</CardDescription>
                  </div>
                  <Badge>{template.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Button size="sm" variant="destructive" onClick={() => handleDeleteTemplate(template._id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Create Campaign Dialog */}
      <Dialog open={showCampaignDialog} onOpenChange={setShowCampaignDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create SMS Campaign</DialogTitle>
            <DialogDescription>Send targeted SMS messages to your customers</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Campaign Name</Label>
              <Input
                value={campaignForm.name}
                onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                placeholder="e.g., Weekend Sale"
              />
            </div>

            <div>
              <Label>Message (160 characters max)</Label>
              <Textarea
                value={campaignForm.message}
                onChange={(e) => setCampaignForm({ ...campaignForm, message: e.target.value.slice(0, 160) })}
                placeholder="Your promotional message..."
                maxLength={160}
              />
              <p className="text-sm text-muted-foreground mt-1">{campaignForm.message.length}/160</p>
            </div>

            <div>
              <Label>Recipients</Label>
              <Select value={campaignForm.recipientType} onValueChange={(value) => setCampaignForm({ ...campaignForm, recipientType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="segment">Segment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {campaignForm.recipientType === 'segment' && (
              <div className="space-y-3 border p-4 rounded-lg">
                <h4 className="font-medium">Segment Filters</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Min Purchases</Label>
                    <Input
                      type="number"
                      value={campaignForm.minPurchases}
                      onChange={(e) => setCampaignForm({ ...campaignForm, minPurchases: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Max Purchases</Label>
                    <Input
                      type="number"
                      value={campaignForm.maxPurchases}
                      onChange={(e) => setCampaignForm({ ...campaignForm, maxPurchases: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Min Spent ($)</Label>
                    <Input
                      type="number"
                      value={campaignForm.minSpent}
                      onChange={(e) => setCampaignForm({ ...campaignForm, minSpent: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Max Spent ($)</Label>
                    <Input
                      type="number"
                      value={campaignForm.maxSpent}
                      onChange={(e) => setCampaignForm({ ...campaignForm, maxSpent: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Last Purchase (days ago)</Label>
                    <Input
                      type="number"
                      value={campaignForm.lastPurchaseDays}
                      onChange={(e) => setCampaignForm({ ...campaignForm, lastPurchaseDays: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              <span>Estimated recipients: {recipientCount}</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCampaignDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateCampaign}>Create Campaign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create SMS Template</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Template Name</Label>
              <Input
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
              />
            </div>

            <div>
              <Label>Category</Label>
              <Select value={templateForm.category} onValueChange={(value) => setTemplateForm({ ...templateForm, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="promotional">Promotional</SelectItem>
                  <SelectItem value="transactional">Transactional</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Message</Label>
              <Textarea
                value={templateForm.message}
                onChange={(e) => setTemplateForm({ ...templateForm, message: e.target.value.slice(0, 160) })}
                maxLength={160}
              />
              <p className="text-sm text-muted-foreground mt-1">{templateForm.message.length}/160</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateTemplate}>Create Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

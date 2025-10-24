import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ticketCode: '',
    attendeeName: '',
    eventName: 'My Event'
  });

  const generateSampleTickets = async () => {
    setLoading(true);
    try {
      const sampleTickets = [
        { ticket_code: 'TICKET001', attendee_name: 'John Doe', event_name: 'Tech Conference 2025' },
        { ticket_code: 'TICKET002', attendee_name: 'Jane Smith', event_name: 'Tech Conference 2025' },
        { ticket_code: 'TICKET003', attendee_name: 'Bob Johnson', event_name: 'Tech Conference 2025' },
        { ticket_code: 'QR12345', attendee_name: 'Alice Williams', event_name: 'Tech Conference 2025' },
        { ticket_code: 'BAR67890', attendee_name: 'Charlie Brown', event_name: 'Tech Conference 2025' },
      ];

      const { error } = await supabase.from('tickets').insert(sampleTickets);
      
      if (error) throw error;
      
      toast.success('Sample tickets created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create sample tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('tickets').insert({
        ticket_code: formData.ticketCode,
        attendee_name: formData.attendeeName,
        event_name: formData.eventName
      });

      if (error) throw error;

      toast.success('Ticket created successfully!');
      setFormData({
        ticketCode: '',
        attendeeName: '',
        eventName: 'My Event'
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Ticket Management</h1>
            <p className="text-muted-foreground">Create and manage event tickets</p>
          </div>
        </div>

        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">Quick Setup</h2>
            <p className="text-sm text-muted-foreground">
              Generate sample tickets to test the scanning system
            </p>
          </div>
          <Button
            onClick={generateSampleTickets}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Generate 5 Sample Tickets
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Create New Ticket</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ticketCode">Ticket Code *</Label>
              <Input
                id="ticketCode"
                placeholder="e.g., TICKET001 or QR12345"
                value={formData.ticketCode}
                onChange={(e) => setFormData({ ...formData, ticketCode: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attendeeName">Attendee Name *</Label>
              <Input
                id="attendeeName"
                placeholder="Full name"
                value={formData.attendeeName}
                onChange={(e) => setFormData({ ...formData, attendeeName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventName">Event Name *</Label>
              <Input
                id="eventName"
                placeholder="Event name"
                value={formData.eventName}
                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gap-2 bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              Create Ticket
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
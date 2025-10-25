import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "@/integrations/firebase/client";
import { collection, addDoc, writeBatch } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Upload } from "lucide-react";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ticketCode: '',
    attendeeName: '',
    eventName: 'My Event'
  });

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      const rows = text.split('\n').filter(row => row.trim());
      
      // Skip header row and parse CSV
      const tickets = rows.slice(1).map(row => {
        const [ticket_code, attendee_name, event_name] = row.split(',').map(cell => cell.trim());
        return { ticket_code, attendee_name, event_name };
      }).filter(ticket => ticket.ticket_code && ticket.attendee_name && ticket.event_name);

      if (tickets.length === 0) {
        toast.error('No valid tickets found in CSV');
        return;
      }

      const attendeesRef = collection(db, "events", "my-first-event", "attendees");
      await Promise.all(tickets.map(ticket => addDoc(attendeesRef, ticket)));
      
      toast.success(`${tickets.length} tickets uploaded successfully!`);
      e.target.value = '';
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload CSV');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const attendeesRef = collection(db, "events", "my-first-event", "attendees");
      await addDoc(attendeesRef, {
        ticket_code: formData.ticketCode,
        attendee_name: formData.attendeeName,
        event_name: formData.eventName,
        checked_in_at: null,
      });

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
            <h2 className="text-xl font-bold text-foreground">Bulk Upload</h2>
            <p className="text-sm text-muted-foreground">
              Upload multiple tickets via CSV file (Format: ticket_code, attendee_name, event_name)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="csvFile">CSV File</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              disabled={loading}
              className="cursor-pointer"
            />
          </div>
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
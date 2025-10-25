import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, Scan, User, AlertCircle, Home, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";

const Scanner = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ status: 'valid' | 'invalid' | 'duplicate', message: string, timestamp?: string } | null>(null);
  const [flashCount, setFlashCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const navigate = useNavigate();

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;
      
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        onScanSuccess,
        () => {} // onScanFailure - silent
      );
      
      setScanning(true);
      setResult(null);
    } catch (err) {
      toast.error("Failed to start camera");
      console.error(err);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scanning) {
      try {
        const state = await scannerRef.current.getState();
        // Only stop if scanner is actually running (state 2) or paused (state 3)
        if (state === 2 || state === 3) {
          await scannerRef.current.stop();
          scannerRef.current.clear();
        }
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const onScanSuccess = async (decodedText: string) => {
    if (processing) return;
    setProcessing(true);

    await stopScanner();
    
    // Check if ticket exists
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('*')
      .eq('ticket_code', decodedText)
      .maybeSingle();

    if (ticketError) {
      setResult({ status: 'invalid', message: 'Error checking ticket' });
      toast.error("Error checking ticket");
      setProcessing(false);
      return;
    }

    if (!ticket) {
      setResult({ status: 'invalid', message: 'Invalid ticket code' });
      toast.error("Invalid ticket");
      setProcessing(false);
      return;
    }

    // Check if already checked in
    if (ticket.checked_in_at) {
      const timestamp = new Date(ticket.checked_in_at).toLocaleString();
      setResult({ 
        status: 'duplicate', 
        message: `${ticket.attendee_name} already checked in at ${timestamp}`,
        timestamp 
      });
      toast.error("Ticket already used");
      
      // Trigger flash animation
      setFlashCount(4); // Flash 2 times (4 half-cycles)
      setProcessing(false);
      return;
    }

    // Valid check-in - update ticket with timestamp
    const { error: checkInError } = await supabase
      .from('tickets')
      .update({ checked_in_at: new Date().toISOString() })
      .eq('id', ticket.id);

    if (checkInError) {
      setResult({ status: 'invalid', message: 'Error recording check-in' });
      toast.error("Error recording check-in");
      setProcessing(false);
      return;
    }

    setResult({ status: 'valid', message: `Verified - ${ticket.event_name}` });
    toast.success(`Checked in: ${ticket.attendee_name}`);
    setProcessing(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  // Flash animation effect
  useEffect(() => {
    if (flashCount > 0) {
      const timer = setTimeout(() => {
        setFlashCount(flashCount - 1);
      }, 250); // Flash every 250ms
      return () => clearTimeout(timer);
    }
  }, [flashCount]);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 transition-colors duration-250 ${
      flashCount > 0 && result?.status === 'duplicate' 
        ? (flashCount % 2 === 0 ? 'bg-error/30' : 'bg-success/30')
        : ''
    }`}>
      <header className="fixed top-4 left-4 z-10 flex gap-2">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="gap-2"
        >
          <Home className="w-4 h-4" />
          Home
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard')}
          className="gap-2"
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/admin')}
          className="gap-2"
        >
          <User className="w-4 h-4" />
          Admin
        </Button>
      </header>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <img src="data:image/jpeg;base64,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каUpQClKUApSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgP//Z" alt="logo" className="w-24 h-24 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground">Ticket Scanner</h1>
          <p className="text-muted-foreground">Scan barcode or QR code</p>
        </div>

        {/* Scanner Card */}
        <Card className="p-6 space-y-4">
          <div id="reader" className="w-full rounded-lg overflow-hidden" />
          
          {!scanning && !result && (
            <Button
              onClick={startScanner}
              className="w-full gap-2 bg-primary hover:bg-primary/90"
              size="lg"
            >
              <Scan className="w-5 h-5" />
              Start Scanning
            </Button>
          )}

          {scanning && (
            <Button
              onClick={stopScanner}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Stop Scanning
            </Button>
          )}
        </Card>

        {/* Result Display */}
        {result && (
          <Card className={`p-8 text-center space-y-4 transition-all duration-500 ${
            result.status === 'valid' 
              ? 'bg-success/10 border-success/50' 
              : 'bg-error/10 border-error/50'
          }`}>
            {result.status === 'valid' && (
              <>
                <CheckCircle className="w-20 h-20 mx-auto text-success animate-in zoom-in duration-500" />
                <h2 className="text-2xl font-bold text-success">Valid Ticket</h2>
              </>
            )}
            {result.status === 'invalid' && (
              <>
                <XCircle className="w-20 h-20 mx-auto text-error animate-in zoom-in duration-500" />
                <h2 className="text-2xl font-bold text-error">Invalid Ticket</h2>
              </>
            )}
            {result.status === 'duplicate' && (
              <>
                <AlertCircle className="w-20 h-20 mx-auto text-error animate-in zoom-in duration-500" />
                <h2 className="text-2xl font-bold text-error">Already Used</h2>
              </>
            )}
            <p className="text-lg text-foreground">{result.message}</p>
            
            <Button
              onClick={() => {
                setResult(null);
                startScanner();
              }}
              className="mt-4 gap-2"
            >
              <Scan className="w-4 h-4" />
              Scan Next
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Scanner;
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
          fps: 30,
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
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
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
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';
import { Shield, Heart, Lock } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface PinAuthProps {
  onAuthenticate: (success: boolean) => void;
}

export default function PinAuth({ onAuthenticate }: PinAuthProps) {
  const [pin, setPin] = useState('');
  const [storedPin, setStoredPin] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const { toast } = useToast();

  useEffect(() => {
    const savedPin = localStorage.getItem('childfirst_pin');
    if (!savedPin) {
      setIsSettingPin(true);
    } else {
      setStoredPin(savedPin);
    }
  }, []);

  const handlePinComplete = (value: string) => {
    if (isSettingPin) {
      if (step === 'enter') {
        setPin(value);
        setStep('confirm');
        toast({
          title: "Confirm your PIN",
          description: "Please enter your PIN again to confirm.",
        });
      } else {
        setConfirmPin(value);
        if (value === pin) {
          localStorage.setItem('childfirst_pin', value);
          setStoredPin(value);
          setIsSettingPin(false);
          toast({
            title: "PIN set successfully",
            description: "Your app is now secured with a PIN.",
          });
          onAuthenticate(true);
        } else {
          toast({
            title: "PINs don't match",
            description: "Please try again.",
            variant: "destructive",
          });
          setPin('');
          setConfirmPin('');
          setStep('enter');
        }
      }
    } else {
      if (value === storedPin) {
        onAuthenticate(true);
        toast({
          title: "Welcome back",
          description: "Access granted to ChildFirst.",
        });
      } else {
        toast({
          title: "Incorrect PIN",
          description: "Please try again.",
          variant: "destructive",
        });
        setPin('');
      }
    }
  };

  const handleBiometricAuth = async () => {
    if ('credentials' in navigator) {
      try {
        const credential = await navigator.credentials.create({
          publicKey: {
            challenge: new Uint8Array(32),
            rp: { name: "ChildFirst" },
            user: {
              id: new Uint8Array(16),
              name: "user@childfirst.app",
              displayName: "ChildFirst User"
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }],
            authenticatorSelection: {
              authenticatorAttachment: "platform",
              userVerification: "required"
            }
          }
        });
        
        if (credential) {
          onAuthenticate(true);
          toast({
            title: "Biometric authentication successful",
            description: "Welcome to ChildFirst.",
          });
        }
      } catch (error) {
        toast({
          title: "Biometric authentication failed",
          description: "Please use your PIN instead.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-effect">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-primary">ChildFirst</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Supporting your neurodivergent child with privacy and care
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">
              {isSettingPin 
                ? (step === 'enter' ? 'Set Your PIN' : 'Confirm Your PIN')
                : 'Enter Your PIN'
              }
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {isSettingPin 
                ? 'Create a 6-digit PIN to secure your data'
                : 'Enter your 6-digit PIN to access the app'
              }
            </p>
          </div>

          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={step === 'confirm' ? confirmPin : pin}
              onChange={(value) => {
                if (step === 'confirm') {
                  setConfirmPin(value);
                } else {
                  setPin(value);
                }
                if (value.length === 6) {
                  handlePinComplete(value);
                }
              }}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {!isSettingPin && (
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={handleBiometricAuth}
              >
                <Lock className="w-4 h-4 mr-2" />
                Use Biometric Authentication
              </Button>
            </div>
          )}

          <div className="text-center pt-4">
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Heart className="w-4 h-4 text-accent" />
              <span>Your data stays private and secure on your device</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
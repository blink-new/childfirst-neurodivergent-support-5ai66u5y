import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { 
  Mic, 
  MicOff, 
  Save, 
  MapPin, 
  Clock, 
  Users, 
  AlertTriangle,
  Play,
  Pause,
  Square,
  RotateCcw
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { format } from 'date-fns';

interface VoiceRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  transcript: string;
  category: string;
  severity: number;
  peopleInvolved: string[];
  location: string;
  timestamp: string;
}

const categories = [
  'Meltdown',
  'School Refusal',
  'Family Conflict',
  'Sensory Overload',
  'Anxiety Episode',
  'Positive Behavior',
  'Breakthrough Moment',
  'Therapy Session',
  'Medical Appointment',
  'Other'
];

const commonPeople = [
  'Child',
  'Parent/Guardian',
  'Sibling',
  'Teacher',
  'Therapist',
  'Doctor',
  'Friend',
  'Extended Family',
  'Other Adult'
];

export default function VoiceRecording() {
  const [state, setState] = useState<VoiceRecordingState>({
    isRecording: false,
    isPaused: false,
    transcript: '',
    category: '',
    severity: 3,
    peopleInvolved: [],
    location: '',
    timestamp: ''
  });
  
  const [recordingTime, setRecordingTime] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-AU';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setState(prev => ({
          ...prev,
          transcript: prev.transcript + finalTranscript
        }));
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const getCurrentLocation = (): Promise<string> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve('Location not available');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        },
        () => {
          resolve('Location access denied');
        },
        { timeout: 5000 }
      );
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      const location = await getCurrentLocation();
      const timestamp = new Date().toISOString();
      
      setState(prev => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        location,
        timestamp
      }));

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      }

      // Start timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      mediaRecorderRef.current.start();
      
      toast({
        title: "Recording started",
        description: "Speak clearly for best transcription results.",
      });
    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Please check microphone permissions.",
        variant: "destructive",
      });
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && state.isRecording) {
      if (state.isPaused) {
        mediaRecorderRef.current.resume();
        if (recognitionRef.current) {
          recognitionRef.current.start();
          setIsListening(true);
        }
        if (timerRef.current) {
          timerRef.current = setInterval(() => {
            setRecordingTime(prev => prev + 1);
          }, 1000);
        }
      } else {
        mediaRecorderRef.current.pause();
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          setIsListening(false);
        }
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
      
      setState(prev => ({
        ...prev,
        isPaused: !prev.isPaused
      }));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setState(prev => ({
      ...prev,
      isRecording: false,
      isPaused: false
    }));
    
    toast({
      title: "Recording stopped",
      description: "Review and save your incident report.",
    });
  };

  const resetRecording = () => {
    stopRecording();
    setState({
      isRecording: false,
      isPaused: false,
      transcript: '',
      category: '',
      severity: 3,
      peopleInvolved: [],
      location: '',
      timestamp: ''
    });
    setRecordingTime(0);
  };

  const saveIncident = () => {
    if (!state.transcript.trim() || !state.category) {
      toast({
        title: "Missing information",
        description: "Please add a transcript and select a category.",
        variant: "destructive",
      });
      return;
    }

    const incident = {
      id: Date.now().toString(),
      timestamp: state.timestamp || new Date().toISOString(),
      category: state.category,
      severity: state.severity,
      location: state.location,
      transcript: state.transcript.trim(),
      peopleInvolved: state.peopleInvolved
    };

    // Save to localStorage
    const existingIncidents = JSON.parse(localStorage.getItem('childfirst_incidents') || '[]');
    existingIncidents.push(incident);
    localStorage.setItem('childfirst_incidents', JSON.stringify(existingIncidents));

    toast({
      title: "Incident saved",
      description: "Your documentation has been securely stored.",
    });

    // Reset form
    resetRecording();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSeverityLabel = (severity: number) => {
    if (severity <= 2) return 'Low Impact';
    if (severity <= 3) return 'Moderate Impact';
    return 'High Impact';
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 2) return 'text-success';
    if (severity <= 3) return 'text-accent';
    return 'text-destructive';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Record Incident</h1>
        <p className="text-muted-foreground">
          Document your child's experience with voice recording and automatic transcription
        </p>
      </div>

      {/* Recording Controls */}
      <Card className="border-2 border-dashed border-primary/30">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Mic className="w-5 h-5" />
            <span>Voice Recording</span>
          </CardTitle>
          <CardDescription>
            Tap to start recording. Your voice will be automatically transcribed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recording Button */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Button
                size="lg"
                className={`w-24 h-24 rounded-full ${
                  state.isRecording 
                    ? 'bg-destructive hover:bg-destructive/90 recording-pulse' 
                    : 'bg-accent hover:bg-accent/90'
                }`}
                onClick={state.isRecording ? stopRecording : startRecording}
              >
                {state.isRecording ? (
                  <Square className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </Button>
            </div>
            
            {state.isRecording && (
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={pauseRecording}
                >
                  {state.isPaused ? (
                    <Play className="w-4 h-4 mr-2" />
                  ) : (
                    <Pause className="w-4 h-4 mr-2" />
                  )}
                  {state.isPaused ? 'Resume' : 'Pause'}
                </Button>
                
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(recordingTime)}</span>
                </div>
                
                {isListening && (
                  <Badge variant="secondary" className="animate-pulse">
                    Listening...
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Status Information */}
          {state.timestamp && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(new Date(state.timestamp), 'PPpp')}
                </span>
              </div>
              {state.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Location captured
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transcript and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transcript */}
        <Card>
          <CardHeader>
            <CardTitle>Transcript</CardTitle>
            <CardDescription>
              Edit the automatically generated transcript as needed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Your speech will appear here automatically, or you can type directly..."
              value={state.transcript}
              onChange={(e) => setState(prev => ({ ...prev, transcript: e.target.value }))}
              className="min-h-[200px] resize-none"
            />
          </CardContent>
        </Card>

        {/* Incident Details */}
        <Card>
          <CardHeader>
            <CardTitle>Incident Details</CardTitle>
            <CardDescription>
              Categorize and provide context for this incident
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Category */}
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select
                value={state.category}
                onValueChange={(value) => setState(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select incident category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Severity */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Severity Level: {state.severity}/5
              </label>
              <div className="space-y-2">
                <Slider
                  value={[state.severity]}
                  onValueChange={(value) => setState(prev => ({ ...prev, severity: value[0] }))}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex items-center space-x-2">
                  <AlertTriangle className={`w-4 h-4 ${getSeverityColor(state.severity)}`} />
                  <span className={`text-sm font-medium ${getSeverityColor(state.severity)}`}>
                    {getSeverityLabel(state.severity)}
                  </span>
                </div>
              </div>
            </div>

            {/* People Involved */}
            <div>
              <label className="text-sm font-medium mb-2 block">People Involved</label>
              <div className="grid grid-cols-2 gap-2">
                {commonPeople.map((person) => (
                  <Button
                    key={person}
                    variant={state.peopleInvolved.includes(person) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setState(prev => ({
                        ...prev,
                        peopleInvolved: prev.peopleInvolved.includes(person)
                          ? prev.peopleInvolved.filter(p => p !== person)
                          : [...prev.peopleInvolved, person]
                      }));
                    }}
                  >
                    <Users className="w-3 h-3 mr-1" />
                    {person}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          variant="outline"
          onClick={resetRecording}
          disabled={state.isRecording}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        
        <Button
          onClick={saveIncident}
          disabled={!state.transcript.trim() || !state.category || state.isRecording}
          className="bg-success hover:bg-success/90 text-success-foreground"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Incident
        </Button>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  BookOpen, 
  ExternalLink, 
  Phone, 
  MapPin, 
  Heart,
  Brain,
  Users,
  School,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  Star
} from 'lucide-react';

const conditions = [
  {
    id: 'autism',
    name: 'Autism Spectrum Disorder',
    icon: Brain,
    color: 'bg-primary text-primary-foreground',
    description: 'Understanding autism and supporting your child\'s unique needs',
    strategies: [
      'Create predictable routines and visual schedules',
      'Use clear, concrete language and avoid idioms',
      'Provide sensory breaks and quiet spaces',
      'Break tasks into smaller, manageable steps',
      'Use positive reinforcement and celebrate small wins'
    ],
    resources: [
      {
        title: 'Autism Victoria',
        description: 'Comprehensive support and resources for Victorian families',
        url: 'https://www.autismvictoria.org.au',
        type: 'Organization'
      },
      {
        title: 'NDIS Autism Support',
        description: 'Information about NDIS funding for autism support',
        url: 'https://www.ndis.gov.au',
        type: 'Government'
      }
    ]
  },
  {
    id: 'adhd',
    name: 'ADHD',
    icon: AlertCircle,
    color: 'bg-accent text-accent-foreground',
    description: 'Managing ADHD symptoms and supporting focus and attention',
    strategies: [
      'Establish consistent daily routines',
      'Use timers and visual reminders',
      'Provide regular movement breaks',
      'Create distraction-free environments for tasks',
      'Use positive behavior support strategies'
    ],
    resources: [
      {
        title: 'ADHD Australia',
        description: 'National support organization for ADHD',
        url: 'https://www.adhdaustralia.org.au',
        type: 'Organization'
      },
      {
        title: 'Victorian ADHD Support',
        description: 'Local support groups and resources',
        url: 'https://www.adhdvic.org.au',
        type: 'Support Group'
      }
    ]
  },
  {
    id: 'pda',
    name: 'Pathological Demand Avoidance',
    icon: Users,
    color: 'bg-secondary text-secondary-foreground',
    description: 'Understanding PDA and reducing demand-related anxiety',
    strategies: [
      'Reduce direct demands and use indirect approaches',
      'Offer choices and maintain flexibility',
      'Use collaborative language ("Let\'s..." instead of "You need to...")',
      'Recognize and validate anxiety behind avoidance',
      'Build trust through understanding and patience'
    ],
    resources: [
      {
        title: 'PDA Society Australia',
        description: 'Information and support for PDA families',
        url: 'https://www.pdasociety.org.au',
        type: 'Organization'
      },
      {
        title: 'Understanding PDA',
        description: 'Comprehensive guide to PDA strategies',
        url: 'https://www.pdaresource.com',
        type: 'Educational'
      }
    ]
  },
  {
    id: 'school-refusal',
    name: 'School Refusal',
    icon: School,
    color: 'bg-destructive text-destructive-foreground',
    description: 'Supporting children who struggle with school attendance',
    strategies: [
      'Identify underlying causes (anxiety, sensory issues, bullying)',
      'Work collaboratively with school staff',
      'Gradual re-introduction to school environment',
      'Address physical symptoms of anxiety',
      'Consider alternative education options if needed'
    ],
    resources: [
      {
        title: 'Victorian Department of Education',
        description: 'School refusal support and policies',
        url: 'https://www.education.vic.gov.au',
        type: 'Government'
      },
      {
        title: 'Anxiety Online',
        description: 'Resources for school anxiety and refusal',
        url: 'https://www.anxietyonline.org.au',
        type: 'Mental Health'
      }
    ]
  }
];

const victorianServices = [
  {
    name: 'Autism Victoria',
    description: 'Statewide autism support services',
    phone: '1300 308 699',
    website: 'https://www.autismvictoria.org.au',
    services: ['Diagnosis support', 'Family support', 'Training', 'Advocacy']
  },
  {
    name: 'AMAZE (Autism Victoria)',
    description: 'Peak body for autism in Victoria',
    phone: '1300 308 699',
    website: 'https://www.amaze.org.au',
    services: ['Information', 'Advocacy', 'Training', 'Support groups']
  },
  {
    name: 'Victorian ADHD Support Group',
    description: 'Support for families affected by ADHD',
    phone: '0431 437 645',
    website: 'https://www.adhdvic.org.au',
    services: ['Support groups', 'Information', 'Advocacy']
  },
  {
    name: 'Developmental Paediatrics - Royal Children\'s Hospital',
    description: 'Specialist assessment and support',
    phone: '(03) 9345 5522',
    website: 'https://www.rch.org.au',
    services: ['Assessment', 'Diagnosis', 'Treatment', 'Family support']
  },
  {
    name: 'Child and Adolescent Mental Health Service (CAMHS)',
    description: 'Mental health support for children and teens',
    phone: '1800 888 319',
    website: 'https://www.betterhealth.vic.gov.au',
    services: ['Mental health assessment', 'Therapy', 'Crisis support']
  }
];

const familySupport = [
  {
    title: 'Understanding Your Child\'s Behavior',
    content: 'Neurodivergent behaviors often serve a purpose - communication, self-regulation, or coping with overwhelming situations. Look beyond the behavior to understand the underlying need.',
    tips: [
      'Keep a behavior diary to identify patterns',
      'Consider sensory, emotional, and environmental triggers',
      'Validate your child\'s experiences and feelings',
      'Focus on teaching coping strategies rather than stopping behaviors'
    ]
  },
  {
    title: 'Working with Resistant Family Members',
    content: 'Not everyone may understand or accept your child\'s neurodivergence. Here are strategies for building understanding and support.',
    tips: [
      'Share educational resources and research',
      'Invite them to appointments or therapy sessions',
      'Set clear boundaries about acceptable language and behavior',
      'Focus on your child\'s strengths and achievements',
      'Consider family therapy or mediation if needed'
    ]
  },
  {
    title: 'Self-Care for Parents',
    content: 'Supporting a neurodivergent child can be emotionally and physically demanding. Taking care of yourself is essential for your family\'s wellbeing.',
    tips: [
      'Connect with other parents in similar situations',
      'Take regular breaks and ask for help',
      'Practice stress-reduction techniques',
      'Celebrate small victories and progress',
      'Consider counseling or therapy for yourself'
    ]
  }
];

export default function EducationalResources() {
  const [selectedCondition, setSelectedCondition] = useState('autism');

  const currentCondition = conditions.find(c => c.id === selectedCondition);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Educational Resources</h1>
        <p className="text-muted-foreground">
          Evidence-based information and support for neurodivergent children in Victoria
        </p>
      </div>

      <Tabs defaultValue="conditions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="conditions">Conditions & Strategies</TabsTrigger>
          <TabsTrigger value="services">Victorian Services</TabsTrigger>
          <TabsTrigger value="family">Family Support</TabsTrigger>
        </TabsList>

        <TabsContent value="conditions" className="space-y-6">
          {/* Condition Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {conditions.map((condition) => {
              const Icon = condition.icon;
              return (
                <Card
                  key={condition.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedCondition === condition.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedCondition(condition.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 rounded-lg ${condition.color} flex items-center justify-center mx-auto mb-3`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-sm">{condition.name}</h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Selected Condition Details */}
          {currentCondition && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strategies */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span>Evidence-Based Strategies</span>
                  </CardTitle>
                  <CardDescription>
                    {currentCondition.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {currentCondition.strategies.map((strategy, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Star className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{strategy}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Resources */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <span>Helpful Resources</span>
                  </CardTitle>
                  <CardDescription>
                    Trusted organizations and information sources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentCondition.resources.map((resource, index) => (
                      <div key={index} className="p-4 border border-border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{resource.title}</h4>
                          <Badge variant="secondary">{resource.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {resource.description}
                        </p>
                        <Button variant="outline" size="sm" asChild>
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Visit Website
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span>Victorian Support Services</span>
              </CardTitle>
              <CardDescription>
                Local organizations and services available in Victoria, Australia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {victorianServices.map((service, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
                    <p className="text-muted-foreground mb-3">{service.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{service.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        <a 
                          href={service.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {service.website}
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {service.services.map((serviceType, serviceIndex) => (
                        <Badge key={serviceIndex} variant="outline">
                          {serviceType}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="family" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {familySupport.map((section, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-accent" />
                    <span>{section.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{section.content}</p>
                  <ul className="space-y-2">
                    {section.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start space-x-3">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Crisis Support */}
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-destructive">
                <Stethoscope className="w-5 h-5" />
                <span>Crisis Support</span>
              </CardTitle>
              <CardDescription>
                If you or your child are in immediate danger or crisis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-background rounded-lg border">
                  <h4 className="font-semibold mb-2">Emergency Services</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    For immediate danger or medical emergency
                  </p>
                  <Button variant="destructive" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Call 000
                  </Button>
                </div>
                
                <div className="p-4 bg-background rounded-lg border">
                  <h4 className="font-semibold mb-2">Mental Health Crisis</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    24/7 mental health support and crisis intervention
                  </p>
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Call 1800 888 319
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
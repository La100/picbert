import { Beaker, Clock, Flame, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Recipe() {
  const steps = [
    {
      id: 1,
      title: 'Choose Your Subject',
      description: 'Select the type of person or character you want to create.',
      icon: Beaker,
    },
    {
      id: 2,
      title: 'Add Details & Customization',
      description: 'Specify features, style, setting, and other preferences.',
      icon: Flame,
    },
    {
      id: 3,
      title: 'Generate & Refine',
      description: 'Our AI creates your images, which you can further refine if needed.',
      icon: Clock,
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            The Perfect Recipe for AI Images
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Follow our simple three-step recipe to create stunning, realistic AI-generated images in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="bg-amber-50 p-6 border-b border-amber-100">
                <h3 className="text-2xl font-bold text-amber-800">The Faces Factory Recipe</h3>
                <p className="text-amber-700 mt-2">Ready in minutes • No experience required</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-8">
                  {steps.map((step) => (
                    <div key={step.id} className="flex gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                        <step.icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          <span className="text-amber-600">Step {step.id}:</span> {step.title}
                        </h4>
                        <p className="mt-2 text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900">Results  Love:</h4>
                  <ul className="mt-4 space-y-3">
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 flex-shrink-0 text-green-500" aria-hidden="true" />
                      <span className="text-gray-700">Realistic, high-quality images</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 flex-shrink-0 text-green-500" aria-hidden="true" />
                      <span className="text-gray-700">Unlimited variations and styles</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 flex-shrink-0 text-green-500" aria-hidden="true" />
                      <span className="text-gray-700">Ready for immediate use in your projects</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-8 text-center">
                  <Link href="/login?state=signup">
                    <Button className="rounded-md text-base h-12 bg-amber-600 hover:bg-amber-700">
                      Start Creating Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative w-full max-w-md aspect-[3/4] rounded-xl overflow-hidden shadow-xl">
              <Image
                src="/recipe-showcase.jpg"
                alt="AI image creation process"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <span className="bg-amber-500 text-white text-xs font-medium px-2.5 py-1 rounded">AI-Generated</span>
                  <p className="mt-2 font-medium text-lg">Amazing results in minutes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 
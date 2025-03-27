import { Pencil, Video } from 'lucide-react';
import Image from 'next/image';
export default function Recipe() {
  const steps = [
    {
      id: 1,
      title: 'Add Catchy Title',
      description: 'Write an engaging title that will grab attention and inspire creativity.',
      icon: Pencil,
    },
    {
      id: 2,
      title: 'Add Your Product Demo',
      description: 'Upload a video or image showcasing your product in action.',
      icon: Video,
    }
  ];

  return (
    <section className="py-24">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">
            Two Simple Steps
          </h2>
          <p className="text-lg text-muted-foreground">
            Example of what can you do with videos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex justify-center order-2 lg:order-1">
            <div className="relative mx-10  aspect-[9/16] rounded-xl overflow-hidden ">
              <Image
                src="https://api.facesfactory.com/storage/v1/object/public/images//landing.png"
                alt="AI-Generated Image"
                width={450}
                height={760}
                className="object-cover "
              />
              
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 order-1 lg:order-2">
            {steps.map((step) => (
              <div 
                key={step.id} 
                className="flex flex-col items-center text-center p-8 rounded-xl border bg-card hover:shadow-lg transition-shadow"
              >
                <div className="mb-6 p-4 rounded-full bg-primary/10">
                  <step.icon className="h-8 w-8 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 
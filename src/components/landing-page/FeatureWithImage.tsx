import { CheckIcon, CurrencyDollarIcon, ClockIcon, ArrowTrendingUpIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid'

export default function FeatureComparison() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center lg:text-left lg:mx-0">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Create more, spend less
          </h2>
         
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-x-12 lg:grid-cols-2">
          <div className="flex flex-col gap-5 h-full justify-center">
            {/* Challenges Section with Background */}
            <div className="rounded-xl bg-red-50/50 p-6 ring-1 ring-red-200">
              <div className="border-b border-red-200 pb-4 mb-5">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Creating content before AI :</h3>
              </div>
              
              {/* Cost Comparison */}
              <div className="flex items-start gap-4 mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 text-red-600">
                  <CurrencyDollarIcon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">High Cost Barrier</h4>
                  <p className="mt-1 text-gray-600">Professional freelancers charge $60-120 per image</p>
                  <div className="mt-2 inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                    $4,000-$6,000 monthly expense
                  </div>
                </div>
              </div>
              
              {/* Time Comparison */}
              <div className="flex items-start gap-4 mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 text-red-600">
                  <ClockIcon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Time Investment</h4>
                  <p className="mt-1 text-gray-600">DIY approaches demand significant time for planning, creating and editing</p>
                  <div className="mt-2 inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                    40+ hours monthly
                  </div>
                </div>
              </div>

         
            </div>
            
            <div className="my-2">
              <h3 className="text-lg font-medium leading-6 text-gray-900">The Faces Factory Advantage</h3>
            </div>
            
            {/* Faces Factory Solution */}
            <div className="rounded-xl bg-gradient-to-br from-green-50 to-blue-50 p-6 ring-1 ring-green-200">
              <div className="flex items-center mb-4">
                <ArrowTrendingUpIcon className="h-6 w-6 text-green-600 mr-3" aria-hidden="true" />
                <h3 className="text-xl font-semibold text-gray-900">Transform Your Content Strategy</h3>
              </div>
              
              <ul className="mt-4 space-y-3">
                <li className="flex gap-2">
                  <CheckIcon className="h-5 w-5 flex-shrink-0 text-green-500" aria-hidden="true" />
                  <span className="text-gray-700">Gain acces to AI video library instantly</span>
                </li>
                <li className="flex gap-2">
                  <CheckIcon className="h-5 w-5 flex-shrink-0 text-green-500" aria-hidden="true" />
                  <span className="text-gray-700">Generate realistic photos of People</span>
                </li>
                <li className="flex gap-2">
                  <CheckIcon className="h-5 w-5 flex-shrink-0 text-green-500" aria-hidden="true" />
                  <span className="text-gray-700">No specialized skills or equipment needed</span>
                </li>
              </ul>
              
              <div className="mt-5 text-center">
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1.5 text-sm font-medium text-green-800">
                  One affordable subscription replaces thousands in expenses
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center mt-8 lg:mt-0">
            <img
              src="/collage.jpg"
              alt="AI-generated images showcase"
              width={1072}
              height={1443}
              className="rounded-xl shadow-xl object-contain max-h-[800px] w-auto h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 
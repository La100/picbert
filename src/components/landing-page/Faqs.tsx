import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import React from 'react'
import AnimatedGradientText from '../ui/animated-gradient-text'
import { cn } from '@/lib/utils'

const faqs = [
  {question: "How does Faces Factory work?", answer: "Faces Factory uses advanced machine learning algorithms to analyze and understand your photos. It then generates new images based on your features and the scenarios you choose, creating realistic and personalized results."},
  {question: "Is my data safe with Faces Factory?", answer: "Yes, we take data privacy very seriously. All uploaded photos and generated images are encrypted and stored securely. We never share your personal data or images with third parties without your explicit consent."},
  {question: "How many photos do I need for best results?", answer: "For optimal results, we recommend providing a clear reference photo that shows your features well. The better the quality and clarity of your reference photo, the more accurate and realistic the generated images will be."},
  {question: "Can I use Faces Factory for commercial purposes?", answer: "Yes, our Pro and Enterprise plans include commercial usage rights for the images you generate. However, please note that you should always respect copyright and usage rights when using generated images."},
  {question: "How often do you update the AI system?", answer: "We continuously work on improving our AI technology. Updates are released regularly to enhance image quality, add new features, and optimize performance. All users automatically benefit from these improvements."},
  {question: "What are the differences between the free and paid plans?", answer: "The free plan allows you to generate up to 5 images per day. The Pro plan includes unlimited image generation, higher resolution output, and access to additional features. The Enterprise plan is tailored for businesses and offers custom integrations and dedicated support."},
]

const Question = ({question, answer}: {question: string, answer: string}) => {
  return (
    <AccordionItem value={question}>
      <AccordionTrigger className='text-left'>{question}</AccordionTrigger>
      <AccordionContent className='text-muted-foreground '>{answer}</AccordionContent>
    </AccordionItem>
  )
}

const Faqs = () => {
  return (
    <section id="faqs" className="w-full self-center container px-6 xs:px-8 sm:px-0 sm:mx-8 lg:mx-auto py-32 flex flex-col items-center justify-center ">
        <AnimatedGradientText className="bg-background backdrop-blur-0">
        <span
          className={cn(
            `inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent uppercase`
          )}
        >
          FAQs
        </span>
      </AnimatedGradientText>
      <h2 className="subHeading mt-4 text-center">Frequently Asked Questions</h2>
      <p className="subText mt-4 text-center ">
        Here are some of the most frequently asked questions about our product.
      </p>
      <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto mt-16">
        {faqs.map((faq) => (
          <Question key={faq.question} {...faq} />
        ))}
      </Accordion>
    </section>
  )
}

export default Faqs
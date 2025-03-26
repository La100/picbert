import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import React from 'react'
import AnimatedGradientText from '../ui/animated-gradient-text'
import { cn } from '@/lib/utils'

const faqs = [
  {
    question: "What is Faces Factory?",
    answer: "Faces Factory is an AI-powered platform that creates realistic human content for your social media. Upload your photos, and our advanced AI will generate personalized, high-quality videos and images ideal for TikTok, Instagram, and YouTube."
  },
  {
    question: "How many tokens do I get with each plan?",
    answer: "Our Hobby plan includes 1000 tokens per month, the Pro plan offers 2500 tokens monthly, and the Business plan provides 5000 tokens per month. Each token can be used to generate content."
  },
  {
    question: "What can I create with Faces Factory?",
    answer: "You can create a wide variety of AI-generated realistic human content including professional shots, trendy street-style looks, and customized videos."
  },
  {
    question: "Do I need to be a professional photographer or editor?",
    answer: "Not at all! Faces Factory is designed to be user-friendly. Our AI handles all the technical aspects of creating high-quality content, so you can focus on growing your social media presence."
  },
  {
    question: "Can I use the content commercially?",
    answer: "Yes, our Pro and Business plans include a commercial license. The Hobby plan is limited to personal use only. Make sure to check our terms of service for specific usage guidelines."
  },
  {
    question: "How fast can I generate content?",
    answer: "Image takes a few seconds to generate, and video around 5 minutes to generate."
  },
 
  {
    question: "What kind of support do you offer?",
    answer: "All plans include standard email support. The Business plan includes express email support, priority feature requests, and a dedicated account manager to help you get the most out of Faces Factory."
  }
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
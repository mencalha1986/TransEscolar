import { useEffect } from 'react'
import LandingNavbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import Problems from '@/components/landing/Problems'
import HowItWorks from '@/components/landing/HowItWorks'
import Features from '@/components/landing/Features'
import Pricing from '@/components/landing/Pricing'
import Testimonials from '@/components/landing/Testimonials'
import FAQ from '@/components/landing/FAQ'
import ContactForm from '@/components/landing/ContactForm'
import CTAFinal from '@/components/landing/CTAFinal'
import Footer from '@/components/landing/Footer'

export function LandingPage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1 }
    )

    const elements = document.querySelectorAll('.reveal')
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="font-sans antialiased">
      <LandingNavbar />
      <Hero />
      <Problems />
      <HowItWorks />
      <Features />
      <Pricing />
      <Testimonials />
      <FAQ />
      <ContactForm />
      <CTAFinal />
      <Footer />
    </div>
  )
}

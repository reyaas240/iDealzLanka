'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'en' | 'ta' | 'si'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.products': 'Products',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.cart': 'Cart',
    'nav.signIn': 'Sign In',
    'nav.signUp': 'Sign Up',
    'nav.signOut': 'Sign Out',
    
    // Home
    'home.hero.title': 'WIN AMAZING PRIZES!',
    'home.hero.subtitle': 'Shop, Give back and Get rewarded.',
    'home.hero.cta': 'View Products',
    'home.featured.title': 'Featured Products',
    'home.noProducts': 'No products available yet. Check back soon!',
    'home.viewDetails': 'View Details',
    
    // Footer
    'footer.tagline': 'Shop, Give back and Get rewarded.',
    'footer.quickLinks': 'Quick Links',
    'footer.legal': 'Legal',
    'footer.rights': 'All rights reserved.',
    
    // Auth
    'auth.signIn': 'Sign in to your account',
    'auth.signUp': 'Create your account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Name',
    'auth.mobile': 'Mobile',
    'auth.country': 'Country',
    
    // Cart
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.continue': 'Continue Shopping',
    'cart.checkout': 'Proceed to Checkout',
    'cart.total': 'Total',
    
    // Checkout
    'checkout.title': 'Checkout',
    'checkout.payment': 'Bank Transfer Details',
    'checkout.transactionId': 'Transaction ID',
    'checkout.receipt': 'Upload Receipt',
    
    // Common
    'common.loading': 'Loading...',
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
  },
  ta: {
    // Navigation
    'nav.products': 'தயாரிப்புகள்',
    'nav.about': 'பற்றி',
    'nav.contact': 'தொடர்பு',
    'nav.cart': 'வண்டி',
    'nav.signIn': 'உள்நுழை',
    'nav.signUp': 'பதிவு',
    'nav.signOut': 'வெளியேறு',
    
    // Home
    'home.hero.title': 'அற்புதமான பரிசுகளை வெல்லுங்கள்!',
    'home.hero.subtitle': 'வாங்குங்கள், வழங்குங்கள், பரிசுகளைப் பெறுங்கள்.',
    'home.hero.cta': 'தயாரிப்புகளைப் பார்க்கவும்',
    'home.featured.title': 'சிறப்பு தயாரிப்புகள்',
    'home.noProducts': 'இன்னும் தயாரிப்புகள் இல்லை. பிறகு வாருங்கள்!',
    'home.viewDetails': 'விவரங்களைக் காண்க',
    
    // Footer
    'footer.tagline': 'வாங்குங்கள், வழங்குங்கள், பரிசுகளைப் பெறுங்கள்.',
    'footer.quickLinks': 'விரைவு இணைப்புகள்',
    'footer.legal': 'சட்டம்',
    'footer.rights': 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
    
    // Auth
    'auth.signIn': 'உங்கள் கணக்கில் உள்நுழையவும்',
    'auth.signUp': 'உங்கள் கணக்கை உருவாக்கவும்',
    'auth.email': 'மின்னஞ்சல்',
    'auth.password': 'கடவுச்சொல்',
    'auth.name': 'பெயர்',
    'auth.mobile': 'மொபைல்',
    'auth.country': 'நாடு',
    
    // Cart
    'cart.title': 'ஷாப்பிங் வண்டி',
    'cart.empty': 'உங்கள் வண்டி காலியாக உள்ளது',
    'cart.continue': 'ஷாப்பிங் தொடரவும்',
    'cart.checkout': 'செக்அவுட் செல்லவும்',
    'cart.total': 'மொத்தம்',
    
    // Checkout
    'checkout.title': 'செக்அவுட்',
    'checkout.payment': 'வங்கி மாற்று விவரங்கள்',
    'checkout.transactionId': 'பரிவர்த்தனை ID',
    'checkout.receipt': 'ரசீது பதிவேற்றவும்',
    
    // Common
    'common.loading': 'ஏற்றுகிறது...',
    'common.submit': 'சமர்ப்பிக்கவும்',
    'common.cancel': 'ரத்துசெய்',
    'common.save': 'சேமி',
    'common.delete': 'நீக்கு',
    'common.edit': 'திருத்து',
  },
  si: {
    // Navigation
    'nav.products': 'නිෂාදනය',
    'nav.about': 'පිළිබඳ',
    'nav.contact': 'අමතන්න',
    'nav.cart': 'කරත්තය',
    'nav.signIn': 'පිවිසෙන්න',
    'nav.signUp': 'ලියාපදිංචි වන්න',
    'nav.signOut': 'ඉවත් වන්න',
    
    // Home
    'home.hero.title': 'විශිෂ්ට ත්‍යාග දිනාගන්න!',
    'home.hero.subtitle': 'මිලදී ගන්න, නැවත ලබා දෙන්න, ත්‍යාග ලබන්න.',
    'home.hero.cta': 'නිෂ්පාදන බලන්න',
    'home.featured.title': 'විශේෂ නිෂ්පාදන',
    'home.noProducts': 'තවම නිෂ්පාදන නැත. පසුව පැමිණෙන්න!',
    'home.viewDetails': 'විස්තර බලන්න',
    
    // Footer
    'footer.tagline': 'මිලදී ගන්න, නැවත ලබා දෙන්න, ත්‍යාග ලබන්න.',
    'footer.quickLinks': 'වේග සබැඳි',
    'footer.legal': 'නීති',
    'footer.rights': 'සියලු හිමිකම් සුරක්ෂිතයි.',
    
    // Auth
    'auth.signIn': 'ඔබේ ගිණුමට පිවිසෙන්න',
    'auth.signUp': 'ඔබේ ගිණුම සාදන්න',
    'auth.email': 'විද්යුත් තැපැල්',
    'auth.password': 'මුරපදය',
    'auth.name': 'නම',
    'auth.mobile': 'ජංගම දුරකථන',
    'auth.country': 'රට',
    
    // Cart
    'cart.title': 'සාප්පු කරත්තය',
    'cart.empty': 'ඔබේ කරත්තය හිස් වේ',
    'cart.continue': 'සාප්පු සැපයුම් දිගටම කරගෙන යන්න',
    'cart.checkout': 'චෙක්අප් වෙත යන්න',
    'cart.total': 'මුළු එකතුව',
    
    // Checkout
    'checkout.title': 'චෙක්අප්',
    'checkout.payment': 'බැංකු හුවමාරු විස්තර',
    'checkout.transactionId': 'ගනුදෙනු ID',
    'checkout.receipt': 'රසිදු උඩුගත කරන්න',
    
    // Common
    'common.loading': 'පූරණය වෙමින්...',
    'common.submit': 'ඉදිරිපත් කරන්න',
    'common.cancel': 'අවලංගු කරන්න',
    'common.save': 'සුරකින්න',
    'common.delete': 'මකන්න',
    'common.edit': 'සංස්කරණය කරන්න',
  },
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language
    if (saved && (saved === 'en' || saved === 'ta' || saved === 'si')) {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

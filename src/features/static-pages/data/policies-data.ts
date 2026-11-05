import { CONTACT_INFO } from '@/constants'

export interface PolicySection {
  id: string
  number: string
  title: string
  intro?: string
  subsections?: {
    subtitle?: string
    paragraphs: string[]
    bullets?: string[]
  }[]
  paragraphs?: string[]
  bullets?: string[]
  callout?: {
    type?: 'info' | 'success' | 'warning'
    title?: string
    text?: string
    entityDetails?: {
      name: string
      legalTitle: string
      address: string
      phone: string
      email: string
    }
  }
}

export interface StructuredPolicyData {
  slug: 'privacy' | 'terms' | 'refund'
  title: string
  badge: string
  subtitle: string
  lastUpdated: string
  sections: PolicySection[]
  plainContent: string
}

export const PRIVACY_POLICY_DATA: StructuredPolicyData = {
  slug: 'privacy',
  title: 'Privacy Policy',
  badge: 'Your Privacy & Data Protection',
  subtitle: 'How FoodIQ collects, uses, protects, and handles your personal information with complete transparency.',
  lastUpdated: 'October 30, 2026',
  sections: [
    {
      id: 'who-we-are',
      number: '1',
      title: 'Who we are',
      paragraphs: [
        `FoodIQ ("we", "our", "us") is a homemade, delivery-first Gujarati and Kathiyawadi tiffin rasoi service based in Ahmedabad, Gujarat.`,
        `This Privacy Policy explains what personal information we collect when you visit our website (foodiq.in), place orders for daily homemade meals, or interact with our rasoi and support team, how we use it, and the choices you have.`,
      ],
      callout: {
        entityDetails: {
          name: 'FoodIQ',
          legalTitle: 'Homemade Kathiyawadi & Gujarati Tiffin Rasoi',
          address: CONTACT_INFO.address.full,
          phone: `${CONTACT_INFO.phone} (Phone / WhatsApp)`,
          email: CONTACT_INFO.email,
        },
      },
    },
    {
      id: 'information-we-collect',
      number: '2',
      title: 'Information we collect',
      subsections: [
        {
          subtitle: 'Information you give us',
          paragraphs: [
            'When you register, place an order, or contact us by WhatsApp, phone, email, or social media, we may collect:',
          ],
          bullets: [
            'Your full name and active Indian mobile number (used for delivery calls and order status updates).',
            'Your email address (for order receipts, payment invoices, and customer communications).',
            'Your delivery address, apartment name, flat number, floor, landmark, and any specific directions or gate instructions you provide.',
            'Your dietary choices: Standard Pure Vegetarian vs. Dedicated Jain Rasoi (prepared in segregated cookware with zero onion, garlic, or root vegetables).',
            'Your order details, meal preferences, and any notes you send us (for example, spice level or ingredients you want to avoid).',
            'Messages, photos, or feedback you send us via WhatsApp, email, or reviews, including feedback or complaints.',
            'Payment confirmation details, where applicable. We do not ask for or store your credit/debit card numbers, UPI PINs, or banking passwords.',
          ],
        },
        {
          subtitle: 'Information collected automatically',
          paragraphs: [
            'Like most modern websites, our hosting and infrastructure providers may automatically record basic technical information when you visit:',
          ],
          bullets: [
            'Device and browser type, operating system, and screen resolution.',
            'Your IP address and general approximate location.',
            'Pages viewed, order flow interactions, and the dates and times of visits.',
          ],
        },
      ],
    },
    {
      id: 'how-we-use-information',
      number: '3',
      title: 'How we use your information',
      intro: 'We only use your personal information when we have a legitimate culinary or operational need. Specifically, we use it to:',
      bullets: [
        'Cook your meals fresh daily: We prepare meals in planned batches (morning for lunch, evening for dinner) strictly adhering to your selected pure veg or Jain dietary specifications.',
        'Deliver your tiffin on time: To dispatch delivery riders to your Ahmedabad address within our lunch (11:00 AM – 1:30 PM) and dinner (7:30 PM – 9:00 PM) delivery windows.',
        'Send order and delivery updates: Order confirmation, cooking alerts, rider dispatch notifications, and cutoff reminders (10:00 AM for lunch, 6:00 PM for dinner).',
        'Provide customer support: Answering WhatsApp queries, handling meal pauses or skips for subscriptions, and addressing delivery inquiries.',
        'Process payments and refunds: Confirming UPI payments, managing Cash on Delivery handovers, and issuing refunds if an issue occurs.',
        'Improve our recipes and packaging: Learning which dishes customers love most and refining our tiffin containers for optimal heat retention.',
        'Comply with applicable laws: Operating in accordance with the Food Safety and Standards Authority of India (FSSAI), Information Technology Act, 2000, and Digital Personal Data Protection Act, 2023.',
      ],
    },
    {
      id: 'how-we-share-information',
      number: '4',
      title: 'How we share your information',
      paragraphs: [
        'We never sell, rent, or trade your personal information to third parties, advertisers, or telemarketers. Period.',
        'We only share limited, necessary details with trusted partners who help us fulfill your food orders:',
      ],
      bullets: [
        'Delivery Riders: We share your delivery name, contact number, building/flat address, landmark, and gate drop-off notes so the rider can safely deliver your hot meal.',
        'Payment Service Providers: Online UPI transactions are processed through authorized payment applications (Google Pay, PhonePe, Paytm, BHIM, Bank UPI). We only receive the payment status and transaction reference ID.',
        'Mapping & Geolocation (Google Maps API): Used to help you locate and save your Ahmedabad address coordinates for pinpoint delivery.',
        'Cloud & Hosting Providers: Our application is hosted on secure cloud infrastructure (Vercel, Supabase) with encrypted databases and strict access restrictions.',
        'Legal Requirements: If required by law, court order, or governmental authorities to investigate fraud or safety concerns.',
      ],
    },
    {
      id: 'how-long-we-keep-it',
      number: '5',
      title: 'How long we keep it',
      paragraphs: [
        'We keep your profile information and saved addresses as long as you maintain an active FoodIQ account so you can order smoothly.',
        'Past order records, tax invoices, and payment receipts are retained for the statutory period required by Indian tax and accounting laws.',
        'If you request account deletion, we will delete or anonymize your personal information from our active databases, retaining only data strictly required by law.',
      ],
    },
    {
      id: 'how-we-protect-it',
      number: '6',
      title: 'How we protect it',
      paragraphs: [
        'We take the security of your data seriously and apply multiple safeguards:',
      ],
      bullets: [
        'Encryption in transit: All data sent between your browser and our servers is protected using HTTPS with modern SSL/TLS encryption.',
        'Database protection: Account records and saved addresses are stored behind database Row-Level Security, preventing unauthorized access.',
        'Zero financial storage: We never store your payment card numbers, CVVs, net banking credentials, or UPI MPINs.',
        'Restricted staff access: Only authorized staff with operational responsibilities (chefs checking dish counts, riders getting delivery addresses) can access necessary order information.',
      ],
    },
    {
      id: 'your-rights',
      number: '7',
      title: 'Your rights',
      paragraphs: [
        'You have full control over your personal information at FoodIQ:',
      ],
      bullets: [
        'Access & Edit: You can review and update your name, phone number, email, and saved delivery addresses anytime by visiting your Account page.',
        'Manage Addresses: You can add new home or office delivery locations or delete outdated addresses whenever you like.',
        'Opt out of marketing: You can opt out of promotional messages or WhatsApp updates anytime by toggling notification preferences or replying to support.',
        'Account Deletion: You can ask us to permanently delete your FoodIQ account and associated data by emailing hello@foodiq.in.',
      ],
    },
    {
      id: 'offers-and-messages',
      number: '8',
      title: 'Offers and messages',
      paragraphs: [
        'From time to time, we may send you important service announcements (such as festival rasoi hours, special holiday menus like Janmashtami or Diwali, or new delivery area expansions).',
        'You can choose to stop receiving promotional messages at any time while still receiving essential order tracking and delivery notices.',
      ],
    },
    {
      id: 'children',
      number: '9',
      title: 'Children’s privacy',
      paragraphs: [
        'FoodIQ services are intended for individuals who are at least 18 years old or under adult supervision.',
        'We do not knowingly collect personal information from children under 18. If you believe a child has provided us with personal information without parental consent, please contact us and we will promptly remove it.',
      ],
    },
    {
      id: 'third-party-links',
      number: '10',
      title: 'Third-party links and cookies',
      paragraphs: [
        'Our website uses essential local storage and session cookies strictly needed to keep you logged in, keep track of your shopping cart, and remember your dietary preferences (Veg/Jain).',
        'We do not use intrusive cross-site advertising cookies or sell user analytics to tracking firms.',
        'Our site may include links to third-party services (such as WhatsApp for customer support or Instagram for daily food reels). Once you leave our site, those external platforms are governed by their own privacy policies.',
      ],
    },
    {
      id: 'changes-to-policy',
      number: '11',
      title: 'Changes to this policy',
      paragraphs: [
        'We may occasionally update this Privacy Policy to reflect improvements in our rasoi operations, delivery enhancements, or changes in statutory regulations.',
        'When we make updates, the "Last Updated" date at the top of this page will be revised. Significant changes will be announced on our website.',
      ],
    },
    {
      id: 'contact-and-grievances',
      number: '12',
      title: 'Contact and grievances',
      paragraphs: [
        `If you have questions, feedback, or concerns regarding your privacy or how your personal information is handled, our team is happy to assist you:`,
      ],
      callout: {
        entityDetails: {
          name: 'FoodIQ Grievance & Customer Care Desk',
          legalTitle: 'FoodIQ Kitchen Facility',
          address: CONTACT_INFO.address.full,
          phone: `${CONTACT_INFO.phone} (All 7 Days: 7:30 AM – 9:30 PM)`,
          email: `${CONTACT_INFO.email} (Response within 48 hours)`,
        },
      },
    },
  ],
  plainContent: `FOODIQ - PRIVACY POLICY\nLast Updated: October 30, 2026\n1. Who we are\n2. Information we collect\n3. How we use your information\n4. How we share your information\n5. How long we keep it\n6. How we protect it\n7. Your rights\n8. Offers and messages\n9. Children\n10. Third-party links and cookies\n11. Changes to this policy\n12. Contact and grievances`,
}

export const TERMS_AND_CONDITIONS_DATA: StructuredPolicyData = {
  slug: 'terms',
  title: 'Terms & Conditions',
  badge: 'Service Agreement & Kitchen Policies',
  subtitle: 'Please review these Terms & Conditions before ordering our daily homemade meals or subscribing to tiffin plans.',
  lastUpdated: 'October 30, 2026',
  sections: [
    {
      id: 'agreement-to-terms',
      number: '1',
      title: 'Agreement to terms',
      paragraphs: [
        `These Terms & Conditions ("Terms") are a legal agreement between you and FoodIQ ("FoodIQ", "we", "us", or "our"), governing your access to and orders placed through our website and homemade tiffin delivery service in Ahmedabad, Gujarat.`,
        `By accessing our platform or placing an order, you confirm that you have read, understood, and agreed to be bound by these Terms and our Privacy Policy. If you do not agree, please do not use our services.`,
      ],
      callout: {
        entityDetails: {
          name: 'FoodIQ',
          legalTitle: 'Homemade Kathiyawadi & Gujarati Tiffin Rasoi',
          address: CONTACT_INFO.address.full,
          phone: `${CONTACT_INFO.phone} (Phone / WhatsApp)`,
          email: CONTACT_INFO.email,
        },
      },
    },
    {
      id: 'who-we-are-ethos',
      number: '2',
      title: 'Who we are & homemade kitchen ethos',
      paragraphs: [
        'FoodIQ is an authentic, family-led homemade rasoi, not a commercial factory or bulk reheated food operator.',
      ],
      bullets: [
        'Fresh Small Batch Cooking: We cook meals fresh twice every day. Morning rasoi is prepared exclusively for lunch, and evening rasoi is prepared fresh for dinner.',
        'Never Reheated: No morning sabji or dal is ever reheated or reused for dinner meals. No leftover food is carried over to the next day.',
        'Pure Cooking Mediums: We cook using Gulab double-filtered groundnut oil (singtel) and pure Amul cow ghee. We never use palm oil, dalda, MSG, baking soda, or artificial colors.',
        '100% Pure Veg & Dedicated Jain Rasoi: Meat, poultry, seafood, and eggs are strictly prohibited. Dedicated cookware, tavas, and utensils are reserved for Jain meals with zero onion, garlic, or root vegetables.',
        'Allergen Advisory: Our kitchen processes peanuts (groundnut oil), wheat (gluten), dairy products (milk, ghee, butter, buttermilk), and sesame seeds. Customers with acute allergies should consider this prior to ordering.',
      ],
    },
    {
      id: 'eligibility-accounts',
      number: '3',
      title: 'Eligibility & account responsibility',
      paragraphs: [
        'To place orders with FoodIQ, you must:',
      ],
      bullets: [
        'Be at least 18 years old and capable of entering into a legally valid agreement under Indian law.',
        'Provide accurate personal details, a functional Indian mobile number, and an address within our operational delivery areas in Ahmedabad.',
        'Maintain the confidentiality of your account credentials and notify us immediately of any unauthorized use.',
      ],
    },
    {
      id: 'cutoffs-timings',
      number: '4',
      title: 'Order cutoff times & delivery windows',
      intro: 'Because every meal is prepared fresh in planned batch quantities, strict order cutoffs are enforced:',
      subsections: [
        {
          subtitle: 'Lunch Tiffin Service',
          paragraphs: [
            `• Order Cutoff Time: ${CONTACT_INFO.cutoffs.lunchTime} sharp every day.`,
            `• Delivery Window: Between ${CONTACT_INFO.cutoffs.lunchDelivery}.`,
            `• Orders for lunch placed after 10:00 AM cannot be accepted for the same day's lunch cycle.`,
          ],
        },
        {
          subtitle: 'Dinner Tiffin Service',
          paragraphs: [
            `• Order Cutoff Time: ${CONTACT_INFO.cutoffs.dinnerTime} sharp every day.`,
            `• Delivery Window: Between ${CONTACT_INFO.cutoffs.dinnerDelivery}.`,
            `• Orders for dinner placed after 6:00 PM cannot be accepted for the same day's dinner cycle.`,
          ],
        },
      ],
    },
    {
      id: 'delivery-coverage',
      number: '5',
      title: 'Delivery areas & gate collection policy',
      intro: `FoodIQ currently delivers across key Ahmedabad sectors:`,
      paragraphs: [
        `Service Areas: ${CONTACT_INFO.deliveryAreas.join(', ')}.`,
      ],
      bullets: [
        'Society & Office Gate Collection: If your apartment complex, gated society, or corporate office restricts entry to delivery riders, you agree to collect the tiffin from the main security gate or reception upon rider arrival.',
        'Customer Reachability: Delivery riders will call your registered phone number upon arrival. Because fresh food is perishable and cannot be redelivered, riders wait up to 10 minutes. If unreachable and no safe drop-off location is available, the meal will be returned without refund eligibility.',
        'Unavoidable Delays: While we strive for punctual delivery, severe monsoon waterlogging, extreme road traffic, or roadblocks will be communicated to you via phone or WhatsApp.',
      ],
    },
    {
      id: 'pricing-and-payments',
      number: '6',
      title: 'Pricing, taxes & payment terms',
      bullets: [
        'All prices listed on the website are in Indian Rupees (₹ INR) and include applicable taxes unless explicitly noted.',
        'Payment Methods: Online UPI (Google Pay, PhonePe, Paytm, BHIM, Bank UPI) and Cash on Delivery (COD).',
        'Cash on Delivery Terms: When choosing COD, you agree to tender the exact order amount in cash to the delivery rider upon delivery.',
        'Anti-Abuse Policy: Refusing a COD order of freshly cooked food upon arrival without a genuine defect constitutes a breach of service. Accounts engaging in COD refusal will be permanently blocked from COD ordering.',
      ],
    },
    {
      id: 'cancellations-replacements',
      number: '7',
      title: 'Order cancellations & replacements',
      bullets: [
        'Cancellation Window: Orders can be cancelled free of charge before the order cutoff (10:00 AM for lunch, 6:00 PM for dinner) or before the kitchen status changes to "Preparing".',
        'Post-Preparation Policy: Once meal cooking has begun, orders cannot be cancelled or refunded because fresh ingredients have already been dedicated and cooked.',
        'Spillage or Incorrect Items: In the rare event of transit packaging damage or an incorrect dish, report it within 2 hours of delivery with a photo via WhatsApp (+91 99999 99999). We will promptly dispatch a replacement or issue a full refund.',
      ],
    },
    {
      id: 'subscriptions-pauses',
      number: '8',
      title: 'Tiffin subscriptions & pause policy',
      paragraphs: [
        'For customers enrolled in weekly, fortnightly, or monthly tiffin subscriptions:',
      ],
      bullets: [
        'Meal Skips & Pauses: You can easily skip meals by notifying us in advance: by 9:00 PM the previous evening for lunch skips, or by 2:00 PM the same day for dinner skips.',
        'Rollover Guarantee: Skipped meals are never lost; they automatically extend your subscription end date.',
        'Early Cancellation: If you cancel an active subscription prematurely, consumed meals will be calculated at the standard single meal rate, and the remaining pro-rata balance will be refunded.',
      ],
    },
    {
      id: 'user-conduct',
      number: '9',
      title: 'User conduct & acceptable use',
      paragraphs: [
        'To ensure a safe and respectful environment for our chefs and delivery personnel:',
      ],
      bullets: [
        'Treat our delivery boys and kitchen staff with dignity, courtesy, and respect.',
        'Do not place fraudulent, test, or prank orders.',
        'Do not attempt to scrape or reverse engineer our website, menu systems, or pricing data without written permission.',
      ],
    },
    {
      id: 'intellectual-property',
      number: '10',
      title: 'Intellectual property',
      paragraphs: [
        'All branding, Gujarati taglines, food photography, menu descriptions, recipes, and website code belong exclusively to FoodIQ and are protected under Indian intellectual property laws.',
        'You may not copy, reproduce, or republish our materials without prior written consent.',
      ],
    },
    {
      id: 'liability-and-law',
      number: '11',
      title: 'Limitation of liability & governing law',
      bullets: [
        'FoodIQ services are provided on an "as is" and "as available" basis.',
        'To the maximum extent permitted by Indian law, FoodIQ’s maximum total liability for any claim shall not exceed the amount actually paid by you for the specific meal order.',
        'These Terms are governed by the laws of India. The courts of Ahmedabad, Gujarat, India have exclusive jurisdiction over any disputes.',
      ],
    },
    {
      id: 'support-and-contact',
      number: '12',
      title: 'Contact & customer support',
      paragraphs: [
        `If you have questions about these Terms, need delivery assistance, or wish to manage your subscription:`,
      ],
      callout: {
        entityDetails: {
          name: 'FoodIQ Rasoi Support Desk',
          legalTitle: 'Daily Homemade Tiffin Rasoi',
          address: CONTACT_INFO.address.full,
          phone: `${CONTACT_INFO.phone} (Lunch: ${CONTACT_INFO.hours.lunchSupport} • Dinner: ${CONTACT_INFO.hours.dinnerSupport})`,
          email: `${CONTACT_INFO.email} (All 7 Days)`,
        },
      },
    },
  ],
  plainContent: `FOODIQ - TERMS & CONDITIONS\nLast Updated: October 30, 2026\n1. Agreement to terms\n2. Who we are & homemade kitchen ethos\n3. Eligibility & accounts\n4. Fresh twice-daily cooking & dietary standards\n5. Order cutoffs & timings\n6. Delivery areas & gate collection\n7. Pricing, taxes & payment terms\n8. Order cancellations & replacements\n9. Tiffin subscriptions & pause policy\n10. User conduct\n11. Limitation of liability & governing law\n12. Contact & customer support`,
}

export const REFUND_POLICY_DATA: StructuredPolicyData = {
  slug: 'refund',
  title: 'Refund & Cancellation Policy',
  badge: 'Customer Satisfaction & Returns',
  subtitle: 'Clear, fair rules regarding cancellations, transit packaging replacements, and refund timelines.',
  lastUpdated: 'October 30, 2026',
  sections: [
    {
      id: 'cancellation-overview',
      number: '1',
      title: 'Order cancellation guidelines',
      paragraphs: [
        `Because FoodIQ prepares fresh homemade meals in planned daily batches, ingredients are freshly prepared right after our order cutoffs.`,
      ],
      bullets: [
        `Lunch Orders: May be cancelled free of charge prior to ${CONTACT_INFO.cutoffs.lunchTime} (or before the kitchen status changes to "Preparing").`,
        `Dinner Orders: May be cancelled free of charge prior to ${CONTACT_INFO.cutoffs.dinnerTime} (or before the kitchen status changes to "Preparing").`,
        'Post-Cutoff Cancellations: Once cooking preparation has begun, orders cannot be cancelled or refunded as fresh cooked food cannot be restocked or reused.',
      ],
    },
    {
      id: 'transit-damage-issues',
      number: '2',
      title: 'Damaged packaging or incorrect delivery',
      paragraphs: [
        'We use food-grade, leak-resistant packaging and insulated transport bags. However, if your meal arrives damaged, spilled, or with an incorrect item:',
      ],
      bullets: [
        'Please inform us within 2 hours of delivery via WhatsApp (+91 99999 99999) or email (hello@foodiq.in).',
        'Share a quick photo of the damaged container and delivery label.',
        'Upon instant verification, we will offer you the choice of a prompt replacement meal or a 100% refund.',
      ],
    },
    {
      id: 'subscription-pauses',
      number: '3',
      title: 'Subscription meal skips & pauses',
      paragraphs: [
        'Subscribers to our monthly or weekly tiffin plans have full flexibility to pause meals when traveling or taking time off:',
      ],
      bullets: [
        'Notice required: Please inform support by 9:00 PM the previous evening for lunch pauses, or by 2:00 PM the same day for dinner pauses.',
        'Skipped meals are never lost; they automatically extend your subscription duration.',
      ],
    },
    {
      id: 'refund-methods-timelines',
      number: '4',
      title: 'Refund settlement timelines',
      paragraphs: [
        'All approved refunds are processed back to the original payment source:',
      ],
      bullets: [
        'Online UPI Payments: Refund initiated within 24 hours; credited to your linked bank account via UPI within 3 to 5 business days.',
        'Cash on Delivery Orders: In the event of an approved refund for a COD delivery, payment will be transferred directly to your verified UPI ID within 24–48 hours.',
      ],
    },
    {
      id: 'contact-support',
      number: '5',
      title: 'Contact support for refund assistance',
      paragraphs: [
        `For refund inquiries, payment verification, or subscription adjustment requests:`,
      ],
      callout: {
        entityDetails: {
          name: 'FoodIQ Rasoi Support Desk',
          legalTitle: 'Customer Care & Refund Assistance',
          address: CONTACT_INFO.address.full,
          phone: `${CONTACT_INFO.phone} (Phone / WhatsApp)`,
          email: `${CONTACT_INFO.email} (All 7 Days)`,
        },
      },
    },
  ],
  plainContent: `FOODIQ - REFUND & CANCELLATION POLICY\nLast Updated: October 30, 2026\n1. Cancellation guidelines\n2. Damaged packaging or incorrect delivery\n3. Subscription meal pauses\n4. Refund settlement timelines\n5. Contact support`,
}

export const POLICIES_DATA_MAP: Record<string, StructuredPolicyData> = {
  privacy: PRIVACY_POLICY_DATA,
  terms: TERMS_AND_CONDITIONS_DATA,
  refund: REFUND_POLICY_DATA,
}

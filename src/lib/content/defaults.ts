import type { AboutContent, FooterContent, HomeContent } from "./types";

/**
 * Default page content — these are the exact values the pages shipped with.
 * They serve as fallbacks so the public pages render identically until the
 * owner edits content in the admin CMS, and fill any missing fields.
 */

export const HOME_DEFAULTS: HomeContent = {
  hero: {
    badge: "Innovating the Digital Future",
    titlePrefix: "Build The",
    titleHighlight: "Future",
    titleSuffix: "With Xipra",
    description:
      "We deliver state-of-the-art software solutions, premium 3D web experiences, and enterprise-grade applications designed to scale.",
    primaryCta: { label: "Explore Our Work", href: "/portfolio" },
    secondaryCta: { label: "Get a Free Quote", href: "/contact" },
    backgroundImages: [
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop"
    ],
  },
  stats: [
    { value: 500, label: "Projects Completed" },
    { value: 250, label: "Happy Clients" },
    { value: 1000, label: "Students Trained" },
    { value: 12, label: "Years Experience" },
  ],
  services: {
    heading: "Our",
    headingHighlight: "Services",
    subtitle: "Discover our comprehensive suite of premium digital services tailored for modern enterprises.",
    items: [
      { title: "Web Development", desc: "High-performance web applications built with modern frameworks like React and Next.js for scalable enterprise solutions." },
      { title: "Web Designing", desc: "Award-winning, user-centric interfaces and premium 3D web experiences that captivate and convert." },
      { title: "Mobile App Development", desc: "Native and cross-platform mobile experiences for iOS and Android tailored to your business needs." },
      { title: "ERP Development", desc: "Custom Enterprise Resource Planning software to streamline operations and integrate core business processes." },
      { title: "Software Development", desc: "Bespoke software solutions engineered from scratch, designed to scale with your growing business demands." },
      { title: "Internship Program", desc: "Comprehensive training and mentorship programs shaping the next generation of top-tier software engineers." },
    ],
  },
  whyChooseUs: {
    eyebrow: "Why Choose Xipra",
    heading: "The Preferred Partner for",
    headingHighlight: "Digital Transformation",
    description:
      "We don't just write code. We partner with you to build scalable, high-performance systems that drive real business value and outpace the competition.",
    buttonLabel: "Talk to an Expert",
    buttonHref: "/contact",
    items: [
      { title: "Experienced Team", desc: "Our award-winning architects and engineers bring decades of combined industry experience." },
      { title: "Affordable Pricing", desc: "Premium quality software solutions tailored to fit diverse enterprise budgets without compromise." },
      { title: "Fast Delivery", desc: "Agile methodologies ensure rapid deployment and continuous iteration for fast time-to-market." },
      { title: "Secure Development", desc: "Security-first engineering practices with military-grade encryption and strict compliance standards." },
      { title: "Latest Technologies", desc: "We leverage modern tech stacks (React 19, Next.js 15, WebGL) to future-proof your product." },
      { title: "Dedicated Support", desc: "24/7 priority maintenance and technical support to keep your systems running flawlessly." },
    ],
  },
  technologyPreview: {
    heading: "Powered by",
    headingHighlight: "Modern Tech",
    subtitle:
      "We utilize a robust and diverse technology stack to deliver reliable, high-performance software tailored to your specific needs.",
  },
  productsPreview: {
    heading: "Enterprise",
    headingHighlight: "Products",
    subtitle: "Ready-to-deploy software solutions designed for specific industry needs.",
    buttonLabel: "View All Products",
    buttonHref: "/products",
  },
  portfolioPreview: {
    heading: "Featured",
    headingHighlight: "Work",
    subtitle: "Explore our award-winning projects that have driven transformation across industries.",
    buttonLabel: "View Portfolio",
  },
  internshipPreview: {
    badge: "Internship Program",
    heading: "Launch Your Career in",
    headingHighlight: "Tech",
    description:
      "Join our hands-on internship program. Work alongside senior engineers on live enterprise projects, gain real-world experience, and earn a verifiable certificate.",
    highlights: ["Live Projects", "Verifiable Certificate", "Placement Assistance"],
    buttonLabel: "Apply Now",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop",
    statValue: "95%",
    statLabel: "Placement Rate",
  },
  cta: {
    heading: "Ready to",
    headingHighlight: "Transform",
    description: "Partner with us to build extraordinary digital experiences. Get in touch today for a free consultation.",
    primaryLabel: "Start Your Project",
    primaryHref: "/contact",
    secondaryLabel: "Call Us Now",
    secondaryHref: "tel:+919033387254",
    tertiaryLabel: "Verify Certificate",
    tertiaryHref: "/verify-certificate",
  },
};

export const ABOUT_DEFAULTS: AboutContent = {
  hero: {
    badge: "About Us",
    titlePrefix: "Architecting the",
    titleHighlight: "Digital Future",
    description:
      "We are a premium technology consulting and software engineering firm dedicated to building high-performance, scalable, and visually stunning digital solutions.",
  },
  intro: {
    imageUrl:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop",
    yearsBadgeValue: "12+",
    yearsBadgeLabel: "Years of Excellence",
    headingTitle: "Who",
    headingHighlight: "We Are",
    subtitle:
      "Xipra Technology is more than just a development agency. We are your strategic technical partners.",
    paragraphs: [
      "Founded with a passion for innovation, we specialize in delivering enterprise-grade software, beautiful web experiences, and scalable cloud architectures that solve complex business challenges.",
      "Our team of award-winning designers and expert engineers work in unison to ensure every product we launch is not only functionally robust but visually breathtaking. We believe in writing clean code, designing intuitive interfaces, and building systems that stand the test of time.",
    ],
  },
  mission:
    "To empower businesses globally by delivering transformative digital solutions. We strive to simplify complexity through innovative software engineering and premium design, ensuring our clients achieve sustainable competitive advantages.",
  vision:
    "To be the world's most trusted technology partner, recognized for our commitment to excellence, continuous innovation, and our ability to architect the digital systems that run tomorrow's leading enterprises.",
  journey: [
    { year: "2014", title: "Company Founded", desc: "Started as a small web design agency with a vision to transform digital landscapes." },
    { year: "2016", title: "Enterprise Solutions", desc: "Expanded our services to include robust ERP systems and custom software development." },
    { year: "2019", title: "Global Reach", desc: "Opened our first international office and crossed 100+ global enterprise clients." },
    { year: "2023", title: "AI & 3D Web", desc: "Integrated cutting-edge AI analytics and immersive 3D experiences into our core stack." },
    { year: "2026", title: "Industry Leaders", desc: "Recognized as a premier software development firm leading digital transformation." },
  ],
  achievements: [
    { title: "Best IT Agency 2025", desc: "Awarded for exceptional software delivery." },
    { title: "500+ Clients", desc: "Trusted by top enterprises worldwide." },
    { title: "Global Presence", desc: "Offices in 3 countries and counting." },
    { title: "1000+ Projects", desc: "Successfully deployed and maintained." },
  ],
  whyChooseUs: [
    "Award-winning UI/UX design that elevates brand perception.",
    "Enterprise-grade security and scalable cloud architecture.",
    "Agile development methodology ensuring fast time-to-market.",
    "Dedicated post-launch support and maintenance teams.",
    "Deep expertise in Next.js, React, Python, and WebGL.",
  ],
};

export const FOOTER_DEFAULTS: FooterContent = {
  description:
    "Architecting the digital future with premium enterprise solutions, mobile applications, and immersive web experiences.",
  copyrightText: "© {year} {company}. All rights reserved.",
  newsletterText: "",
  columns: [
    {
      title: "Quick Links",
      links: [
        { name: "Home", href: "/" },
        { name: "About", href: "/about" },
        { name: "Technology", href: "/technology" },
        { name: "Products", href: "/products" },
        { name: "Portfolio", href: "/portfolio" },
        { name: "Internship", href: "/internship" },
        { name: "Verify Certificate", href: "/verify-certificate" },
        { name: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Web Development",
      links: [
        { name: "ASP.NET Website Development", href: "#" },
        { name: "PHP Website Development", href: "#" },
        { name: "Joomla Website Development", href: "#" },
        { name: "WordPress Website Development", href: "#" },
        { name: "Drupal Website Development", href: "#" },
        { name: "Ecommerce Website Development", href: "#" },
        { name: "Business Website Development", href: "#" },
        { name: "Static HTML Website Development", href: "#" },
      ],
    },
    {
      title: "Web Designing",
      links: [
        { name: "Static Website Designing", href: "#" },
        { name: "Flash Website Designing", href: "#" },
        { name: "Joomla Website Designing", href: "#" },
        { name: "WordPress Website Designing", href: "#" },
        { name: "Drupal Website Designing", href: "#" },
        { name: "JQuery Website Designing", href: "#" },
        { name: "Photoshop Website Designing", href: "#" },
        { name: "Website Redesigning", href: "#" },
      ],
    },
    {
      title: "Mobile Development",
      links: [
        { name: "Android Apps Development", href: "#" },
        { name: "iPhone Apps Development", href: "#" },
        { name: "Symbian Apps Development", href: "#" },
        { name: "Windows Mobile Development", href: "#" },
        { name: "Java Apps Development", href: "#" },
        { name: "Blackberry Apps Development", href: "#" },
        { name: "Mobile Website Development", href: "#" },
        { name: "Mobile Apps Development", href: "#" },
      ],
    },
    {
      title: "Free Internship Program",
      links: [
        { name: ".NET Technology", href: "#" },
        { name: "Open Source Technology", href: "#" },
        { name: "Mobile Technology", href: "#" },
        { name: "Graphics Technology", href: "#" },
        { name: "Flex Technology", href: "#" },
        { name: "Java Technology", href: "#" },
        { name: "JSON Development", href: "#" },
      ],
    },
  ],
};

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  RotateCcw, 
  Clock, 
  MapPin, 
  ExternalLink 
} from "lucide-react";
import { FaWhatsapp, FaPhoneAlt } from "react-icons/fa";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  quickActions?: { label: string; href: string; icon?: "call" | "whatsapp" | "link" }[];
  suggestedFollowUps?: string[];
}

const KNOWLEDGE_BASE = [
  {
    keywords: ["hi", "hello", "hey", "hola", "greetings", "namaste", "good morning", "good evening", "good afternoon"],
    answer: "Hello! 👋 Welcome to **Xipra Technology**. I'm your AI Assistant. How can I help you today? You can ask me about our **technologies**, **internship programs**, **pricing**, **office timings**, **locations**, or **contact details**!",
    actions: [
      { label: "View Technologies", href: "/technology", icon: "link" as const },
      { label: "Internship Program", href: "/internship", icon: "link" as const },
      { label: "Contact Us", href: "/contact", icon: "link" as const },
    ],
    followUps: ["Tell me about internships", "What services do you offer?", "Where is your office located?", "What are your working hours?"]
  },
  {
    keywords: ["intern", "internship", "training", "certificate", "student", "live project", "fresher", "placement", "course", "courses"],
    answer: `🎓 **Xipra Technology Internship & Industrial Training Program:**

• **Live Projects**: Work on real production-grade enterprise software.
• **Technologies Offered**: 
  - .NET Core & C#
  - React.js & Next.js
  - PHP & Laravel Development
  - Mobile Apps (Flutter, Android, iOS)
  - Python & AI / Data Science
  - UI/UX & Web Designing
• **Benefits**: Verifiable Digital Certificate, Industrial Mentorship, Mock Interviews & Placement Assistance!
• **Online Verification**: Certificates can be instantly verified on our portal.`,
    actions: [
      { label: "Apply for Internship", href: "/internship", icon: "link" as const },
      { label: "Verify Certificate", href: "/verify-certificate", icon: "link" as const },
      { label: "Inquire on WhatsApp", href: "https://wa.me/919033387254?text=Hi,%20I%20am%20interested%20in%20the%20Internship%20Program%20at%20Xipra%20Technology", icon: "whatsapp" as const },
    ],
    followUps: ["How to apply for internship?", "Are certificates verifiable?", "What are the timings for internship?"]
  },
  {
    keywords: ["tech", "technology", "technologies", "stack", "react", "dotnet", ".net", "python", "php", "laravel", "flutter", "angular", "node", "ai", "artificial intelligence", "ml", "machine learning", "cloud", "azure", "cybersecurity"],
    answer: `💻 **Our Core Technology Capabilities:**

1. **Web Development**: Full Stack, ASP.NET Core, PHP & Laravel, Python & Django, React.js, Angular, Node.js, E-Commerce platforms.
2. **Mobile App Development**: Native Android (Kotlin), iOS (Swift), Flutter, React Native, Firebase, API Integrations.
3. **AI & Emerging Tech**: Generative AI, Agentic AI, Deep Learning, AI Chatbots, Prompt Engineering & Automation.
4. **Data & Cloud**: Data Analytics, Power BI, SQL Databases, Microsoft Azure, Cloud Computing, Cybersecurity & IoT.`,
    actions: [
      { label: "Explore Tech Stack", href: "/technology", icon: "link" as const },
      { label: "View Portfolio", href: "/portfolio", icon: "link" as const },
      { label: "Request Tech Consultation", href: "/contact", icon: "link" as const },
    ],
    followUps: ["Do you build custom mobile apps?", "Can you develop AI solutions?", "What is the pricing for web development?"]
  },
  {
    keywords: ["service", "services", "web development", "app development", "mobile app", "software", "solution", "solutions", "product", "products"],
    answer: `🚀 **Xipra Technology Services & Products:**

• **Custom Software & Enterprise Solutions**: Tailored web and desktop applications for businesses.
• **Web & Cloud Applications**: High-performance, scalable and responsive web applications.
• **Mobile App Development**: Cross-platform and native iOS & Android applications.
• **AI & Automation**: Smart chatbots, process automation, and machine learning models.
• **Ready Enterprise Products**: ERP, CRM, School & Hospital Management, Billing and Inventory Software.`,
    actions: [
      { label: "View Products", href: "/products", icon: "link" as const },
      { label: "View Portfolio", href: "/portfolio", icon: "link" as const },
      { label: "Get a Free Quote", href: "/contact", icon: "link" as const },
    ],
    followUps: ["How to get a project quotation?", "Can we schedule a call?", "What is your pricing?"]
  },
  {
    keywords: ["price", "pricing", "cost", "charge", "charges", "rate", "quotation", "quote", "fee", "budget", "how much"],
    answer: `💰 **Pricing & Quotations at Xipra Technology:**

Every software project and internship batch is unique! We offer:
• **Transparent & Competitive Pricing**: Customized based on your project requirements, scope, features, and timeline.
• **Milestone-Based Payments**: Flexible payment schedules linked with development milestones.
• **Free Initial Consultation & Estimation**: Get a detailed quote with no obligations!

Reach out with your project details to get a customized proposal within 24 hours.`,
    actions: [
      { label: "Get Free Quote", href: "/contact", icon: "link" as const },
      { label: "Chat on WhatsApp", href: "https://wa.me/919033387254?text=Hello%20Xipra%20Technology,%20I%20would%20like%20to%20get%20a%20price%20quote%20for%20my%20project.", icon: "whatsapp" as const },
      { label: "Call for Pricing", href: "tel:+919033387254", icon: "call" as const },
    ],
    followUps: ["What technologies do you support?", "Where are you located?", "What are your business hours?"]
  },
  {
    keywords: ["time", "timing", "timings", "hours", "working hours", "open", "close", "schedule", "when", "holiday"],
    answer: `⏰ **Office Working Hours:**

• **Monday to Saturday**: 9:00 AM – 6:30 PM (IST)
• **Sunday**: Closed
• **Support**: 24/7 Email & WhatsApp inquiries are received and responded to during active hours.`,
    actions: [
      { label: "Call Us Now", href: "tel:+919033387254", icon: "call" as const },
      { label: "WhatsApp Us", href: "https://wa.me/919033387254", icon: "whatsapp" as const },
      { label: "Contact Page", href: "/contact", icon: "link" as const },
    ],
    followUps: ["Where is your office located?", "What are your phone numbers?", "How do I apply for an internship?"]
  },
  {
    keywords: ["location", "address", "where", "office", "head office", "city", "place", "himmatnagar", "gujarat", "map", "directions"],
    answer: `📍 **Our Office Locations in Himmatnagar, Gujarat:**

🏢 **Head Office**:
94/B, First Floor, Shraddhapark, Mahavirnagar, Himmatnagar, Gujarat, India - 383001

🏢 **New Office / Branch**:
Office No: TF-32, Pratham Square, Sahakari Jin Road, Himmatnagar, Gujarat, India - 383001`,
    actions: [
      { label: "View on Contact Page", href: "/contact", icon: "link" as const },
      { label: "Call Office", href: "tel:+919033387254", icon: "call" as const },
    ],
    followUps: ["What are your office hours?", "How can I call you?", "What services do you provide?"]
  },
  {
    keywords: ["call", "phone", "contact", "mobile", "number", "email", "reach", "talk", "whatsapp", "telephone"],
    answer: `📞 **Get in Touch with Xipra Technology:**

• **Phone Numbers**:
  - [+91 9033387254](tel:+919033387254)
  - [+91 8866116482](tel:+918866116482)
• **WhatsApp**: [+91 9033387254](https://wa.me/919033387254)
• **Email Addresses**:
  - info@xipratechnology.com
  - xipratechnology@gmail.com
  - contact@xipratechnology.com`,
    actions: [
      { label: "Call +91 9033387254", href: "tel:+919033387254", icon: "call" as const },
      { label: "Chat on WhatsApp", href: "https://wa.me/919033387254", icon: "whatsapp" as const },
      { label: "Send Contact Message", href: "/contact", icon: "link" as const },
    ],
    followUps: ["What are your office hours?", "Where are you located?", "What services do you offer?"]
  },
  {
    keywords: ["verify", "certificate", "verification", "check certificate", "student id", "cert"],
    answer: `📜 **Online Certificate Verification:**

All certificates issued by Xipra Technology for internships and industrial training carry a unique Certificate ID that can be authenticated instantly online anytime.`,
    actions: [
      { label: "Go to Verify Certificate", href: "/verify-certificate", icon: "link" as const },
      { label: "Internship Program Details", href: "/internship", icon: "link" as const },
    ],
    followUps: ["How to apply for internship?", "What are the contact details?", "What technologies are taught?"]
  },
  {
    keywords: ["about", "company", "who are you", "xipra", "team", "founder", "wiregen"],
    answer: `🌟 **About Xipra Technology:**

Xipra Technology is a premier software development and IT solutions company dedicated to architecting digital future through cutting-edge web applications, enterprise software, mobile apps, and emerging AI technologies. We also run high-impact student training and internship programs to foster future tech leaders.`,
    actions: [
      { label: "Learn More About Us", href: "/about", icon: "link" as const },
      { label: "Our Portfolio", href: "/portfolio", icon: "link" as const },
      { label: "Get in Touch", href: "/contact", icon: "link" as const },
    ],
    followUps: ["What services do you offer?", "Where is your office located?", "Tell me about internships"]
  },
  {
    keywords: ["hackathon", "gujarat virtual hackathon", "wx hackathon", "competition", "contest", "prize pool", "cash prize", "hack", "hackathone"],
    answer: `🏆 **Gujarat Virtual Hackathon 2026 (Coming Soon!):**

Presented by **Xipra Technology** & **Wiregen AI** — Gujarat's premier online coding & design competition!

• **Total Prize Pool**: ₹1,00,000+ Cash Prizes & Rewards
• **100% Virtual / Online**: Compete from anywhere
• **Competition Tracks**:
  1. 🎨 **Graphics & UI/UX** (Solo): ₹5k / ₹3k / ₹2k
  2. 💻 **Frontend Wizardry** (Up to 2): ₹15k / ₹10k / ₹5k
  3. 🚀 **Fullstack Innovation** (Up to 4): ₹30k / ₹20k / ₹10k
• **Perks**: Verified Digital Certificate, Live Mentorship, Placement Priority & Swags!`,
    actions: [
      { label: "🚀 Visit Hackathon Portal", href: "https://hackathon.xipra.in/", icon: "link" as const },
      { label: "💬 Pre-Register via WhatsApp", href: "https://wa.me/919033387254?text=Hello%20Xipra%20Technology!%20I%20want%20to%20pre-register%20for%20the%20Gujarat%20Virtual%20Hackathon%202026.", icon: "whatsapp" as const },
      { label: "📞 Contact Organizers", href: "/contact", icon: "link" as const }
    ],
    followUps: ["What are the hackathon tracks?", "What is the prize pool?", "Who is eligible to participate?"]
  }
];

function findAnswer(query: string) {
  const normalized = query.toLowerCase().trim();

  // Match best category
  let bestMatch = null;
  let maxScore = 0;

  for (const item of KNOWLEDGE_BASE) {
    let score = 0;
    for (const keyword of item.keywords) {
      if (normalized === keyword) {
        score += 10;
      } else if (normalized.includes(keyword)) {
        score += keyword.length > 3 ? 4 : 2;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && maxScore > 0) {
    return {
      text: bestMatch.answer,
      actions: bestMatch.actions,
      followUps: bestMatch.followUps
    };
  }

  // Fallback
  return {
    text: `Thank you for your question! I don't have the exact answer in my knowledge base right now, but our team at **Xipra Technology** will be glad to assist you immediately.

You can connect directly with our experts via **Phone Call**, **WhatsApp**, or by submitting a query on our **Contact Page**.`,
    actions: [
      { label: "Chat on WhatsApp", href: "https://wa.me/919033387254", icon: "whatsapp" as const },
      { label: "Call Us (+91 9033387254)", href: "tel:+919033387254", icon: "call" as const },
      { label: "Submit Inquiry Form", href: "/contact", icon: "link" as const }
    ],
    followUps: ["What services do you offer?", "Tell me about internships", "Where is your office located?", "What are your timings?"]
  };
}

export default function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      sender: "bot",
      text: "👋 Hi there! I'm the **Xipra Tech AI Assistant**.\n\nAsk me anything about our **technologies**, **internships**, **pricing**, **working hours**, **office locations**, or **contact info**!",
      timestamp: "Just now",
      quickActions: [
        { label: "🎓 Internship Info", href: "/internship", icon: "link" },
        { label: "💻 Tech Stack", href: "/technology", icon: "link" },
        { label: "📍 Office Locations", href: "/contact", icon: "link" }
      ],
      suggestedFollowUps: [
        "Tell me about internships",
        "What services do you offer?",
        "What are your office hours?",
        "How can I call you?"
      ]
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);

  // Close on Escape key or outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        chatRef.current && 
        !chatRef.current.contains(target) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick, { passive: true });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate natural AI thinking delay
    setTimeout(() => {
      const response = findAnswer(query);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickActions: response.actions,
        suggestedFollowUps: response.followUps
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "bot",
        text: "👋 Chat reset! How else can I assist you with **Xipra Technology**?",
        timestamp: "Just now",
        quickActions: [
          { label: "🎓 Internship Info", href: "/internship", icon: "link" },
          { label: "💻 Tech Stack", href: "/technology", icon: "link" },
          { label: "📍 Office Locations", href: "/contact", icon: "link" }
        ],
        suggestedFollowUps: [
          "What services do you offer?",
          "Tell me about internships",
          "What are your working hours?",
          "How much does a project cost?"
        ]
      }
    ]);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        ref={toggleBtnRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
        className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-blue-500 text-white shadow-lg hover:shadow-primary/50 transition-all duration-300 hover:scale-110 active:scale-95 z-50"
      >
        <div className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-background"></span>
        </div>
        {isOpen ? (
          <X className="w-6 h-6 transition-transform duration-200" />
        ) : (
          <Bot className="w-6 h-6 transition-transform duration-200 group-hover:rotate-12" />
        )}
      </button>

      {/* Mobile Dimmed Backdrop Overlay (Click to close) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[140] sm:hidden animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div 
          ref={chatRef}
          className="fixed inset-x-3 bottom-20 sm:bottom-24 sm:right-6 sm:left-auto sm:w-[410px] h-[76vh] sm:h-[580px] max-h-[620px] z-[150] rounded-3xl bg-card/95 border border-border shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-200 overscroll-contain"
        >
          {/* Mobile Pull-Down Dismiss Handle */}
          <div 
            onClick={() => setIsOpen(false)}
            title="Tap to close chat"
            className="sm:hidden pt-2.5 pb-1 flex justify-center cursor-pointer bg-gradient-to-r from-primary/10 via-card to-card hover:opacity-80 transition-opacity"
          >
            <div className="w-12 h-1.5 rounded-full bg-muted-foreground/40 hover:bg-muted-foreground/60 transition-colors" />
          </div>

          {/* Header */}
          <div className="px-4 py-3 sm:py-4 bg-gradient-to-r from-primary/20 via-card to-card border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-inner shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground leading-none">Xipra AI Assistant</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Instant answers about services & info</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleResetChat}
                title="Restart chat"
                aria-label="Restart chat"
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-foreground/5 active:scale-95 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Prominent, easy-to-tap close button */}
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat (Esc)"
                aria-label="Close chat"
                className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-foreground/80 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 border border-border active:scale-95 transition-all flex items-center gap-1 text-xs font-semibold"
              >
                <X className="w-4 h-4" />
                <span className="hidden xs:inline text-[11px]">Close</span>
              </button>
            </div>
          </div>

          {/* Quick Info Bar */}
          <div className="px-3.5 py-1.5 bg-muted/40 border-b border-border/50 flex items-center justify-between text-[11px] text-muted-foreground overflow-x-auto gap-3 whitespace-nowrap scrollbar-none">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-primary shrink-0" /> Mon-Sat: 9am - 6:30pm
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-primary shrink-0" /> Himmatnagar, Gujarat
            </span>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm scroll-smooth">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-2.5 shadow-sm text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted/80 text-foreground border border-border/60 rounded-bl-none whitespace-pre-line"
                  }`}
                >
                  {msg.text}
                </div>

                {/* Quick Action Buttons */}
                {msg.quickActions && msg.quickActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[95%]">
                    {msg.quickActions.map((action, i) => {
                      const isExternal = action.href.startsWith("http") || action.href.startsWith("tel:");
                      return isExternal ? (
                        <a
                          key={i}
                          href={action.href}
                          target={action.href.startsWith("tel:") ? undefined : "_blank"}
                          rel={action.href.startsWith("tel:") ? undefined : "noopener noreferrer"}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors"
                        >
                          {action.icon === "whatsapp" && <FaWhatsapp className="w-3 h-3 text-emerald-500" />}
                          {action.icon === "call" && <FaPhoneAlt className="w-2.5 h-2.5 text-blue-400" />}
                          {action.label}
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                      ) : (
                        <Link
                          key={i}
                          href={action.href}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-foreground/5 hover:bg-foreground/10 text-foreground border border-border transition-colors"
                        >
                          {action.label}
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Suggested follow up questions */}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                    {msg.suggestedFollowUps.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(prompt)}
                        className="text-[10px] text-muted-foreground hover:text-foreground bg-card hover:bg-muted border border-border/60 rounded-full px-2.5 py-0.5 transition-all text-left"
                      >
                        ⚡ {prompt}
                      </button>
                    ))}
                  </div>
                )}

                <span className="text-[9px] text-muted-foreground/60 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/60 border border-border/40 w-fit px-3 py-2 rounded-2xl rounded-bl-none text-xs">
                <Sparkles className="w-3.5 h-3.5 text-primary animate-spin" />
                <span>AI is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Drawer */}
          <div className="px-3 py-2 bg-muted/20 border-t border-border/40 flex items-center gap-1.5 overflow-x-auto scrollbar-none whitespace-nowrap text-[11px]">
            <button
              onClick={() => handleSend("Tell me about Gujarat Virtual Hackathon")}
              className="px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-colors shrink-0 font-medium"
            >
              🏆 Hackathon
            </button>
            <button
              onClick={() => handleSend("Tell me about internship")}
              className="px-2.5 py-1 rounded-md bg-foreground/5 hover:bg-foreground/10 text-foreground/80 transition-colors shrink-0"
            >
              🎓 Internship
            </button>
            <button
              onClick={() => handleSend("What technologies do you work with?")}
              className="px-2.5 py-1 rounded-md bg-foreground/5 hover:bg-foreground/10 text-foreground/80 transition-colors shrink-0"
            >
              💻 Technologies
            </button>
            <button
              onClick={() => handleSend("What are your office timings?")}
              className="px-2.5 py-1 rounded-md bg-foreground/5 hover:bg-foreground/10 text-foreground/80 transition-colors shrink-0"
            >
              ⏰ Timings
            </button>
            <button
              onClick={() => handleSend("Where is your office located?")}
              className="px-2.5 py-1 rounded-md bg-foreground/5 hover:bg-foreground/10 text-foreground/80 transition-colors shrink-0"
            >
              📍 Location
            </button>
            <button
              onClick={() => handleSend("How can I call you?")}
              className="px-2.5 py-1 rounded-md bg-foreground/5 hover:bg-foreground/10 text-foreground/80 transition-colors shrink-0"
            >
              📞 Call Info
            </button>
            <button
              onClick={() => handleSend("How much does a project cost?")}
              className="px-2.5 py-1 rounded-md bg-foreground/5 hover:bg-foreground/10 text-foreground/80 transition-colors shrink-0"
            >
              💰 Pricing
            </button>
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-card border-t border-border flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about Xipra..."
              className="flex-1 bg-muted/60 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              aria-label="Send message"
              className="p-2 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

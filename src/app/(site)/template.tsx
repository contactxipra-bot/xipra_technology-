import RevealObserver from "@/components/ui/RevealObserver";

/*
  Page-transition wrapper.

  This is a Server Component on purpose. It used to be a client component that
  rendered a framer-motion <motion.div keyed on the pathname>, which meant every
  route in the site pulled framer-motion into its critical path and could not
  start its entrance until React had hydrated. The transition is now a CSS
  animation with the same shape (fade 0→1 plus an 8px rise, 0.2s ease-out), so
  it starts on the first painted frame with no JavaScript involved.

  Next.js remounts a template on every navigation, so the fresh DOM node re-runs
  the animation exactly as the keyed motion.div did — and RevealObserver
  re-registers the incoming page's scroll reveals.
*/
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-enter w-full">
      <RevealObserver />
      {children}
    </div>
  );
}

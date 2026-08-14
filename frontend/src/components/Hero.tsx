import { ArrowDown, Activity } from 'lucide-react'
import { SectionCupHero } from '@/three/SectionCup'

/**
 * The hero states the thesis rather than selling: this shop shows you what is
 * inside things. Inside the drink, via the section drawing; inside the system,
 * via the rail above it.
 */
export function Hero({ onOpenActivity }: { onOpenActivity: () => void }) {
  return (
    <section className="relative border-b border-line">
      <div className="mx-auto grid max-w-[100rem] gap-8 px-4 pb-10 pt-10 sm:px-8 sm:pb-16 sm:pt-16 lg:grid-cols-12 lg:gap-6">
        <div className="flex flex-col justify-center lg:col-span-5">
          <p className="eyebrow animate-rise-in">Chiang Rai · 1,300 m · arabica</p>

          <h1 className="mt-5 font-display text-[clamp(2.6rem,7vw,4.4rem)] font-extrabold leading-[0.94] tracking-[-0.045em] text-ink">
            <span className="block animate-rise-in [animation-delay:80ms]">Look inside</span>
            <span className="block animate-rise-in [animation-delay:160ms]">the cup.</span>
            <span className="block animate-rise-in text-moss [animation-delay:240ms]">
              Then the shop.
            </span>
          </h1>

          <p className="mt-6 max-w-md animate-rise-in text-[0.975rem] leading-relaxed text-moss [animation-delay:320ms]">
            Highland arabica, pulled at the counter. Order a drink and the rail above follows it
            through all four services — the menu it came from, the order that was written, the event
            that was published, and the notification that came back.
          </p>

          <div className="mt-8 flex animate-rise-in flex-wrap gap-3 [animation-delay:400ms]">
            <a href="#menu" className="btn btn-primary">
              <ArrowDown size={15} strokeWidth={2} />
              See the menu
            </a>
            <button type="button" className="btn btn-quiet" onClick={onOpenActivity}>
              <Activity size={15} strokeWidth={1.8} />
              Order activity
            </button>
          </div>
        </div>

        <div className="animate-fade-in lg:col-span-7 [animation-delay:200ms]">
          <SectionCupHero className="h-[40vh] min-h-[18rem] w-full sm:h-[48vh] lg:h-[30rem]" />
        </div>
      </div>
    </section>
  )
}

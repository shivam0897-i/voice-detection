import { motion, useSpring, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, createContext, useContext } from 'react';
import confetti from 'canvas-confetti';
import { Link } from 'react-router-dom';
import { Check, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import Particles from '@/components/ui/demo-particles';

const PricingContext = createContext({
    isMonthly: true,
    setIsMonthly: () => { },
});

function useMediaQuery(query) {
    const [value, setValue] = useState(false);
    useEffect(() => {
        const mql = matchMedia(query);
        const onChange = (e) => setValue(e.matches);
        mql.addEventListener('change', onChange);
        setValue(mql.matches);
        return () => mql.removeEventListener('change', onChange);
    }, [query]);
    return value;
}

// Interactive starfield — mouse-reactive dots
function StarDot({ mousePosition, containerRef }) {
    const [initialPos] = useState({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
    });

    const springConfig = { stiffness: 100, damping: 15, mass: 0.1 };
    const springX = useSpring(0, springConfig);
    const springY = useSpring(0, springConfig);

    useEffect(() => {
        if (!containerRef.current || mousePosition.x === null || mousePosition.y === null) {
            springX.set(0);
            springY.set(0);
            return;
        }
        const rect = containerRef.current.getBoundingClientRect();
        const starX = rect.left + (parseFloat(initialPos.left) / 100) * rect.width;
        const starY = rect.top + (parseFloat(initialPos.top) / 100) * rect.height;
        const dx = mousePosition.x - starX;
        const dy = mousePosition.y - starY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const radius = 600;
        if (distance < radius) {
            const force = 1 - distance / radius;
            springX.set(dx * force * 0.5);
            springY.set(dy * force * 0.5);
        } else {
            springX.set(0);
            springY.set(0);
        }
    }, [mousePosition, initialPos, containerRef, springX, springY]);

    return (
        <motion.div
            className="absolute rounded-full bg-foreground/60"
            style={{
                top: initialPos.top,
                left: initialPos.left,
                width: `${1 + Math.random() * 2}px`,
                height: `${1 + Math.random() * 2}px`,
                x: springX,
                y: springY,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 5 }}
        />
    );
}

function InteractiveStarfield({ mousePosition, containerRef }) {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
            {Array.from({ length: 120 }).map((_, i) => (
                <StarDot key={i} mousePosition={mousePosition} containerRef={containerRef} />
            ))}
        </div>
    );
}

// Toggle
function PricingToggle() {
    const { isMonthly, setIsMonthly } = useContext(PricingContext);
    const confettiRef = useRef(null);
    const monthlyRef = useRef(null);
    const annualRef = useRef(null);
    const [pillStyle, setPillStyle] = useState({});

    useEffect(() => {
        const btn = isMonthly ? monthlyRef : annualRef;
        if (btn.current) {
            setPillStyle({
                width: btn.current.offsetWidth,
                transform: `translateX(${btn.current.offsetLeft}px)`,
            });
        }
    }, [isMonthly]);

    const handleToggle = (monthly) => {
        if (isMonthly === monthly) return;
        setIsMonthly(monthly);

        if (!monthly && annualRef.current) {
            const rect = annualRef.current.getBoundingClientRect();
            confetti({
                particleCount: 80,
                spread: 80,
                origin: {
                    x: (rect.left + rect.width / 2) / window.innerWidth,
                    y: (rect.top + rect.height / 2) / window.innerHeight,
                },
                colors: ['#10B981', '#34D399', '#6EE7B7'],
                ticks: 300,
                gravity: 1.2,
                decay: 0.94,
                startVelocity: 30,
            });
        }
    };

    return (
        <div className="flex justify-center">
            <div ref={confettiRef} className="relative flex w-fit items-center rounded-full border border-border bg-accent/50 p-1">
                <motion.div
                    className="absolute left-0 top-0 h-full rounded-full bg-primary p-1"
                    style={pillStyle}
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
                <button
                    ref={monthlyRef}
                    onClick={() => handleToggle(true)}
                    className={cn(
                        'relative z-10 rounded-full px-5 py-2 text-sm font-medium transition-colors',
                        isMonthly ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground/70',
                    )}
                >
                    Monthly
                </button>
                <button
                    ref={annualRef}
                    onClick={() => handleToggle(false)}
                    className={cn(
                        'relative z-10 rounded-full px-5 py-2 text-sm font-medium transition-colors',
                        !isMonthly ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground/70',
                    )}
                >
                    Annual
                    <span className={cn('hidden sm:inline', !isMonthly ? 'text-primary-foreground/70' : '')}>
                        {' '}(Save 20%)
                    </span>
                </button>
            </div>
        </div>
    );
}

// Plan card
function PricingCard({ plan, index }) {
    const { isMonthly } = useContext(PricingContext);
    const isDesktop = useMediaQuery('(min-width: 1024px)');

    const priceValue = isMonthly ? Number(plan.price) : Number(plan.yearlyPrice);
    const isCustom = isNaN(priceValue);

    return (
        <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{
                y: plan.isPopular && isDesktop ? -20 : 0,
                opacity: 1,
            }}
            viewport={{ once: true }}
            transition={{
                duration: 0.6,
                type: 'spring',
                stiffness: 100,
                damping: 20,
                delay: index * 0.15,
            }}
            className={cn(
                'rounded-2xl p-8 flex flex-col relative bg-card/60 backdrop-blur-sm',
                plan.isPopular
                    ? 'border-2 border-primary/40 shadow-xl shadow-primary/10'
                    : 'border border-border',
            )}
        >
            {plan.isPopular && (
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                    <div className="bg-primary py-1.5 px-4 rounded-full flex items-center gap-1.5">
                        <Star className="text-primary-foreground h-4 w-4 fill-current" />
                        <span className="text-primary-foreground text-sm font-semibold">Most Popular</span>
                    </div>
                </div>
            )}
            <div className="flex-1 flex flex-col text-center">
                <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground/70">{plan.description}</p>
                <div className="mt-6 flex items-baseline justify-center gap-x-1">
                    <span className="text-5xl font-bold tracking-tight text-foreground">
                        {isCustom ? (
                            plan.price
                        ) : (
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={priceValue}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.25 }}
                                    className="inline-block"
                                >
                                    ${priceValue}
                                </motion.span>
                            </AnimatePresence>
                        )}
                    </span>
                    {!isCustom && (
                        <span className="text-sm font-semibold leading-6 tracking-wide text-muted-foreground/50">
                            / {plan.period}
                        </span>
                    )}
                </div>
                <p className="text-xs text-muted-foreground/40 mt-2">
                    {isCustom ? 'Contact for pricing' : isMonthly ? 'Billed Monthly' : 'Billed Annually'}
                </p>

                <ul className="mt-8 space-y-3 text-sm leading-6 text-left text-muted-foreground">
                    {plan.features.map((feature) => (
                        <li key={feature} className="flex gap-x-3">
                            <Check
                                className={cn(
                                    'h-5 w-4 flex-none',
                                    plan.isPopular ? 'text-primary' : 'text-muted-foreground/40'
                                )}
                                aria-hidden="true"
                            />
                            {feature}
                        </li>
                    ))}
                </ul>

                <div className="mt-auto pt-8 flex justify-center w-full">
                    <Link to={plan.href} className="w-full flex justify-center cursor-pointer">
                        {plan.isPopular ? (
                            <Particles className="w-[85%]">
                                {plan.buttonText}
                            </Particles>
                        ) : (
                            <Button variant="outline" className="w-full h-[50px] rounded-full text-foreground/80 hover:bg-accent">
                                {plan.buttonText}
                            </Button>
                        )}
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

// Main export
export function PricingSection({ plans, title, description }) {
    const [isMonthly, setIsMonthly] = useState(true);
    const containerRef = useRef(null);
    const [mousePosition, setMousePosition] = useState({ x: null, y: null });

    return (
        <PricingContext.Provider value={{ isMonthly, setIsMonthly }}>
            <div
                ref={containerRef}
                onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
                onMouseLeave={() => setMousePosition({ x: null, y: null })}
                className="relative w-full bg-background py-20 sm:py-24"
            >
                <InteractiveStarfield mousePosition={mousePosition} containerRef={containerRef} />
                <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
                        <h2 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-[52px] md:leading-[1.1]">
                            {title}
                        </h2>
                        <p className="text-muted-foreground text-[15px] leading-relaxed whitespace-pre-line">
                            {description}
                        </p>
                    </div>
                    <PricingToggle />
                    <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 items-start gap-8">
                        {plans.map((plan, index) => (
                            <PricingCard key={index} plan={plan} index={index} />
                        ))}
                    </div>
                </div>
            </div>
        </PricingContext.Provider>
    );
}

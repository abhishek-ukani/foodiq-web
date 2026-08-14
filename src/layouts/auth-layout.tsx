import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChefHat, Leaf, ShieldCheck, Truck } from 'lucide-react'
import { ROUTES } from '@/constants'

const HIGHLIGHTS = [
  { icon: Leaf, text: 'Cooked fresh every single day' },
  { icon: Truck, text: 'Reliable delivery across Ahmedabad' },
  { icon: ShieldCheck, text: 'Your data stays private and secure' },
]

export function AuthLayout({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="bg-primary text-primary-foreground relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        <div
          aria-hidden
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, white 0, transparent 45%), radial-gradient(circle at 80% 70%, white 0, transparent 40%)',
          }}
        />
        <Link to={ROUTES.home} className="relative z-10 flex items-center gap-3">
          <div className="bg-primary-foreground/15 flex size-11 items-center justify-center rounded-xl">
            <ChefHat className="size-6" aria-hidden />
          </div>
          <span className="font-display text-xl font-semibold">FoodIQ</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-md space-y-6"
        >
          <p className="font-display text-3xl leading-tight font-medium">
            Homemade tiffin, cooked with the same care as your own kitchen.
          </p>
          <ul className="space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item.text} className="flex items-center gap-3 text-sm">
                <span className="bg-primary-foreground/15 flex size-8 shrink-0 items-center justify-center rounded-full">
                  <item.icon className="size-4" aria-hidden />
                </span>
                {item.text}
              </li>
            ))}
          </ul>
        </motion.div>

        <p className="relative z-10 text-xs opacity-70">
          © {new Date().getFullYear()} FoodIQ. All rights reserved.
        </p>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm space-y-8">
          <Link to={ROUTES.home} className="mb-2 flex items-center gap-2 lg:hidden">
            <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg">
              <ChefHat className="size-4" aria-hidden />
            </div>
            <span className="font-display text-lg font-semibold">FoodIQ</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-2"
          >
            <h1 className="font-display text-3xl font-semibold">{title}</h1>
            <p className="text-muted-foreground text-sm">{description}</p>
          </motion.div>

          {children}
        </div>
      </div>
    </div>
  )
}

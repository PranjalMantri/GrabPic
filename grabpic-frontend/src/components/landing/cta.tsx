import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="mx-auto mt-24 w-full max-w-5xl fade-in-up">
      <div className="relative overflow-hidden rounded-[28px] border border-black/20 bg-[linear-gradient(135deg,#1f2937_0%,#313742_70%)] px-8 py-16 text-center text-white md:px-14">
        <div className="pointer-events-none absolute left-0 top-0 h-40 w-40 rounded-full bg-(--color-primary)/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

        <h2 className="text-4xl font-bold tracking-[-0.02em] md:text-5xl">Ready to relive your best moments?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-white/75">
          Join thousands of photographers and event-goers who use GrabPic to find their memories
          instantly.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href="/register" className={buttonVariants({ size: "lg" })}>
            Create Account
          </Link>
        </div>
      </div>
    </section>
  );
}

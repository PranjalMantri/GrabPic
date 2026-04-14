import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const collageImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDpAsQlkbJZfZdIi_fe-ZhDS06G6fM-40RsBNS2QFtAHavqn-ydt0SnnbW2O9RU1gSJiZ9F1w7UMS-YcSkLzhC9KKDRcCv50Liz9IpyNt-Zhwgyt6SHyuV-ABaaPrct9uHZSrnmioZXUj8Pk07u0GIEx7_wjGHuqT3nT3Q36niV0fSdS42mJ5LfRt9MktnVGiGH3dkz785cTXyY2erWdqmfZCgt0M_qkjF9V0R_TXL6NRxBM9kwwP1QcaIBVKAI7YcELT4h4JVMEUk",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD21fTH4YoVXSLROy7ZZADz5fE6uwu-_d6JvBapUM111wSBxhfZ6XKmpQFms1a2Dc8mooBao6RTQhbFyKFCQeuX4wRE0frrlE4aV7DQHhxdw07PlcU7YDTEw0tw1YbRgo9YSO2lRln8XKrSEILIb-gKpp713MVBMBEt9UMSJjG4kS3iIF3Qu6rgm7prqdpw1aSsmHT_2zjVS4dF6LuMQyhp3i2JSxiQniMBB8qo2PzTQhqNKDTeAsaJmSvw1RfzrnHnlI5upEzTA0o",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCN0s8T0PyddVcdOw3kCt2ZVN48M7aZJMdVochNQPm0aXpmrx8EEGttmQw9FmI0n1WrsEniM9ODwhtgNexCvIGYw8--Jxs6ceIbIgcHUU7gQ3nkuWCBtONkfCsVSnStBrTv0YQ-RKVtmgDobSwDR291fO7E111SxLbzbstzTU6LzsSt1gXxiYd8dWVjidiMzze1ozCxUC7mDIypfYW8i79OTRn4ayXzheysF3bgV4yDafdIGclEsaUC3FmrgitFmfmqk705XNgamDw",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCbgUGrcfob8XDLa8di1q2Lsv4Ke9OStp_JaoRuhqFlk-uiynpl6hH63cjOEpQgxJfpzo43Uu6ZWxYZ4vjZsHrDmOMLblvemccLdHRZDfBE6zH_kElcjF7NlXlkP9Z0cBvrXQbrQw3wA4l6mgL9J4_bfzPGaTndtlmxdWssnidDfc2JkVH73X9gC6ANY0PfUkLzwZlySXssC-OME485R1nxPXPoH2aAmKJOUGUcq9XxgLdBAUyX35J1oWP9Xt-eHOQHh5GgsYVktG8",
];

export function HeroSection() {
  return (
    <section className="mx-auto mt-12 grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.03fr_1fr]">
      <div className="hero-copy fade-in-up">
        <Badge className="mb-6 flex w-fit items-center gap-2 border border-[var(--color-border)] bg-[var(--color-primary-subtle)] px-3 py-1.5 text-[var(--color-primary)] shadow-[0_10px_28px_rgba(91,79,232,0.12)]">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/80 text-[var(--color-primary)]">
            <Sparkles size={12} />
          </span>
          <span>AI-Powered Event Photography</span>
        </Badge>
        <h1 className="text-5xl font-extrabold leading-[1.05] tracking-[-0.02em] text-[var(--color-text-primary)] md:text-6xl">
          Find your photos
          <span className="block text-[var(--color-primary)]">instantly</span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-[var(--color-text-secondary)] md:text-[17px]">
          Stop scrolling through thousands of event photos. Our advanced face-recognition AI
          finds every shot of you and your friends in seconds.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 text-white">
          <Link href="/register" className={buttonVariants({ size: "lg", className: "text-white" })}>
            Get Started
            <ArrowRight size={16} />
          </Link>
          <Button variant="secondary" size="lg">
            Try Demo
          </Button>
        </div>
      </div>

      <div className="collage-card fade-in-up delay-1">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--color-text-secondary)]">
              Face Search
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)]">Scanning 1,240 photos...</p>
          </div>
          <div className="h-5 w-5 rounded-full bg-[var(--color-border-subtle)]" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="img-frame aspect-[4/5]">
              <img
                src={collageImages[0]}
                alt="Event moment portrait"
                loading="lazy"
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div className="img-frame aspect-square rounded-[1.6rem]">
              <img
                src={collageImages[2]}
                alt="Event moment candid"
                loading="lazy"
                className="h-full w-full object-cover object-center"
              />
            </div>
          </div>

          <div className="space-y-4 pt-8">
            <div className="img-frame aspect-square rounded-[1.6rem]">
              <img
                src={collageImages[1]}
                alt="Event moment dancing"
                loading="lazy"
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div className="img-frame aspect-[4/5]">
              <img
                src={collageImages[3]}
                alt="Event moment stage portrait"
                loading="lazy"
                className="h-full w-full object-cover object-center"
              />
            </div>
          </div>
        </div>

        <Badge variant="outline" className="absolute left-1/2 top-[56%] -translate-x-1/2 bg-white/90">
          98% Match Found
        </Badge>
      </div>
    </section>
  );
}

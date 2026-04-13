import { Bolt, ShieldCheck, Sparkles, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const fastRetrievalPreviews = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDpAsQlkbJZfZdIi_fe-ZhDS06G6fM-40RsBNS2QFtAHavqn-ydt0SnnbW2O9RU1gSJiZ9F1w7UMS-YcSkLzhC9KKDRcCv50Liz9IpyNt-Zhwgyt6SHyuV-ABaaPrct9uHZSrnmioZXUj8Pk07u0GIEx7_wjGHuqT3nT3Q36niV0fSdS42mJ5LfRt9MktnVGiGH3dkz785cTXyY2erWdqmfZCgt0M_qkjF9V0R_TXL6NRxBM9kwwP1QcaIBVKAI7YcELT4h4JVMEUk",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD21fTH4YoVXSLROy7ZZADz5fE6uwu-_d6JvBapUM111wSBxhfZ6XKmpQFms1a2Dc8mooBao6RTQhbFyKFCQeuX4wRE0frrlE4aV7DQHhxdw07PlcU7YDTEw0tw1YbRgo9YSO2lRln8XKrSEILIb-gKpp713MVBMBEt9UMSJjG4kS3iIF3Qu6rgm7prqdpw1aSsmHT_2zjVS4dF6LuMQyhp3i2JSxiQniMBB8qo2PzTQhqNKDTeAsaJmSvw1RfzrnHnlI5upEzTA0o",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCN0s8T0PyddVcdOw3kCt2ZVN48M7aZJMdVochNQPm0aXpmrx8EEGttmQw9FmI0n1WrsEniM9ODwhtgNexCvIGYw8--Jxs6ceIbIgcHUU7gQ3nkuWCBtONkfCsVSnStBrTv0YQ-RKVtmgDobSwDR291fO7E111SxLbzbstzTU6LzsSt1gXxiYd8dWVjidiMzze1ozCxUC7mDIypfYW8i79OTRn4ayXzheysF3bgV4yDafdIGclEsaUC3FmrgitFmfmqk705XNgamDw",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCbgUGrcfob8XDLa8di1q2Lsv4Ke9OStp_JaoRuhqFlk-uiynpl6hH63cjOEpQgxJfpzo43Uu6ZWxYZ4vjZsHrDmOMLblvemccLdHRZDfBE6zH_kElcjF7NlXlkP9Z0cBvrXQbrQw3wA4l6mgL9J4_bfzPGaTndtlmxdWssnidDfc2JkVH73X9gC6ANY0PfUkLzwZlySXssC-OME485R1nxPXPoH2aAmKJOUGUcq9XxgLdBAUyX35J1oWP9Xt-eHOQHh5GgsYVktG8",
];

export function FeaturesSection() {
  return (
    <section className="mx-auto mt-28 w-full max-w-6xl">
      <div className="text-center fade-in-up">
        <h2 className="text-[38px] font-bold tracking-[-0.01em] text-[var(--color-text-primary)]">
          Engineered for Moments
        </h2>
        <p className="mt-3 text-sm text-[var(--color-text-tertiary)] md:text-base">
          Our platform combines enterprise-grade AI with a curated editorial experience.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardContent className="h-full min-h-72">
            <FeatureHeader icon={<Bolt size={14} />} title="Fast Retrieval" />
            <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--color-text-secondary)]">
              Our proprietary indexing engine processes thousands of high-resolution images in
              milliseconds, delivering personalized results the moment you upload.
            </p>
            <div className="mt-8 flex w-fit items-center gap-1.5">
              {fastRetrievalPreviews.map((image, index) => (
                <div key={image} className="h-12 w-12 overflow-hidden rounded-lg bg-[#e8ebf3]">
                  <img
                    src={image}
                    alt={`Fast retrieval preview ${index + 1}`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-[var(--color-primary)] text-white shadow-[var(--shadow-primary)]">
          <CardContent className="min-h-72">
            <FeatureHeader icon={<ShieldCheck size={14} />} title="AI Privacy" dark />
            <p className="mt-4 text-sm leading-7 text-white/80">
              Your biometrics never leave our secure environment. We prioritize data sovereignty
              and encrypted facial hash storage.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="min-h-56">
            <FeatureHeader icon={<Users size={14} />} title="Group Sharing" />
            <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">
              Create shared intelligent albums. Tag friends once, and the AI will automatically
              suggest photos they appear in.
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 overflow-hidden bg-white">
          <CardContent className="min-h-56 md:flex md:items-center md:gap-8">
            <div className="flex-1">
              <FeatureHeader icon={<Sparkles size={14} />} title="AI Curator" />
              <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">
                Our AI does not just find you; it finds the best of you. It automatically filters
                out blinks, blurs, and poor lighting to highlight your best moments.
              </p>
            </div>

            <div className="mt-6 h-48 flex-1 overflow-hidden rounded-2xl bg-[#e8ebf3] md:mt-0">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsEOD5mide5BZ2L47bSOvdmE6jDT_YSzc6UJ0FPDZoRhUCj11WGU616Z4tST7UBjub0A9FVuXkAYGCDA_hSnV6CiLXLydPkRKuQMG6wvDpHeLVOeKXxgdG3tStmpLlerecYWu0CgiuA9XmYPdnEYZs-N0ONsEhJJkhoYELhZWcW14ojs8z0JkM5JYzqyx-c7ewlevz_YbC03DYjp9ntOFHy0-pB1qCfxuKelofDidoBrrhP52Rjy731uviKndH-POBcm5-6BZeVV8"
                alt="AI curation abstract visual"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </CardContent>
        </Card>

      </div>
    </section>
  );
}

function FeatureHeader({
  icon,
  title,
  dark,
}: {
  icon: React.ReactNode;
  title: string;
  dark?: boolean;
}) {
  return (
    <div>
      <div
        className={`inline-flex h-8 w-8 items-center justify-center rounded-[10px] ${
          dark ? "bg-white/20 text-white" : "bg-[var(--color-primary-subtle)] text-[var(--color-primary)]"
        }`}
      >
        {icon}
      </div>
      <h3 className="mt-5 text-[26px] font-semibold tracking-[-0.01em]">{title}</h3>
    </div>
  );
}

import { HeroSequence } from "@/components/hero/HeroSequence";
import { Intro } from "@/components/home/Intro";
import { FeaturedCollection } from "@/components/home/FeaturedCollection";
import { RedSpectrum } from "@/components/home/RedSpectrum";
import { Editorial } from "@/components/home/Editorial";
import { Manifesto } from "@/components/home/Manifesto";
import { Newsletter } from "@/components/home/Newsletter";

export default function Home() {
  return (
    <>
      <HeroSequence />
      <Intro />
      <FeaturedCollection />
      <RedSpectrum />
      <Editorial />
      <Manifesto />
      <Newsletter />
    </>
  );
}

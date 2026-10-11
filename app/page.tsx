import Hero from "@/components/hero";
// Hidden for now; restore this import and <About /> below to bring it back.
// import About from "@/components/about";
import WorkTimeline from "@/components/work-timeline";
import OtherWork from "@/components/other-work";
import Writing from "@/components/writing";
import PhotoDrumSection from "@/components/photo-drum-section";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      {/* <About /> */}
      <WorkTimeline />
      <OtherWork />
      <Writing />
      <PhotoDrumSection />
    </main>
  );
}
